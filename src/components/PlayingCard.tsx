"use client";

import { motion } from "framer-motion";
import type { Card, Suit } from "@/lib/hokm-engine";

const SUIT_GLYPH: Record<Suit, string> = {
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
};

const SUIT_COLOR: Record<Suit, string> = {
  spades: "var(--ink)",
  clubs: "var(--ink)",
  hearts: "var(--maroon)",
  diamonds: "var(--maroon)",
};

const SUIT_FA: Record<Suit, string> = {
  spades: "پیک",
  hearts: "دل",
  diamonds: "خشت",
  clubs: "گشنیز",
};

interface PlayingCardProps {
  card?: Card;
  faceDown?: boolean;
  size?: "sm" | "md" | "lg";
  selectable?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<PlayingCardProps["size"]>, string> = {
  sm: "w-11 h-16 rounded-lg",
  md: "w-16 h-[5.75rem] rounded-xl",
  lg: "w-[4.75rem] h-[6.75rem] rounded-2xl",
};

const CENTER_SUIT_SIZE: Record<NonNullable<PlayingCardProps["size"]>, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
};

const CORNER_RANK_SIZE: Record<NonNullable<PlayingCardProps["size"]>, string> = {
  sm: "text-[0.55rem]",
  md: "text-[0.7rem]",
  lg: "text-[0.85rem]",
};

const CORNER_SUIT_SIZE: Record<NonNullable<PlayingCardProps["size"]>, string> = {
  sm: "text-[0.5rem]",
  md: "text-[0.62rem]",
  lg: "text-[0.75rem]",
};

const CORNER_OFFSET: Record<NonNullable<PlayingCardProps["size"]>, string> = {
  sm: "top-0.5 left-1",
  md: "top-1 left-1.5",
  lg: "top-1 left-2",
};

const CORNER_OFFSET_MIRROR: Record<NonNullable<PlayingCardProps["size"]>, string> = {
  sm: "bottom-0.5 right-1",
  md: "bottom-1 right-1.5",
  lg: "bottom-1 right-2",
};

const RANK_LABEL: Record<string, string> = {
  J: "J",
  Q: "Q",
  K: "K",
  A: "A",
};

export function PlayingCard({
  card,
  faceDown = false,
  size = "md",
  selectable = false,
  disabled = false,
  onClick,
  className = "",
}: PlayingCardProps) {
  const sizeClass = SIZE_CLASSES[size];

  if (faceDown || !card) {
    return (
      <div
        className={`${sizeClass} ${className} relative shrink-0 overflow-hidden`}
        style={{
          boxShadow: "0 2px 6px rgba(0,0,0,0.45)",
        }}
        aria-hidden
      >
        <svg viewBox="0 0 100 140" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <radialGradient id="cardBackBg" cx="50%" cy="38%" r="75%">
              <stop offset="0%" stopColor="#2c5c48" />
              <stop offset="55%" stopColor="#163629" />
              <stop offset="100%" stopColor="#0c1e17" />
            </radialGradient>
          </defs>
          <rect width="100" height="140" fill="url(#cardBackBg)" />

          <rect x="5" y="5" width="90" height="130" rx="8" fill="none" stroke="#c9a24b" strokeWidth="1.4" />
          <rect
            x="9"
            y="9"
            width="82"
            height="122"
            rx="5"
            fill="none"
            stroke="#c9a24b"
            strokeOpacity="0.55"
            strokeWidth="0.8"
          />

          {[
            { x: 9, y: 9, sx: 1, sy: 1 },
            { x: 91, y: 9, sx: -1, sy: 1 },
            { x: 9, y: 131, sx: 1, sy: -1 },
            { x: 91, y: 131, sx: -1, sy: -1 },
          ].map((c, i) => (
            <g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.sx} ${c.sy})`}>
              <path
                d="M0 0 C 8 0, 12 4, 12 12"
                fill="none"
                stroke="#c9a24b"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.85"
              />
              <circle cx="12" cy="12" r="1.4" fill="#c9a24b" opacity="0.85" />
            </g>
          ))}

          <g transform="translate(50 70)">
            <circle r="24" fill="none" stroke="#c9a24b" strokeOpacity="0.4" strokeWidth="0.7" />
            {Array.from({ length: 8 }).map((_, i) => (
              <ellipse
                key={i}
                cx="0"
                cy="-13"
                rx="4.4"
                ry="13"
                fill="#c9a24b"
                opacity="0.32"
                transform={`rotate(${i * 45})`}
              />
            ))}
            <circle r="9" fill="#1a382c" stroke="#c9a24b" strokeWidth="1" />
            <text
              y="3.2"
              textAnchor="middle"
              fontSize="9"
              fill="#e0bd6c"
              fontFamily="Fraunces, serif"
              fontStyle="italic"
            >
              ح
            </text>
          </g>
        </svg>
      </div>
    );
  }

  const rankLabel = RANK_LABEL[card.rank] ?? card.rank;
  const color = SUIT_COLOR[card.suit];

  return (
    <motion.button
      type="button"
      onClick={selectable && !disabled ? onClick : undefined}
      whileHover={selectable && !disabled ? { y: -14 } : undefined}
      whileTap={selectable && !disabled ? { scale: 0.96 } : undefined}
      className={`${sizeClass} ${className} relative shrink-0 flex items-center justify-center transition-shadow ${
        selectable && !disabled
          ? "cursor-pointer hover:shadow-lg hover:shadow-gold/25"
          : "cursor-default"
      } ${disabled ? "opacity-40 saturate-50" : ""}`}
      style={{
        background: "linear-gradient(160deg, #fffcf5 0%, var(--card-face) 55%, #efe6d2 100%)",
        boxShadow:
          "0 2px 5px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(26,21,18,0.5), inset 0 0 0 3px var(--card-face), inset 0 0 0 4px rgba(201,162,75,0.55)",
      }}
      disabled={disabled}
      aria-label={`${rankLabel} ${SUIT_FA[card.suit]}`}
    >
      {/* physical left/right, not RTL-logical, so corners never flip */}
      <div
        className={`absolute ${CORNER_OFFSET[size]} flex flex-col items-center leading-none gap-0.5 select-none`}
        style={{ color }}
      >
        <span className={`font-mono font-bold ${CORNER_RANK_SIZE[size]}`}>{rankLabel}</span>
        <span className={CORNER_SUIT_SIZE[size]}>{SUIT_GLYPH[card.suit]}</span>
      </div>

      <span
        className={`${CENTER_SUIT_SIZE[size]} leading-none`}
        style={{ color, filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.15))" }}
      >
        {SUIT_GLYPH[card.suit]}
      </span>

      <div
        className={`absolute ${CORNER_OFFSET_MIRROR[size]} rotate-180 flex flex-col items-center leading-none gap-0.5 select-none`}
        style={{ color }}
      >
        <span className={`font-mono font-bold ${CORNER_RANK_SIZE[size]}`}>{rankLabel}</span>
        <span className={CORNER_SUIT_SIZE[size]}>{SUIT_GLYPH[card.suit]}</span>
      </div>
    </motion.button>
  );
}

export function SuitBadge({ suit, size = "md" }: { suit: Suit; size?: "sm" | "md" }) {
  const px = size === "sm" ? "text-sm" : "text-lg";
  return (
    <span
      className={`inline-flex items-center gap-1 ${px} font-semibold`}
      style={{ color: SUIT_COLOR[suit] === "var(--ink)" ? "var(--sand)" : "var(--gold-bright)" }}
    >
      <span style={{ color: SUIT_COLOR[suit] }}>{SUIT_GLYPH[suit]}</span>
      {SUIT_FA[suit]}
    </span>
  );
}

export { SUIT_FA, SUIT_GLYPH };
