import type { Card, Rank, Seat, Suit } from "./types";
import { SEATS } from "./types";

export const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];

export const RANKS: Rank[] = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

export const RANK_VALUE: Record<Rank, number> = RANKS.reduce(
  (acc, rank, index) => {
    acc[rank] = index + 2;
    return acc;
  },
  {} as Record<Rank, number>,
);

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[], rng: () => number = Math.random): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealHand(
  hakemSeat: Seat,
  rng: () => number = Math.random,
): {
  initialHakemCards: Card[];
  restBySeat: Record<Seat, Card[]>;
} {
  const deck = shuffleDeck(createDeck(), rng);

  const initialHakemCards = deck.slice(0, 5);
  let cursor = 5;

  const restBySeat = {} as Record<Seat, Card[]>;
  for (const seat of SEATS) {
    const count = seat === hakemSeat ? 8 : 13;
    restBySeat[seat] = deck.slice(cursor, cursor + count);
    cursor += count;
  }

  return { initialHakemCards, restBySeat };
}
