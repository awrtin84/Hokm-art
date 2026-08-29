"use client";

export function TrickPile({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <div
      className="relative flex items-center justify-center shrink-0 rounded-[5px]"
      style={{
        width: 28,
        height: 38,
        background: "linear-gradient(155deg, #2f6350 0%, #1a4033 60%, #102319 100%)",
        opacity: 0.92,
        boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(201,162,75,0.55)",
      }}
    >
      <span className="font-mono font-bold text-xs" style={{ color: "var(--gold-bright)" }}>
        {count}
      </span>
    </div>
  );
}
