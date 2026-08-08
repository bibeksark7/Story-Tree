import type { NextRequest } from "next/server";
import { getNode, getChildren, getAncestors, insertChild } from "@/lib/db/nodes";
import { narrate } from "@/lib/ai/narrate";
import { invalidateCanon } from "@/lib/canon";
import { GuardError, enforceDepthCap, enforceRateLimit, guardResponse, hashIp } from "@/lib/guard";

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

    const { data: narration } = await narrate({
      depth: parent.depth + 1,
      ancestorProse: ancestors.map((a) => a.prose),
      parentProse: parent.prose,
      choiceLabel: label,
      object: null,
      leakObject: null,
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
      ancestorObjectIds: parent.object_id
        ? [...parent.ancestor_object_ids, parent.object_id]
        : parent.ancestor_object_ids,
    });

    invalidateCanon();
    return Response.json({ id: node.id, generated: wonRace });
  } catch (e) {
    return guardResponse(e);
  }
}
