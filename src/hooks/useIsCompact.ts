"use client";

import { useEffect, useState } from "react";

export function useIsCompact(breakpointPx = 640): boolean {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpointPx}px)`);
    setIsCompact(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsCompact(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpointPx]);

  return isCompact;
}
