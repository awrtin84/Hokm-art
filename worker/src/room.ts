import {
  chooseCardToPlay,
  chooseTrumpSuit,
  createNewMatch,
  declareTrump,
  playCard,
  startNextHand,
  type Card,
  type GameState,
  type PlayerSlot,
  type Seat,
  type Suit,
} from "../../src/lib/hokm-engine";
import { buildClientView, type ClientMessage, type SeatMap, type SeatOccupant, type ServerMessage } from "./protocol";

const SEATS: Seat[] = ["N", "E", "S", "W"];
const BOT_NAMES: Record<Seat, string> = { N: "شمال (بات)", E: "شرق (بات)", S: "جنوب (بات)", W: "غرب (بات)" };

const BOT_THINK_MS = 900;
const TRICK_HOLD_MS = 1200;
const NEXT_HAND_DELAY_MS = 2600;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function emptySeatMap(): SeatMap {
  return { N: null, E: null, S: null, W: null };
}

export class HokmRoom implements DurableObject {
  private readonly state: DurableObjectState;
  private seats: SeatMap = emptySeatMap();
  private game: GameState | null = null;
  private sockets = new Map<WebSocket, Seat | null>();
  private loaded = false;
  private resolvingBots = false;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  private async ensureLoaded() {
    if (this.loaded) return;
    const storedSeats = await this.state.storage.get<SeatMap>("seats");
    const storedGame = await this.state.storage.get<GameState>("game");
    this.seats = storedSeats ?? emptySeatMap();
    this.game = storedGame ?? null;
    this.loaded = true;
  }

  private async persist() {
    await this.state.storage.put("seats", this.seats);
    if (this.game) {
      await this.state.storage.put("game", this.game);
    } else {
      await this.state.storage.delete("game");
    }
  }

  async fetch(request: Request): Promise<Response> {
    await this.ensureLoaded();

    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    const url = new URL(request.url);
    const playerId = url.searchParams.get("playerId") ?? crypto.randomUUID();
    const name = url.searchParams.get("name") ?? "بازیکن";

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();

    const existingSeat = SEATS.find((s) => {
      const occ = this.seats[s];
      return occ?.kind === "human" && occ.playerId === playerId;
    });

    this.sockets.set(server, existingSeat ?? null);
    if (existingSeat) {
      this.seats[existingSeat] = { kind: "human", playerId, name };
      await this.persist();
    }

    this.sendTo(server, this.seatFor(server));

    server.addEventListener("message", (event: MessageEvent) => {
      this.handleMessage(server, playerId, name, event.data as string).catch((err) => {
        this.sendError(server, err instanceof Error ? err.message : "خطای ناشناخته");
      });
    });

    server.addEventListener("close", () => {
      this.sockets.delete(server);
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  private seatFor(socket: WebSocket): Seat | null {
    return this.sockets.get(socket) ?? null;
  }

  private async handleMessage(socket: WebSocket, playerId: string, defaultName: string, raw: string) {
    const msg = JSON.parse(raw) as ClientMessage;

    if (msg.type === "claimSeat") {
      if (this.game) throw new Error("بازی از قبل شروع شده");
      if (this.seats[msg.seat]) throw new Error("این صندلی قبلاً گرفته شده");
      for (const s of SEATS) {
        if (this.seats[s]?.kind === "human" && (this.seats[s] as { playerId: string }).playerId === playerId) {
          this.seats[s] = null;
        }
      }
      this.seats[msg.seat] = { kind: "human", playerId, name: msg.name || defaultName };
      this.sockets.set(socket, msg.seat);
      await this.persist();
      this.broadcastAll();
      return;
    }

    if (msg.type === "startWithBots") {
      if (this.game) throw new Error("بازی از قبل شروع شده");
      const humanCount = SEATS.filter((s) => this.seats[s]?.kind === "human").length;
      if (humanCount === 0) throw new Error("حداقل یک نفر باید توی اتاق باشه");
      for (const s of SEATS) {
        if (!this.seats[s]) this.seats[s] = { kind: "bot", name: BOT_NAMES[s] };
      }
      const players: PlayerSlot[] = SEATS.map((seat) => {
        const occ = this.seats[seat] as Exclude<SeatOccupant, null>;
        return { seat, kind: occ.kind, name: occ.name };
      });
      this.game = createNewMatch({ players });
      await this.persist();
      this.broadcastAll();
      await this.resolveBotTurns();
      return;
    }

    if (msg.type === "resetRoom") {
      this.game = null;
      for (const s of SEATS) {
        if (this.seats[s]?.kind === "bot") this.seats[s] = null;
      }
      await this.persist();
      this.broadcastAll();
      return;
    }

    const seat = this.seatFor(socket);
    if (!seat || !this.game) throw new Error("شما توی این اتاق صندلی ندارید");

    if (msg.type === "declareTrump") {
      if (this.game.phase !== "choosing_trump" || this.game.hakemSeat !== seat) {
        throw new Error("الان نوبت انتخاب حکم شما نیست");
      }
      this.game = declareTrump(this.game, seat, msg.suit);
      await this.persist();
      this.broadcastAll();
      await this.resolveBotTurns();
      return;
    }

    if (msg.type === "playCard") {
      if (this.game.phase !== "playing" || this.game.currentTurnSeat !== seat) {
        throw new Error("الان نوبت شما نیست");
      }
      await this.applyPlay(seat, msg.card);
      return;
    }
  }

  private async applyPlay(seat: Seat, card: Card) {
    if (!this.game) return;
    const result = playCard(this.game, seat, card);

    if (!result.trickCompleted) {
      this.game = result.state;
      await this.persist();
      this.broadcastAll();
      await this.resolveBotTurns();
      return;
    }

    const finishedTrick = result.state.completedTricks[result.state.completedTricks.length - 1];
    const handsAfterPlay = {
      ...this.game.hands,
      [seat]: this.game.hands[seat].filter((c) => !(c.suit === card.suit && c.rank === card.rank)),
    };
    const frozenGame: GameState = { ...this.game, hands: handsAfterPlay };

    this.broadcastAll(frozenGame, { holding: true, currentTrick: finishedTrick, phase: "playing" });
    await sleep(TRICK_HOLD_MS);

    this.game = result.state;
    await this.persist();

    if (result.handCompleted && !result.matchCompleted) {
      this.broadcastAll();
      await sleep(NEXT_HAND_DELAY_MS);
      if (this.game && this.game.phase === "hand_complete") {
        this.game = startNextHand(this.game);
        await this.persist();
        this.broadcastAll();
        await this.resolveBotTurns();
      }
      return;
    }

    this.broadcastAll();
    if (!result.matchCompleted) {
      await this.resolveBotTurns();
    }
  }

  private async resolveBotTurns() {
    if (this.resolvingBots) return;
    this.resolvingBots = true;
    try {
      while (this.game) {
        const seat = this.game.currentTurnSeat;
        const occ = this.seats[seat];
        if (!occ || occ.kind !== "bot") break;

        if (this.game.phase === "choosing_trump") {
          await sleep(BOT_THINK_MS);
          if (!this.game) break;
          const suit: Suit = chooseTrumpSuit(this.game.hands[this.game.hakemSeat]);
          this.game = declareTrump(this.game, this.game.hakemSeat, suit);
          await this.persist();
          this.broadcastAll();
          continue;
        }

        if (this.game.phase === "playing") {
          await sleep(BOT_THINK_MS);
          if (!this.game) break;
          const card = chooseCardToPlay(this.game, seat);
          await this.applyPlay(seat, card);
          continue;
        }

        break;
      }
    } finally {
      this.resolvingBots = false;
    }
  }

  private sendTo(
    socket: WebSocket,
    seat: Seat | null,
    gameOverride?: GameState,
    overrides?: Parameters<typeof buildClientView>[3],
  ) {
    const view = buildClientView(this.seats, gameOverride ?? this.game, seat, overrides);
    const msg: ServerMessage = { type: "view", view };
    try {
      socket.send(JSON.stringify(msg));
    } catch {
      this.sockets.delete(socket);
    }
  }

  private sendError(socket: WebSocket, message: string) {
    const msg: ServerMessage = { type: "error", message };
    try {
      socket.send(JSON.stringify(msg));
    } catch {
      this.sockets.delete(socket);
    }
  }

  private broadcastAll(gameOverride?: GameState, overrides?: Parameters<typeof buildClientView>[3]) {
    for (const [socket, seat] of this.sockets) {
      this.sendTo(socket, seat, gameOverride, overrides);
    }
  }
}
