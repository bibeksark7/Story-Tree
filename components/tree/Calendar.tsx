"use client";

import { useEffect, useState } from "react";
import type { Phase } from "@/lib/tree/palette";

const WEEKS = 26;
const DAY_MS = 86_400_000;

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function pretty(day: string): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Contributions calendar: one square per day for the last half year, shaded by
 * how many times the tree was climbed that day.
 */
export function Calendar({ phase, onClose }: { phase: Phase; onClose: () => void }) {
  const [byDay, setByDay] = useState<Record<string, number> | null>(null);
  const [hover, setHover] = useState<{ day: string; n: number } | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/activity", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (live) setByDay(d.byDay ?? {});
      })
      .catch(() => {
        if (live) setByDay({});
      });
    return () => {
      live = false;
    };
  }, []);

  // Columns are weeks, rows are days. Anchor on the Sunday of the CURRENT
  // week and count back, so the final column always contains today — rolling
  // a fixed span back to a Sunday dropped the last few days, and today is
  // exactly the day most likely to have activity.
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const thisWeekStart = new Date(today);
  thisWeekStart.setUTCDate(today.getUTCDate() - today.getUTCDay());
  const start = new Date(thisWeekStart.getTime() - (WEEKS - 1) * 7 * DAY_MS);

  const columns: string[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    const col: string[] = [];
    for (let d = 0; d < 7; d++) {
      col.push(isoDay(new Date(start.getTime() + (w * 7 + d) * DAY_MS)));
    }
    columns.push(col);
  }

  const max = byDay ? Math.max(1, ...Object.values(byDay)) : 1;

  function shade(n: number): string {
    if (!n) return "rgba(0,0,0,0.08)";
    const step = Math.min(Math.ceil((n / max) * 4), 4);
    return [
      "",
      `${phase.grassShade}66`,
      `${phase.grassShade}aa`,
      phase.grassShade,
      phase.grass,
    ][step];
  }

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-black/45 p-3 sm:items-center">
      <div
        className="w-full max-w-lg rounded-lg bg-white p-4 shadow-xl"
        role="dialog"
        aria-label="Climbing calendar"
      >
        <div className="flex items-baseline justify-between">
          <p className="font-label text-[0.6875rem] uppercase tracking-[0.16em] text-neutral-500">
            Climbs per day
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close calendar"
            className="rounded px-2 py-1 text-neutral-500 hover:bg-neutral-100"
          >
            ×
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <div className="flex gap-[3px]">
            {columns.map((col, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                {col.map((day) => {
                  const n = byDay?.[day] ?? 0;
                  const future = day > isoDay(today);
                  return (
                    <button
                      key={day}
                      type="button"
                      aria-label={`${pretty(day)}: ${n} ${n === 1 ? "climb" : "climbs"}`}
                      // Tap as well as hover: there is no hover on a phone,
                      // and this is a phone-first product.
                      onClick={() => setHover({ day, n })}
                      onMouseEnter={() => setHover({ day, n })}
                      onFocus={() => setHover({ day, n })}
                      className="h-[13px] w-[13px] rounded-[2px]"
                      style={{
                        background: future ? "transparent" : shade(n),
                        outline: future ? "none" : undefined,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-3 min-h-[1.25rem] text-[0.875rem] text-neutral-700">
          {byDay === null
            ? "Reading the ledger…"
            : hover
              ? `${hover.n} ${hover.n === 1 ? "climb" : "climbs"} on ${pretty(hover.day)}`
              : "Tap or hover a square for that day's climbs."}
        </p>
      </div>
    </div>
  );
}
