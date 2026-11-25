import { Suspense } from "react";
import { localNow } from "@/domain/local-date";
import { requireAllowedSession } from "@/server/session";
import { listOpenTasks } from "@/server/task-repository";
import { countUsageDays } from "@/server/usage-repository";
import { AppShell } from "./app-shell";
import { TaskList } from "./task-list";

export default function HomePage() {
  // Reading the session is request-time work, so it streams inside Suspense (cacheComponents).
  return (
    <Suspense fallback={<main className="flex flex-1" aria-busy="true" />}>
      <Home />
    </Suspense>
  );
}

async function Home() {
  const session = await requireAllowedSession(); // nothing below renders without an allowed session
  // Plan 002 §5.7: the two queries run in parallel to keep the open fast (NFR-03).
  const [usedDays, tasks] = await Promise.all([countUsageDays(7), listOpenTasks()]);
  // Plan 002 §5.6: labels and colours use "now" in Toronto, recomputed on every render
  // (including the refresh when the installed app comes back to the screen).
  const now = localNow(new Date());

  return (
    <AppShell current="tasks" usedDays={usedDays} email={session.user.email}>
      <TaskList
        now={now}
        tasks={tasks.map((task) => ({ ...task, createdAt: task.createdAt.toISOString() }))}
      />
    </AppShell>
  );
}
