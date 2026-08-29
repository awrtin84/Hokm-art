"use client";

import dynamic from "next/dynamic";

// The game's initial state involves shuffling (Math.random), so it must
// never be rendered on the server — SSR and client hydration would produce
// two different shuffles and React would throw a hydration mismatch.
const GameTable = dynamic(
  () => import("@/components/GameTable").then((mod) => mod.GameTable),
  { ssr: false },
);

export default function PlayPage() {
  return (
    <main
      className="flex-1 flex flex-col min-h-0"
      style={{ background: "var(--felt-dark)" }}
    >
      <GameTable />
    </main>
  );
}
