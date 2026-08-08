import { anthropic, NARRATE_MODEL, MAX_TOKENS, outputConfigFor } from "./client";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { NarrationSchema, type Narration } from "./schemas";
import { NARRATE_SYSTEM, buildNarrationUserTurn, type NarrationContext } from "./prompts";

export async function narrate(
  ctx: NarrationContext,
): Promise<{ data: Narration; usage: { cache_read_input_tokens?: number | null } }> {
  const userTurn = buildNarrationUserTurn(ctx);

  if (process.env.NODE_ENV !== "production") {
    console.log("\n--- narrate user turn ---\n" + userTurn + "\n--- end ---\n");
  }

  const message = await anthropic.messages.parse({
    model: NARRATE_MODEL,
    max_tokens: MAX_TOKENS,
    // Cache breakpoint on the system block: world bible + instructions are
    // byte-identical every call. Everything volatile is in the user turn below.
    system: [{ type: "text", text: NARRATE_SYSTEM, cache_control: { type: "ephemeral" } }],
    output_config: outputConfigFor(NARRATE_MODEL, zodOutputFormat(NarrationSchema)),
    messages: [{ role: "user", content: userTurn }],
  });

  if (message.stop_reason === "refusal") {
    throw new Error(`narrate: model refused (${message.stop_details?.category ?? "unknown"})`);
  }
  if (!message.parsed_output) {
    throw new Error(`narrate: no parsed output (stop_reason=${message.stop_reason})`);
  }
  return { data: message.parsed_output, usage: message.usage };
}
