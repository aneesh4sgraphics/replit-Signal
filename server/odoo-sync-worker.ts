import { db } from "./db";
import { customers, customerSyncQueue } from "@shared/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { odooClient } from "./odoo";
import { tryAcquireAdvisoryLock, releaseAdvisoryLock } from "./advisory-lock";

const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours (daily)
let intervalHandle: ReturnType<typeof setInterval> | null = null;
let hasLock = false;

async function processOdooSyncQueue(): Promise<void> {
  try {
    console.log("[Odoo Sync Worker] Starting batch sync to Odoo...");
    
    const pendingItems = await db.select()
      .from(customerSyncQueue)
      .where(eq(customerSyncQueue.status, 'pending'))
      .orderBy(customerSyncQueue.createdAt);

    if (pendingItems.length === 0) {
      console.log("[Odoo Sync Worker] No pending changes to sync");
      return;
    }

    console.log(`[Odoo Sync Worker] Found ${pendingItems.length} pending changes`);

    const partnerGroups = new Map<number, typeof pendingItems>();
    for (const item of pendingItems) {
      const group = partnerGroups.get(item.odooPartnerId) || [];
      group.push(item);
      partnerGroups.set(item.odooPartnerId, group);
    }

    console.log(`[Odoo Sync Worker] Processing ${partnerGroups.size} partners`);

    let successCount = 0;
    let errorCount = 0;
    let conflictCount = 0;

    for (const [partnerId, items] of Array.from(partnerGroups.entries())) {
      try {
        // Capture the specific item IDs we're processing to avoid race conditions
        const itemIds = items.map(item => item.id);
        
        const latestChanges: Record<string, string | null> = {};
        for (const item of items) {
          latestChanges[item.fieldName] = item.newValue;
        }

        const customerId = items[0].customerId;
        const [customer] = await db.select()
          .from(customers)
          .where(eq(customers.id, customerId))
          .limit(1);

        const lastWriteDate = customer?.odooWriteDate || undefined;
        const result = await odooClient.updatePartnerWithConflictCheck(
          partnerId,
          latestChanges,
          lastWriteDate
        );

        if (result.conflict) {
          console.log(`[Odoo Sync Worker] Conflict for partner ${partnerId}`);
          // Only update the specific items we processed, not all pending items
          for (const itemId of itemIds) {
            await db.update(customerSyncQueue)
              .set({ 
                status: 'conflict', 
                errorMessage: result.error,
                processedAt: new Date(),
              })
              .where(eq(customerSyncQueue.id, itemId));
          }

          await db.update(customers)
            .set({ 
              odooSyncStatus: 'conflict',
              odooLastSyncError: result.error,
            })
            .where(eq(customers.odooPartnerId, partnerId));

          conflictCount++;
          continue;
        }

        if (!result.success) {
          console.log(`[Odoo Sync Worker] Error for partner ${partnerId}: ${result.error}`);
          const retryCount = items[0].retryCount || 0;
          
          if (retryCount >= 3) {
            // Only update the specific items we processed
            for (const itemId of itemIds) {
              await db.update(customerSyncQueue)
                .set({ 
                  status: 'error', 
                  errorMessage: result.error,
                  processedAt: new Date(),
                })
                .where(eq(customerSyncQueue.id, itemId));
            }

            await db.update(customers)
              .set({ 
                odooSyncStatus: 'error',
                odooLastSyncError: result.error,
              })
              .where(eq(customers.odooPartnerId, partnerId));
          } else {
            // Only update the specific items we processed
            for (const itemId of itemIds) {
              await db.update(customerSyncQueue)
                .set({ 
                  retryCount: retryCount + 1,
                  errorMessage: result.error,
                })
                .where(eq(customerSyncQueue.id, itemId));
            }
          }

          errorCount++;
          continue;
        }

        // Only update the specific items we processed
        for (const itemId of itemIds) {
          await db.update(customerSyncQueue)
            .set({ 
              status: 'synced',
              processedAt: new Date(),
            })
            .where(eq(customerSyncQueue.id, itemId));
        }

        // Check if there are more pending items for this customer
        const remainingPending = await db.select({ count: sql<number>`count(*)::int` })
          .from(customerSyncQueue)
          .where(and(
            eq(customerSyncQueue.customerId, customerId),
            eq(customerSyncQueue.status, 'pending')
          ));
        
        const stillHasPending = (remainingPending[0]?.count || 0) > 0;

        await db.update(customers)
          .set({ 
            odooSyncStatus: stillHasPending ? 'pending' : 'synced',
            odooPendingChanges: stillHasPending ? undefined : null,
            odooLastSyncError: null,
            odooWriteDate: result.currentWriteDate || new Date(),
            lastOdooSyncAt: new Date(),
          })
          .where(eq(customers.odooPartnerId, partnerId));

        successCount++;
        console.log(`[Odoo Sync Worker] Synced partner ${partnerId} (${itemIds.length} items, ${Object.keys(latestChanges).length} fields)`);

      } catch (error: any) {
        console.error(`[Odoo Sync Worker] Unexpected error for partner ${partnerId}:`, error.message);
        errorCount++;
      }
    }

    console.log(`[Odoo Sync Worker] Batch complete. Success: ${successCount}, Errors: ${errorCount}, Conflicts: ${conflictCount}`);

  } catch (error: any) {
    console.error("[Odoo Sync Worker] Error processing sync queue:", error.message);
  }
}

export async function startOdooSyncWorker(): Promise<void> {
  if (intervalHandle !== null) {
    console.log("[Odoo Sync Worker] Already running, skipping start");
    return;
  }

  hasLock = await tryAcquireAdvisoryLock('ODOO_SYNC_WORKER');
  if (!hasLock) {
    console.log("[Odoo Sync Worker] Another instance holds the lock, skipping start");
    return;
  }

  console.log("[Odoo Sync Worker] Acquired lock, starting Odoo sync worker (daily)...");

  intervalHandle = setInterval(() => {
    const now = new Date();
    if (now.getHours() === 3 && now.getMinutes() < 10) {
      processOdooSyncQueue();
    }
  }, 10 * 60 * 1000); // Check every 10 minutes
}

export async function stopOdooSyncWorker(): Promise<void> {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
  if (hasLock) {
    await releaseAdvisoryLock('ODOO_SYNC_WORKER');
    hasLock = false;
  }
  console.log("[Odoo Sync Worker] Stopped");
}

export async function runOdooSyncNow(): Promise<{ success: boolean; message: string }> {
  try {
    await processOdooSyncQueue();
    return { success: true, message: "Sync completed" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
