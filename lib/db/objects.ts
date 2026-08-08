import "server-only";
import { db } from "@/lib/supabase";
import type { StoryObject } from "@/lib/ai/schemas";

export type ObjectRow = {
  id: string;
  name: string;
  material: string | null;
  condition: string | null;
  mood: string;
  dominant_color: string;
  contributor_hash: string | null;
  is_hidden: boolean;
  created_at: string;
};

export async function insertObject(
  object: StoryObject,
  contributorHash: string,
): Promise<ObjectRow> {
  const { data, error } = await db
    .from("objects")
    .insert({
      name: object.name,
      material: object.material,
      condition: object.condition,
      mood: object.mood,
      dominant_color: object.dominant_color,
      contributor_hash: contributorHash,
    })
    .select("*")
    .single();

  if (error) throw new Error(`insertObject: ${error.message}`);
  return data as ObjectRow;
}

/**
 * Pick an object that has not already appeared on this branch.
 *
 * `ancestor_object_ids` is carried down the tree on insert, so exclusion is a
 * single query with `id <> all(...)` — no recursive walk, no tree traversal.
 * Used by the leak mechanism in Phase 4.
 */
export async function pickLeakObject(excludeIds: string[]): Promise<ObjectRow | null> {
  let q = db
    .from("objects")
    .select("*")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(30);

  if (excludeIds.length > 0) {
    q = q.not("id", "in", `(${excludeIds.join(",")})`);
  }

  const { data, error } = await q;
  if (error) throw new Error(`pickLeakObject: ${error.message}`);
  if (!data || data.length === 0) return null;

  return data[Math.floor(Math.random() * data.length)] as ObjectRow;
}
