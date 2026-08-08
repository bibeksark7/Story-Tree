// Typed module, not JSON: compile-time exhaustiveness on the 5x5 grid, zero
// runtime IO, no fetch, no failure mode. The grid is built from the same enum
// arrays the extraction schema constrains the model to, so a new colour or mood
// cannot silently miss an entry.
import { DOMINANT_COLORS, MOODS, type DominantColor, type Mood } from "@/lib/ai/schemas";

export type ArtKey = `${DominantColor}-${Mood}`;

export const MANIFEST: Record<ArtKey, string> = Object.fromEntries(
  DOMINANT_COLORS.flatMap((c) => MOODS.map((m) => [`${c}-${m}`, `/brand/${c}-${m}.png`])),
) as Record<ArtKey, string>;

// Unreachable given the schema constraint, but the read path never crashes.
export const FALLBACK_ASSET = "/brand/bone-dormant.png";
