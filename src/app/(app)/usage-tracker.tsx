"use client";

import { useEffect } from "react";
import { recordVisit } from "./actions";

/**
 * Plan §5.4: an installed iPhone app often resumes from the background without reloading.
 * When the page becomes visible again, record today's usage day (idempotent, BR-3).
 */
export function UsageTracker() {
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        recordVisit().catch(() => {
          // Offline or signed out: nothing to record, and nothing to show (online-only, ADR-0003).
        });
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  return null;
}
