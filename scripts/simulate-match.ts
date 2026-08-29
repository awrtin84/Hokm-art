// Run with: npx tsx scripts/simulate-match.ts
import {
  chooseCardToPlay,
  chooseTrumpSuit,
  createNewMatch,
  declareTrump,
  getLegalPlaysForSeat,
  playCard,
  startNextHand,
  type GameState,
  type PlayerSlot,
  type Seat,
} from "../src/lib/hokm-engine";

const players: PlayerSlot[] = [
  { seat: "N", kind: "bot", name: "Bot-N" },
  { seat: "E", kind: "bot", name: "Bot-E" },
  { seat: "S", kind: "bot", name: "Bot-S" },
  { seat: "W", kind: "bot", name: "Bot-W" },
];

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAILED:", msg);
    process.exit(1);
  }
}

function totalCardsInPlay(state: GameState): number {
  return Object.values(state.hands).reduce((sum, h) => sum + h.length, 0);
}

let state = createNewMatch({ players, initialHakem: "N", rng: Math.random });
console.log(`Match started. Hakem: ${state.hakemSeat}`);

let handsPlayed = 0;
const MAX_HANDS = 30;

while (state.phase !== "match_complete" && handsPlayed < MAX_HANDS) {
  assert(state.phase === "choosing_trump", "expected choosing_trump phase");
  assert(state.hands[state.hakemSeat].length === 5, "hakem should have 5 cards pre-trump");

  const trump = chooseTrumpSuit(state.hands[state.hakemSeat]);
  state = declareTrump(state, state.hakemSeat, trump);
  console.log(`Hand ${handsPlayed + 1}: hakem=${state.hakemSeat} trump=${trump}`);

  assert(totalCardsInPlay(state) === 52, `expected 52 cards dealt, got ${totalCardsInPlay(state)}`);
  for (const seat of Object.keys(state.hands) as Seat[]) {
    assert(state.hands[seat].length === 13, `${seat} should have 13 cards, has ${state.hands[seat].length}`);
  }

  while (state.phase === "playing") {
    const seat = state.currentTurnSeat;
    const legal = getLegalPlaysForSeat(state, seat);
    assert(legal.length > 0, `${seat} has no legal plays but must play`);

    const card = chooseCardToPlay(state, seat);
    assert(
      legal.some((c) => c.suit === card.suit && c.rank === card.rank),
      `bot chose an illegal card for ${seat}`,
    );

    const result = playCard(state, seat, card);
    state = result.state;
  }

  assert(
    state.phase === "hand_complete" || state.phase === "match_complete",
    "expected hand_complete or match_complete phase after hand ends",
  );
  const { A, B } = state.trickWins;
  console.log(`  Hand complete. Tricks A=${A} B=${B}. Hand wins so far: A=${state.handWins.A} B=${state.handWins.B}`);

  handsPlayed++;

  if (state.handWins.A >= state.handTarget || state.handWins.B >= state.handTarget) {
    break;
  }

  state = startNextHand(state);
}

assert(state.phase === "match_complete", "match should have completed within MAX_HANDS");
console.log(`\nMatch complete! Winner: Team ${state.matchWinner}`);
console.log(`Final hand wins — A: ${state.handWins.A}, B: ${state.handWins.B}`);
console.log(`Total hands played: ${handsPlayed}`);
console.log("\nAll sanity checks passed ✔");
