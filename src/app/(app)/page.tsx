import { Suspense } from "react";
import { localNow } from "@/domain/local-date";
import { requireAllowedSession } from "@/server/session";
import { listOpenTasks } from "@/server/task-repository";
import { countUsageDays } from "@/server/usage-repository";
import { SignOutButton } from "./sign-out-button";
import { TaskList } from "./task-list";
import { UsageTracker } from "./usage-tracker";

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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <UsageTracker />
      <header className="flex items-baseline justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight">SprintYourLife</h1>
        {/* AC-5.5 (spec 001): a neutral count. No streak, no colour that judges. */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Used <strong>{usedDays}</strong> of the last 7 days
        </p>
      </header>

      <TaskList
        now={now}
        tasks={tasks.map((task) => ({ ...task, createdAt: task.createdAt.toISOString() }))}
      />

      <footer className="mt-auto flex flex-col items-center gap-2 pt-8 text-sm text-zinc-500 dark:text-zinc-400">
        <p>Signed in as {session.user.email}</p>
        <SignOutButton />
      </footer>
    </main>
  );
}
