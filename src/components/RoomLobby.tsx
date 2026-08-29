"use client";

import { useState } from "react";
import { useOnlineGame } from "@/hooks/useOnlineGame";
import type { Seat } from "@/lib/hokm-engine";

const SEATS: Seat[] = ["N", "E", "S", "W"];
const SEAT_LABEL_FA: Record<Seat, string> = { N: "شمال", E: "شرق", S: "جنوب", W: "غرب" };

export function RoomLobby({
  roomId,
  game,
}: {
  roomId: string;
  game: ReturnType<typeof useOnlineGame>;
}) {
  const { view, claimSeat, startWithBots, error } = game;
  const [copied, setCopied] = useState(false);

  if (!view) return null;

  const youHaveSeat = view.yourSeat !== null;

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="font-display text-2xl mb-1" style={{ color: "var(--gold-bright)" }}>
          اتاق {roomId}
        </h1>
        <button onClick={copyLink} className="text-xs opacity-70 hover:opacity-100 underline">
          {copied ? "کپی شد!" : "کپی لینک دعوت"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {SEATS.map((seat) => {
          const occ = view.seats[seat];
          const isYou = occ?.kind === "human" && view.yourSeat === seat;
          return (
            <div
              key={seat}
              className="rounded-xl border p-3 flex flex-col items-center gap-2"
              style={{
                borderColor: isYou ? "var(--gold-bright)" : "rgba(201,162,75,0.35)",
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <span className="text-xs opacity-60">{SEAT_LABEL_FA[seat]}</span>
              {occ ? (
                <span
                  className="text-sm font-medium"
                  style={{ color: isYou ? "var(--gold-bright)" : "var(--sand)" }}
                >
                  {occ.name}
                  {isYou ? " (خودت)" : ""}
                </span>
              ) : youHaveSeat ? (
                <span className="text-sm opacity-40">خالی</span>
              ) : (
                <button
                  onClick={() => claimSeat(seat)}
                  className="text-xs px-3 py-1 rounded-lg font-semibold"
                  style={{ background: "var(--gold)", color: "var(--ink)" }}
                >
                  بشین اینجا
                </button>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-sm" style={{ color: "var(--maroon)" }}>
          {error}
        </p>
      )}

      {youHaveSeat && (
        <button
          onClick={startWithBots}
          className="px-6 py-2.5 rounded-xl font-semibold"
          style={{ background: "var(--gold)", color: "var(--ink)" }}
        >
          شروع بازی — صندلی‌های خالی با بات پر میشن
        </button>
      )}

      {!youHaveSeat && (
        <p className="text-xs opacity-50">اول یه صندلی انتخاب کن</p>
      )}
    </div>
  );
}
