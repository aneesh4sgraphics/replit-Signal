import { db } from "./db";
import { 
  customers, 
  users,
  nowModeSessions, 
  nowModeActivities,
  nowModeAdminReports,
  customerActivityEvents,
  customerJourney,
  coachingMoments,
  NOW_MODE_BUCKETS,
  BUCKET_QUOTAS,
  CARD_TYPE_BUCKETS,
  HIGH_VALUE_OUTCOMES,
  type NowModeBucket,
  type CardOutcome,
  type NowModeSession,
  type InsertNowModeActivity,
} from "@shared/schema";
import { eq, and, or, isNull, lt, gt, desc, sql, ne, lte } from "drizzle-orm";

const DAILY_TARGET = 10;
const SKIP_PENALTY_THRESHOLD = 3;
const DORMANCY_MINUTES = 90;

interface Customer {
  id: string;
  company: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  salesRepId: string | null;
  salesRepName: string | null;
  pricingTier: string | null;
  lastOutboundEmailAt: Date | null;
  swatchbookSentAt: Date | null;
  pressTestSentAt: Date | null;
  priceListSentAt: Date | null;
  doNotContact: boolean | null;
  pausedUntil: Date | null;
}

interface EligibleCard {
  customerId: string;
  customer: Customer;
  cardType: string;
  bucket: NowModeBucket;
  whyNow: string;
  isHardCard: boolean;
  outcomeButtons: OutcomeButton[];
}

interface OutcomeButton {
  outcome: CardOutcome;
  label: string;
  icon: string;
  color: string;
  schedulesFollowUp?: boolean;
  followUpDays?: number;
}

interface BucketProgress {
  bucket: NowModeBucket;
  completed: number;
  quota: number;
  remaining: number;
}

export class NowModeEngine {
  private getTodayKey(): string {
    return new Date().toISOString().split("T")[0];
  }

  async getOrCreateSession(userId: string): Promise<NowModeSession> {
    const dateKey = this.getTodayKey();
    
    const existing = await db
      .select()
      .from(nowModeSessions)
      .where(and(eq(nowModeSessions.userId, userId), eq(nowModeSessions.dateKey, dateKey)))
      .limit(1);
    
    if (existing.length > 0) {
      return existing[0];
    }

    const [session] = await db
      .insert(nowModeSessions)
      .values({
        userId,
        dateKey,
        totalCompleted: 0,
        dailyTarget: DAILY_TARGET,
        callsCompleted: 0,
        followUpsCompleted: 0,
        outreachCompleted: 0,
        dataHygieneCompleted: 0,
        enablementCompleted: 0,
        totalSkips: 0,
        skipPenaltyApplied: false,
        efficiencyScore: 100,
        highValueOutcomes: 0,
        lastActivityAt: new Date(),
        startedAt: new Date(),
      })
      .returning();
    
    return session;
  }

  getBucketProgress(session: NowModeSession): BucketProgress[] {
    return NOW_MODE_BUCKETS.map((bucket) => {
      const completed = this.getBucketCompleted(session, bucket);
      const quota = BUCKET_QUOTAS[bucket];
      return {
        bucket,
        completed,
        quota,
        remaining: Math.max(0, quota - completed),
      };
    });
  }

  private getBucketCompleted(session: NowModeSession, bucket: NowModeBucket): number {
    switch (bucket) {
      case "calls": return session.callsCompleted || 0;
      case "follow_ups": return session.followUpsCompleted || 0;
      case "outreach": return session.outreachCompleted || 0;
      case "data_hygiene": return session.dataHygieneCompleted || 0;
      case "enablement": return session.enablementCompleted || 0;
    }
  }

  private getNextBucket(session: NowModeSession): NowModeBucket | null {
    const progress = this.getBucketProgress(session);
    const unfilled = progress.filter((p) => p.remaining > 0);
    
    if (unfilled.length === 0) return null;
    
    return unfilled[0].bucket;
  }

  async getEligibleCard(userId: string): Promise<{ card: EligibleCard | null; session: NowModeSession; allDone: boolean }> {
    const session = await this.getOrCreateSession(userId);
    
    if ((session.totalCompleted || 0) >= DAILY_TARGET) {
      return { card: null, session, allDone: true };
    }

    const recentActivities = await db
      .select({ customerId: nowModeActivities.customerId })
      .from(nowModeActivities)
      .where(eq(nowModeActivities.sessionId, session.id))
      .orderBy(desc(nowModeActivities.createdAt))
      .limit(20);
    
    const recentCustomerIds = recentActivities.map((a) => a.customerId);

    const targetBucket = this.getNextBucket(session);
    if (!targetBucket) {
      return { card: null, session, allDone: true };
    }

    const skipPenalty = session.skipPenaltyApplied || false;
    
    const card = await this.findCardForBucket(userId, targetBucket, recentCustomerIds, skipPenalty);
    
    if (card) {
      return { card, session, allDone: false };
    }

    for (const bucket of NOW_MODE_BUCKETS) {
      if (bucket === targetBucket) continue;
      const spilloverCard = await this.findCardForBucket(userId, bucket, recentCustomerIds, skipPenalty);
      if (spilloverCard) {
        return { card: spilloverCard, session, allDone: false };
      }
    }

    return { card: null, session, allDone: true };
  }

  private async findCardForBucket(
    userId: string,
    bucket: NowModeBucket,
    excludeCustomerIds: string[],
    skipHardCards: boolean
  ): Promise<EligibleCard | null> {
    const eligibleCustomers = await this.getEligibleCustomers(userId, excludeCustomerIds);
    
    for (const customer of eligibleCustomers) {
      const cardType = this.matchCardType(customer, bucket, skipHardCards);
      if (cardType) {
        return this.buildCard(customer, cardType, bucket);
      }
    }
    
    return null;
  }

  private async getEligibleCustomers(userId: string, excludeIds: string[]): Promise<Customer[]> {
    const now = new Date();
    
    let query = db
      .select()
      .from(customers)
      .where(
        and(
          or(eq(customers.doNotContact, false), isNull(customers.doNotContact)),
          or(isNull(customers.pausedUntil), lt(customers.pausedUntil, now)),
          or(eq(customers.salesRepId, userId), isNull(customers.salesRepId))
        )
      )
      .orderBy(desc(customers.totalSpent), desc(customers.totalOrders))
      .limit(100);

    const result = await query;
    return result.filter((c) => !excludeIds.includes(c.id));
  }

  private matchCardType(customer: Customer, bucket: NowModeBucket, skipHardCards: boolean): string | null {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    switch (bucket) {
      case "data_hygiene":
        if (!customer.pricingTier) return "set_pricing_tier";
        if (!customer.salesRepId) return "set_sales_rep";
        if (!customer.email) return "set_primary_email";
        return null;

      case "calls":
        if (skipHardCards) return null;
        if (!customer.lastOutboundEmailAt || customer.lastOutboundEmailAt < thirtyDaysAgo) {
          return "daily_call";
        }
        return "daily_call";

      case "outreach":
        if (!customer.swatchbookSentAt) return "send_swatchbook";
        if (!customer.pressTestSentAt) return "send_press_test";
        if (!customer.lastOutboundEmailAt || customer.lastOutboundEmailAt < thirtyDaysAgo) {
          return "send_marketing_email";
        }
        return null;

      case "follow_ups":
        if (skipHardCards) return null;
        return "follow_up_quote";

      case "enablement":
        if (customer.swatchbookSentAt && !customer.priceListSentAt) {
          return "send_price_list";
        }
        return "introduce_category";
    }
  }

  private buildCard(customer: Customer, cardType: string, bucket: NowModeBucket): EligibleCard {
    const isHardCard = ["daily_call", "follow_up_call", "follow_up_quote"].includes(cardType);
    
    return {
      customerId: customer.id,
      customer,
      cardType,
      bucket,
      whyNow: this.getWhyNow(customer, cardType),
      isHardCard,
      outcomeButtons: this.getOutcomeButtons(cardType),
    };
  }

  private getWhyNow(customer: Customer, cardType: string): string {
    const name = customer.company || `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "This customer";
    
    switch (cardType) {
      case "set_pricing_tier":
        return `${name} needs a pricing tier assigned to generate quotes.`;
      case "set_sales_rep":
        return `${name} has no assigned sales rep.`;
      case "set_primary_email":
        return `${name} is missing a primary email address.`;
      case "daily_call":
        return `${name} hasn't been contacted recently. A quick call could uncover opportunities.`;
      case "send_swatchbook":
        return `${name} hasn't received a swatchbook yet - great way to showcase our products.`;
      case "send_press_test":
        return `${name} might benefit from a press test to validate print quality.`;
      case "send_marketing_email":
        return `${name} hasn't received email in 30+ days. Time to re-engage.`;
      case "send_price_list":
        return `${name} received samples but not a price list. Send pricing to close the loop.`;
      case "follow_up_quote":
        return `${name} has an outstanding quote. Follow up to close the deal.`;
      case "introduce_category":
        return `${name} might be interested in expanding to new product categories.`;
      default:
        return `Action needed for ${name}.`;
    }
  }

  private getOutcomeButtons(cardType: string): OutcomeButton[] {
    switch (cardType) {
      case "set_pricing_tier":
      case "set_sales_rep":
      case "set_primary_email":
        return [
          { outcome: "data_updated", label: "Updated", icon: "check", color: "green" },
          { outcome: "marked_dnc", label: "Bad Fit / DNC", icon: "user-x", color: "red" },
        ];

      case "daily_call":
        return [
          { outcome: "called_connected", label: "Connected", icon: "phone", color: "green" },
          { outcome: "called_voicemail", label: "Left Voicemail", icon: "voicemail", color: "yellow", schedulesFollowUp: true, followUpDays: 3 },
          { outcome: "called_no_answer", label: "No Answer", icon: "phone-missed", color: "orange", schedulesFollowUp: true, followUpDays: 2 },
          { outcome: "marked_dnc", label: "Bad Fit / DNC", icon: "user-x", color: "red" },
        ];

      case "send_swatchbook":
      case "send_press_test":
        return [
          { outcome: "sample_sent", label: "Sent", icon: "send", color: "green", schedulesFollowUp: true, followUpDays: 7 },
          { outcome: "emailed", label: "Emailed First", icon: "mail", color: "blue", schedulesFollowUp: true, followUpDays: 3 },
          { outcome: "marked_dnc", label: "Bad Fit / DNC", icon: "user-x", color: "red" },
        ];

      case "send_marketing_email":
        return [
          { outcome: "emailed", label: "Email Sent", icon: "mail", color: "green", schedulesFollowUp: true, followUpDays: 7 },
          { outcome: "marked_dnc", label: "Bad Fit / DNC", icon: "user-x", color: "red" },
        ];

      case "send_price_list":
        return [
          { outcome: "quote_sent", label: "Price List Sent", icon: "file-text", color: "green", schedulesFollowUp: true, followUpDays: 5 },
          { outcome: "emailed", label: "Emailed First", icon: "mail", color: "blue", schedulesFollowUp: true, followUpDays: 3 },
          { outcome: "marked_dnc", label: "Bad Fit / DNC", icon: "user-x", color: "red" },
        ];

      case "follow_up_quote":
        return [
          { outcome: "called_connected", label: "Connected", icon: "phone", color: "green" },
          { outcome: "quote_sent", label: "Re-sent Quote", icon: "file-text", color: "blue", schedulesFollowUp: true, followUpDays: 5 },
          { outcome: "scheduled_follow_up", label: "Schedule Later", icon: "calendar", color: "yellow", schedulesFollowUp: true, followUpDays: 7 },
          { outcome: "marked_dnc", label: "Bad Fit / DNC", icon: "user-x", color: "red" },
        ];

      case "introduce_category":
        return [
          { outcome: "emailed", label: "Intro Sent", icon: "mail", color: "green", schedulesFollowUp: true, followUpDays: 7 },
          { outcome: "called_connected", label: "Discussed", icon: "phone", color: "blue" },
          { outcome: "scheduled_follow_up", label: "Schedule Later", icon: "calendar", color: "yellow", schedulesFollowUp: true, followUpDays: 14 },
        ];

      default:
        return [
          { outcome: "completed", label: "Done", icon: "check", color: "green" },
          { outcome: "marked_dnc", label: "Bad Fit / DNC", icon: "user-x", color: "red" },
        ];
    }
  }

  async completeCard(
    userId: string,
    customerId: string,
    cardType: string,
    outcome: CardOutcome,
    notes?: string
  ): Promise<{ success: boolean; session: NowModeSession; nextFollowUpAt?: Date }> {
    const session = await this.getOrCreateSession(userId);
    const bucket = CARD_TYPE_BUCKETS[cardType] || "data_hygiene";
    const isHighValue = HIGH_VALUE_OUTCOMES.includes(outcome);
    const outcomeButtons = this.getOutcomeButtons(cardType);
    const button = outcomeButtons.find((b) => b.outcome === outcome);
    
    let nextFollowUpAt: Date | undefined;
    if (button?.schedulesFollowUp && button.followUpDays) {
      nextFollowUpAt = new Date();
      nextFollowUpAt.setDate(nextFollowUpAt.getDate() + button.followUpDays);
    }

    await db.insert(nowModeActivities).values({
      sessionId: session.id,
      userId,
      customerId,
      cardType,
      bucket,
      isHardCard: ["daily_call", "follow_up_call", "follow_up_quote"].includes(cardType),
      outcome,
      outcomeNotes: notes,
      isSkip: false,
      nextFollowUpAt,
      nextFollowUpType: nextFollowUpAt ? "follow_up_" + cardType : undefined,
      completedAt: new Date(),
    });

    const newCompleted = (session.totalCompleted || 0) + 1;
    const newHighValue = (session.highValueOutcomes || 0) + (isHighValue ? 1 : 0);
    const newEfficiency = this.calculateEfficiency(newCompleted, session.totalSkips || 0, newHighValue);

    const updateData: Record<string, any> = {
      totalCompleted: newCompleted,
      highValueOutcomes: newHighValue,
      efficiencyScore: newEfficiency,
      lastActivityAt: new Date(),
      updatedAt: new Date(),
    };

    switch (bucket) {
      case "calls":
        updateData.callsCompleted = (session.callsCompleted || 0) + 1;
        break;
      case "follow_ups":
        updateData.followUpsCompleted = (session.followUpsCompleted || 0) + 1;
        break;
      case "outreach":
        updateData.outreachCompleted = (session.outreachCompleted || 0) + 1;
        break;
      case "data_hygiene":
        updateData.dataHygieneCompleted = (session.dataHygieneCompleted || 0) + 1;
        break;
      case "enablement":
        updateData.enablementCompleted = (session.enablementCompleted || 0) + 1;
        break;
    }

    await db.update(nowModeSessions).set(updateData).where(eq(nowModeSessions.id, session.id));

    if (outcome === "marked_dnc") {
      await db.update(customers).set({
        doNotContact: true,
        doNotContactReason: notes || "Marked via NOW MODE",
        doNotContactSetBy: userId,
        doNotContactSetAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(customers.id, customerId));
    }

    if (cardType === "send_swatchbook" && outcome === "sample_sent") {
      await db.update(customers).set({ swatchbookSentAt: new Date(), updatedAt: new Date() }).where(eq(customers.id, customerId));
    } else if (cardType === "send_press_test" && outcome === "sample_sent") {
      await db.update(customers).set({ pressTestSentAt: new Date(), updatedAt: new Date() }).where(eq(customers.id, customerId));
    } else if (cardType === "send_price_list" && outcome === "quote_sent") {
      await db.update(customers).set({ priceListSentAt: new Date(), updatedAt: new Date() }).where(eq(customers.id, customerId));
    }

    if (outcome === "emailed" || outcome === "sample_sent" || outcome === "quote_sent") {
      await db.update(customers).set({ lastOutboundEmailAt: new Date(), updatedAt: new Date() }).where(eq(customers.id, customerId));
    }

    if (nextFollowUpAt) {
      await db.insert(coachingMoments).values({
        customerId,
        assignedTo: userId,
        action: "follow_up_" + cardType,
        whyNow: `Follow up scheduled from NOW MODE ${cardType}`,
        priority: 50,
        scheduledFor: nextFollowUpAt,
        status: "pending",
        sourceType: "now_mode",
      });
    }

    const updatedSession = await this.getOrCreateSession(userId);
    return { success: true, session: updatedSession, nextFollowUpAt };
  }

  async skipCard(
    userId: string,
    customerId: string,
    cardType: string,
    skipReason: string,
    notes?: string
  ): Promise<{ success: boolean; session: NowModeSession; penaltyApplied: boolean }> {
    const session = await this.getOrCreateSession(userId);
    const bucket = CARD_TYPE_BUCKETS[cardType] || "data_hygiene";
    
    await db.insert(nowModeActivities).values({
      sessionId: session.id,
      userId,
      customerId,
      cardType,
      bucket,
      isHardCard: ["daily_call", "follow_up_call", "follow_up_quote"].includes(cardType),
      outcome: "skipped",
      outcomeNotes: notes,
      isSkip: true,
      skipReason,
      completedAt: new Date(),
    });

    const newSkips = (session.totalSkips || 0) + 1;
    const applyPenalty = newSkips >= SKIP_PENALTY_THRESHOLD;
    const newEfficiency = this.calculateEfficiency(session.totalCompleted || 0, newSkips, session.highValueOutcomes || 0);

    await db.update(nowModeSessions).set({
      totalSkips: newSkips,
      skipPenaltyApplied: applyPenalty,
      efficiencyScore: newEfficiency,
      lastActivityAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(nowModeSessions.id, session.id));

    const updatedSession = await this.getOrCreateSession(userId);
    return { success: true, session: updatedSession, penaltyApplied: applyPenalty };
  }

  private calculateEfficiency(completed: number, skips: number, highValueOutcomes: number): number {
    let score = 100;
    
    const completionRatio = completed / DAILY_TARGET;
    score = Math.min(100, 50 + (completionRatio * 50));
    
    score += highValueOutcomes * 5;
    
    if (skips > 2) {
      score -= (skips - 2) * 10;
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  async checkDormancy(userId: string): Promise<{ isDormant: boolean; minutesSinceActivity: number; session: NowModeSession }> {
    const session = await this.getOrCreateSession(userId);
    
    if (!session.lastActivityAt) {
      return { isDormant: false, minutesSinceActivity: 0, session };
    }

    const now = new Date();
    const lastActivity = new Date(session.lastActivityAt);
    const minutesSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60));
    
    return {
      isDormant: minutesSinceActivity >= DORMANCY_MINUTES,
      minutesSinceActivity,
      session,
    };
  }

  async getAdminReport(dateKey?: string): Promise<any[]> {
    const targetDate = dateKey || this.getTodayKey();
    
    const sessions = await db
      .select({
        session: nowModeSessions,
        user: users,
      })
      .from(nowModeSessions)
      .leftJoin(users, eq(nowModeSessions.userId, users.id))
      .where(eq(nowModeSessions.dateKey, targetDate))
      .orderBy(desc(nowModeSessions.totalCompleted));

    const reports = await Promise.all(
      sessions.map(async ({ session, user }) => {
        const activities = await db
          .select()
          .from(nowModeActivities)
          .where(eq(nowModeActivities.sessionId, session.id));

        const outcomeBreakdown: Record<string, number> = {};
        activities.forEach((a) => {
          outcomeBreakdown[a.outcome] = (outcomeBreakdown[a.outcome] || 0) + 1;
        });

        const totalActions = activities.length;
        const skipRate = totalActions > 0 ? ((session.totalSkips || 0) / totalActions) * 100 : 0;

        return {
          userId: session.userId,
          userEmail: user?.email || "Unknown",
          userName: user?.username || "Unknown",
          dateKey: session.dateKey,
          completions: session.totalCompleted || 0,
          skips: session.totalSkips || 0,
          skipRate: Math.round(skipRate * 10) / 10,
          bucketBreakdown: {
            calls: session.callsCompleted || 0,
            follow_ups: session.followUpsCompleted || 0,
            outreach: session.outreachCompleted || 0,
            data_hygiene: session.dataHygieneCompleted || 0,
            enablement: session.enablementCompleted || 0,
          },
          outcomeBreakdown,
          efficiencyScore: session.efficiencyScore || 100,
          highValueOutcomes: session.highValueOutcomes || 0,
          firstActivityAt: activities.length > 0 ? activities[0].completedAt : null,
          lastActivityAt: session.lastActivityAt,
        };
      })
    );

    return reports;
  }

  async getEfficiencyScore(userId: string): Promise<number> {
    const session = await this.getOrCreateSession(userId);
    return session.efficiencyScore || 100;
  }
}

export const nowModeEngine = new NowModeEngine();
