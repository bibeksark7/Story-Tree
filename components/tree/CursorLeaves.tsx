"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Leaves drift off the pointer as it moves.
 *
 * Deliberately not a generic glow or trail — leaves belong to this product.
 * Skipped entirely on touch devices, where there is no pointer to follow, and
 * when the visitor has asked for reduced motion.
 */

type Leaf = {
  id: number;
  x: number;
  y: number;
  /** Sideways drift as it falls. */
  dx: number;
  rot: number;
  size: number;
  hue: string;
  life: number;
};

const HUES = ["#7cc45a", "#5f9a35", "#a3c94f", "#e0a63c"];
const SPAWN_EVERY_MS = 85;
const MIN_TRAVEL = 26;
const MAX_LEAVES = 22;

export function CursorLeaves() {
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const last = useRef({ x: 0, y: 0, t: 0 });
  const nextId = useRef(0);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || still) return;

    function onMove(e: PointerEvent) {
      const now = performance.now();
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;

      // Only spawn on real movement, and never faster than the cadence —
      // otherwise a quick sweep floods the screen.
      if (now - last.current.t < SPAWN_EVERY_MS) return;
      if (Math.hypot(dx, dy) < MIN_TRAVEL) return;

      last.current = { x: e.clientX, y: e.clientY, t: now };
      const id = nextId.current++;

      setLeaves((prev) => [
        ...prev.slice(-(MAX_LEAVES - 1)),
        {
          id,
          x: e.clientX,
          y: e.clientY,
          dx: (Math.random() - 0.5) * 70,
          rot: (Math.random() - 0.5) * 320,
          size: 9 + Math.random() * 9,
          hue: HUES[id % HUES.length],
          life: 1500 + Math.random() * 700,
        },
      ]);

      window.setTimeout(() => {
        setLeaves((prev) => prev.filter((l) => l.id !== id));
      }, 2300);
    }

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  if (leaves.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {leaves.map((l) => (
        <span
          key={l.id}
          className="absolute block"
          style={{
            left: l.x,
            top: l.y,
            width: l.size,
            height: l.size,
            background: l.hue,
            // A leaf, not a dot: pointed at one end, round at the other.
            borderRadius: "0 60% 0 60%",
            animation: `leaf-fall ${l.life}ms cubic-bezier(0.25, 0.6, 0.4, 1) forwards`,
            ["--leaf-dx" as string]: `${l.dx}px`,
            ["--leaf-rot" as string]: `${l.rot}deg`,
          }}
        />
      ))}

      <style>{`
        @keyframes leaf-fall {
          0%   { opacity: 0;   transform: translate(-50%, -50%) rotate(0deg) scale(0.5); }
          18%  { opacity: 0.95; }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--leaf-dx)), calc(-50% + 130px))
                       rotate(var(--leaf-rot)) scale(0.85);
          }
        }
      `}</style>
    </div>
  );
}
