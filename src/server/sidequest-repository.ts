import "server-only";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import type { Category } from "@/domain/sidequest";
import { db } from "./db/client";
import { sidequest } from "./db/schema";

/** A sidequest as the UI needs it. Grouping and sorting (BR-3, BR-4) are done by the domain. */
export interface BankSidequest {
  id: string;
  title: string;
  category: Category;
  createdAt: Date;
}

/**
 * Inserts a sidequest. The caller has already checked the session and validated the title (BR-1)
 * and the category (BR-2); the database CHECKs are a second line of defence.
 */
export async function createSidequest(title: string, category: Category): Promise<void> {
  await db.insert(sidequest).values({ title, category });
}

/** Every sidequest in the Bank, deleted ones excluded (BR-5). Unsorted: see groupByCategory. */
export async function listSidequests(): Promise<BankSidequest[]> {
  return db
    .select({
      id: sidequest.id,
      title: sidequest.title,
      category: sidequest.category,
      createdAt: sidequest.createdAt,
    })
    .from(sidequest)
    .where(isNull(sidequest.deletedAt));
}

/** Matches a sidequest still in the Bank (not deleted). */
const inBank = (id: string) => and(eq(sidequest.id, id), isNull(sidequest.deletedAt));

/** AC-4.1, AC-4.2: change title and category. A deleted sidequest can't be edited. */
export async function updateSidequest(id: string, title: string, category: Category): Promise<void> {
  await db.update(sidequest).set({ title, category }).where(inBank(id));
}

/** AC-5.1: soft delete. The row stays (undo, future logs) but is never listed again (BR-5). */
export async function deleteSidequest(id: string): Promise<void> {
  await db.update(sidequest).set({ deletedAt: new Date() }).where(inBank(id));
}

/** AC-5.2: undo "delete" — the sidequest comes back exactly as it was. */
export async function restoreSidequest(id: string): Promise<void> {
  await db
    .update(sidequest)
    .set({ deletedAt: null })
    .where(and(eq(sidequest.id, id), isNotNull(sidequest.deletedAt)));
}
