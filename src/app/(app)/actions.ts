"use server";

import { refresh } from "next/cache";
import { getAllowedSession } from "@/server/session";
import { recordUsageDay } from "@/server/usage-repository";

/**
 * T16 (plan §5.4): called when the installed app comes back to the screen without reloading.
 * Records today, then refreshes the page so "Used N of the last 7 days" is current.
 */
export async function recordVisit(): Promise<void> {
  const session = await getAllowedSession(); // server actions are public endpoints: check first
  if (!session) return;
  await recordUsageDay();
  refresh();
}
