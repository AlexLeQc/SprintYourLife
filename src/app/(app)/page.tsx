import { Suspense } from "react";
import { requireAllowedSession } from "@/server/session";
import { SignOutButton } from "./sign-out-button";

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

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">SprintYourLife</h1>
      <p className="max-w-sm text-zinc-600 dark:text-zinc-400">
        Foundation in progress. Features arrive one spec at a time.
      </p>
      <p className="text-sm text-zinc-500">Signed in as {session.user.email}</p>
      <SignOutButton />
    </main>
  );
}
