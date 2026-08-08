import "server-only";
import { guardText } from "./guardText";
import { GuardError } from "@/lib/guard";

/**
 * The second guard point: nothing generated is written to the tree without
 * being read once more.
 *
 * Set PROSE_GUARD=off in Vercel to skip it. That is cut-list item 2 — it saves
 * roughly a second on every single generation, and is defensible because the
 * narrator is heavily constrained by the world bible and only ever sees a
 * pre-screened object.
 */
export async function screenProse(prose: string): Promise<void> {
  if (process.env.PROSE_GUARD === "off") return;

  const { data } = await guardText(prose);
  if (data.verdict === "unsafe") {
    // Deliberately vague to the reader: naming what tripped the screen would
    // teach someone how to aim at it.
    throw new GuardError(
      422,
      "unsafe_prose",
      "That turn of the corridor did not come out right. Try the other way.",
    );
  }
}
