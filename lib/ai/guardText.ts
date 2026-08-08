import { anthropic, GUARD_MODEL, MAX_TOKENS, outputConfigFor } from "./client";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { GuardSchema, type Guard } from "./schemas";
import { GUARD_SYSTEM } from "./prompts";

export async function guardText(prose: string): Promise<{ data: Guard; usage: unknown }> {
  const message = await anthropic.messages.parse({
    model: GUARD_MODEL,
    max_tokens: MAX_TOKENS,
    system: GUARD_SYSTEM,
    output_config: outputConfigFor(GUARD_MODEL, zodOutputFormat(GuardSchema)),
    messages: [{ role: "user", content: prose }],
  });

  // Fail closed: an unreadable guard result is treated as unsafe.
  if (message.stop_reason === "refusal" || !message.parsed_output) {
    return { data: { verdict: "unsafe", reason: "guard call did not return a verdict" }, usage: message.usage };
  }
  return { data: message.parsed_output, usage: message.usage };
}
