import Link from "next/link";
import { Card } from "@/components/Card";

export default function NotFound() {
  return (
    <Card>
      <p className="label">No such entry</p>
      <p className="mt-4 text-[1.1875rem] leading-[1.72] text-ink">
        There is no corridor here. The ledger has no entry under that number, and the
        building keeps no record of one ever existing.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block font-label text-[0.8125rem] text-ink-soft hover:text-ink"
      >
        Go back inside
      </Link>
    </Card>
  );
}
