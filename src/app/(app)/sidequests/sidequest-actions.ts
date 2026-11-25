"use server";

import { refresh } from "next/cache";
import { normalizeTitle, parseCategory, type Category } from "@/domain/sidequest";
import * as sidequests from "@/server/sidequest-repository";
import { assertAllowed, assertId, titleErrorMessage, type FormResult } from "../action-guards";

type FormInput = { title: string; category: string | null };

/**
 * Every action checks the session first, then re-validates its input (plan 004 §5.1):
 * BR-1 for the title, BR-2 for the category, a UUID for the id.
 */
function validate(input: FormInput): { ok: true; title: string; category: Category } | { ok: false; error: string } {
  const title = normalizeTitle(typeof input?.title === "string" ? input.title : "");
  if (!title.ok) return { ok: false, error: titleErrorMessage(title.error) };
  const category = parseCategory(input?.category);
  if (!category.ok) return { ok: false, error: "Pick a category." };
  return { ok: true, title: title.value, category: category.value };
}

function assertSidequestId(id: unknown): asserts id is string {
  assertId(id, "sidequest");
}

/** AC-1.1 to AC-1.5: add a sidequest. */
export async function createSidequest(input: FormInput): Promise<FormResult> {
  await assertAllowed();
  const valid = validate(input);
  if (!valid.ok) return valid;
  await sidequests.createSidequest(valid.title, valid.category);
  refresh();
  return { ok: true };
}

/** AC-4.1, AC-4.2: edit title and category. */
export async function updateSidequest(input: FormInput & { id: string }): Promise<FormResult> {
  await assertAllowed();
  assertSidequestId(input?.id);
  const valid = validate(input);
  if (!valid.ok) return valid;
  await sidequests.updateSidequest(input.id, valid.title, valid.category);
  refresh();
  return { ok: true };
}

/** AC-5.1: delete (soft). */
export async function deleteSidequest(id: string): Promise<void> {
  await assertAllowed();
  assertSidequestId(id);
  await sidequests.deleteSidequest(id);
  refresh();
}

/** AC-5.2: undo "delete". */
export async function restoreSidequest(id: string): Promise<void> {
  await assertAllowed();
  assertSidequestId(id);
  await sidequests.restoreSidequest(id);
  refresh();
}
