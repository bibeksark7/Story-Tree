import { notFound } from "next/navigation";
import { postsInMilestone } from "@/lib/db/posts";
import { MILESTONE_EVERY, phaseOf } from "@/lib/tree/geometry";
import { paletteFor } from "@/lib/tree/palette";
import { MilestoneReel } from "@/components/tree/MilestoneReel";

export const dynamic = "force-dynamic";

export default async function MilestonePage({ params }: PageProps<"/milestone/[n]">) {
  const { n } = await params;
  const milestone = Number(n);

  if (!Number.isInteger(milestone) || milestone <= 0 || milestone % MILESTONE_EVERY !== 0) {
    notFound();
  }

  const posts = await postsInMilestone(milestone, MILESTONE_EVERY);
  if (posts.length === 0) notFound();

  const phase = paletteFor(phaseOf(milestone));

  return (
    <MilestoneReel
      milestone={milestone}
      phase={phase}
      posts={posts.map((p) => ({
        id: p.id,
        idx: p.idx,
        kind: p.kind,
        body: p.body,
        image_url: p.image_url,
        created_at: p.created_at,
      }))}
    />
  );
}
