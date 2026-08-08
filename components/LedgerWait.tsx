"use client";

import { useEffect, useState } from "react";

/**
 * The wait screen.
 *
 * Seven seconds is a long time to look at a spinner. The world bible says the
 * building "keeps its own inventory, in ledgers that appear to write
 * themselves" — so while the passage is being written, the reader watches the
 * entry being made. Something to read, in the story's own voice, instead of a
 * progress indicator.
 *
 * The DATE field is struck through on purpose: there are no clocks in this
 * building. It is the one joke, and only someone paying attention gets it.
 */

type Row = { name: string; value: string; struck?: boolean };

const STEP_MS = 900;

export function LedgerWait({ location }: { location: string }) {
  const rows: Row[] = [
    { name: "Accession", value: "pending" },
    { name: "Location", value: location },
    { name: "Condition", value: "as found" },
    { name: "Date", value: "—", struck: true },
    { name: "Entered by", value: "the building" },
  ];

  const [shown, setShown] = useState(1);

  useEffect(() => {
    if (shown >= rows.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [shown, rows.length]);

  return (
    <section aria-live="polite" aria-busy="true" className="pt-1">
      <p className="label mb-4">The ledger is writing itself</p>

      <div className="border-t border-paper-deep pt-3">
        {rows.slice(0, shown).map((row) => (
          <div key={row.name} className="ink-in flex gap-3 py-[5px]">
            <span className="label w-[6.5rem] shrink-0 pt-[3px]">{row.name}</span>
            <span
              className={`font-label text-[0.8125rem] leading-5 ${
                row.struck ? "text-ink-faint line-through decoration-stamp/70" : "text-ink-soft"
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}

        {/* The nib, still moving. */}
        <div className="mt-3 h-px w-full overflow-hidden bg-paper-deep">
          <div className="h-px w-1/3 animate-[nib_1.6s_ease-in-out_infinite] bg-stamp/60" />
        </div>
      </div>

      <style>{`
        @keyframes nib {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[nib_1\\.6s_ease-in-out_infinite\\] { animation: none; }
        }
      `}</style>
    </section>
  );
}
