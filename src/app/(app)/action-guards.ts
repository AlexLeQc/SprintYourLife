import "server-only";
import type { TitleError } from "@/domain/title";
import { getAllowedSession } from "@/server/session";

/**
 * Guards shared by every server action (tasks, sidequests). Not a "use server" file:
 * these helpers must never become endpoints themselves.
 */

/** What a form needs to know. `error` is a short message for the user. */
export type FormResult = { ok: true } | { ok: false; error: string };

/**
 * Server actions are public HTTP endpoints: check the session FIRST (AC-S.1 of specs 002 and 004),
 * then re-validate everything. The client is never trusted.
 */
export async function assertAllowed(): Promise<void> {
  const session = await getAllowedSession();
  if (!session) throw new Error("Not allowed");
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Refuses anything that isn't a UUID before it reaches a query. */
export function assertId(id: unknown, what: string): asserts id is string {
  if (typeof id !== "string" || !UUID_PATTERN.test(id)) throw new Error(`Invalid ${what} id`);
}

/** BR-1's user-facing messages, the same for tasks and sidequests. */
export function titleErrorMessage(error: TitleError): string {
  return error === "too_long" ? "Title is too long (200 characters max)." : "Title is empty.";
}
