-- Spec 004 CR-1 (vision v0.5): Move is split into Sport and Explore.
-- Former Move rows become Sport; the owner re-files the Explore ones with Edit.
-- No titles here on purpose: the repository is public.
ALTER TABLE "sidequest" DROP CONSTRAINT "sidequest_category_valid";--> statement-breakpoint
UPDATE "sidequest" SET "category" = 'sport' WHERE "category" = 'move';--> statement-breakpoint
ALTER TABLE "sidequest" ADD CONSTRAINT "sidequest_category_valid" CHECK ("sidequest"."category" IN ('sport', 'explore', 'learn', 'create', 'play', 'connect'));
