"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { CSSProperties } from "react";
import { usePracticeGame } from "@/hooks/usePracticeGame";
import { useIsCompact } from "@/hooks/useIsCompact";
import type { Seat } from "@/lib/hokm-engine";
import { HakemSeal } from "./HakemSeal";
import { HandFan } from "./HandFan";
import { PlayerProfile } from "./PlayerProfile";
import { PlayingCard, SUIT_FA, SUIT_GLYPH } from "./PlayingCard";
import { Scoreboard } from "./Scoreboard";
import { TrickPile } from "./TrickPile";
import { TrumpPicker } from "./TrumpPicker";

const TRICK_SLOT_POSITION: Record<Seat, string> = {
  N: "top-[20%] left-1/2 -translate-x-1/2",
  E: "top-1/2 right-[26%] -translate-y-1/2",
  W: "top-1/2 left-[26%] -translate-y-1/2",
  S: "bottom-[24%] left-1/2 -translate-x-1/2",
};

function turnGlow(isActive: boolean): CSSProperties | undefined {
  return isActive
    ? {
        boxShadow: "0 0 0 2px rgba(224,189,108,0.7), 0 0 16px 2px rgba(224,189,108,0.35)",
      }
    : undefined;
}

const CORNER_ORNAMENTS: { style: string; flip: string }[] = [
  { style: "top-3 left-3", flip: "scale-x-1 scale-y-1" },
  { style: "top-3 right-3", flip: "-scale-x-1 scale-y-1" },
  { style: "bottom-3 left-3", flip: "scale-x-1 -scale-y-1" },
  { style: "bottom-3 right-3", flip: "-scale-x-1 -scale-y-1" },
];

export function GameTable() {
  const {
    state,
    humanSeat,
    isHumanTurn,
    legalPlaysForHuman,
    displayTrick,
    humanDeclareTrump,
    humanPlayCard,
    continueToNextHand,
    restartMatch,
  } = usePracticeGame();
  const isCompact = useIsCompact();

  const humanIsHakemChoosing =
    state.phase === "choosing_trump" && state.hakemSeat === humanSeat;

  const opponentCardWidth = isCompact ? 34 : 44;
  const humanCardWidth = isCompact ? 54 : 76;

  return (
    <div className="relative flex flex-col flex-1 min-h-0 w-full">
      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-30 flex items-center gap-2">
        <Scoreboard handWins={state.handWins} />
        <button
          onClick={restartMatch}
          className="text-[0.65rem] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border opacity-80 hover:opacity-100 transition-opacity"
          style={{ borderColor: "rgba(201,162,75,0.4)", background: "rgba(0,0,0,0.25)" }}
        >
          بازی جدید
        </button>
      </div>

      <div className="relative flex-1 min-h-0 mx-2 sm:mx-3 mb-2 sm:mb-3 mt-2 sm:mt-3 rounded-[1.5rem] sm:rounded-[2.25rem] p-1.5 sm:p-2.5 wood-bezel">
        <div className="relative w-full h-full rounded-[1.65rem] felt-surface overflow-hidden">
          <div className="absolute inset-3 rounded-[1.1rem] border border-gold/15 pointer-events-none z-0" />

          {CORNER_ORNAMENTS.map((c, i) => (
            <svg
              key={i}
              viewBox="0 0 24 24"
              className={`absolute ${c.style} w-7 h-7 ${c.flip} opacity-70 pointer-events-none z-10`}
            >
              <path
                d="M1 1 C 10 1, 15 6, 15 15"
                fill="none"
                stroke="var(--gold)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <circle cx="15" cy="15" r="1.8" fill="var(--gold)" />
            </svg>
          ))}

          <div className="absolute z-10 top-5 sm:top-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <div className="relative z-30">
              <PlayerProfile label="N" name={state.players.N.name} active={state.currentTurnSeat === "N"} />
            </div>
            {state.hakemSeat === "N" && (
              <div className="relative z-20">
                <HakemSeal trumpSuit={state.trumpSuit} pending={state.phase === "choosing_trump"} />
              </div>
            )}
            <HandFan
              items={state.hands.N.slice(0, 5)}
              cardWidthPx={opponentCardWidth}
              maxSpreadDeg={18}
              liftPx={5}
              spacingPx={opponentCardWidth * 0.32}
              className="h-16 rounded-xl transition-shadow relative z-10 overflow-visible"
              style={turnGlow(state.currentTurnSeat === "N")}
              renderItem={(_, i) => <PlayingCard key={i} faceDown size="sm" />}
            />
            <TrickPile count={state.trickWins.A} />
          </div>

          <div className="absolute z-10 top-1/2 right-2 sm:right-3 -translate-y-1/2 flex flex-col items-center gap-1.5">
            <div className="relative z-30">
              <PlayerProfile label="E" name={state.players.E.name} active={state.currentTurnSeat === "E"} />
            </div>
            {state.hakemSeat === "E" && (
              <div className="relative z-20">
                <HakemSeal trumpSuit={state.trumpSuit} pending={state.phase === "choosing_trump"} />
              </div>
            )}
            <div className="flex items-center gap-2 relative z-10">
              <HandFan
                items={state.hands.E.slice(0, 5)}
                cardWidthPx={opponentCardWidth}
                maxSpreadDeg={18}
                liftPx={5}
                spacingPx={opponentCardWidth * 0.32}
                className="h-16 rounded-xl transition-shadow"
                style={turnGlow(state.currentTurnSeat === "E")}
                renderItem={(_, i) => <PlayingCard key={i} faceDown size="sm" />}
              />
              <TrickPile count={state.trickWins.B} />
            </div>
          </div>

          <div className="absolute z-10 top-1/2 left-2 sm:left-3 -translate-y-1/2 flex flex-col items-center gap-1.5">
            <div className="relative z-30">
              <PlayerProfile label="W" name={state.players.W.name} active={state.currentTurnSeat === "W"} />
            </div>
            {state.hakemSeat === "W" && (
              <div className="relative z-20">
                <HakemSeal trumpSuit={state.trumpSuit} pending={state.phase === "choosing_trump"} />
              </div>
            )}
            <HandFan
              items={state.hands.W.slice(0, 5)}
              cardWidthPx={opponentCardWidth}
              maxSpreadDeg={18}
              liftPx={5}
              spacingPx={opponentCardWidth * 0.32}
              className="h-16 relative z-10 rounded-xl transition-shadow"
              style={turnGlow(state.currentTurnSeat === "W")}
              renderItem={(_, i) => <PlayingCard key={i} faceDown size="sm" />}
            />
          </div>

          <AnimatePresence>
            {displayTrick?.plays.map(({ seat, card }) => (
              <motion.div
                key={`${seat}-${card.suit}-${card.rank}`}
                initial={{ opacity: 0, scale: 0.6, y: seat === "S" ? 40 : -20 }}
                animate={{
                  opacity: 1,
                  scale: displayTrick.winnerSeat === seat ? 1.08 : 1,
                  y: 0,
                }}
                exit={{ opacity: 0, scale: 0.7 }}
                className={`absolute z-20 ${TRICK_SLOT_POSITION[seat]}`}
                style={
                  displayTrick.winnerSeat === seat
                    ? { filter: "drop-shadow(0 0 10px rgba(224,189,108,0.85))" }
                    : undefined
                }
              >
                <PlayingCard card={card} size="md" />
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none flex flex-col items-center">
            <div
              className="rounded-full flex items-center justify-center relative"
              style={{ width: "6.5rem", height: "6.5rem", border: "1.5px solid rgba(201,162,75,0.3)" }}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 2,
                    height: i % 3 === 0 ? 7 : 3,
                    background: "rgba(201,162,75,0.35)",
                    top: 2,
                    left: "50%",
                    transformOrigin: "50% 3.1rem",
                    transform: `translateX(-50%) rotate(${i * 30}deg)`,
                  }}
                />
              ))}
              <div
                className="rounded-full flex items-center justify-center"
                style={{ width: "4.4rem", height: "4.4rem", border: "1px dashed rgba(201,162,75,0.25)" }}
              >
                {state.trumpSuit ? (
                  <span
                    className="text-4xl"
                    style={{
                      color:
                        state.trumpSuit === "hearts" || state.trumpSuit === "diamonds"
                          ? "rgba(122,46,46,0.55)"
                          : "rgba(26,21,18,0.4)",
                    }}
                  >
                    {SUIT_GLYPH[state.trumpSuit]}
                  </span>
                ) : (
                  <span className="text-xs opacity-30 font-display italic">حکم</span>
                )}
              </div>
            </div>
            {state.trumpSuit && (
              <span className="mt-1 text-[0.65rem] opacity-40 tracking-wide">
                حکم: {SUIT_FA[state.trumpSuit]}
              </span>
            )}
          </div>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pb-6">
            <div className="relative z-30 mb-3">
              <PlayerProfile
                label="S"
                name={state.players[humanSeat].name}
                active={isHumanTurn}
              />
            </div>
            <HandFan
              items={state.hands[humanSeat]}
              cardWidthPx={humanCardWidth}
              maxSpreadDeg={30}
              liftPx={isCompact ? 7 : 10}
              className="h-24 sm:h-28 rounded-2xl transition-shadow"
              style={turnGlow(isHumanTurn)}
              renderItem={(card, i) => {
                const isLegal = legalPlaysForHuman.some(
                  (c) => c.suit === card.suit && c.rank === card.rank,
                );
                return (
                  <PlayingCard
                    key={`${card.suit}-${card.rank}-${i}`}
                    card={card}
                    size={isCompact ? "md" : "lg"}
                    selectable={state.phase === "playing" && isHumanTurn}
                    disabled={state.phase === "playing" && isHumanTurn && !isLegal}
                    onClick={() => humanPlayCard(card)}
                  />
                );
              }}
            />
          </div>
        </div>
      </div>

      {humanIsHakemChoosing && (
        <TrumpPicker hand={state.hands[humanSeat]} onChoose={humanDeclareTrump} />
      )}

      {state.phase === "hand_complete" && (
        <RoundResultOverlay state={state} onContinue={continueToNextHand} />
      )}

      {state.phase === "match_complete" && (
        <MatchResultOverlay state={state} onRestart={restartMatch} />
      )}
    </div>
  );
}

function RoundResultOverlay({
  state,
  onContinue,
}: {
  state: ReturnType<typeof usePracticeGame>["state"];
  onContinue: () => void;
}) {
  const weWon = state.trickWins.A > state.trickWins.B;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="text-center rounded-2xl border p-7 max-w-sm w-full"
        style={{ background: "var(--sand)", borderColor: "var(--gold)", color: "var(--ink)" }}
      >
        <span className="text-3xl mb-1 block">{weWon ? "🏅" : "🤝"}</span>
        <h2 className="font-display text-2xl mb-1">
          {weWon ? "این راند مال ما بود!" : "این راند رو حریف برد"}
        </h2>
        <p className="text-xs opacity-60 mb-5">
          {weWon
            ? "دست خوبی زدید — راند بعد رو هم ببریم؟"
            : "اشکالی نداره، راند بعد جبران می‌کنیم"}
        </p>

        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="flex flex-col items-center gap-1">
            <TrickPile count={state.trickWins.A} />
            <span className="text-[0.65rem] opacity-60">دست‌های ما</span>
          </div>
          <div className="w-px h-10" style={{ background: "rgba(26,21,18,0.15)" }} />
          <div className="flex flex-col items-center gap-1">
            <TrickPile count={state.trickWins.B} />
            <span className="text-[0.65rem] opacity-60">دست‌های حریف</span>
          </div>
        </div>

        <p className="font-mono text-xs opacity-50 mb-5">
          امتیاز راندها — ما {state.handWins.A} · حریف {state.handWins.B}
        </p>

        <button
          onClick={onContinue}
          className="px-6 py-2.5 rounded-xl font-semibold w-full"
          style={{ background: "var(--felt)", color: "var(--sand)" }}
        >
          شروع راند بعد
        </button>
      </motion.div>
    </motion.div>
  );
}

function MatchResultOverlay({
  state,
  onRestart,
}: {
  state: ReturnType<typeof usePracticeGame>["state"];
  onRestart: () => void;
}) {
  const weWon = state.matchWinner === "A";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="text-center rounded-2xl border p-8 max-w-sm w-full"
        style={{ background: "var(--sand)", borderColor: "var(--gold)", color: "var(--ink)" }}
      >
        <span className="text-4xl mb-2 block">{weWon ? "🏆" : "😔"}</span>
        <h2 className="font-display text-2xl mb-2">
          {weWon ? "بازی رو بردید!" : "این بازی رو باختید"}
        </h2>
        <p className="font-mono text-sm opacity-60 mb-6">
          راندهای نهایی — ما {state.handWins.A} — حریف {state.handWins.B}
        </p>
        <button
          onClick={onRestart}
          className="px-6 py-2.5 rounded-xl font-semibold w-full"
          style={{ background: "var(--felt)", color: "var(--sand)" }}
        >
          بازی دوباره
        </button>
      </motion.div>
    </motion.div>
  );
}
