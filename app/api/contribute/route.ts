import type { NextRequest } from "next/server";
import { getNode, insertContribution } from "@/lib/db/nodes";
import { insertObject } from "@/lib/db/objects";
import { extractObject, type ImageMediaType } from "@/lib/ai/extract";
import { narrate } from "@/lib/ai/narrate";
import { MOOD_BUCKET } from "@/lib/art/manifest";
import { invalidateCanon } from "@/lib/canon";
import {
  GuardError,
  enforceDepthCap,
  enforceRateLimit,
  enforceUpload,
  guardResponse,
  hashIp,
} from "@/lib/guard";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData().catch(() => null);
    if (!form) throw new GuardError(400, "bad_request", "Malformed request.");

    const parentId = form.get("parentId");
    if (typeof parentId !== "string") {
      throw new GuardError(400, "bad_request", "Malformed request.");
    }

    const ipHash = hashIp(request);
    await enforceRateLimit(ipHash, "contribute");

    const file = form.get("photo");
    enforceUpload(file);

    const parent = await getNode(parentId);
    if (!parent) throw new GuardError(404, "not_found", "That passage is no longer here.");
    enforceDepthCap(parent.depth);

    // The bytes go to the vision model and are never written anywhere —
    // not to disk, not to Storage, not to the database.
    const bytes = Buffer.from(await file.arrayBuffer());
    const { data: extraction } = await extractObject({
      base64: bytes.toString("base64"),
      mediaType: file.type as ImageMediaType,
    });

    if (extraction.verdict === "reject") {
      throw new GuardError(
        422,
        "unsafe_photo",
        "The building will not take that one. Try photographing an object instead.",
      );
    }

    const object = await insertObject(extraction.object, ipHash);

    const { data: narration } = await narrate({
      depth: parent.depth + 1,
      ancestorProse: [],
      parentProse: parent.prose,
      choiceLabel: "leave something here",
      object: extraction.object,
      leakObject: null,
    });

    // The illustration now follows the object rather than the parent — the
    // visual signal that someone left something here. Store the manifest key;
    // the page turns it into a path at render time.
    const artAsset = `${extraction.object.dominant_color}-${MOOD_BUCKET[extraction.object.mood]}`;

    const node = await insertContribution({
      parentId: parent.id,
      depth: parent.depth + 1,
      prose: narration.prose,
      pendingChoices: [narration.choice_a, narration.choice_b],
      artAsset,
      objectId: object.id,
      ancestorObjectIds: parent.object_id
        ? [...parent.ancestor_object_ids, parent.object_id]
        : parent.ancestor_object_ids,
    });

    invalidateCanon();
    return Response.json({ id: node.id, object: extraction.object.name });
  } catch (e) {
    return guardResponse(e);
  }
}
