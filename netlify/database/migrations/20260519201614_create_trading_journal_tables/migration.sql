CREATE TABLE "checklist_templates" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL,
	"question" text NOT NULL,
	"category" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL,
	"session_date" date NOT NULL,
	"went_well" text DEFAULT '' NOT NULL,
	"to_improve" text DEFAULT '' NOT NULL,
	"emotional_rating" integer NOT NULL,
	"additional_notes" text DEFAULT '',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pre_trade_checks" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL,
	"session_date" date NOT NULL,
	"answers" text NOT NULL,
	"readiness_score" integer NOT NULL,
	"passed" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session_logs" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL,
	"session_date" date NOT NULL,
	"rules_followed" text NOT NULL,
	"pre_trade_check_id" integer,
	"session_plan_id" integer,
	"journal_entry_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session_plans" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL,
	"session_date" date NOT NULL,
	"session_type" text NOT NULL,
	"bias" text NOT NULL,
	"max_trades" integer NOT NULL,
	"risk_per_trade" real NOT NULL,
	"notes" text DEFAULT '',
	"locked" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
