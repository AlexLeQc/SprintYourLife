/**
 * The title rule shared by tasks (spec 002 BR-1) and sidequests (spec 004 BR-1), pure TypeScript.
 * One source of truth, so the two features can't drift apart (plan 004 §2).
 */
import type { Result } from "./result";

export const TITLE_MAX_LENGTH = 200;

export type TitleError = "empty" | "too_long";

/**
 * BR-1: trims the title; it must be 1–200 characters after trimming.
 * Characters are counted as Unicode code points, like PostgreSQL's char_length (plan 002 §4),
 * so the app and the database CHECK always agree.
 */
export function normalizeTitle(raw: string): Result<string, TitleError> {
  const title = raw.trim();
  const length = Array.from(title).length;
  if (length === 0) return { ok: false, error: "empty" };
  if (length > TITLE_MAX_LENGTH) return { ok: false, error: "too_long" };
  return { ok: true, value: title };
}
