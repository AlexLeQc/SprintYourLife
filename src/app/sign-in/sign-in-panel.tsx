"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

// Same value as NOT_ALLOWED in src/server/auth.ts (server-only module, so not imported here).
const NOT_ALLOWED = "NOT_ALLOWED";

/** AC-2.1: a single "Sign in with Google" button. AC-3.1: refused accounts see "This app is private." */
export function SignInPanel() {
  const error = useSearchParams().get("error");
  const [pending, setPending] = useState(false);

  async function signIn() {
    setPending(true);
    // Full-page redirect to Google and back, no popup (plan §5.3).
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
      errorCallbackURL: "/sign-in",
    });
  }

  return (
    <>
      {error === NOT_ALLOWED && (
        <p role="alert" className="font-medium">
          This app is private.
        </p>
      )}
      {error && error !== NOT_ALLOWED && (
        <p role="alert" className="text-zinc-600 dark:text-zinc-400">
          Sign-in didn&apos;t work. Please try again.
        </p>
      )}
      <button
        type="button"
        onClick={signIn}
        disabled={pending}
        className="rounded-full bg-foreground px-6 py-3 font-medium text-background disabled:opacity-50"
      >
        {pending ? "Redirecting…" : "Sign in with Google"}
      </button>
    </>
  );
}
