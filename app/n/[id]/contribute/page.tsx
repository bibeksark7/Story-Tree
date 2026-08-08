import Link from "next/link";
import { notFound } from "next/navigation";
import { getNode } from "@/lib/db/nodes";
import { CameraCapture } from "@/components/CameraCapture";

export const dynamic = "force-dynamic";

export default async function ContributePage({ params }: PageProps<"/n/[id]/contribute">) {
  const { id } = await params;

  const node = await getNode(id);
  if (!node) notFound();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-3">
        <h1 className="text-lg text-neutral-100">Leave something here</h1>
        <p className="text-base leading-relaxed text-neutral-400">
          Photograph an object in front of you. It will be written into this part of the
          building, and it will stay.
        </p>
        <p className="text-sm leading-relaxed text-neutral-500">
          The photograph is read once and never stored. Only the words survive.
        </p>
      </div>

      <CameraCapture parentId={node.id} />

      <Link href={`/n/${node.id}`} className="text-sm text-neutral-500 hover:text-neutral-300">
        ← Back to the passage
      </Link>
    </main>
  );
}
