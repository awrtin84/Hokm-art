import type { Card, GameState, Seat, Suit, Team } from "@/lib/hokm-engine";

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

export type ClientMessage =
  | { type: "claimSeat"; seat: Seat; name: string }
  | { type: "startWithBots" }
  | { type: "declareTrump"; suit: Suit }
  | { type: "playCard"; card: Card }
  | { type: "resetRoom" };

export type ServerMessage = { type: "view"; view: ClientView } | { type: "error"; message: string };
