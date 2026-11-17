"use server";

import { refresh } from "next/cache";
import { normalizeTitle, parseDue } from "@/domain/task";
import { getAllowedSession } from "@/server/session";
import * as tasks from "@/server/task-repository";

/** What the add form needs to know. `error` is a short message for the user (AC-1.5). */
export type CreateTaskResult = { ok: true } | { ok: false; error: string };

/**
 * Server actions are public HTTP endpoints: check the session FIRST (AC-S.1, plan §5.1),
 * then re-validate everything — the client is never trusted.
 */
async function assertAllowed(): Promise<void> {
  const session = await getAllowedSession();
  if (!session) throw new Error("Not allowed");
}

/** AC-1.1 to AC-1.5: create a task from the add form. */
export async function createTask(input: {
  title: string;
  dueDate?: string | null;
  dueTime?: string | null;
}): Promise<CreateTaskResult> {
  await assertAllowed();

  const title = normalizeTitle(typeof input?.title === "string" ? input.title : "");
  if (!title.ok) {
    // AC-1.4: a blank title is silently ignored by the form; this is the server-side backstop.
    return { ok: false, error: title.error === "too_long" ? "Title is too long (200 characters max)." : "Title is empty." };
  }
  const due = parseDue(asOptionalString(input.dueDate), asOptionalString(input.dueTime));
  if (!due.ok) {
    return { ok: false, error: due.error === "time_without_date" ? "Pick a date before a time." : "That date or time isn't valid." };
  }

  await tasks.createTask(title.value, due.value);
  refresh();
  return { ok: true };
}

function asOptionalString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}
