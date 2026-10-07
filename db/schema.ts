import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  serial,
  real,
  date,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const checklistTemplates = pgTable("checklist_templates", {
  id: serial().primaryKey(),
  userId: text("user_id").notNull(),
  question: text().notNull(),
  category: text().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const preTradeChecks = pgTable("pre_trade_checks", {
  id: serial().primaryKey(),
  userId: text("user_id").notNull(),
  sessionDate: date("session_date").notNull(),
  answers: text().notNull(),
  readinessScore: integer("readiness_score").notNull(),
  passed: boolean().notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessionPlans = pgTable("session_plans", {
  id: serial().primaryKey(),
  userId: text("user_id").notNull(),
  sessionDate: date("session_date").notNull(),
  sessionType: text("session_type").notNull(),
  bias: text().notNull(),
  maxTrades: integer("max_trades").notNull(),
  riskPerTrade: real("risk_per_trade").notNull(),
  notes: text().default(""),
  locked: boolean().notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial().primaryKey(),
  userId: text("user_id").notNull(),
  sessionDate: date("session_date").notNull(),
  wentWell: text("went_well").notNull().default(""),
  toImprove: text("to_improve").notNull().default(""),
  emotionalRating: integer("emotional_rating").notNull(),
  additionalNotes: text("additional_notes").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

// A single day's trade recap. This is the source of truth for the dashboard and
// streak history: the trader records (in real time or backfilled later) which of
// their entry rules they followed, the outcome, and the risk taken. One recap per
// trader per calendar day — saving an existing date upserts it.
export const dayRecaps = pgTable(
  "day_recaps",
  {
    id: serial().primaryKey(),
    userId: text("user_id").notNull(),
    sessionDate: date("session_date").notNull(),
    // JSON map of ruleId -> boolean for the trader's entry checklist.
    rules: text().notNull().default("{}"),
    rulesFollowed: integer("rules_followed").notNull().default(0),
    rulesTotal: integer("rules_total").notNull().default(10),
    // win | loss | breakeven | no-trade
    outcome: text().notNull().default("no-trade"),
    rMultiple: real("r_multiple"),
    riskUsed: real("risk_used"),
    pair: text().default(""),
    notes: text().default(""),
    // full | partial | broken — derived discipline grade used for the heatmap.
    discipline: text().notNull().default("none"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [
    uniqueIndex("day_recaps_user_date_unique").on(t.userId, t.sessionDate),
  ]
);

export const sessionLogs = pgTable("session_logs", {
  id: serial().primaryKey(),
  userId: text("user_id").notNull(),
  sessionDate: date("session_date").notNull(),
  rulesFollowed: text("rules_followed").notNull(),
  preTradeCheckId: integer("pre_trade_check_id"),
  sessionPlanId: integer("session_plan_id"),
  journalEntryId: integer("journal_entry_id"),
  createdAt: timestamp("created_at").defaultNow(),
});
