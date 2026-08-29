import { RANK_VALUE } from "./deck";
import type { Card, Seat, Suit, Team, Trick } from "./types";
import { SEATS, TEAM_OF_SEAT } from "./types";

export function getTeam(seat: Seat): Team {
  return TEAM_OF_SEAT[seat];
}

export function getPartnerSeat(seat: Seat): Seat {
  const partners: Record<Seat, Seat> = { N: "S", S: "N", E: "W", W: "E" };
  return partners[seat];
}

export function getNextSeat(seat: Seat): Seat {
  const idx = SEATS.indexOf(seat);
  return SEATS[(idx + 1) % SEATS.length];
}

export function cardsEqual(a: Card, b: Card): boolean {
  return a.suit === b.suit && a.rank === b.rank;
}

// Must follow the led suit if you hold it; otherwise any card is legal.
export function getLegalPlays(hand: Card[], leadSuit: Suit | null): Card[] {
  if (leadSuit === null) return hand;
  const followSuitCards = hand.filter((c) => c.suit === leadSuit);
  return followSuitCards.length > 0 ? followSuitCards : hand;
}

export function isValidPlay(hand: Card[], card: Card, leadSuit: Suit | null): boolean {
  const legal = getLegalPlays(hand, leadSuit);
  return legal.some((c) => cardsEqual(c, card));
}

// Highest trump wins; if no trump was played, highest card of the led suit wins.
export function determineTrickWinner(trick: Trick, trumpSuit: Suit): Seat {
  const leadSuit = trick.plays[0]?.card.suit;
  if (!leadSuit) {
    throw new Error("Cannot determine winner of an empty trick");
  }

  const trumpPlays = trick.plays.filter((p) => p.card.suit === trumpSuit);
  const contenders = trumpPlays.length > 0
    ? trumpPlays
    : trick.plays.filter((p) => p.card.suit === leadSuit);

  let best = contenders[0];
  for (const play of contenders) {
    if (RANK_VALUE[play.card.rank] > RANK_VALUE[best.card.rank]) {
      best = play;
    }
  }
  return best.seat;
}

export function sortHand(hand: Card[]): Card[] {
  const suitOrder: Record<Suit, number> = { spades: 0, hearts: 1, clubs: 2, diamonds: 3 };
  return [...hand].sort((a, b) => {
    if (a.suit !== b.suit) return suitOrder[a.suit] - suitOrder[b.suit];
    return RANK_VALUE[a.rank] - RANK_VALUE[b.rank];
  });
}
