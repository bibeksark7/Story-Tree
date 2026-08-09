import "server-only";
import { z } from "zod";
import { anthropic, EXTRACT_MODEL, MAX_TOKENS, outputConfigFor } from "./client";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { ImageMediaType } from "./extract";

/**
 * A one-line caption for a photo posted to the tree.
 *
 * The safety verdict rides along in the same request, so it costs nothing
 * extra in latency or tokens — it is the same call either way.
 */
export const PhotoCaptionSchema = z.object({
  caption: z.string().describe("One short sentence, at most 12 words, describing what is in the photo."),
  safe: z.boolean().describe("False only for nudity, graphic violence, or an identifiable document of personal information."),
});
export type PhotoCaption = z.infer<typeof PhotoCaptionSchema>;

const SYSTEM = `You write one-line captions for photographs people pin to a shared tree.

Write plainly and warmly. Say what is actually in the picture. No more than
twelve words. Do not begin with "A photo of" or "An image of". Do not guess at
who someone is or where they are.`;

export async function describePhoto(input: {
  base64: string;
  mediaType: ImageMediaType;
}): Promise<PhotoCaption> {
  const message = await anthropic.messages.parse({
    model: EXTRACT_MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM,
    output_config: outputConfigFor(EXTRACT_MODEL, zodOutputFormat(PhotoCaptionSchema)),
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: input.mediaType, data: input.base64 } },
          { type: "text", text: "Caption this." },
        ],
      },
    ],
  });

  // A caption is a nicety, not a requirement — never fail a post over it.
  if (message.stop_reason === "refusal" || !message.parsed_output) {
    return { caption: "", safe: true };
  }
  return message.parsed_output;
}
