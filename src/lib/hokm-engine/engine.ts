import { dealHand } from "./deck";
import {
  determineTrickWinner,
  getLegalPlays,
  getNextSeat,
  getTeam,
  isValidPlay,
  sortHand,
} from "./rules";
import type {
  Card,
  GameState,
  NewMatchOptions,
  Seat,
  Suit,
  Team,
  Trick,
} from "./types";
import { SEATS } from "./types";

function pickRandomSeat(rng: () => number): Seat {
  return SEATS[Math.floor(rng() * SEATS.length)];
}

export function createNewMatch(options: NewMatchOptions): GameState {
  const rng = options.rng ?? Math.random;
  const hakemSeat = options.initialHakem ?? pickRandomSeat(rng);

  const players = Object.fromEntries(
    options.players.map((p) => [p.seat, p]),
  ) as GameState["players"];

  for (const seat of SEATS) {
    if (!players[seat]) {
      throw new Error(`Missing player assignment for seat ${seat}`);
    }
  }

  const { initialHakemCards, restBySeat } = dealHand(hakemSeat, rng);

  const hands = Object.fromEntries(
    SEATS.map((seat) => [seat, seat === hakemSeat ? sortHand(initialHakemCards) : []]),
  ) as GameState["hands"];

  const state: GameState = {
    players,
    hands,
    hakemSeat,
    trumpSuit: null,
    phase: "choosing_trump",
    currentTurnSeat: hakemSeat,
    currentTrick: null,
    completedTricks: [],
    trickWins: { A: 0, B: 0 },
    handWins: { A: 0, B: 0 },
    trickTarget: options.trickTarget ?? 7,
    handTarget: options.handTarget ?? 7,
    matchWinner: null,
    version: 0,
  };

  // Stash the pre-dealt rest of the deck so declareTrump hands out exactly
  // these cards instead of re-shuffling.
  pendingDeals.set(state, { restBySeat });

  return state;
}

interface PendingDeal {
  restBySeat: Record<Seat, Card[]>;
}

const pendingDeals = new WeakMap<GameState, PendingDeal>();

function dealAndStash(hakemSeat: Seat, rng: () => number) {
  const { initialHakemCards, restBySeat } = dealHand(hakemSeat, rng);
  return { initialHakemCards, restBySeat };
}

export function declareTrump(
  state: GameState,
  seat: Seat,
  suit: Suit,
  rng: () => number = Math.random,
): GameState {
  if (state.phase !== "choosing_trump") {
    throw new Error(`Cannot declare trump during phase "${state.phase}"`);
  }
  if (seat !== state.hakemSeat) {
    throw new Error(`Only the hakem (${state.hakemSeat}) may declare trump`);
  }

  const stash = pendingDeals.get(state);
  const restBySeat = stash?.restBySeat ?? dealAndStash(state.hakemSeat, rng).restBySeat;

  const hands = Object.fromEntries(
    SEATS.map((s) => [s, sortHand([...(state.hands[s] ?? []), ...restBySeat[s]])]),
  ) as GameState["hands"];

  return {
    ...state,
    hands,
    trumpSuit: suit,
    phase: "playing",
    currentTurnSeat: state.hakemSeat,
    currentTrick: { leaderSeat: state.hakemSeat, plays: [] },
    version: state.version + 1,
  };
}

export interface PlayCardResult {
  state: GameState;
  trickCompleted: boolean;
  handCompleted: boolean;
  matchCompleted: boolean;
}

export function playCard(state: GameState, seat: Seat, card: Card): PlayCardResult {
  if (state.phase !== "playing") {
    throw new Error(`Cannot play a card during phase "${state.phase}"`);
  }
  if (seat !== state.currentTurnSeat) {
    throw new Error(`It is not ${seat}'s turn (current turn: ${state.currentTurnSeat})`);
  }
  if (!state.currentTrick) {
    throw new Error("No active trick to play into");
  }

  const hand = state.hands[seat];
  const leadSuit = state.currentTrick.plays[0]?.card.suit ?? null;

  if (!isValidPlay(hand, card, leadSuit)) {
    throw new Error(
      `Illegal play: ${seat} must follow suit "${leadSuit}" if able, or has no such card in hand`,
    );
  }

  const newHand = hand.filter((c) => !(c.suit === card.suit && c.rank === card.rank));
  const updatedTrick: Trick = {
    ...state.currentTrick,
    plays: [...state.currentTrick.plays, { seat, card }],
  };

  const hands = { ...state.hands, [seat]: newHand };

  if (updatedTrick.plays.length < 4) {
    return {
      state: {
        ...state,
        hands,
        currentTrick: updatedTrick,
        currentTurnSeat: getNextSeat(seat),
        version: state.version + 1,
      },
      trickCompleted: false,
      handCompleted: false,
      matchCompleted: false,
    };
  }

  const winnerSeat = determineTrickWinner(updatedTrick, state.trumpSuit as Suit);
  const finishedTrick: Trick = { ...updatedTrick, winnerSeat };
  const winningTeam = getTeam(winnerSeat);

  const trickWins: Record<Team, number> = {
    ...state.trickWins,
    [winningTeam]: state.trickWins[winningTeam] + 1,
  };

  const handCompleted = trickWins[winningTeam] >= state.trickTarget;

  let nextState: GameState = {
    ...state,
    hands,
    currentTrick: handCompleted ? null : { leaderSeat: winnerSeat, plays: [] },
    completedTricks: [...state.completedTricks, finishedTrick],
    currentTurnSeat: winnerSeat,
    trickWins,
    phase: handCompleted ? "hand_complete" : "playing",
    version: state.version + 1,
  };

  let matchCompleted = false;

  if (handCompleted) {
    const handWins: Record<Team, number> = {
      ...state.handWins,
      [winningTeam]: state.handWins[winningTeam] + 1,
    };
    matchCompleted = handWins[winningTeam] >= state.handTarget;

    nextState = {
      ...nextState,
      handWins,
      phase: matchCompleted ? "match_complete" : "hand_complete",
      matchWinner: matchCompleted ? winningTeam : null,
    };
  }

  return {
    state: nextState,
    trickCompleted: true,
    handCompleted,
    matchCompleted,
  };
}

// If the hakem's team won the hand, they stay hakem; otherwise the role
// passes to the next seat clockwise.
export function startNextHand(state: GameState, rng: () => number = Math.random): GameState {
  if (state.phase !== "hand_complete") {
    throw new Error(`Cannot start next hand during phase "${state.phase}"`);
  }

  const hakemTeamWon = state.trickWins[getTeam(state.hakemSeat)] >= state.trickTarget;
  const nextHakem = hakemTeamWon ? state.hakemSeat : getNextSeat(state.hakemSeat);

  const { initialHakemCards, restBySeat } = dealAndStash(nextHakem, rng);

  const hands = Object.fromEntries(
    SEATS.map((s) => [s, s === nextHakem ? sortHand(initialHakemCards) : []]),
  ) as GameState["hands"];

  const freshState: GameState = {
    ...state,
    hands,
    hakemSeat: nextHakem,
    trumpSuit: null,
    phase: "choosing_trump",
    currentTurnSeat: nextHakem,
    currentTrick: null,
    completedTricks: [],
    trickWins: { A: 0, B: 0 },
    version: state.version + 1,
  };

  pendingDeals.set(freshState, { restBySeat });
  return freshState;
}

export function getLegalPlaysForSeat(state: GameState, seat: Seat): Card[] {
  const leadSuit = state.currentTrick?.plays[0]?.card.suit ?? null;
  return getLegalPlays(state.hands[seat], leadSuit);
}
