import { redirect } from "next/navigation";
import { canonEntry } from "@/lib/canon";
import { Card } from "@/components/Card";

// Canon shifts as people read. Never serve a cached entry point.
export const dynamic = "force-dynamic";

export default async function Home() {
  const entry = await canonEntry(2);

  // An empty tree is a setup problem, not a reader-facing state.
  if (!entry) {
    return (
      <Card>
        <p className="label">Empty inventory</p>
        <p className="mt-4 text-[1.1875rem] leading-[1.72] text-ink">
          The Lost &amp; Found holds nothing yet.
        </p>
        <p className="mt-3 font-label text-[0.8125rem] text-ink-soft">
          Run npm run seed to insert the trunk.
        </p>
      </Card>
    );
  }

  redirect(`/n/${entry.id}`);
}
