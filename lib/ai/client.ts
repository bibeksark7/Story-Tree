import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic();

// Every model choice in the app lives here. Env overrides make the latency
// escape hatch a config change rather than a deploy — set them in .env.local
// to sweep with scripts/probe.ts, or in Vercel to change models live.
//
// Chosen from Phase 0 probe data on a 1024x768 fixture, warm (p50):
//   extract  Haiku 4.5  1.7s   constrained classification into the 5x5 grid
//   narrate  Sonnet 5   4.3s   the product; Opus 5 costs +1.6s and blows the gate
//   guard    Haiku 4.5  1.0s   pure text classification on every generation
// photo->node 6.0s, 6.9s including the guard, against an 8s budget.
export const EXTRACT_MODEL = process.env.EXTRACT_MODEL ?? "claude-haiku-4-5";
export const NARRATE_MODEL = process.env.NARRATE_MODEL ?? "claude-sonnet-5";
export const GUARD_MODEL = process.env.GUARD_MODEL ?? "claude-haiku-4-5";

// Effort is the latency lever. Thinking is on by default on Opus 5 and must
// not be disabled — disabling it can leak <thinking> tags into output.
export const EFFORT = "low" as const;

// max_tokens caps thinking PLUS output. The prose is ~80 words; the headroom
// is for thinking. Raise this first if responses truncate mid-sentence.
export const MAX_TOKENS = 2048;

// output_config.effort errors on Haiku 4.5, so the escape hatch above would
// 400 without this guard.
const EFFORT_CAPABLE = new Set(["claude-opus-5", "claude-sonnet-5"]);

export function outputConfigFor(model: string, format?: unknown) {
  const cfg: Record<string, unknown> = {};
  if (EFFORT_CAPABLE.has(model)) cfg.effort = EFFORT;
  if (format) cfg.format = format;
  return cfg;
}
