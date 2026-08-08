// Pure selection function. Signature stays swappable for a future Reve API.
import { MANIFEST, FALLBACK_ASSET, type ArtKey } from "./manifest";
import type { DominantColor, Mood } from "@/lib/ai/schemas";

export type Illustration = { src: string; alt: string };
export type IllustrationInput = {
  dominantColor: DominantColor;
  mood: Mood;
  /** node id — reserved for future variation, unused today */
  seed: string;
};

export function selectIllustration(i: IllustrationInput): Illustration {
  const key = `${i.dominantColor}-${i.mood}` as ArtKey;
  return {
    src: MANIFEST[key] ?? FALLBACK_ASSET,
    alt: `An illustration in ${i.dominantColor}, ${i.mood}.`,
  };
}
