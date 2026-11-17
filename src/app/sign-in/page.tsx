import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInPanel } from "./sign-in-panel";

export const metadata: Metadata = { title: "Sign in · SprintYourLife" };

export default function SignInPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">SprintYourLife</h1>
      <Suspense>
        <SignInPanel />
      </Suspense>
    </main>
  );
}
