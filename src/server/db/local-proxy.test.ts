import { describe, expect, it } from "vitest";
import { isLocalProxyUrl, localProxyFetchEndpoint } from "./local-proxy";

// Spec 003 TR-1: only the throwaway test database is routed to the local proxy.
describe("isLocalProxyUrl (spec 003 TR-1)", () => {
  it("accepts the local end-to-end database", () => {
    expect(isLocalProxyUrl("postgres://postgres:postgres@db.localtest.me:5432/main")).toBe(true);
  });

  it.each([
    "postgresql://user:pw@ep-example-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
    "postgres://postgres:postgres@localhost:5432/main",
    "postgres://postgres:postgres@db.localtest.me.example.com:5432/main",
    "postgres://postgres:postgres@evil-db.localtest.me:5432/main",
    "not a url",
    "",
  ])("refuses %j", (url) => {
    expect(isLocalProxyUrl(url)).toBe(false);
  });
});

describe("localProxyFetchEndpoint", () => {
  it("uses plain HTTP on the proxy port", () => {
    expect(localProxyFetchEndpoint("db.localtest.me")).toBe("http://db.localtest.me:4444/sql");
  });
});
