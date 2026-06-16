"use client";

import { useState, useCallback } from "react";

export function useModelViewer() {
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (loaded) return;
    await import("@google/model-viewer");
    setLoaded(true);
  }, [loaded]);

  return { loaded, loadModelViewer: load };
}
