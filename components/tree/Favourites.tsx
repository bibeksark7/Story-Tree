"use client";

import type { Favourite } from "@/lib/tree/local";
import type { Phase } from "@/lib/tree/palette";

/**
 * Saved branches, down the side of the screen.
 *
 * Tapping one jumps to that branch on the tree and opens it; closing it leaves
 * you exactly there, so you carry on climbing from that point rather than
 * being sent back to the top.
 */
export function Favourites({
  favourites,
  open,
  onToggleOpen,
  onJump,
  onRemove,
  phase,
}: {
  favourites: Favourite[];
  open: boolean;
  onToggleOpen: () => void;
  onJump: (fav: Favourite) => void;
  onRemove: (fav: Favourite) => void;
  phase: Phase;
}) {
  return (
    <div className="absolute right-0 top-1/2 z-30 flex -translate-y-1/2 items-start">
      {open && (
        <div className="mr-1 max-h-[62dvh] w-56 overflow-y-auto rounded-l-lg bg-white/95 p-2 shadow-lg backdrop-blur">
          <p className="px-2 py-1 font-label text-[0.625rem] uppercase tracking-[0.16em] text-neutral-500">
            Saved branches
          </p>
          {favourites.length === 0 ? (
            <p className="px-2 py-3 text-[0.8125rem] leading-snug text-neutral-500">
              Open a post and tap the star to save it here.
            </p>
          ) : (
            <ul>
              {favourites.map((f, i) => (
                <li key={f.id} className="flex items-start gap-1">
                  <button
                    type="button"
                    onClick={() => onJump(f)}
                    className="min-w-0 flex-1 rounded px-2 py-2 text-left hover:bg-neutral-100"
                  >
                    <span className="font-label text-[0.625rem] uppercase tracking-[0.14em] text-neutral-500">
                      Favourite {i + 1} · branch {f.idx}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.875rem] text-neutral-900">
                      {f.label}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove favourite ${i + 1}`}
                    onClick={() => onRemove(f)}
                    className="mt-2 shrink-0 rounded px-2 py-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={open}
        aria-label={open ? "Hide saved branches" : "Show saved branches"}
        className="rounded-l-md px-2 py-4 text-sm shadow-md"
        style={{ background: "rgba(255,255,255,0.94)", color: phase.ink }}
      >
        <span className="block leading-none">{open ? "›" : "★"}</span>
        {!open && favourites.length > 0 && (
          <span className="mt-1 block font-label text-[0.625rem] leading-none text-neutral-600">
            {favourites.length}
          </span>
        )}
      </button>
    </div>
  );
}
