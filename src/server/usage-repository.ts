import "server-only";
import { and, gte, lte } from "drizzle-orm";
import { addDays, localDate, type LocalDate } from "@/domain/local-date";
import { countUsedLastNDays } from "@/domain/usage";
import { db } from "./db/client";
import { usageDay } from "./db/schema";

/** "Today" for the app: the local date in America/Toronto (BR-2). */
export function today(now: Date = new Date()): LocalDate {
  return localDate(now);
}

/**
 * Records `day` as a usage day (AC-5.1). Idempotent: a second call for the same day
 * changes nothing, because `day` is the primary key (BR-3, AC-5.2).
 */
export async function recordUsageDay(day: LocalDate = today()): Promise<void> {
  await db.insert(usageDay).values({ day }).onConflictDoNothing();
}

/** "Used N of the last `n` days", today included (BR-4, AC-5.5). */
export async function countUsageDays(n: number, day: LocalDate = today()): Promise<number> {
  const rows = await db
    .select({ day: usageDay.day })
    .from(usageDay)
    .where(and(gte(usageDay.day, addDays(day, -(n - 1))), lte(usageDay.day, day)));
  return countUsedLastNDays(
    rows.map((row) => row.day),
    day,
    n,
  );
}
