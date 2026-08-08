"use client";

import { useEffect } from "react";

/**
 * Records that this node was read. Client-side and fire-and-forget so it never
 * blocks the render, and so bots that do not run JS do not skew canon.
 */
export function VisitPing({ nodeId }: { nodeId: string }) {
  useEffect(() => {
    const body = JSON.stringify({ id: nodeId });
    // keepalive lets the request survive the navigation away from this page.
    fetch("/api/visit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [nodeId]);

  return null;
}
