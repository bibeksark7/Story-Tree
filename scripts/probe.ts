// Env comes from `tsx --env-file=.env.local` (see the "probe" npm script).
// A dotenv call here would be too late: ESM hoists the imports below, so
// lib/ai/client.ts constructs the Anthropic client before any statement runs.
import { readFileSync, writeFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import { extractObject, type ImageMediaType } from "@/lib/ai/extract";
import { narrate } from "@/lib/ai/narrate";
import { guardText } from "@/lib/ai/guardText";
import { selectIllustration } from "@/lib/art/illustrate";

const MEDIA: Record<string, ImageMediaType> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

async function stage<T>(name: string, fn: () => Promise<T>): Promise<[T, number]> {
  const t0 = performance.now();
  const out = await fn();
  const ms = Math.round(performance.now() - t0);
  console.log(`  ${name.padEnd(12)} ${String(ms).padStart(6)} ms`);
  return [out, ms];
}

async function main() {
  const path = process.argv[2];
  if (!path) {
    console.error("usage: npm run probe -- ./fixtures/mug.jpg");
    process.exit(1);
  }

  const mediaType = MEDIA[extname(path).toLowerCase()];
  if (!mediaType) throw new Error(`unsupported image type: ${extname(path)}`);

  const bytes = readFileSync(resolve(path));
  console.log(`\n${path} — ${(bytes.length / 1024).toFixed(0)} KB\n`);

  const total0 = performance.now();

  const [extraction, extractMs] = await stage("extract", () =>
    extractObject({ base64: bytes.toString("base64"), mediaType }),
  );

  const [narration, narrateMs] = await stage("narrate", () =>
    narrate({
      depth: 3,
      ancestorProse: ["[probe ancestor 1]", "[probe ancestor 2]"],
      parentProse: "[probe parent passage]",
      choiceLabel: "leave something here",
      object: extraction.data.object,
      leakObject: null,
    }),
  );

  const [guard, guardMs] = await stage("guard", () => guardText(narration.data.prose));

  const illustration = selectIllustration({
    dominantColor: extraction.data.object.dominant_color,
    mood: extraction.data.object.mood,
    seed: "probe",
  });

  const totalMs = Math.round(performance.now() - total0);

  console.log(`  ${"TOTAL".padEnd(12)} ${String(totalMs).padStart(6)} ms`);
  console.log(`  ${"(no guard)".padEnd(12)} ${String(totalMs - guardMs).padStart(6)} ms\n`);

  console.log("verdict:      ", extraction.data.verdict, extraction.data.reject_reason || "");
  console.log("object:       ", JSON.stringify(extraction.data.object));
  console.log("asset:        ", illustration.src);
  console.log("prose:        ", narration.data.prose);
  console.log("words:        ", narration.data.prose.trim().split(/\s+/).length);
  console.log("choices:      ", [narration.data.choice_a, narration.data.choice_b]);
  console.log("prose guard:  ", guard.data.verdict, guard.data.reason || "");
  console.log("cache reads:  ", narration.usage.cache_read_input_tokens ?? 0, "(expect > 0 on run 2+)");

  writeFileSync(
    ".probe-latency.json",
    JSON.stringify({ at: new Date().toISOString(), extractMs, narrateMs, guardMs, totalMs }, null, 2),
  );

  if (totalMs - guardMs > 8000) {
    console.error("\nGATE FAILED: photo->node exceeds 8s. Fix models/effort before Phase 1.\n");
    process.exit(1);
  }
  console.log("\nGATE PASSED\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
