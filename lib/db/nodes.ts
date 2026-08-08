import "server-only";
import { db } from "@/lib/supabase";

export type NodeRow = {
  id: string;
  parent_id: string | null;
  slot_index: number | null;
  depth: number;
  prose: string;
  pending_choices: string[];
  object_id: string | null;
  leaked_object_id: string | null;
  ancestor_object_ids: string[];
  art_asset: string;
  visit_count: number;
  is_hidden: boolean;
  created_at: string;
};

const COLS =
  "id,parent_id,slot_index,depth,prose,pending_choices,object_id,leaked_object_id,ancestor_object_ids,art_asset,visit_count,is_hidden,created_at";

/** Every read path filters hidden rows, so the kill switch works everywhere at once. */
export async function getNode(id: string): Promise<NodeRow | null> {
  const { data, error } = await db
    .from("nodes")
    .select(COLS)
    .eq("id", id)
    .eq("is_hidden", false)
    .maybeSingle();
  if (error) throw new Error(`getNode: ${error.message}`);
  return data as NodeRow | null;
}

export async function getRoot(): Promise<NodeRow | null> {
  const { data, error } = await db
    .from("nodes")
    .select(COLS)
    .is("parent_id", null)
    .eq("is_hidden", false)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getRoot: ${error.message}`);
  return data as NodeRow | null;
}

export async function getChildren(parentId: string): Promise<NodeRow[]> {
  const { data, error } = await db
    .from("nodes")
    .select(COLS)
    .eq("parent_id", parentId)
    .eq("is_hidden", false)
    .order("slot_index", { ascending: true });
  if (error) throw new Error(`getChildren: ${error.message}`);
  return (data ?? []) as NodeRow[];
}

/**
 * Walk up at most `limit` levels. This is where context discipline is enforced —
 * the narrator can never see more ancestors than this returns, no matter what
 * the prompt builder asks for. Returned oldest-first.
 */
export async function getAncestors(nodeId: string, limit = 2): Promise<NodeRow[]> {
  const out: NodeRow[] = [];
  let cursor: string | null = nodeId;

  for (let i = 0; i < limit; i++) {
    const current: NodeRow | null = await getNode(cursor);
    if (!current?.parent_id) break;
    const parent = await getNode(current.parent_id);
    if (!parent) break;
    out.unshift(parent);
    cursor = parent.id;
  }
  return out;
}

export type InsertChildInput = {
  parentId: string;
  slotIndex: number;
  depth: number;
  prose: string;
  pendingChoices: [string, string];
  artAsset: string;
  objectId?: string | null;
  leakedObjectId?: string | null;
  ancestorObjectIds?: string[];
};

/**
 * The race guard.
 *
 * Two simultaneous taps on the same unwritten choice must not produce two
 * siblings. The plan called for `ON CONFLICT ... DO NOTHING`, but the unique
 * index is partial (`where parent_id is not null`) and Postgres requires
 * ON CONFLICT to restate that predicate — which PostgREST cannot express.
 *
 * So: insert, and if Postgres raises 23505 (unique_violation), another request
 * won this slot. Select and return the winner. Verified to return the exact
 * row the winner inserted.
 *
 * This wastes one model call in a rare race and, in exchange, makes half-written
 * rows structurally impossible.
 */
export async function insertChild(
  input: InsertChildInput,
): Promise<{ node: NodeRow; wonRace: boolean }> {
  const { data, error } = await db
    .from("nodes")
    .insert({
      parent_id: input.parentId,
      slot_index: input.slotIndex,
      depth: input.depth,
      prose: input.prose,
      pending_choices: input.pendingChoices,
      art_asset: input.artAsset,
      object_id: input.objectId ?? null,
      leaked_object_id: input.leakedObjectId ?? null,
      ancestor_object_ids: input.ancestorObjectIds ?? [],
    })
    .select(COLS)
    .single();

  if (!error) return { node: data as NodeRow, wonRace: true };

  if (error.code === "23505") {
    const winner = await db
      .from("nodes")
      .select(COLS)
      .eq("parent_id", input.parentId)
      .eq("slot_index", input.slotIndex)
      .single();
    if (winner.error) throw new Error(`insertChild lost race but winner missing: ${winner.error.message}`);
    return { node: winner.data as NodeRow, wonRace: false };
  }

  throw new Error(`insertChild: ${error.message}`);
}

/**
 * Fire-and-forget popularity signal. Read-modify-write, so concurrent visits
 * can drop a count — acceptable, this only ranks siblings for the canon walk.
 */
export async function incrementVisit(id: string): Promise<void> {
  const { data } = await db.from("nodes").select("visit_count").eq("id", id).maybeSingle();
  if (!data) return;
  await db.from("nodes").update({ visit_count: data.visit_count + 1 }).eq("id", id);
}
