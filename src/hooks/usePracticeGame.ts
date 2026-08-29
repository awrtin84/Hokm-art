"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  chooseCardToPlay,
  chooseTrumpSuit,
  createNewMatch,
  declareTrump,
  getLegalPlaysForSeat,
  playCard,
  startNextHand,
  type Card,
  type GameState,
  type PlayerSlot,
  type Seat,
  type Trick,
} from "@/lib/hokm-engine";

const HUMAN_SEAT: Seat = "S";

const PLAYERS: PlayerSlot[] = [
  { seat: "N", kind: "bot", name: "شمال" },
  { seat: "E", kind: "bot", name: "شرق" },
  { seat: "S", kind: "human", name: "شما" },
  { seat: "W", kind: "bot", name: "غرب" },
];

const BOT_THINK_MS = 700;
// Keeps a completed trick's 4th card on screen before the engine resets to
// the next (empty) trick, which otherwise happens in the same update.
const TRICK_HOLD_MS = 1100;

export function usePracticeGame() {
  const [state, setState] = useState<GameState>(() => createNewMatch({ players: PLAYERS }));
  const [holdTrick, setHoldTrick] = useState<Trick | null>(null);

  const botTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearBotTimeout = () => {
    if (botTimeoutRef.current) {
      clearTimeout(botTimeoutRef.current);
      botTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearBotTimeout();
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    };
  }, []);

  const applyPlayResult = useCallback((fromState: GameState, seat: Seat, card: Card) => {
    const result = playCard(fromState, seat, card);

    if (!result.trickCompleted) {
      setState(result.state);
      return;
    }

    const finishedTrick = result.state.completedTricks[result.state.completedTricks.length - 1];

    setState((prev) => ({
      ...prev,
      hands: {
        ...prev.hands,
        [seat]: prev.hands[seat].filter((c) => !(c.suit === card.suit && c.rank === card.rank)),
      },
    }));
    setHoldTrick(finishedTrick);

    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    holdTimeoutRef.current = setTimeout(() => {
      setHoldTrick(null);
      setState(result.state);
    }, TRICK_HOLD_MS);
  }, []);

  useEffect(() => {
    clearBotTimeout();
    if (holdTrick) return;

    if (state.phase === "choosing_trump" && state.players[state.currentTurnSeat].kind === "bot") {
      const hakemSeat = state.hakemSeat;
      const hand = state.hands[hakemSeat];
      botTimeoutRef.current = setTimeout(() => {
        setState((prev) => {
          if (prev.phase !== "choosing_trump") return prev;
          return declareTrump(prev, hakemSeat, chooseTrumpSuit(hand));
        });
      }, BOT_THINK_MS);
    }

    if (state.phase === "playing" && state.players[state.currentTurnSeat].kind === "bot") {
      const seat = state.currentTurnSeat;
      const card = chooseCardToPlay(state, seat);
      botTimeoutRef.current = setTimeout(() => {
        applyPlayResult(state, seat, card);
      }, BOT_THINK_MS);
    }

    return clearBotTimeout;
  }, [state, holdTrick, applyPlayResult]);

  const humanDeclareTrump = useCallback(
    (suit: Parameters<typeof declareTrump>[2]) => {
      if (state.phase !== "choosing_trump" || state.hakemSeat !== HUMAN_SEAT) return;
      setState(declareTrump(state, HUMAN_SEAT, suit));
    },
    [state],
  );

  const humanPlayCard = useCallback(
    (card: Card) => {
      if (state.phase !== "playing" || state.currentTurnSeat !== HUMAN_SEAT || holdTrick) return;
      applyPlayResult(state, HUMAN_SEAT, card);
    },
    [state, holdTrick, applyPlayResult],
  );

  const continueToNextHand = useCallback(() => {
    setState((prev) => (prev.phase === "hand_complete" ? startNextHand(prev) : prev));
  }, []);

  const restartMatch = useCallback(() => {
    clearBotTimeout();
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    setHoldTrick(null);
    setState(createNewMatch({ players: PLAYERS }));
  }, []);

  const legalPlaysForHuman =
    state.phase === "playing" && !holdTrick ? getLegalPlaysForSeat(state, HUMAN_SEAT) : [];

  return {
    state,
    humanSeat: HUMAN_SEAT,
    isHumanTurn: state.currentTurnSeat === HUMAN_SEAT && !holdTrick,
    legalPlaysForHuman,
    displayTrick: holdTrick ?? state.currentTrick,
    humanDeclareTrump,
    humanPlayCard,
    continueToNextHand,
    restartMatch,
  };
}
