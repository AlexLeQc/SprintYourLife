import { Suspense } from "react";
import { requireAllowedSession } from "@/server/session";
import { listSidequests } from "@/server/sidequest-repository";
import { countUsageDays } from "@/server/usage-repository";
import { AppShell } from "../app-shell";
import { Bank } from "./bank";

export default function SidequestsPage() {
  // Reading the session is request-time work, so it streams inside Suspense (cacheComponents).
  return (
    <Suspense fallback={<main className="flex flex-1" aria-busy="true" />}>
      <Sidequests />
    </Suspense>
  );
}

async function Sidequests() {
  // AC-S.1: nothing below renders without an allowed session. It also records today's
  // usage day, so opening only this tab counts (AC-3.4).
  const session = await requireAllowedSession();
  const [usedDays, sidequests] = await Promise.all([countUsageDays(7), listSidequests()]);

  return (
    <AppShell current="sidequests" usedDays={usedDays} email={session.user.email}>
      <Bank sidequests={sidequests.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() }))} />
    </AppShell>
  );
}
