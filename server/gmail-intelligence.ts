import { db } from "./db";
import { gmailSyncState, gmailMessages, gmailInsights, customers } from "@shared/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { getMessages, getMessage } from "./gmail-client";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function parseEmailAddress(raw: string): { email: string; name: string } {
  const match = raw.match(/^(?:"?([^"<]*)"?\s*)?<?([^>]+)>?$/);
  if (match) {
    return { name: match[1]?.trim() || '', email: match[2]?.trim() || raw };
  }
  return { name: '', email: raw };
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function getSyncState(userId: string) {
  const [state] = await db.select().from(gmailSyncState).where(eq(gmailSyncState.userId, userId));
  return state;
}

export async function createOrUpdateSyncState(userId: string, updates: Partial<typeof gmailSyncState.$inferSelect>) {
  const existing = await getSyncState(userId);
  if (existing) {
    await db.update(gmailSyncState)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(gmailSyncState.userId, userId));
  } else {
    await db.insert(gmailSyncState).values({
      userId,
      ...updates,
    });
  }
}

export async function syncGmailMessages(userId: string, userEmail: string, maxMessages: number = 50) {
  console.log(`[Gmail Intelligence] Starting sync for user ${userId}`);
  
  await createOrUpdateSyncState(userId, { syncStatus: 'syncing' });

  try {
    const inboxMessages = await getMessages('INBOX', maxMessages);
    const sentMessages = await getMessages('SENT', maxMessages);
    
    const allMessages = [
      ...inboxMessages.map(m => ({ ...m, direction: 'inbound' as const })),
      ...sentMessages.map(m => ({ ...m, direction: 'outbound' as const }))
    ];

    const existingMsgIds = await db.select({ gmailMessageId: gmailMessages.gmailMessageId })
      .from(gmailMessages)
      .where(eq(gmailMessages.userId, userId));
    const existingSet = new Set(existingMsgIds.map(m => m.gmailMessageId));

    const newMessages = allMessages.filter(m => m.id && !existingSet.has(m.id));
    console.log(`[Gmail Intelligence] Found ${newMessages.length} new messages to process`);

    const customerEmails = await db.select({ id: customers.id, email: customers.email })
      .from(customers);
    const emailToCustomer: Record<string, string> = {};
    customerEmails.forEach(c => {
      if (c.email) emailToCustomer[c.email.toLowerCase()] = c.id;
    });

    let processed = 0;
    for (const msg of newMessages) {
      if (!msg.id) continue;
      
      const fullMessage = await getMessage(msg.id);
      const fromParsed = parseEmailAddress(fullMessage.from);
      const toParsed = parseEmailAddress(fullMessage.to);
      
      const contactEmail = msg.direction === 'inbound' ? fromParsed.email : toParsed.email;
      const customerId = emailToCustomer[contactEmail.toLowerCase()] || null;
      
      const bodyText = stripHtml(fullMessage.body);

      await db.insert(gmailMessages).values({
        userId,
        gmailMessageId: msg.id,
        threadId: msg.threadId || null,
        direction: msg.direction,
        fromEmail: fromParsed.email,
        fromName: fromParsed.name,
        toEmail: toParsed.email,
        toName: toParsed.name,
        subject: fullMessage.subject,
        snippet: fullMessage.snippet || null,
        bodyText: bodyText.substring(0, 10000),
        sentAt: msg.date ? new Date(msg.date) : null,
        customerId,
        analysisStatus: 'pending',
      });
      processed++;
    }

    const currentState = await getSyncState(userId);
    await createOrUpdateSyncState(userId, { 
      syncStatus: 'idle',
      lastSyncedAt: new Date(),
      messagesProcessed: (currentState?.messagesProcessed || 0) + processed,
      lastError: null
    });

    console.log(`[Gmail Intelligence] Sync complete. Processed ${processed} new messages`);
    return { success: true, processedCount: processed };
  } catch (error: any) {
    console.error('[Gmail Intelligence] Sync error:', error);
    await createOrUpdateSyncState(userId, { 
      syncStatus: 'error',
      lastError: error.message 
    });
    throw error;
  }
}

export async function analyzeMessagesForInsights(userId: string, limit: number = 20) {
  console.log(`[Gmail Intelligence] Analyzing messages for user ${userId}`);
  
  const pendingMessages = await db.select()
    .from(gmailMessages)
    .where(and(
      eq(gmailMessages.userId, userId),
      eq(gmailMessages.analysisStatus, 'pending')
    ))
    .limit(limit);

  if (pendingMessages.length === 0) {
    console.log('[Gmail Intelligence] No pending messages to analyze');
    return { analyzed: 0, insights: 0 };
  }

  let totalInsights = 0;

  for (const message of pendingMessages) {
    try {
      await db.update(gmailMessages)
        .set({ analysisStatus: 'processing' })
        .where(eq(gmailMessages.id, message.id));

      const insights = await extractInsightsFromEmail(message);
      
      for (const insight of insights) {
        await db.insert(gmailInsights).values({
          messageId: message.id,
          userId,
          customerId: message.customerId,
          insightType: insight.type,
          summary: insight.summary,
          details: insight.details,
          confidence: insight.confidence.toString(),
          dueDate: insight.dueDate,
          priority: insight.priority,
          status: 'pending',
        });
        totalInsights++;
      }

      await db.update(gmailMessages)
        .set({ analysisStatus: 'completed', analyzedAt: new Date() })
        .where(eq(gmailMessages.id, message.id));

    } catch (error: any) {
      console.error(`[Gmail Intelligence] Error analyzing message ${message.id}:`, error);
      await db.update(gmailMessages)
        .set({ analysisStatus: 'failed' })
        .where(eq(gmailMessages.id, message.id));
    }
  }

  const finalState = await getSyncState(userId);
  await createOrUpdateSyncState(userId, {
    insightsExtracted: (finalState?.insightsExtracted || 0) + totalInsights,
  });

  console.log(`[Gmail Intelligence] Analysis complete. Extracted ${totalInsights} insights`);
  return { analyzed: pendingMessages.length, insights: totalInsights };
}

interface ExtractedInsight {
  type: 'sales_opportunity' | 'promise' | 'follow_up' | 'task' | 'question';
  summary: string;
  details: string;
  confidence: number;
  dueDate: Date | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

async function extractInsightsFromEmail(message: typeof gmailMessages.$inferSelect): Promise<ExtractedInsight[]> {
  const emailContent = `
Subject: ${message.subject}
From: ${message.fromName} <${message.fromEmail}>
To: ${message.toName} <${message.toEmail}>
Date: ${message.sentAt?.toISOString() || 'Unknown'}
Direction: ${message.direction === 'outbound' ? 'Sent by me' : 'Received'}

Content:
${message.bodyText?.substring(0, 4000) || message.snippet || 'No content'}
`;

  const systemPrompt = `You are a sales intelligence assistant analyzing business emails. Extract actionable insights from emails.

For each email, identify:
1. PROMISES: Commitments made to customers (e.g., "I'll send you a quote by Friday", "I'll follow up next week")
2. FOLLOW_UPS: Required follow-up actions mentioned (e.g., "let me know if you need anything", "touch base next month")
3. SALES_OPPORTUNITIES: Buying signals or opportunities (e.g., "interested in pricing", "looking to order soon")
4. TASKS: Specific action items mentioned (e.g., "send samples", "check inventory")
5. QUESTIONS: Unanswered customer questions requiring response

Return a JSON array of insights. Each insight must have:
- type: one of "promise", "follow_up", "sales_opportunity", "task", "question"
- summary: a brief 1-sentence description (max 100 chars)
- details: fuller context from the email
- confidence: 0.0-1.0 how confident you are this is actionable
- dueDate: ISO date string if a deadline is mentioned or can be reasonably inferred, null otherwise
- priority: "low", "medium", "high", or "urgent" based on urgency

Only extract insights with confidence >= 0.6. If no actionable insights, return empty array [].
Focus on business-relevant items. Ignore auto-replies, newsletters, and marketing emails.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: emailContent }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];

    const parsed = JSON.parse(content);
    const insights: ExtractedInsight[] = (parsed.insights || parsed || [])
      .filter((i: any) => i.confidence >= 0.6)
      .map((i: any) => ({
        type: i.type,
        summary: i.summary?.substring(0, 200) || '',
        details: i.details?.substring(0, 1000) || '',
        confidence: parseFloat(i.confidence) || 0.7,
        dueDate: i.dueDate ? new Date(i.dueDate) : null,
        priority: i.priority || 'medium',
      }));

    return insights;
  } catch (error: any) {
    console.error('[Gmail Intelligence] OpenAI error:', error);
    return [];
  }
}

export async function getInsightsForUser(userId: string, filters?: { 
  status?: string; 
  type?: string; 
  customerId?: string;
  limit?: number;
}) {
  let query = db.select({
    insight: gmailInsights,
    message: gmailMessages,
    customer: customers,
  })
    .from(gmailInsights)
    .leftJoin(gmailMessages, eq(gmailInsights.messageId, gmailMessages.id))
    .leftJoin(customers, eq(gmailInsights.customerId, customers.id))
    .where(eq(gmailInsights.userId, userId))
    .orderBy(desc(gmailInsights.createdAt))
    .limit(filters?.limit || 50);

  const results = await query;
  
  return results.map(r => ({
    ...r.insight,
    email: r.message ? {
      subject: r.message.subject,
      from: r.message.fromEmail,
      to: r.message.toEmail,
      date: r.message.sentAt,
      direction: r.message.direction,
    } : null,
    customer: r.customer ? {
      id: r.customer.id,
      firstName: r.customer.firstName,
      lastName: r.customer.lastName,
      company: r.customer.company,
      email: r.customer.email,
    } : null,
  }));
}

export async function updateInsightStatus(insightId: number, status: string, userId: string, reason?: string) {
  const updates: any = { 
    status, 
    updatedAt: new Date() 
  };
  
  if (status === 'completed') {
    updates.completedAt = new Date();
    updates.completedBy = userId;
  } else if (status === 'dismissed') {
    updates.dismissedAt = new Date();
    updates.dismissedReason = reason;
  }

  await db.update(gmailInsights)
    .set(updates)
    .where(and(
      eq(gmailInsights.id, insightId),
      eq(gmailInsights.userId, userId)
    ));
}

export async function getInsightsSummary(userId: string) {
  const stats = await db.select({
    status: gmailInsights.status,
    type: gmailInsights.insightType,
    count: sql<number>`count(*)::int`,
  })
    .from(gmailInsights)
    .where(eq(gmailInsights.userId, userId))
    .groupBy(gmailInsights.status, gmailInsights.insightType);

  const pending = stats.filter(s => s.status === 'pending');
  const byType: Record<string, number> = {};
  pending.forEach(s => {
    byType[s.type] = (byType[s.type] || 0) + s.count;
  });

  const urgent = await db.select({ count: sql<number>`count(*)::int` })
    .from(gmailInsights)
    .where(and(
      eq(gmailInsights.userId, userId),
      eq(gmailInsights.status, 'pending'),
      eq(gmailInsights.priority, 'urgent')
    ));

  const overdueCount = await db.select({ count: sql<number>`count(*)::int` })
    .from(gmailInsights)
    .where(and(
      eq(gmailInsights.userId, userId),
      eq(gmailInsights.status, 'pending'),
      sql`${gmailInsights.dueDate} < NOW()`
    ));

  return {
    totalPending: pending.reduce((sum, s) => sum + s.count, 0),
    byType,
    urgent: urgent[0]?.count || 0,
    overdue: overdueCount[0]?.count || 0,
  };
}
