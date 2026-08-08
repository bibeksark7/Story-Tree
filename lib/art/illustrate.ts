// Pure selection function. Signature stays swappable for a future Reve API.
import { MANIFEST, MOOD_BUCKET, FALLBACK_ASSET, type ArtKey } from "./manifest";
import type { DominantColor, Mood } from "@/lib/ai/schemas";

export type Illustration = { src: string; alt: string };
export type IllustrationInput = {
  dominantColor: DominantColor;
  mood: Mood;
  /** node id — reserved for future variation, unused today */
  seed: string;
};

export function selectIllustration(i: IllustrationInput): Illustration {
  const key = `${i.dominantColor}-${MOOD_BUCKET[i.mood]}` as ArtKey;
  return {
    src: MANIFEST[key] ?? FALLBACK_ASSET,
    // The alt text keeps the true mood, not the bucket — it costs nothing and
    // is more useful to a screen reader.
    alt: `An illustration in ${i.dominantColor}, ${i.mood}.`,
  };
}
