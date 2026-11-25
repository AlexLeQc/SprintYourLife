import type { ReactNode } from "react";
import { SignOutButton } from "./sign-out-button";
import { TabBar, type Tab } from "./tab-bar";
import { UsageTracker } from "./usage-tracker";

/**
 * The frame of every signed-in page: the column, the usage tracker and the tab bar. It holds no
 * private data, so it renders OUTSIDE the page's Suspense boundary: when you switch tabs, Next.js
 * shows it at once and only the content streams in (T08 fix: no more blank screen between tabs).
 */
export function AppFrame({ current, children }: { current: Tab; children: ReactNode }) {
  return (
    // Bottom padding keeps the last row and the footer clear of the floating tab bar (plan 004 §5.2).
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 pb-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom)+2rem)] pt-[max(1.5rem,env(safe-area-inset-top))]">
      {/* Records a usage day when the installed app resumes on any tab (spec 004 AC-3.4). */}
      <UsageTracker />
      {children}
      <TabBar current={current} />
    </main>
  );
}

function Header({ usage }: { usage: ReactNode }) {
  return (
    <header className="flex items-baseline justify-between gap-4">
      <h1 className="text-xl font-semibold tracking-tight">SprintYourLife</h1>
      {usage}
    </header>
  );
}

/**
 * A page's private content, rendered only after the page checked the session (CLAUDE.md):
 * header with the usage line, the page's own content, and the "Signed in as" footer.
 */
export function AppShell({ usedDays, email, children }: { usedDays: number; email: string; children: ReactNode }) {
  return (
    <>
      <Header
        usage={
          // AC-5.5 (spec 001): a neutral count. No streak, no colour that judges.
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Used <strong>{usedDays}</strong> of the last 7 days
          </p>
        }
      />

      {children}

      <footer className="mt-auto flex flex-col items-center gap-2 pt-8 text-sm text-zinc-500 dark:text-zinc-400">
        <p>Signed in as {email}</p>
        <SignOutButton />
      </footer>
    </>
  );
}

/**
 * Shown while a page checks the session and loads its data: the same header and a few grey
 * placeholder rows, so the screen never goes blank. Hidden from screen readers (aria-busy).
 */
export function PageSkeleton() {
  const bar = "rounded-lg bg-zinc-100 dark:bg-zinc-900";
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <Header usage={<span aria-hidden="true" className={`${bar} h-4 w-36`} />} />
      <div aria-hidden="true" className="flex flex-col gap-2">
        <div className={`${bar} h-11`} />
        <div className={`${bar} h-14`} />
        <div className={`${bar} h-14`} />
        <div className={`${bar} h-14`} />
      </div>
    </div>
  );
}
