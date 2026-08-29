export type Suit = "hearts" | "diamonds" | "clubs" | "spades";

export type Rank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A";

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type Seat = "N" | "E" | "S" | "W";
export type Team = "A" | "B";

export const SEATS: Seat[] = ["N", "E", "S", "W"];

export const TEAM_OF_SEAT: Record<Seat, Team> = {
  N: "A",
  S: "A",
  E: "B",
  W: "B",
};

export type PlayerKind = "human" | "bot";

export interface PlayerSlot {
  seat: Seat;
  kind: PlayerKind;
  name: string;
  botDifficulty?: "easy" | "normal" | "hard";
}

export type GamePhase = "choosing_trump" | "playing" | "hand_complete" | "match_complete";

export interface TrickPlay {
  seat: Seat;
  card: Card;
}

export interface Trick {
  leaderSeat: Seat;
  plays: TrickPlay[];
  winnerSeat?: Seat;
}

export interface GameState {
  players: Record<Seat, PlayerSlot>;
  hands: Record<Seat, Card[]>;
  hakemSeat: Seat;
  trumpSuit: Suit | null;
  phase: GamePhase;
  currentTurnSeat: Seat;
  currentTrick: Trick | null;
  completedTricks: Trick[];
  trickWins: Record<Team, number>;
  handWins: Record<Team, number>;
  trickTarget: number;
  handTarget: number;
  matchWinner: Team | null;
  version: number;
}

export interface NewMatchOptions {
  players: PlayerSlot[];
  initialHakem?: Seat;
  trickTarget?: number;
  handTarget?: number;
  rng?: () => number;
}
