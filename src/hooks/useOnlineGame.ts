"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getLegalPlays, sortHand, type Card, type Seat, type Suit } from "@/lib/hokm-engine";
import type { ClientMessage, ClientView, ServerMessage } from "@/lib/hokm-online/protocol";

const PLAYER_ID_KEY = "hokm-player-id";

function getPlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

function buildWsUrl(roomId: string, playerId: string, name: string): string {
  const base = process.env.NEXT_PUBLIC_HOKM_ROOM_WS_URL ?? "ws://localhost:8787";
  const url = new URL(`${base}/room/${roomId}`);
  url.searchParams.set("playerId", playerId);
  url.searchParams.set("name", name);
  return url.toString();
}

export function useOnlineGame(roomId: string, name: string) {
  const [view, setView] = useState<ClientView | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    const playerId = getPlayerId();

    function connect() {
      if (cancelled) return;
      const socket = new WebSocket(buildWsUrl(roomId, playerId, name));
      wsRef.current = socket;

      socket.onopen = () => setConnected(true);

      socket.onclose = () => {
        setConnected(false);
        if (!cancelled) reconnectTimer = setTimeout(connect, 1500);
      };

      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data as string) as ServerMessage;
        if (msg.type === "view") {
          setView(msg.view);
          setError(null);
        } else if (msg.type === "error") {
          setError(msg.message);
        }
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [roomId, name]);

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const claimSeat = useCallback((seat: Seat) => send({ type: "claimSeat", seat, name }), [send, name]);
  const startWithBots = useCallback(() => send({ type: "startWithBots" }), [send]);
  const declareTrump = useCallback((suit: Suit) => send({ type: "declareTrump", suit }), [send]);
  const playCard = useCallback((card: Card) => send({ type: "playCard", card }), [send]);
  const resetRoom = useCallback(() => send({ type: "resetRoom" }), [send]);

  const isYourTurn = !!view && !view.holding && view.yourSeat === view.currentTurnSeat;

  const legalPlays =
    view && view.phase === "playing" && !view.holding
      ? getLegalPlays(sortHand(view.yourHand), view.currentTrick?.plays[0]?.card.suit ?? null)
      : [];

  return {
    view,
    connected,
    error,
    isYourTurn,
    legalPlays,
    claimSeat,
    startWithBots,
    declareTrump,
    playCard,
    resetRoom,
  };
}
