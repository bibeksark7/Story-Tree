import type { NextRequest } from "next/server";
import { getNode, getChildren, getAncestors, insertChild } from "@/lib/db/nodes";
import { pickLeakObject } from "@/lib/db/objects";
import { narrate } from "@/lib/ai/narrate";
import { invalidateCanon } from "@/lib/canon";
import type { StoryObject } from "@/lib/ai/schemas";
import { GuardError, enforceDepthCap, enforceRateLimit, guardResponse, hashIp } from "@/lib/guard";

/**
 * The single flag from the cut list. Set LEAK_CHANCE=0 in Vercel to remove
 * object leaking entirely — no code change, no deploy, no schema change.
 * Set it to 1 to force a leak on every generation, which is how it gets tested.
 */
const LEAK_CHANCE = Number(process.env.LEAK_CHANCE ?? 0.25);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parentId = body?.parentId;
    const slot = body?.slot;

    if (typeof parentId !== "string" || (slot !== 0 && slot !== 1)) {
      throw new GuardError(400, "bad_request", "Malformed request.");
    }

    // Guards run before any model call, so a rate-limited request costs nothing.
    await enforceRateLimit(hashIp(request), "generate");

    const parent = await getNode(parentId);
    if (!parent) throw new GuardError(404, "not_found", "That passage is no longer here.");

    enforceDepthCap(parent.depth);

    // If the slot is already filled, return the existing node. Cheap, and it
    // makes a double-tap idempotent rather than a race.
    const existing = (await getChildren(parent.id)).find((c) => c.slot_index === slot);
    if (existing) return Response.json({ id: existing.id, generated: false });

    const label = parent.pending_choices[slot];
    if (!label) throw new GuardError(400, "bad_slot", "That choice does not exist.");

    // Parent + exactly 2 ancestors + object. Never the whole tree.
    const ancestors = await getAncestors(parent.id, 2);

    // Objects leak. One in four passages surfaces something a stranger left
    // somewhere else in the building, half-buried and unexplained.
    //
    // Excluded: anything already on this branch. ancestor_object_ids is carried
    // down on every insert, so this is one query rather than a tree walk — and
    // it stops a visitor's own object from following them around.
    const seen = parent.object_id
      ? [...parent.ancestor_object_ids, parent.object_id]
      : parent.ancestor_object_ids;

    const leakRow = Math.random() < LEAK_CHANCE ? await pickLeakObject(seen) : null;
    const leakObject: StoryObject | null = leakRow
      ? {
          name: leakRow.name,
          material: leakRow.material ?? "",
          condition: leakRow.condition ?? "",
          mood: leakRow.mood as StoryObject["mood"],
          dominant_color: leakRow.dominant_color as StoryObject["dominant_color"],
        }
      : null;

    const { data: narration } = await narrate({
      depth: parent.depth + 1,
      ancestorProse: ancestors.map((a) => a.prose),
      parentProse: parent.prose,
      choiceLabel: label,
      object: null,
      leakObject,
    });

    // A text-only child is the same place one step later, so it inherits the
    // parent's illustration. When an object is contributed (Phase 3) the art
    // shifts to that object's colour and mood — the visual signal that someone
    // left something here.
    const { node, wonRace } = await insertChild({
      parentId: parent.id,
      slotIndex: slot,
      depth: parent.depth + 1,
      prose: narration.prose,
      pendingChoices: [narration.choice_a, narration.choice_b],
      artAsset: parent.art_asset,
      leakedObjectId: leakRow?.id ?? null,
      ancestorObjectIds: seen,
    });

    invalidateCanon();
    return Response.json({ id: node.id, generated: wonRace });
  } catch (e) {
    return guardResponse(e);
  }
}
