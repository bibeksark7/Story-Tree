import type { NextRequest } from "next/server";
import { db } from "@/lib/supabase";
import { insertPost, countPosts } from "@/lib/db/posts";
import { describePhoto } from "@/lib/ai/describe";
import type { ImageMediaType } from "@/lib/ai/extract";
import { isMilestone } from "@/lib/tree/geometry";
import { GuardError, enforceRateLimit, enforceUpload, guardResponse, hashIp } from "@/lib/guard";

export const BUCKET = "posts";
const MAX_BODY = 280;

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData().catch(() => null);
    if (!form) throw new GuardError(400, "bad_request", "That did not arrive properly. Try again.");

    const kind = form.get("kind");
    if (kind !== "text" && kind !== "photo") {
      throw new GuardError(400, "bad_request", "That did not arrive properly. Try again.");
    }

    const ipHash = hashIp(request);
    await enforceRateLimit(ipHash, "contribute");

    let body: string | null = null;
    let imageUrl: string | null = null;

    if (kind === "text") {
      const text = String(form.get("body") ?? "").trim();
      if (!text) throw new GuardError(400, "empty", "Write something first.");
      if (text.length > MAX_BODY) {
        throw new GuardError(413, "too_long", `Keep it under ${MAX_BODY} characters.`);
      }
      body = text;
    } else {
      const file = form.get("photo");
      enforceUpload(file);

      const bytes = Buffer.from(await file.arrayBuffer());

      // Caption and safety verdict come from the same call — free.
      const described = await describePhoto({
        base64: bytes.toString("base64"),
        mediaType: file.type as ImageMediaType,
      });
      if (!described.safe) {
        throw new GuardError(422, "unsafe_photo", "The tree will not take that one. Try another.");
      }

      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.jpg`;
      const up = await db.storage.from(BUCKET).upload(path, bytes, {
        contentType: file.type,
        upsert: false,
      });
      if (up.error) throw new Error(`upload: ${up.error.message}`);

      imageUrl = db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      body = described.caption || null;
    }

    const post = await insertPost({ kind, body, imageUrl, authorHash: ipHash });
    const count = await countPosts();

    return Response.json({
      id: post.id,
      idx: post.idx,
      count,
      milestone: isMilestone(count) ? count : null,
    });
  } catch (e) {
    return guardResponse(e);
  }
}
