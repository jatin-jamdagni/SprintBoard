CREATE TABLE "workspaces" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"github_org" text NOT NULL,
	"github_repo" text NOT NULL,
	"github_token" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pull_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"repo" text NOT NULL,
	"pr_number" integer NOT NULL,
	"title" text NOT NULL,
	"author" text NOT NULL,
	"avatar_url" text,
	"status" text NOT NULL,
	"is_draft" boolean DEFAULT false NOT NULL,
	"opened_at" timestamp with time zone NOT NULL,
	"merged_at" timestamp with time zone,
	"first_review_at" timestamp with time zone,
	"review_count" integer DEFAULT 0 NOT NULL,
	"additions" integer DEFAULT 0 NOT NULL,
	"deletions" integer DEFAULT 0 NOT NULL,
	"url" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sprint_summaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"content" text NOT NULL,
	"pr_count" integer DEFAULT 0 NOT NULL,
	"merged_count" integer DEFAULT 0 NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"date" date NOT NULL,
	"prs_opened" integer DEFAULT 0 NOT NULL,
	"prs_merged" integer DEFAULT 0 NOT NULL,
	"avg_review_lag_hours" numeric(6, 2)
);
--> statement-breakpoint
ALTER TABLE "pull_requests" ADD CONSTRAINT "pull_requests_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprint_summaries" ADD CONSTRAINT "sprint_summaries_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_snapshots" ADD CONSTRAINT "daily_snapshots_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pr_workspace_repo_number_idx" ON "pull_requests" USING btree ("workspace_id","repo","pr_number");--> statement-breakpoint
CREATE UNIQUE INDEX "snapshot_workspace_date_idx" ON "daily_snapshots" USING btree ("workspace_id","date");