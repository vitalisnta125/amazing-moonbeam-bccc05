CREATE TABLE "day_recaps" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL,
	"session_date" date NOT NULL,
	"rules" text DEFAULT '{}' NOT NULL,
	"rules_followed" integer DEFAULT 0 NOT NULL,
	"rules_total" integer DEFAULT 10 NOT NULL,
	"outcome" text DEFAULT 'no-trade' NOT NULL,
	"r_multiple" real,
	"risk_used" real,
	"pair" text DEFAULT '',
	"notes" text DEFAULT '',
	"discipline" text DEFAULT 'none' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "day_recaps_user_date_unique" ON "day_recaps" ("user_id","session_date");