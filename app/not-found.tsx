import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-5 px-6 py-24">
      <p className="text-lg leading-relaxed text-neutral-200">
        There is no corridor here. The ledger has no entry under that number, and the
        building keeps no record of one ever existing.
      </p>
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-300">
        ← Go back inside
      </Link>
    </main>
  );
}
