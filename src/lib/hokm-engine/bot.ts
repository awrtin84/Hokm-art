import { RANK_VALUE, SUITS } from "./deck";
import { getLegalPlaysForSeat } from "./engine";
import { getPartnerSeat, getTeam } from "./rules";
import type { Card, GameState, Seat, Suit } from "./types";

export function chooseTrumpSuit(hand: Card[]): Suit {
  const scoreBySuit: Record<Suit, number> = {
    hearts: 0,
    diamonds: 0,
    clubs: 0,
    spades: 0,
  };

  for (const card of hand) {
    const rankValue = RANK_VALUE[card.rank];
    const points = rankValue >= 11 ? (rankValue - 10) * 3 : 1;
    scoreBySuit[card.suit] += points;
  }

  let bestSuit: Suit = SUITS[0];
  for (const suit of SUITS) {
    if (scoreBySuit[suit] > scoreBySuit[bestSuit]) {
      bestSuit = suit;
    }
  }
  return bestSuit;
}

function highestPlay(plays: { seat: Seat; card: Card }[], trumpSuit: Suit, leadSuit: Suit) {
  const trumpPlays = plays.filter((p) => p.card.suit === trumpSuit);
  const contenders = trumpPlays.length > 0 ? trumpPlays : plays.filter((p) => p.card.suit === leadSuit);
  return contenders.reduce((best, p) =>
    RANK_VALUE[p.card.rank] > RANK_VALUE[best.card.rank] ? p : best,
  );
}

// Leading: play from the longest/strongest non-trump suit. Following: play
// low if the partner is winning, cheapest winner if an opponent is winning,
// otherwise discard the lowest off-suit card.
export function chooseCardToPlay(state: GameState, seat: Seat): Card {
  const legal = getLegalPlaysForSeat(state, seat);
  if (legal.length === 1) return legal[0];

  const trumpSuit = state.trumpSuit as Suit;
  const trick = state.currentTrick;
  const isLeading = !trick || trick.plays.length === 0;

  const byLowest = (cards: Card[]) =>
    [...cards].sort((a, b) => RANK_VALUE[a.rank] - RANK_VALUE[b.rank])[0];
  const byHighest = (cards: Card[]) =>
    [...cards].sort((a, b) => RANK_VALUE[b.rank] - RANK_VALUE[a.rank])[0];

  if (isLeading) {
    const nonTrump = legal.filter((c) => c.suit !== trumpSuit);
    const pool = nonTrump.length > 0 ? nonTrump : legal;

    const bySuitCount: Partial<Record<Suit, Card[]>> = {};
    for (const card of pool) {
      (bySuitCount[card.suit] ??= []).push(card);
    }
    const longestSuitCards = Object.values(bySuitCount).sort(
      (a, b) => (b?.length ?? 0) - (a?.length ?? 0),
    )[0]!;
    return byHighest(longestSuitCards);
  }

  const leadSuit = trick!.plays[0].card.suit;
  const currentBest = highestPlay(trick!.plays, trumpSuit, leadSuit);
  const partnerIsWinning = getTeam(currentBest.seat) === getTeam(seat);

  if (partnerIsWinning) {
    return byLowest(legal);
  }

  const winningCards = legal.filter((c) => {
    if (c.suit === trumpSuit && currentBest.card.suit !== trumpSuit) return true;
    if (c.suit === currentBest.card.suit) {
      return RANK_VALUE[c.rank] > RANK_VALUE[currentBest.card.rank];
    }
    return false;
  });

  if (winningCards.length > 0) {
    return byLowest(winningCards);
  }

  const offSuit = legal.filter((c) => c.suit !== leadSuit && c.suit !== trumpSuit);
  return byLowest(offSuit.length > 0 ? offSuit : legal);
}

export function isBotSeat(state: GameState, seat: Seat): boolean {
  return state.players[seat]?.kind === "bot";
}

export { getPartnerSeat };
