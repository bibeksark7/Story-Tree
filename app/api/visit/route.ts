import { NextRequest } from "next/server";
import { incrementVisit } from "@/lib/db/nodes";

/**
 * Fire-and-forget popularity signal. Canon is derived from visit_count, so
 * without this the canon walk picks arbitrarily among siblings.
 *
 * Always returns 204 — a failed count must never surface to a reader.
 */
export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (typeof id === "string" && id.length > 0) {
      await incrementVisit(id);
    }
  } catch {
    // Deliberately swallowed.
  }
  return new Response(null, { status: 204 });
}
