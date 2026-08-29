"use client";

import { motion } from "framer-motion";
import type { Card, Suit } from "@/lib/hokm-engine";
import { PlayingCard, SUIT_FA, SUIT_GLYPH } from "./PlayingCard";

const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];

interface TrumpPickerProps {
  hand: Card[];
  onChoose: (suit: Suit) => void;
}

export function TrumpPicker({ hand, onChoose }: TrumpPickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 20 }}
        className="w-full max-w-md rounded-2xl border p-6 text-center"
        style={{
          background: "var(--sand)",
          borderColor: "var(--gold)",
          color: "var(--ink)",
        }}
      >
        <h2 className="font-display text-2xl mb-1">شما حاکم شدید</h2>
        <p className="text-sm opacity-70 mb-4">یکی از خال‌ها رو به‌عنوان حکم انتخاب کن</p>

        <div className="flex justify-center gap-1 mb-6 flex-wrap">
          {hand.map((c) => (
            <PlayingCard key={`${c.suit}-${c.rank}`} card={c} size="sm" />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {SUITS.map((suit) => (
            <button
              key={suit}
              onClick={() => onChoose(suit)}
              className="flex items-center justify-center gap-2 rounded-xl py-3 font-semibold border-2 transition-colors hover:brightness-110"
              style={{
                borderColor: "var(--gold)",
                background: "var(--felt)",
                color: "var(--sand)",
              }}
            >
              <span
                className="text-xl"
                style={{
                  color:
                    suit === "hearts" || suit === "diamonds"
                      ? "var(--maroon)"
                      : "var(--sand)",
                }}
              >
                {SUIT_GLYPH[suit]}
              </span>
              {SUIT_FA[suit]}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
