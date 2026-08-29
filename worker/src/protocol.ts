import type { Card, GameState, Seat, Suit, Team } from "../../src/lib/hokm-engine";

export type SeatOccupant =
  | { kind: "human"; playerId: string; name: string }
  | { kind: "bot"; name: string }
  | null;

export type SeatMap = Record<Seat, SeatOccupant>;

export interface ClientView {
  yourSeat: Seat | null;
  seats: SeatMap;
  hasGame: boolean;
  holding: boolean;
  phase: GameState["phase"] | "lobby";
  hakemSeat: Seat;
  trumpSuit: Suit | null;
  currentTurnSeat: Seat;
  yourHand: Card[];
  handCounts: Record<Seat, number>;
  currentTrick: GameState["currentTrick"];
  trickWins: Record<Team, number>;
  handWins: Record<Team, number>;
  trickTarget: number;
  handTarget: number;
  matchWinner: Team | null;
  version: number;
}

export function buildClientView(
  seats: SeatMap,
  game: GameState | null,
  yourSeat: Seat | null,
  overrides: Partial<Pick<ClientView, "holding" | "phase" | "currentTrick">> = {},
): ClientView {
  if (!game) {
    return {
      yourSeat,
      seats,
      hasGame: false,
      holding: false,
      phase: "lobby",
      hakemSeat: "N",
      trumpSuit: null,
      currentTurnSeat: "N",
      yourHand: [],
      handCounts: { N: 0, E: 0, S: 0, W: 0 },
      currentTrick: null,
      trickWins: { A: 0, B: 0 },
      handWins: { A: 0, B: 0 },
      trickTarget: 7,
      handTarget: 7,
      matchWinner: null,
      version: 0,
    };
  }

  const handCounts = Object.fromEntries(
    (Object.keys(game.hands) as Seat[]).map((s) => [s, game.hands[s].length]),
  ) as Record<Seat, number>;

  return {
    yourSeat,
    seats,
    hasGame: true,
    holding: overrides.holding ?? false,
    phase: overrides.phase ?? game.phase,
    hakemSeat: game.hakemSeat,
    trumpSuit: game.trumpSuit,
    currentTurnSeat: game.currentTurnSeat,
    yourHand: yourSeat ? game.hands[yourSeat] : [],
    handCounts,
    currentTrick: overrides.currentTrick ?? game.currentTrick,
    trickWins: game.trickWins,
    handWins: game.handWins,
    trickTarget: game.trickTarget,
    handTarget: game.handTarget,
    matchWinner: game.matchWinner,
    version: game.version,
  };
}

export type ClientMessage =
  | { type: "claimSeat"; seat: Seat; name: string }
  | { type: "startWithBots" }
  | { type: "declareTrump"; suit: Suit }
  | { type: "playCard"; card: Card }
  | { type: "resetRoom" };

export type ServerMessage =
  | { type: "view"; view: ClientView }
  | { type: "error"; message: string };
