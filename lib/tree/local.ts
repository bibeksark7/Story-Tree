"use client";

import { useSyncExternalStore } from "react";

/**
 * Per-visitor state: the unlocked climber skin and saved branches.
 *
 * There are no accounts, so this lives in the browser. Exposed as an external
 * store rather than read into state inside an effect — that avoids both the
 * cascading render and the server/client hydration mismatch you get from
 * touching localStorage during render.
 */

const SKIN_KEY = "storytree.skin";
const FAVS_KEY = "storytree.favourites";

export type Skin = "default" | "reve";
export type Favourite = { id: string; idx: number; label: string };

const listeners = new Set<() => void>();

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
}

function emit(): void {
  for (const fn of listeners) fn();
}

// getSnapshot must return a stable reference or React re-renders forever, so
// the parsed values are cached and only rebuilt when something writes.
let skinCache: Skin = "default";
let favsCache: Favourite[] = [];
const EMPTY: Favourite[] = [];

function readSkinNow(): Skin {
  skinCache = window.localStorage.getItem(SKIN_KEY) === "reve" ? "reve" : "default";
  return skinCache;
}

function readFavsNow(): Favourite[] {
  try {
    const raw = window.localStorage.getItem(FAVS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    favsCache = Array.isArray(parsed) ? parsed : [];
  } catch {
    favsCache = [];
  }
  return favsCache;
}

let hydrated = false;
function ensureHydrated(): void {
  if (hydrated) return;
  hydrated = true;
  readSkinNow();
  readFavsNow();
}

export function useSkin(): Skin {
  return useSyncExternalStore(
    subscribe,
    () => {
      ensureHydrated();
      return skinCache;
    },
    () => "default" as Skin,
  );
}

export function useFavourites(): Favourite[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      ensureHydrated();
      return favsCache;
    },
    () => EMPTY,
  );
}

export function setSkin(skin: Skin): void {
  window.localStorage.setItem(SKIN_KEY, skin);
  skinCache = skin;
  emit();
}

export function setFavourites(list: Favourite[]): void {
  const next = list.slice(0, 50);
  window.localStorage.setItem(FAVS_KEY, JSON.stringify(next));
  favsCache = next;
  emit();
}

export function toggleFavourite(list: Favourite[], fav: Favourite): Favourite[] {
  return list.some((f) => f.id === fav.id)
    ? list.filter((f) => f.id !== fav.id)
    : [fav, ...list];
}
