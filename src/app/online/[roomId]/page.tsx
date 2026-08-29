"use client";

import { use, useEffect, useState } from "react";
import { OnlineGameTable } from "@/components/OnlineGameTable";
import { RoomLobby } from "@/components/RoomLobby";
import { useOnlineGame } from "@/hooks/useOnlineGame";

const NAME_KEY = "hokm-player-name";

export default function OnlineRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const [name, setName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(NAME_KEY);
    if (stored) setName(stored);
  }, []);

  if (name === null) {
    return (
      <main
        className="flex-1 flex flex-col items-center justify-center gap-4 px-4"
        style={{ background: "var(--felt-dark)" }}
      >
        <h1 className="font-display text-2xl" style={{ color: "var(--gold-bright)" }}>
          اسمت چیه؟
        </h1>
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            const finalName = nameInput.trim() || "بازیکن";
            localStorage.setItem(NAME_KEY, finalName);
            setName(finalName);
          }}
          placeholder="مثلاً آرتین"
          className="px-4 py-2 rounded-xl text-center outline-none"
          style={{ background: "var(--sand)", color: "var(--ink)" }}
        />
        <button
          onClick={() => {
            const finalName = nameInput.trim() || "بازیکن";
            localStorage.setItem(NAME_KEY, finalName);
            setName(finalName);
          }}
          className="px-6 py-2 rounded-xl font-semibold"
          style={{ background: "var(--gold)", color: "var(--ink)" }}
        >
          ورود به اتاق
        </button>
      </main>
    );
  }

  return <RoomContent roomId={roomId} name={name} />;
}

function RoomContent({ roomId, name }: { roomId: string; name: string }) {
  const game = useOnlineGame(roomId, name);

  return (
    <main className="flex-1 flex flex-col" style={{ background: "var(--felt-dark)" }}>
      {!game.view && (
        <div className="flex-1 flex items-center justify-center">
          <p className="opacity-60 text-sm">
            {game.connected ? "در حال دریافت اطلاعات اتاق…" : "در حال اتصال به اتاق…"}
          </p>
        </div>
      )}
      {game.view &&
        (game.view.hasGame ? (
          <OnlineGameTable game={game} />
        ) : (
          <RoomLobby roomId={roomId} game={game} />
        ))}
    </main>
  );
}
