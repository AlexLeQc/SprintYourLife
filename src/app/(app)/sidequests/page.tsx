import { Suspense } from "react";
import { requireAllowedSession } from "@/server/session";
import { listSidequests } from "@/server/sidequest-repository";
import { countUsageDays } from "@/server/usage-repository";
import { AppFrame, AppShell, PageSkeleton } from "../app-shell";
import { Bank } from "./bank";

export default function SidequestsPage() {
  // The frame and tab bar render at once; the content streams inside Suspense (cacheComponents).
  return (
    <AppFrame current="sidequests">
      <Suspense fallback={<PageSkeleton />}>
        <Sidequests />
      </Suspense>
    </AppFrame>
  );
}

async function Sidequests() {
  // AC-S.1: nothing below renders without an allowed session. It also records today's
  // usage day, so opening only this tab counts (AC-3.4).
  const session = await requireAllowedSession();
  const [usedDays, sidequests] = await Promise.all([countUsageDays(7), listSidequests()]);

  return (
    <AppShell usedDays={usedDays} email={session.user.email}>
      <Bank sidequests={sidequests.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() }))} />
    </AppShell>
  );
}
