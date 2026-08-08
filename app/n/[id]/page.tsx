import { notFound } from "next/navigation";
import { getNode, getChildren } from "@/lib/db/nodes";
import { getObject } from "@/lib/db/objects";
import { selectIllustration } from "@/lib/art/illustrate";
import { Card } from "@/components/Card";
import { Passage } from "@/components/Passage";
import { Choices, type Choice } from "@/components/Choices";
import { VisitPing } from "@/components/VisitPing";
import type { DominantColor, Mood } from "@/lib/ai/schemas";

// A freshly generated child must never be hidden behind a stale render.
export const dynamic = "force-dynamic";

/** A catalogue number, not a UUID. Readers should feel filed, not indexed. */
function accession(id: string): string {
  return `LF-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

export default async function NodePage({ params }: PageProps<"/n/[id]">) {
  const { id } = await params;

  const node = await getNode(id);
  if (!node) notFound();

  const children = await getChildren(node.id);
  const object = node.object_id ? await getObject(node.object_id) : null;

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
    <Card>
      <VisitPing nodeId={node.id} />
      <Passage
        prose={node.prose}
        illustration={illustration}
        accession={accession(node.id)}
        shelf={node.depth}
        objectName={object?.name ?? null}
      />
      {/* The contribute affordance appears once a reader is a few screens in,
          so it lands as a discovery rather than an instruction. */}
      <Choices nodeId={node.id} choices={choices} showContribute={node.depth >= 2} />
    </Card>
  );
}
