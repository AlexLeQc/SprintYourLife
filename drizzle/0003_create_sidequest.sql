CREATE TABLE "sidequest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sidequest_title_length" CHECK (char_length("sidequest"."title") BETWEEN 1 AND 200),
	CONSTRAINT "sidequest_category_valid" CHECK ("sidequest"."category" IN ('create', 'learn', 'play', 'connect', 'move'))
);
