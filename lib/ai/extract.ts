import { anthropic, EXTRACT_MODEL, MAX_TOKENS, outputConfigFor } from "./client";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { ExtractionSchema, type Extraction } from "./schemas";
import { EXTRACT_SYSTEM } from "./prompts";

export type ImageMediaType = "image/jpeg" | "image/png" | "image/webp";

export async function extractObject(input: {
  base64: string;
  mediaType: ImageMediaType;
}): Promise<{ data: Extraction; usage: unknown }> {
  const message = await anthropic.messages.parse({
    model: EXTRACT_MODEL,
    max_tokens: MAX_TOKENS,
    system: EXTRACT_SYSTEM,
    output_config: outputConfigFor(EXTRACT_MODEL, zodOutputFormat(ExtractionSchema)),
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: input.mediaType, data: input.base64 } },
          { type: "text", text: "Catalogue this object." },
        ],
      },
    ],
  });

  if (message.stop_reason === "refusal") {
    throw new Error(`extract: model refused (${message.stop_details?.category ?? "unknown"})`);
  }
  if (!message.parsed_output) {
    throw new Error(`extract: no parsed output (stop_reason=${message.stop_reason})`);
  }
  return { data: message.parsed_output, usage: message.usage };
}
