// Typed module, not JSON: compile-time exhaustiveness, zero runtime IO, no
// fetch, no failure mode.
//
// The vision model still classifies into all five moods — that richness is
// free and feeds the prose. The art grid is deliberately coarser: five colours
// x two mood buckets = 10 assets, not 25. Ten good illustrations beat
// twenty-five rushed ones, and a visitor tapping through five nodes cannot
// tell the difference.
import { DOMINANT_COLORS, type DominantColor, type Mood } from "@/lib/ai/schemas";

/** The two buckets the five moods collapse into. */
export const ART_MOODS = ["dormant", "restless"] as const;
export type ArtMood = (typeof ART_MOODS)[number];

/**
 * Settled things read as `dormant`; disturbed, wrong, or mid-motion things
 * read as `restless`. Exhaustive over Mood — adding a mood is a compile error
 * until it is bucketed here.
 */
export const MOOD_BUCKET: Record<Mood, ArtMood> = {
  dormant: "dormant",
  tender: "dormant",
  restless: "restless",
  ominous: "restless",
  absurd: "restless",
};

export type ArtKey = `${DominantColor}-${ArtMood}`;

export const MANIFEST: Record<ArtKey, string> = Object.fromEntries(
  DOMINANT_COLORS.flatMap((c) => ART_MOODS.map((m) => [`${c}-${m}`, `/brand/${c}-${m}.png`])),
) as Record<ArtKey, string>;

// Unreachable given the schema constraint, but the read path never crashes.
export const FALLBACK_ASSET = "/brand/bone-dormant.png";
