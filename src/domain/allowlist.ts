/**
 * BR-1 — An email is allowed if and only if it is in the allowlist.
 * The comparison ignores case and surrounding spaces.
 */

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

/** Parses the ALLOWED_EMAILS environment variable: comma-separated emails. */
export function parseAllowlist(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map(normalize)
    .filter((email) => email.length > 0);
}

/** True only if `email` is in `allowlist`. A missing email or an empty allowlist refuses everyone. */
export function isAllowed(
  email: string | null | undefined,
  allowlist: readonly string[],
): boolean {
  if (!email) return false;
  const candidate = normalize(email);
  if (candidate.length === 0) return false;
  return allowlist.some((allowed) => normalize(allowed) === candidate);
}
