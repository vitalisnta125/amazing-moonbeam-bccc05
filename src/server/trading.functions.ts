import { createServerFn } from "@tanstack/react-start";
import { requireAuthMiddleware } from "../middleware/identity.js";
import { db } from "../../db/index.js";
import {
  checklistTemplates,
  preTradeChecks,
  sessionPlans,
  journalEntries,
  sessionLogs,
  dayRecaps,
} from "../../db/schema.js";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  countFollowed,
  gradeDiscipline,
  RULES_TOTAL,
  type RuleState,
  type Outcome,
} from "../lib/trade-rules.js";

// --- Checklist Templates ---

export const getChecklistTemplates = createServerFn({ method: "GET" })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const rows = await db
      .select()
      .from(checklistTemplates)
      .where(eq(checklistTemplates.userId, context.user.id))
      .orderBy(checklistTemplates.sortOrder);
    return rows;
  });

export const saveChecklistTemplates = createServerFn({ method: "POST" })
  .middleware([requireAuthMiddleware])
  .inputValidator(
    (data: { questions: { question: string; category: string }[] }) => data
  )
  .handler(async ({ context, data }) => {
    await db
      .delete(checklistTemplates)
      .where(eq(checklistTemplates.userId, context.user.id));
    if (data.questions.length > 0) {
      await db.insert(checklistTemplates).values(
        data.questions.map((q, i) => ({
          userId: context.user.id,
          question: q.question,
          category: q.category,
          sortOrder: i,
        }))
      );
    }
    return { success: true };
  });

// --- Pre-Trade Checks ---

export const submitPreTradeCheck = createServerFn({ method: "POST" })
  .middleware([requireAuthMiddleware])
  .inputValidator(
    (data: {
      answers: string;
      readinessScore: number;
      passed: boolean;
      sessionDate: string;
    }) => data
  )
  .handler(async ({ context, data }) => {
    const [row] = await db
      .insert(preTradeChecks)
      .values({
        userId: context.user.id,
        sessionDate: data.sessionDate,
        answers: data.answers,
        readinessScore: data.readinessScore,
        passed: data.passed,
      })
      .returning();
    return row;
  });

export const getTodayCheck = createServerFn({ method: "GET" })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const today = new Date().toISOString().split("T")[0];
    const rows = await db
      .select()
      .from(preTradeChecks)
      .where(
        and(
          eq(preTradeChecks.userId, context.user.id),
          eq(preTradeChecks.sessionDate, today)
        )
      )
      .orderBy(desc(preTradeChecks.createdAt))
      .limit(1);
    return rows[0] ?? null;
  });

// --- Session Plans ---

export const submitSessionPlan = createServerFn({ method: "POST" })
  .middleware([requireAuthMiddleware])
  .inputValidator(
    (data: {
      sessionDate: string;
      sessionType: string;
      bias: string;
      maxTrades: number;
      riskPerTrade: number;
      notes: string;
    }) => data
  )
  .handler(async ({ context, data }) => {
    const [row] = await db
      .insert(sessionPlans)
      .values({
        userId: context.user.id,
        ...data,
      })
      .returning();
    return row;
  });

export const getTodayPlan = createServerFn({ method: "GET" })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const today = new Date().toISOString().split("T")[0];
    const rows = await db
      .select()
      .from(sessionPlans)
      .where(
        and(
          eq(sessionPlans.userId, context.user.id),
          eq(sessionPlans.sessionDate, today)
        )
      )
      .orderBy(desc(sessionPlans.createdAt))
      .limit(1);
    return rows[0] ?? null;
  });

// --- Journal Entries ---

export const submitJournalEntry = createServerFn({ method: "POST" })
  .middleware([requireAuthMiddleware])
  .inputValidator(
    (data: {
      sessionDate: string;
      wentWell: string;
      toImprove: string;
      emotionalRating: number;
      additionalNotes: string;
    }) => data
  )
  .handler(async ({ context, data }) => {
    const [row] = await db
      .insert(journalEntries)
      .values({
        userId: context.user.id,
        ...data,
      })
      .returning();
    return row;
  });

export const getJournalEntries = createServerFn({ method: "GET" })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const rows = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, context.user.id))
      .orderBy(desc(journalEntries.sessionDate))
      .limit(30);
    return rows;
  });

export const getTodayJournal = createServerFn({ method: "GET" })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const today = new Date().toISOString().split("T")[0];
    const rows = await db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, context.user.id),
          eq(journalEntries.sessionDate, today)
        )
      )
      .limit(1);
    return rows[0] ?? null;
  });

// --- Session Logs (Streak data) ---

export const submitSessionLog = createServerFn({ method: "POST" })
  .middleware([requireAuthMiddleware])
  .inputValidator(
    (data: {
      sessionDate: string;
      rulesFollowed: string;
      preTradeCheckId?: number;
      sessionPlanId?: number;
      journalEntryId?: number;
    }) => data
  )
  .handler(async ({ context, data }) => {
    const [row] = await db
      .insert(sessionLogs)
      .values({
        userId: context.user.id,
        ...data,
      })
      .returning();
    return row;
  });

export const getSessionLogs = createServerFn({ method: "GET" })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const rows = await db
      .select()
      .from(sessionLogs)
      .where(eq(sessionLogs.userId, context.user.id))
      .orderBy(desc(sessionLogs.sessionDate));
    return rows;
  });

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const userId = context.user.id;

    const totalSessions = await db
      .select({ count: sql<number>`count(*)` })
      .from(sessionLogs)
      .where(eq(sessionLogs.userId, userId));

    const greenSessions = await db
      .select({ count: sql<number>`count(*)` })
      .from(sessionLogs)
      .where(
        and(
          eq(sessionLogs.userId, userId),
          eq(sessionLogs.rulesFollowed, "full")
        )
      );

    const recentChecks = await db
      .select()
      .from(preTradeChecks)
      .where(eq(preTradeChecks.userId, userId))
      .orderBy(desc(preTradeChecks.createdAt))
      .limit(7);

    const avgScore =
      recentChecks.length > 0
        ? Math.round(
            recentChecks.reduce((s, c) => s + c.readinessScore, 0) /
              recentChecks.length
          )
        : 0;

    return {
      totalSessions: Number(totalSessions[0]?.count ?? 0),
      greenSessions: Number(greenSessions[0]?.count ?? 0),
      avgReadinessScore: avgScore,
    };
  });

// --- Day Recaps (real-time + backfilled trade records) ---

export const getDayRecaps = createServerFn({ method: "GET" })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const rows = await db
      .select()
      .from(dayRecaps)
      .where(eq(dayRecaps.userId, context.user.id))
      .orderBy(desc(dayRecaps.sessionDate))
      .limit(180);

    // Parse the stored JSON rule map back into an object for the client.
    return rows.map((r) => {
      let rules: RuleState = {};
      try {
        rules = JSON.parse(r.rules) as RuleState;
      } catch {
        rules = {};
      }
      return { ...r, rules };
    });
  });

export const saveDayRecap = createServerFn({ method: "POST" })
  .middleware([requireAuthMiddleware])
  .inputValidator(
    (data: {
      sessionDate: string;
      rules: RuleState;
      outcome: Outcome;
      rMultiple: number | null;
      riskUsed: number | null;
      pair: string;
      notes: string;
    }) => data
  )
  .handler(async ({ context, data }) => {
    const rulesFollowed = countFollowed(data.rules);
    const discipline = gradeDiscipline(rulesFollowed, RULES_TOTAL, data.outcome);
    const rulesJson = JSON.stringify(data.rules ?? {});

    const [row] = await db
      .insert(dayRecaps)
      .values({
        userId: context.user.id,
        sessionDate: data.sessionDate,
        rules: rulesJson,
        rulesFollowed,
        rulesTotal: RULES_TOTAL,
        outcome: data.outcome,
        rMultiple: data.rMultiple,
        riskUsed: data.riskUsed,
        pair: data.pair,
        notes: data.notes,
        discipline,
      })
      // One recap per trader per day — re-saving a date overwrites it.
      .onConflictDoUpdate({
        target: [dayRecaps.userId, dayRecaps.sessionDate],
        set: {
          rules: rulesJson,
          rulesFollowed,
          rulesTotal: RULES_TOTAL,
          outcome: data.outcome,
          rMultiple: data.rMultiple,
          riskUsed: data.riskUsed,
          pair: data.pair,
          notes: data.notes,
          discipline,
          updatedAt: new Date(),
        },
      })
      .returning();

    return { ...row, rules: data.rules };
  });
