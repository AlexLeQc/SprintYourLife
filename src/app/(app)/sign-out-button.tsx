"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

/** AC-4.2: sign out deletes the session and returns to the sign-in page. */
export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.replace("/sign-in");
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-zinc-700"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
