import type { ReactNode } from "react";

/**
 * A catalogue card on the table. Everything the reader sees sits on one of
 * these — passage, camera, error, empty state — so the whole product reads as
 * a single physical object rather than a set of pages.
 */
export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full justify-center px-4 py-8 sm:py-14">
      <div className="settle card-stock w-full max-w-[34rem] rounded-[2px] shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_10px_28px_-12px_rgba(34,31,26,0.55)]">
        <div className="m-[6px] border border-paper-deep/70 p-5 sm:m-2 sm:p-7">{children}</div>
      </div>
    </div>
  );
}

/** The ledger's field rows: a narrow label column and a value. */
export function Field({ name, value }: { name: string; value: ReactNode }) {
  return (
    <div className="flex gap-3 py-[3px]">
      <span className="label w-[5.5rem] shrink-0 pt-[3px]">{name}</span>
      <span className="font-label text-[0.8125rem] leading-5 text-ink-soft">{value}</span>
    </div>
  );
}
