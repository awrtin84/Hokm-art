"use client";

export function Scoreboard({ handWins }: { handWins: { A: number; B: number } }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-2 border"
      style={{ borderColor: "rgba(201,162,75,0.35)", background: "rgba(0,0,0,0.2)" }}
    >
      <RoundCell label="راند ما" value={handWins.A} />
      <div className="w-px h-7" style={{ background: "rgba(201,162,75,0.3)" }} />
      <RoundCell label="راند حریف" value={handWins.B} />
    </div>
  );
}

function RoundCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center leading-tight">
      <span className="font-mono text-xl font-bold" style={{ color: "var(--gold-bright)" }}>
        {value}
      </span>
      <span className="text-[0.65rem] opacity-60">{label}</span>
    </div>
  );
}
