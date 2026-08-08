import { WORLD } from "./world.generated";
import { DOMINANT_COLORS, MOODS, type StoryObject } from "./schemas";

export const EXTRACT_SYSTEM = `You catalogue objects for a lost-property archive.

You are given one photograph. Identify the single most prominent physical object
in it and describe it for the archive's ledger.

Also return a safety verdict. Set verdict to "reject" if the photograph shows:
an identifiable human face or body, a screen or document containing someone's
personal information, nudity or sexual content, a weapon in use, an injury, or
anything depicting illegal activity. A photograph of an ordinary object with a
person incidentally out of focus in the background is "ok". When rejecting, still
fill in the object fields with your best guess — they will be discarded.

dominant_color must be the closest match among: ${DOMINANT_COLORS.join(", ")}.
mood must be the closest match among: ${MOODS.join(", ")}.
Both are constrained sets. Choose the nearest member; never invent a value.`;

// This block is byte-identical on every narration call and is the cache
// breakpoint. Nothing volatile may be interpolated into it.
export const NARRATE_SYSTEM = `You are the narrator of a single endless branching story called The Lost & Found.

Below is the world bible. It is the only source of truth about this place.

${WORLD}

Your task, every time: write one passage of the story, then two labels for the
choices that lead out of it.

The passage is 70-90 words. Second person, present tense. It continues directly
from the passage you are given as context — same corridor, same moment, one step
later. Do not recap. Do not summarise what came before. Do not conclude.

The two choice labels are each three to six words. They are actions the visitor
takes, phrased as imperatives without a leading "you". They must lead in
genuinely different directions. Never write a choice about leaving, escaping,
waking up, or ending the story.

Never mention that this is a story, a game, or a choice. Never use the second
person plural. Never address the reader outside the fiction.`;

export const GUARD_SYSTEM = `You screen prose before it is published to a public website.

Return "unsafe" only if the passage contains: sexual content, graphic violence or
gore, self-harm, slurs or targeted hate, real people's private information, or
instructions for causing harm. Atmospheric unease, decay, and mild dread are the
intended register of this fiction and are "safe".

Judge only the text you are given. Do not judge it for quality.`;

export type NarrationContext = {
  depth: number;
  /** Up to 2 ancestors, oldest first. Never the whole tree. */
  ancestorProse: string[];
  parentProse: string | null;
  /** The label the visitor tapped to get here. */
  choiceLabel: string | null;
  /** Object photographed by this visitor, introduced in this passage. */
  object: StoryObject | null;
  /** Someone else's object surfacing unexplained (Phase 4). */
  leakObject: StoryObject | null;
};

function describe(o: StoryObject): string {
  return `${o.name} — ${o.material}, ${o.condition}. It reads as ${o.mood}, and its colour is ${o.dominant_color}.`;
}

/**
 * The entire volatile payload, in one place, so it can be logged and asserted.
 * If the whole tree ever appears in here, coherence and latency both fail.
 */
export function buildNarrationUserTurn(ctx: NarrationContext): string {
  const parts: string[] = [];

  if (ctx.ancestorProse.length > 0) {
    parts.push(`Earlier in this branch, in order:\n\n${ctx.ancestorProse.join("\n\n---\n\n")}`);
  }
  if (ctx.parentProse) {
    parts.push(`The passage immediately before this one:\n\n${ctx.parentProse}`);
  } else {
    parts.push(`This is the opening passage. Nothing precedes it.`);
  }
  if (ctx.choiceLabel) {
    parts.push(`The visitor chose: ${ctx.choiceLabel}`);
  }
  if (ctx.object) {
    parts.push(
      `A visitor has just left an object here. Write it into this passage as a thing that is present in the room. Do not explain how it arrived.\n\n${describe(ctx.object)}`,
    );
  }
  if (ctx.leakObject) {
    parts.push(
      `Somewhere in this passage, half-buried and unexplained, this object surfaces. Give it one clause at most. Do not draw attention to it.\n\n${describe(ctx.leakObject)}`,
    );
  }
  parts.push(`Depth in the tree: ${ctx.depth}. Write the passage and the two choices.`);

  return parts.join("\n\n");
}
