import "server-only";
import { getRoot, getChildren, type NodeRow } from "@/lib/db/nodes";

/**
 * Canon is derived, not stored: walk from the root, always taking the child
 * with the highest visit_count. Cached in-process for 30s so the landing page
 * is not N queries deep on every load.
 *
 * On Vercel each lambda instance keeps its own copy. That is fine — canon is a
 * popularity heuristic, not a source of truth, and a stale path for 30 seconds
 * is invisible.
 */
const TTL_MS = 30_000;
const MAX_WALK = 40; // depth cap; also stops a cycle from hanging a request

let cache: { at: number; path: NodeRow[] } | null = null;

async function walk(): Promise<NodeRow[]> {
  const root = await getRoot();
  if (!root) return [];

  const path: NodeRow[] = [root];
  let current = root;

  for (let i = 0; i < MAX_WALK; i++) {
    const children = await getChildren(current.id);
    if (children.length === 0) break;
    const next = children.reduce((a, b) => (b.visit_count > a.visit_count ? b : a));
    path.push(next);
    current = next;
  }
  return path;
}

export async function canonPath(): Promise<NodeRow[]> {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return cache.path;
  const path = await walk();
  cache = { at: now, path };
  return path;
}

/**
 * The landing entry point. A stranger should arrive mid-story, not at the top,
 * so aim for canon depth 2 and fall back to the deepest node available.
 */
export async function canonEntry(preferredDepth = 2): Promise<NodeRow | null> {
  const path = await canonPath();
  if (path.length === 0) return null;
  return path[Math.min(preferredDepth, path.length - 1)];
}

/** Called after a write so the next landing reflects the new tree. */
export function invalidateCanon(): void {
  cache = null;
}
