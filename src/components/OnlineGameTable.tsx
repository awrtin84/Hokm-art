"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { CSSProperties } from "react";
import { useIsCompact } from "@/hooks/useIsCompact";
import { useOnlineGame } from "@/hooks/useOnlineGame";
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
    ? { boxShadow: "0 0 0 2px rgba(224,189,108,0.7), 0 0 16px 2px rgba(224,189,108,0.35)" }
    : undefined;
}

const CORNER_ORNAMENTS: { style: string; flip: string }[] = [
  { style: "top-3 left-3", flip: "scale-x-1 scale-y-1" },
  { style: "top-3 right-3", flip: "-scale-x-1 scale-y-1" },
  { style: "bottom-3 left-3", flip: "scale-x-1 -scale-y-1" },
  { style: "bottom-3 right-3", flip: "-scale-x-1 -scale-y-1" },
];

const OPPONENT_SEATS: Seat[] = ["N", "E", "W"];

type OnlineGame = ReturnType<typeof useOnlineGame>;

export function OnlineGameTable({ game }: { game: OnlineGame }) {
  const { view, isYourTurn, legalPlays, declareTrump, playCard, resetRoom } = game;
  const isCompact = useIsCompact();

  if (!view || !view.yourSeat) return null;

  const humanSeat = view.yourSeat;
  const opponentSeats = OPPONENT_SEATS.filter((s) => s !== humanSeat);
  const [topSeat, rightSeat, leftSeat] = orderOpponents(humanSeat, opponentSeats);

  const opponentCardWidth = isCompact ? 34 : 44;
  const humanCardWidth = isCompact ? 54 : 76;

  const humanIsHakemChoosing = view.phase === "choosing_trump" && view.hakemSeat === humanSeat;

  return (
    <div className="relative flex flex-col flex-1 min-h-0 w-full">
      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-30 flex items-center gap-2">
        <Scoreboard handWins={view.handWins} />
        <button
          onClick={resetRoom}
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
              <path d="M1 1 C 10 1, 15 6, 15 15" fill="none" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="15" cy="15" r="1.8" fill="var(--gold)" />
            </svg>
          ))}

          <OpponentSeat
            seat={topSeat}
            view={view}
            cardWidth={opponentCardWidth}
            position="top-5 sm:top-7 left-1/2 -translate-x-1/2"
            fanClassName="h-16 rounded-xl transition-shadow relative z-10 overflow-visible"
            showPileForTeam={teamOf(topSeat)}
          />

          <OpponentSeat
            seat={rightSeat}
            view={view}
            cardWidth={opponentCardWidth}
            position="top-1/2 right-2 sm:right-3 -translate-y-1/2"
            fanClassName="h-16 rounded-xl transition-shadow"
            row
            pileSide="after"
          />

          <OpponentSeat
            seat={leftSeat}
            view={view}
            cardWidth={opponentCardWidth}
            position="top-1/2 left-2 sm:left-3 -translate-y-1/2"
            fanClassName="h-16 relative z-10 rounded-xl transition-shadow"
          />

          <AnimatePresence>
            {view.currentTrick?.plays.map(({ seat, card }) => (
              <motion.div
                key={`${seat}-${card.suit}-${card.rank}`}
                initial={{ opacity: 0, scale: 0.6, y: seat === humanSeat ? 40 : -20 }}
                animate={{
                  opacity: 1,
                  scale: view.currentTrick?.winnerSeat === seat ? 1.08 : 1,
                  y: 0,
                }}
                exit={{ opacity: 0, scale: 0.7 }}
                className={`absolute z-20 ${TRICK_SLOT_POSITION[relativeSlot(humanSeat, seat)]}`}
                style={
                  view.currentTrick?.winnerSeat === seat
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
                {view.trumpSuit ? (
                  <span
                    className="text-4xl"
                    style={{
                      color:
                        view.trumpSuit === "hearts" || view.trumpSuit === "diamonds"
                          ? "rgba(122,46,46,0.55)"
                          : "rgba(26,21,18,0.4)",
                    }}
                  >
                    {SUIT_GLYPH[view.trumpSuit]}
                  </span>
                ) : (
                  <span className="text-xs opacity-30 font-display italic">حکم</span>
                )}
              </div>
            </div>
            {view.trumpSuit && (
              <span className="mt-1 text-[0.65rem] opacity-40 tracking-wide">
                حکم: {SUIT_FA[view.trumpSuit]}
              </span>
            )}
          </div>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pb-6">
            <div className="relative z-30 mb-3">
              <PlayerProfile
                label="S"
                name={view.seats[humanSeat]?.name ?? "شما"}
                active={isYourTurn}
              />
            </div>
            <HandFan
              items={view.yourHand}
              cardWidthPx={humanCardWidth}
              maxSpreadDeg={30}
              liftPx={isCompact ? 7 : 10}
              className="h-24 sm:h-28 rounded-2xl transition-shadow"
              style={turnGlow(isYourTurn)}
              renderItem={(card, i) => {
                const isLegal = legalPlays.some((c) => c.suit === card.suit && c.rank === card.rank);
                return (
                  <PlayingCard
                    key={`${card.suit}-${card.rank}-${i}`}
                    card={card}
                    size={isCompact ? "md" : "lg"}
                    selectable={view.phase === "playing" && isYourTurn}
                    disabled={view.phase === "playing" && isYourTurn && !isLegal}
                    onClick={() => playCard(card)}
                  />
                );
              }}
            />
          </div>
        </div>
      </div>

      {humanIsHakemChoosing && <TrumpPicker hand={view.yourHand} onChoose={declareTrump} />}

      {view.phase === "hand_complete" && <RoundResultOverlay view={view} />}
      {view.phase === "match_complete" && <MatchResultOverlay view={view} onRestart={resetRoom} />}
    </div>
  );
}

function teamOf(seat: Seat): "A" | "B" {
  return seat === "N" || seat === "S" ? "A" : "B";
}

function orderOpponents(humanSeat: Seat, opponents: Seat[]): [Seat, Seat, Seat] {
  const rotation: Record<Seat, Seat[]> = {
    S: ["N", "E", "W"],
    N: ["S", "W", "E"],
    E: ["W", "S", "N"],
    W: ["E", "N", "S"],
  };
  const order = rotation[humanSeat];
  return [order[0], order[1], order[2]] as [Seat, Seat, Seat];
}

function relativeSlot(humanSeat: Seat, actualSeat: Seat): Seat {
  if (actualSeat === humanSeat) return "S";
  const [top, right, left] = orderOpponents(humanSeat, (["N", "E", "W"] as Seat[]).filter((s) => s !== humanSeat));
  if (actualSeat === top) return "N";
  if (actualSeat === right) return "E";
  if (actualSeat === left) return "W";
  return "N";
}

function OpponentSeat({
  seat,
  view,
  cardWidth,
  position,
  fanClassName,
  row = false,
  pileSide = "before",
  showPileForTeam,
}: {
  seat: Seat;
  view: NonNullable<OnlineGame["view"]>;
  cardWidth: number;
  position: string;
  fanClassName: string;
  row?: boolean;
  pileSide?: "before" | "after";
  showPileForTeam?: "A" | "B";
}) {
  const occupant = view.seats[seat];
  const count = view.handCounts[seat] ?? 0;
  const active = view.currentTurnSeat === seat && !view.holding;
  const pileTeam = showPileForTeam ?? teamOf(seat);
  const pileCount = pileTeam === "A" ? view.trickWins.A : view.trickWins.B;

  const fan = (
    <HandFan
      items={Array.from({ length: Math.min(count, 5) })}
      cardWidthPx={cardWidth}
      maxSpreadDeg={18}
      liftPx={5}
      spacingPx={cardWidth * 0.32}
      className={fanClassName}
      style={turnGlow(active)}
      renderItem={(_, i) => <PlayingCard key={i} faceDown size="sm" />}
    />
  );

  return (
    <div className={`absolute z-10 ${position} flex flex-col items-center gap-1.5`}>
      <div className="relative z-30">
        <PlayerProfile label={seat} name={occupant?.name ?? "خالی"} active={active} />
      </div>
      {view.hakemSeat === seat && (
        <div className="relative z-20">
          <HakemSeal trumpSuit={view.trumpSuit} pending={view.phase === "choosing_trump"} />
        </div>
      )}
      {row ? (
        <div className="flex items-center gap-2 relative z-10">
          {pileSide === "before" && <TrickPile count={pileCount} />}
          {fan}
          {pileSide === "after" && <TrickPile count={pileCount} />}
        </div>
      ) : (
        <>
          {fan}
          <TrickPile count={pileCount} />
        </>
      )}
    </div>
  );
}

function RoundResultOverlay({ view }: { view: NonNullable<OnlineGame["view"]> }) {
  const weWon = view.trickWins.A > view.trickWins.B;
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
        <p className="text-xs opacity-60 mb-5">راند بعد خودکار شروع میشه…</p>

        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="flex flex-col items-center gap-1">
            <TrickPile count={view.trickWins.A} />
            <span className="text-[0.65rem] opacity-60">دست‌های ما</span>
          </div>
          <div className="w-px h-10" style={{ background: "rgba(26,21,18,0.15)" }} />
          <div className="flex flex-col items-center gap-1">
            <TrickPile count={view.trickWins.B} />
            <span className="text-[0.65rem] opacity-60">دست‌های حریف</span>
          </div>
        </div>

        <p className="font-mono text-xs opacity-50">
          امتیاز راندها — ما {view.handWins.A} · حریف {view.handWins.B}
        </p>
      </motion.div>
    </motion.div>
  );
}

function MatchResultOverlay({
  view,
  onRestart,
}: {
  view: NonNullable<OnlineGame["view"]>;
  onRestart: () => void;
}) {
  const weWon = view.matchWinner === "A";
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
          راندهای نهایی — ما {view.handWins.A} — حریف {view.handWins.B}
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
