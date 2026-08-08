import { notFound } from "next/navigation";
import { getNode, getChildren } from "@/lib/db/nodes";
import { selectIllustration } from "@/lib/art/illustrate";
import { Passage } from "@/components/Passage";
import { ChoiceList, type Choice } from "@/components/ChoiceList";
import { VisitPing } from "@/components/VisitPing";
import type { DominantColor, Mood } from "@/lib/ai/schemas";

// A freshly generated child must never be hidden behind a stale render.
export const dynamic = "force-dynamic";

export default async function NodePage({ params }: PageProps<"/n/[id]">) {
  const { id } = await params;

  const node = await getNode(id);
  if (!node) notFound();

  const children = await getChildren(node.id);

  // art_asset stores the manifest key ("amber-dormant"), which is already the
  // resolved colour+bucket. Reuse selectIllustration so there is exactly one
  // place that knows how a key becomes a path.
  const [color, mood] = node.art_asset.split("-");
  const illustration = selectIllustration({
    dominantColor: color as DominantColor,
    mood: mood as Mood,
    seed: node.id,
  });

  const choices: Choice[] = node.pending_choices.map((label, slotIndex) => ({
    label,
    slotIndex,
    childId: children.find((c) => c.slot_index === slotIndex)?.id ?? null,
  }));

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-10 px-6 py-16">
      <VisitPing nodeId={node.id} />
      <Passage prose={node.prose} illustration={illustration} />
      {/* The contribute affordance appears once a reader is a few screens in,
          so it lands as a discovery rather than an instruction. */}
      <ChoiceList nodeId={node.id} choices={choices} showContribute={node.depth >= 2} />
    </main>
  );
}
