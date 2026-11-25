import "server-only";
import { isNull } from "drizzle-orm";
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
