"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

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
    <main className="mx-auto flex w-full max-w-xl flex-col gap-5 px-6 py-24">
      <p className="text-lg leading-relaxed text-neutral-200">
        Something in the building did not answer. The lamps are still on; the corridor is
        still there. It simply did not respond this time.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="w-fit rounded-sm border border-neutral-700 px-5 py-3 text-base text-neutral-200 transition-colors hover:border-neutral-400 hover:bg-neutral-900"
      >
        Try the door again
      </button>
    </main>
  );
}
