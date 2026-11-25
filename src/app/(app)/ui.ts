import type { TitleError } from "@/domain/title";

/**
 * Styles and messages shared by the task and sidequest screens (reuse first, CLAUDE.md).
 * Inputs use 16 px text (text-base) so iOS doesn't zoom in (spec 002 AC-2.8).
 */
export const field =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-950";
export const primaryButton =
  "rounded-lg bg-zinc-900 px-4 py-2 text-base font-medium text-white dark:bg-zinc-100 dark:text-zinc-900";
export const secondaryButton =
  "rounded-full border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300";
export const errorText = "text-sm text-red-700 dark:text-red-400";

export const SAVE_ERROR = "Couldn't save. Check your connection and try again.";

/** BR-1's user-facing messages, the same for tasks and sidequests, on the server and in the browser. */
export function titleErrorMessage(error: TitleError): string {
  return error === "too_long" ? "Title is too long (200 characters max)." : "Title is empty.";
}
