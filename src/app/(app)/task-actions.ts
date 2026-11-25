"use server";

import { refresh } from "next/cache";
import { localNow } from "@/domain/local-date";
import { completionDate, normalizeTitle, parseDue, type Due } from "@/domain/task";
import * as tasks from "@/server/task-repository";
import { assertAllowed, assertId, titleErrorMessage, type FormResult } from "./action-guards";

// Session first, then re-validation (AC-S.1, plan 002 §5.1): see action-guards.ts.
function assertTaskId(id: unknown): asserts id is string {
  assertId(id, "task");
}

function asOptionalString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

type FormInput = { title: string; dueDate?: string | null; dueTime?: string | null };

/** BR-1 and BR-2 on the server, with user-facing messages. */
function validate(input: FormInput): { ok: true; title: string; due: Due } | { ok: false; error: string } {
  const title = normalizeTitle(typeof input?.title === "string" ? input.title : "");
  if (!title.ok) return { ok: false, error: titleErrorMessage(title.error) };
  const due = parseDue(asOptionalString(input.dueDate), asOptionalString(input.dueTime));
  if (!due.ok) {
    return { ok: false, error: due.error === "time_without_date" ? "Pick a date before a time." : "That date or time isn't valid." };
  }
  return { ok: true, title: title.value, due: due.value };
}

/** AC-1.1 to AC-1.5: create a task from the add form. */
export async function createTask(input: FormInput): Promise<FormResult> {
  await assertAllowed();
  const valid = validate(input);
  if (!valid.ok) return valid;
  await tasks.createTask(valid.title, valid.due);
  refresh();
  return { ok: true };
}

/** AC-4.1 to AC-4.3: edit title, date and time. */
export async function updateTask(input: FormInput & { id: string }): Promise<FormResult> {
  await assertAllowed();
  assertTaskId(input?.id);
  const valid = validate(input);
  if (!valid.ok) return valid;
  await tasks.updateTask(input.id, valid.title, valid.due);
  refresh();
  return { ok: true };
}

/** AC-3.1: mark done today (Toronto date, BR-4). */
export async function completeTask(id: string): Promise<void> {
  await assertAllowed();
  assertTaskId(id);
  await tasks.completeTask(id, completionDate(localNow(new Date())));
  refresh();
}

/** AC-6.1: undo "done". */
export async function reopenTask(id: string): Promise<void> {
  await assertAllowed();
  assertTaskId(id);
  await tasks.reopenTask(id);
  refresh();
}

/** AC-5.1: delete (soft, plan D-2). */
export async function deleteTask(id: string): Promise<void> {
  await assertAllowed();
  assertTaskId(id);
  await tasks.deleteTask(id);
  refresh();
}

/** AC-6.2: undo "delete". */
export async function restoreTask(id: string): Promise<void> {
  await assertAllowed();
  assertTaskId(id);
  await tasks.restoreTask(id);
  refresh();
}
