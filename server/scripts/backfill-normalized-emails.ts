import { db } from "../db";
import { customers, customerContacts, gmailMessages, userGmailConnections, gmailUnmatchedEmails, gmailMessageMatches } from "@shared/schema";
import { isNull, sql } from "drizzle-orm";
import { normalizeEmail } from "@shared/email-normalizer";

const BATCH_SIZE = 500;

async function backfillCustomers() {
  console.log("[Backfill] Starting customer email normalization...");
  let processed = 0;
  let updated = 0;
  
  while (true) {
    const batch = await db.select({ id: customers.id, email: customers.email, email2: customers.email2 })
      .from(customers)
      .where(isNull(customers.emailNormalized))
      .limit(BATCH_SIZE);
    
    if (batch.length === 0) break;
    
    for (const customer of batch) {
      const emailNormalized = normalizeEmail(customer.email);
      const email2Normalized = normalizeEmail(customer.email2);
      
      await db.update(customers)
        .set({ 
          emailNormalized,
          email2Normalized,
          updatedAt: new Date(),
        })
        .where(sql`${customers.id} = ${customer.id}`);
      
      updated++;
    }
    
    processed += batch.length;
    console.log(`[Backfill] Customers: ${processed} processed, ${updated} updated`);
  }
  
  console.log(`[Backfill] Customer backfill complete: ${updated} records updated`);
  return updated;
}

async function backfillCustomerContacts() {
  console.log("[Backfill] Starting customer contacts email normalization...");
  let processed = 0;
  let updated = 0;
  
  while (true) {
    const batch = await db.select({ id: customerContacts.id, email: customerContacts.email })
      .from(customerContacts)
      .where(isNull(customerContacts.emailNormalized))
      .limit(BATCH_SIZE);
    
    if (batch.length === 0) break;
    
    for (const contact of batch) {
      const emailNormalized = normalizeEmail(contact.email);
      
      await db.update(customerContacts)
        .set({ 
          emailNormalized,
          updatedAt: new Date(),
        })
        .where(sql`${customerContacts.id} = ${contact.id}`);
      
      updated++;
    }
    
    processed += batch.length;
    console.log(`[Backfill] Contacts: ${processed} processed, ${updated} updated`);
  }
  
  console.log(`[Backfill] Contact backfill complete: ${updated} records updated`);
  return updated;
}

async function backfillGmailMessages() {
  console.log("[Backfill] Starting Gmail messages email normalization...");
  let processed = 0;
  let updated = 0;
  
  while (true) {
    const batch = await db.select({ 
      id: gmailMessages.id, 
      fromEmail: gmailMessages.fromEmail, 
      toEmail: gmailMessages.toEmail 
    })
      .from(gmailMessages)
      .where(isNull(gmailMessages.fromEmailNormalized))
      .limit(BATCH_SIZE);
    
    if (batch.length === 0) break;
    
    for (const msg of batch) {
      const fromEmailNormalized = normalizeEmail(msg.fromEmail);
      const toEmailNormalized = normalizeEmail(msg.toEmail);
      
      await db.update(gmailMessages)
        .set({ 
          fromEmailNormalized,
          toEmailNormalized,
        })
        .where(sql`${gmailMessages.id} = ${msg.id}`);
      
      updated++;
    }
    
    processed += batch.length;
    console.log(`[Backfill] Gmail messages: ${processed} processed, ${updated} updated`);
  }
  
  console.log(`[Backfill] Gmail messages backfill complete: ${updated} records updated`);
  return updated;
}

async function backfillGmailConnections() {
  console.log("[Backfill] Starting Gmail connections email normalization...");
  let updated = 0;
  
  const connections = await db.select({ 
    id: userGmailConnections.id, 
    gmailAddress: userGmailConnections.gmailAddress 
  })
    .from(userGmailConnections)
    .where(isNull(userGmailConnections.gmailAddressNormalized));
  
  for (const conn of connections) {
    const gmailAddressNormalized = normalizeEmail(conn.gmailAddress);
    
    await db.update(userGmailConnections)
      .set({ 
        gmailAddressNormalized,
        updatedAt: new Date(),
      })
      .where(sql`${userGmailConnections.id} = ${conn.id}`);
    
    updated++;
  }
  
  console.log(`[Backfill] Gmail connections backfill complete: ${updated} records updated`);
  return updated;
}

async function backfillUnmatchedEmails() {
  console.log("[Backfill] Starting unmatched emails normalization...");
  let processed = 0;
  let updated = 0;
  
  while (true) {
    const batch = await db.select({ 
      id: gmailUnmatchedEmails.id, 
      email: gmailUnmatchedEmails.email 
    })
      .from(gmailUnmatchedEmails)
      .where(isNull(gmailUnmatchedEmails.emailNormalized))
      .limit(BATCH_SIZE);
    
    if (batch.length === 0) break;
    
    for (const unmatched of batch) {
      const emailNormalized = normalizeEmail(unmatched.email);
      
      await db.update(gmailUnmatchedEmails)
        .set({ emailNormalized })
        .where(sql`${gmailUnmatchedEmails.id} = ${unmatched.id}`);
      
      updated++;
    }
    
    processed += batch.length;
    console.log(`[Backfill] Unmatched emails: ${processed} processed, ${updated} updated`);
  }
  
  console.log(`[Backfill] Unmatched emails backfill complete: ${updated} records updated`);
  return updated;
}

async function backfillMessageMatches() {
  console.log("[Backfill] Starting message matches normalization...");
  let processed = 0;
  let updated = 0;
  
  while (true) {
    const batch = await db.select({ 
      id: gmailMessageMatches.id, 
      matchedEmail: gmailMessageMatches.matchedEmail 
    })
      .from(gmailMessageMatches)
      .where(isNull(gmailMessageMatches.matchedEmailNormalized))
      .limit(BATCH_SIZE);
    
    if (batch.length === 0) break;
    
    for (const match of batch) {
      const matchedEmailNormalized = normalizeEmail(match.matchedEmail);
      
      await db.update(gmailMessageMatches)
        .set({ matchedEmailNormalized })
        .where(sql`${gmailMessageMatches.id} = ${match.id}`);
      
      updated++;
    }
    
    processed += batch.length;
    console.log(`[Backfill] Message matches: ${processed} processed, ${updated} updated`);
  }
  
  console.log(`[Backfill] Message matches backfill complete: ${updated} records updated`);
  return updated;
}

export async function runEmailNormalizationBackfill(): Promise<{
  customers: number;
  contacts: number;
  gmailMessages: number;
  gmailConnections: number;
  unmatchedEmails: number;
  messageMatches: number;
}> {
  console.log("[Backfill] === Starting Email Normalization Backfill ===");
  const startTime = Date.now();
  
  const results = {
    customers: await backfillCustomers(),
    contacts: await backfillCustomerContacts(),
    gmailMessages: await backfillGmailMessages(),
    gmailConnections: await backfillGmailConnections(),
    unmatchedEmails: await backfillUnmatchedEmails(),
    messageMatches: await backfillMessageMatches(),
  };
  
  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log(`[Backfill] === Backfill Complete in ${duration}s ===`);
  console.log(`[Backfill] Summary:`, results);
  
  return results;
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runEmailNormalizationBackfill()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[Backfill] Error:", err);
      process.exit(1);
    });
}
