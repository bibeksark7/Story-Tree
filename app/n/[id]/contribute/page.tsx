import Link from "next/link";
import { notFound } from "next/navigation";
import { getNode } from "@/lib/db/nodes";
import { Card } from "@/components/Card";
import { CameraCapture } from "@/components/CameraCapture";

export const dynamic = "force-dynamic";

export default async function ContributePage({ params }: PageProps<"/n/[id]/contribute">) {
  const { id } = await params;

  const node = await getNode(id);
  if (!node) notFound();

  return (
    <Card>
      <p className="label">New entry</p>
      <h1 className="mt-3 text-[1.5rem] leading-snug text-ink">Leave something here</h1>

      <p className="mt-4 text-[1.0625rem] leading-[1.7] text-ink">
        Photograph an object in front of you. It will be written into this part of the
        building, and it will stay.
      </p>

      <p className="mt-3 font-label text-[0.8125rem] leading-5 text-ink-soft">
        The photograph is read once and never stored. Only the words survive.
      </p>

      <div className="mt-7 border-t border-paper-deep pt-7">
        <CameraCapture parentId={node.id} />
      </div>

      <Link
        href={`/n/${node.id}`}
        className="mt-6 inline-block font-label text-[0.8125rem] text-ink-soft hover:text-ink"
      >
        Back to the passage
      </Link>
    </Card>
  );
}
