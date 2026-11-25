"use server";

import { refresh } from "next/cache";
import { normalizeTitle, parseCategory } from "@/domain/sidequest";
import * as sidequests from "@/server/sidequest-repository";
import { assertAllowed, titleErrorMessage, type FormResult } from "../action-guards";

type FormInput = { title: string; category: string | null };

/** AC-1.1 to AC-1.5: add a sidequest. Session first, then BR-1 and BR-2 on the server (plan 004 §5.1). */
export async function createSidequest(input: FormInput): Promise<FormResult> {
  await assertAllowed();
  const title = normalizeTitle(typeof input?.title === "string" ? input.title : "");
  if (!title.ok) return { ok: false, error: titleErrorMessage(title.error) };
  const category = parseCategory(input?.category);
  if (!category.ok) return { ok: false, error: "Pick a category." };
  await sidequests.createSidequest(title.value, category.value);
  refresh();
  return { ok: true };
}
