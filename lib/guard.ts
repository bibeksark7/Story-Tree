import "server-only";
import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { db } from "@/lib/supabase";

/**
 * Protection ships with the endpoint, not after it. /api/generate is a public
 * endpoint that writes rows and spends tokens from its first minute of
 * existence, so every limit below is enforced from that first minute.
 */

export const DEPTH_CAP = 40;

export const LIMITS = {
  generate: { max: 20, windowMs: 10 * 60_000 },
  contribute: { max: 10, windowMs: 10 * 60_000 },
} as const;

export type GuardKind = keyof typeof LIMITS;

export class GuardError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Salted hash of the client IP. Never store the raw address — this exists for
 * rate limiting and forensics, not identity.
 */
export function hashIp(request: NextRequest): string {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) throw new Error("IP_HASH_SALT is not set");

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Fixed-window limiter backed by rate_events. Records the attempt first, then
 * counts — so a burst of concurrent requests cannot all read a stale count and
 * slip through together.
 */
export async function enforceRateLimit(ipHash: string, kind: GuardKind): Promise<void> {
  const { max, windowMs } = LIMITS[kind];
  const since = new Date(Date.now() - windowMs).toISOString();

  const insert = await db.from("rate_events").insert({ ip_hash: ipHash, kind });
  if (insert.error) throw new Error(`rate limit write: ${insert.error.message}`);

  const { count, error } = await db
    .from("rate_events")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .eq("kind", kind)
    .gte("created_at", since);

  if (error) throw new Error(`rate limit read: ${error.message}`);

  if ((count ?? 0) > max) {
    throw new GuardError(
      429,
      "rate_limited",
      "You have been busy. Wait a few minutes before adding to the story again.",
    );
  }
}

export function enforceDepthCap(parentDepth: number): void {
  if (parentDepth + 1 > DEPTH_CAP) {
    throw new GuardError(
      409,
      "depth_cap",
      "This branch has gone as deep as it goes. Start again from somewhere else.",
    );
  }
}

/** Turns any thrown value into a composed response rather than a stack trace. */
export function guardResponse(e: unknown): Response {
  if (e instanceof GuardError) {
    return Response.json({ error: e.code, message: e.message }, { status: e.status });
  }
  console.error(e);
  return Response.json(
    { error: "internal", message: "Something in the building did not answer. Try again." },
    { status: 500 },
  );
}
