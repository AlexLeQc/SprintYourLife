CREATE TABLE "task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"due_date" date,
	"due_time" time(0),
	"completed_on" date,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "task_title_length" CHECK (char_length("task"."title") BETWEEN 1 AND 200),
	CONSTRAINT "task_time_needs_date" CHECK ("task"."due_time" IS NULL OR "task"."due_date" IS NOT NULL)
);
