"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Card } from "@/components/Card";

// Next 16 names this prop `retry`, not `reset`.
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card>
      <p className="label">Entry incomplete</p>
      <p className="mt-4 text-[1.1875rem] leading-[1.72] text-ink">
        Something in the building did not answer. The lamps are still on and the corridor is
        still there. It simply did not respond this time.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 border border-ink/30 px-5 py-3 font-label text-[0.8125rem] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-paper-lit"
      >
        Try the door again
      </button>
    </Card>
  );
}
