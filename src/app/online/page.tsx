"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function randomRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function OnlineEntryPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");

  return (
    <main
      className="flex-1 flex flex-col items-center justify-center gap-6 px-4"
      style={{ background: "var(--felt-dark)" }}
    >
      <h1 className="font-display text-3xl" style={{ color: "var(--gold-bright)" }}>
        بازی آنلاین
      </h1>

      <button
        onClick={() => router.push(`/online/${randomRoomCode()}`)}
        className="px-6 py-3 rounded-xl font-semibold"
        style={{ background: "var(--gold)", color: "var(--ink)" }}
      >
        ساخت اتاق جدید
      </button>

      <div className="flex items-center gap-2">
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="کد اتاق"
          className="px-4 py-2 rounded-xl text-center font-mono outline-none"
          style={{ background: "var(--sand)", color: "var(--ink)" }}
        />
        <button
          onClick={() => joinCode.trim() && router.push(`/online/${joinCode.trim()}`)}
          className="px-4 py-2 rounded-xl border font-medium"
          style={{ borderColor: "var(--gold)" }}
        >
          ورود به اتاق
        </button>
      </div>
    </main>
  );
}
