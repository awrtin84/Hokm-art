"use client";

import { motion } from "framer-motion";
import type { Suit } from "@/lib/hokm-engine";
import { SUIT_GLYPH } from "./PlayingCard";

interface HakemSealProps {
  trumpSuit: Suit | null;
  pending?: boolean;
  size?: "inline" | "lg";
}

export function HakemSeal({ trumpSuit, pending = false, size = "inline" }: HakemSealProps) {
  const px = size === "inline" ? 30 : 56;
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="relative flex items-center justify-center rounded-full shrink-0"
      style={{
        width: px,
        height: px,
        background:
          "radial-gradient(circle at 35% 30%, var(--gold-bright), var(--gold) 60%, #8a6b2c 100%)",
        boxShadow:
          "0 2px 6px rgba(0,0,0,0.5), 0 0 0 1.5px rgba(26,21,18,0.6), inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.3)",
      }}
      aria-label={trumpSuit ? `حاکم — حکم: ${trumpSuit}` : "حاکم — در انتظار انتخاب حکم"}
    >
      <div
        className="absolute rounded-full border border-dashed"
        style={{ inset: size === "inline" ? 2 : 3, borderColor: "rgba(26,21,18,0.4)" }}
      />
      {trumpSuit ? (
        <span
          className="font-display font-bold"
          style={{ color: "var(--ink)", fontSize: size === "inline" ? "1rem" : "1.5rem" }}
        >
          {SUIT_GLYPH[trumpSuit]}
        </span>
      ) : (
        <motion.span
          animate={pending ? { opacity: [0.5, 1, 0.5] } : undefined}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="font-display italic font-semibold"
          style={{ color: "var(--ink)", fontSize: size === "inline" ? "0.55rem" : "0.65rem" }}
        >
          حکم؟
        </motion.span>
      )}
    </motion.div>
  );
}
