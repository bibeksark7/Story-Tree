import { redirect } from "next/navigation";
import { canonEntry } from "@/lib/canon";

// Canon shifts as people read. Never serve a cached entry point.
export const dynamic = "force-dynamic";

export default async function Home() {
  const entry = await canonEntry(2);

  // An empty tree is a setup problem, not a reader-facing state. Say so plainly
  // rather than redirecting into nowhere.
  if (!entry) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 font-mono text-sm text-neutral-400">
        <p className="mb-2 text-neutral-200">The Lost &amp; Found is empty.</p>
        <p>Run `npm run seed` to insert the trunk.</p>
      </main>
    );
  }

  redirect(`/n/${entry.id}`);
}
