"use client";

export function PlayerProfile({
  label,
  name,
  active,
}: {
  label: string;
  name: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="flex items-center justify-center rounded-full font-bold text-xs shrink-0 transition-all"
        style={{
          width: 26,
          height: 26,
          background: active
            ? "radial-gradient(circle at 35% 30%, var(--gold-bright), var(--gold) 70%)"
            : "rgba(0,0,0,0.25)",
          border: `1.5px solid ${active ? "var(--gold-bright)" : "rgba(201,162,75,0.4)"}`,
          color: active ? "var(--ink)" : "var(--sand)",
          boxShadow: active ? "0 0 10px 2px rgba(224,189,108,0.55)" : undefined,
        }}
      >
        {label}
      </div>
      <span
        className="text-xs font-medium transition-colors"
        style={{
          color: active ? "var(--gold-bright)" : "var(--sand)",
          opacity: active ? 1 : 0.75,
        }}
      >
        {name}
      </span>
    </div>
  );
}
