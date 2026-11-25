import type { ReactNode } from "react";
import { SignOutButton } from "./sign-out-button";
import { TabBar, type Tab } from "./tab-bar";
import { UsageTracker } from "./usage-tracker";

interface Props {
  current: Tab;
  usedDays: number;
  email: string;
  children: ReactNode;
}

/**
 * The frame shared by every signed-in page (plan 004 §5.3): header with the usage line, the page's
 * content, the "Signed in as" footer, and the tab bar. Not a layout on purpose: each page checks
 * the session itself, first, and passes in what it read (CLAUDE.md, access control).
 */
export function AppShell({ current, usedDays, email, children }: Props) {
  return (
    // Bottom padding keeps the last row and the footer clear of the fixed tab bar (plan 004 §5.2).
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 pb-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom)+2rem)] pt-[max(1.5rem,env(safe-area-inset-top))]">
      {/* Records a usage day when the installed app resumes on any tab (spec 004 AC-3.4). */}
      <UsageTracker />
      <header className="flex items-baseline justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight">SprintYourLife</h1>
        {/* AC-5.5 (spec 001): a neutral count. No streak, no colour that judges. */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Used <strong>{usedDays}</strong> of the last 7 days
        </p>
      </header>

      {children}

      <footer className="mt-auto flex flex-col items-center gap-2 pt-8 text-sm text-zinc-500 dark:text-zinc-400">
        <p>Signed in as {email}</p>
        <SignOutButton />
      </footer>

      <TabBar current={current} />
    </main>
  );
}
