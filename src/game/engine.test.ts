import { describe, expect, it } from "vitest";
import { CARDS, FINAL_CARDS } from "../data/cards";
import { COLORS } from "../data/zones";
import { createGame, heatLabel, ranking, transition, winners } from "./engine";
import {
  loadGame,
  SAVE_KEY,
  saveGame,
  validateGame,
  type StorageLike,
} from "./storage";
import { ZONE_IDS, type GameState, type Player, type ZoneId } from "./types";
const players = (count = 3): Player[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `p${i}`,
    name: `Игрок ${i + 1}`,
    color: COLORS[i],
    avatar: "alien",
    score: 0,
    zone: null,
    completed: 0,
    wins: 0,
    risks: 0,
  }));
const fixed = () => 0.41;
function select(state: GameState, zone: ZoneId): GameState {
  return transition(
    {
      ...state,
      choices: [zone, ...ZONE_IDS.filter((z) => z !== zone).slice(0, 2)],
    },
    { type: "SELECT_ZONE", zone },
    fixed,
  );
}
function card(state: GameState, zone: ZoneId): GameState {
  return transition(select(state, zone), { type: "ARRIVE" }, fixed);
}
function memory(): StorageLike {
  const values = new Map<string, string>();
  return {
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => {
      values.set(k, v);
    },
  };
}
describe("decks and turn selection", () => {
  it("has ten original cards per zone and eight different final tasks", () => {
    expect(CARDS).toHaveLength(50);
    expect(new Set(CARDS.map((c) => c.id)).size).toBe(50);
    expect(new Set(CARDS.map((c) => c.text)).size).toBe(50);
    for (const zone of ZONE_IDS)
      expect(CARDS.filter((c) => c.zone === zone)).toHaveLength(10);
    expect(FINAL_CARDS).toHaveLength(8);
    expect(new Set(FINAL_CARDS.map((c) => c.id)).size).toBe(8);
  });
  it.each([3, 8])(
    "starts a valid %i player game with three distinct choices",
    (count) => {
      const state = createGame(players(count), fixed);
      expect(validateGame(state)).toBe(true);
      expect(state.choices).toHaveLength(3);
      expect(new Set(state.choices).size).toBe(3);
    },
  );
  it.each([2, 9])("rejects %i players", (count) =>
    expect(() => createGame(players(count), fixed)).toThrow(),
  );
  it("rejects an unavailable zone and premature completion", () => {
    const state = createGame(players(), fixed);
    const zone = ZONE_IDS.find((z) => !state.choices.includes(z))!;
    expect(transition(state, { type: "SELECT_ZONE", zone }, fixed)).toBe(state);
    expect(transition(state, { type: "COMPLETE" }, fixed)).toBe(state);
  });
  it.each(ZONE_IDS)(
    "exhausts the %s deck before repeating and refills without boundary repetition",
    (zone) => {
      let state = createGame(players(), fixed);
      const seen: string[] = [];
      for (let i = 0; i < 21; i++) {
        state = card(state, zone);
        seen.push(state.card!.id);
        state = transition(state, { type: "SKIP" }, fixed);
      }
      expect(new Set(seen.slice(0, 10)).size).toBe(10);
      expect(new Set(seen.slice(10, 20)).size).toBe(10);
      expect(seen[10]).not.toBe(seen[9]);
      expect(seen[20]).not.toBe(seen[19]);
      expect(validateGame(state)).toBe(true);
    },
  );
  it("moves only the active player and waits before revealing the card", () => {
    const state = select(createGame(players(), fixed), "provocation");
    expect(state.phase).toBe("moving");
    expect(state.players[0].zone).toBe("provocation");
    expect(state.players[1].zone).toBe(null);
    expect(transition(state, { type: "COMPLETE" }, fixed)).toBe(state);
    expect(transition(state, { type: "ARRIVE" }).phase).toBe("card");
  });
});
describe("scoring and chaos", () => {
  it.each([
    ["provocation", 2, 5],
    ["chaos", 2, 5],
    ["company", 2, 10],
  ] as const)("%s awards %i points and %i heat", (zone, points, heat) => {
    const state = transition(
      card(createGame(players(), fixed), zone),
      { type: "COMPLETE" },
      fixed,
    );
    expect(state.players[0].score).toBe(points);
    expect(state.heat).toBe(heat);
    expect(state.current).toBe(1);
    expect(state.turn).toBe(2);
    expect(state.players[0].completed).toBe(1);
  });
  it("skip changes neither score nor heat and advances the player", () => {
    const state = transition(
      card(createGame(players(), fixed), "company"),
      { type: "SKIP" },
      fixed,
    );
    expect(state.players[0].score).toBe(0);
    expect(state.heat).toBe(0);
    expect(state.current).toBe(1);
  });
  it("requires a valid duel opponent and awards only the selected winner", () => {
    let state = card(createGame(players(), fixed), "duel");
    expect(transition(state, { type: "COMPLETE", winnerId: "p1" }, fixed)).toBe(
      state,
    );
    expect(transition(state, { type: "SET_OPPONENT", id: "p0" }, fixed)).toBe(
      state,
    );
    state = transition(state, { type: "SET_OPPONENT", id: "p1" }, fixed);
    expect(transition(state, { type: "COMPLETE", winnerId: "p2" }, fixed)).toBe(
      state,
    );
    state = transition(state, { type: "COMPLETE", winnerId: "p1" }, fixed);
    expect(state.players.map((p) => p.score)).toEqual([0, 3, 0]);
    expect(state.players[1].wins).toBe(1);
    expect(state.heat).toBe(5);
  });
  it.each([1, 2, 3, 4, 5, 6])(
    "resolves risk roll %i and never allows a reroll",
    (value) => {
      let state = card(createGame(players(), fixed), "risk");
      expect(transition(state, { type: "COMPLETE" }, fixed)).toBe(state);
      state = transition(state, { type: "ROLL", value });
      expect(transition(state, { type: "ROLL", value: 6 })).toBe(state);
      expect(transition(state, { type: "SKIP" })).toBe(state);
      state = transition(state, { type: "COMPLETE" }, fixed);
      expect(state.players[0].score).toBe(value >= 4 ? 4 : 0);
      expect(state.heat).toBe(5);
      expect(state.players[0].risks).toBe(1);
    },
  );
  it("subtracts exactly two points for an unsuccessful risk", () => {
    const initial = createGame(players(), fixed);
    initial.players[0].score = 5;
    const rolled = transition(card(initial, "risk"), {
      type: "ROLL",
      value: 2,
    });
    expect(
      transition(rolled, { type: "COMPLETE" }, fixed).players[0].score,
    ).toBe(3);
  });
  it.each([0, 7, 2.5, NaN])("rejects invalid die value %s", (value) => {
    const state = card(createGame(players(), fixed), "risk");
    expect(transition(state, { type: "ROLL", value })).toBe(state);
  });
  it("counts chaos duration in subsequent completed turns including skips", () => {
    let state = card(createGame(players(), fixed), "chaos");
    const duration = state.card!.effect!.turns;
    state = transition(state, { type: "COMPLETE" }, fixed);
    expect(state.effects[0].remaining).toBe(duration);
    for (let i = 0; i < duration; i++)
      state = transition(card(state, "provocation"), { type: "SKIP" }, fixed);
    expect(state.effects).toHaveLength(0);
  });
  it("does not activate a skipped chaos card", () =>
    expect(
      transition(
        card(createGame(players(), fixed), "chaos"),
        { type: "SKIP" },
        fixed,
      ).effects,
    ).toHaveLength(0));
});
describe("complete party and final round", () => {
  it.each([3, 8])(
    "finishes a complete %i player party and gives every participant one final turn",
    (count) => {
      let state = createGame(players(count), fixed);
      while (state.heat < 100) {
        state = card(state, "company");
        state = transition(state, { type: "COMPLETE" }, fixed);
        expect(validateGame(state)).toBe(true);
      }
      expect(state.phase).toBe("final-intro");
      expect(state.finalOrder[0]).toBe(state.players[state.current].id);
      expect(new Set(state.finalOrder).size).toBe(count);
      expect(state.finalCards).toHaveLength(count);
      expect(new Set(state.finalCards.map((c) => c.id)).size).toBe(count);
      const before = state.players.map((p) => p.score);
      state = transition(state, { type: "START_FINAL" });
      for (let i = 0; i < count; i++) {
        expect(state.finalIndex).toBe(i);
        state = transition(state, { type: "FINAL_COMPLETE", completed: true });
        expect(validateGame(state)).toBe(true);
      }
      expect(state.phase).toBe("results");
      expect(state.players.map((p) => p.score)).toEqual(
        before.map((n) => n + 5),
      );
      expect(
        transition(state, { type: "FINAL_COMPLETE", completed: true }),
      ).toBe(state);
    },
  );
  it("caps heat at 100, finishes the triggering turn, and allows final skips", () => {
    let state = createGame(players(), fixed);
    state.heat = 95;
    state = transition(card(state, "company"), { type: "COMPLETE" }, fixed);
    expect(state.heat).toBe(100);
    expect(state.players[0].score).toBe(2);
    expect(state.current).toBe(1);
    state = transition(state, { type: "START_FINAL" });
    state = transition(state, { type: "FINAL_COMPLETE", completed: false });
    expect(state.players[1].score).toBe(0);
    expect(state.finalIndex).toBe(1);
  });
  it("announces all tied winners without mutating player turn order", () => {
    const group = players();
    group[0].score = 4;
    group[1].score = 7;
    group[2].score = 7;
    expect(winners(group).map((p) => p.id)).toEqual(["p1", "p2"]);
    expect(ranking(group).map((p) => p.id)).toEqual(["p1", "p2", "p0"]);
    expect(group[0].id).toBe("p0");
  });
  it.each([
    [0, "Разогрев"],
    [30, "Разогрев"],
    [31, "Вечеринка"],
    [60, "Вечеринка"],
    [61, "Жарко"],
    [80, "Жарко"],
    [81, "Безумие"],
    [99, "Безумие"],
    [100, "Точка кипения"],
  ])("labels heat %s as %s", (heat, label) =>
    expect(heatLabel(Number(heat))).toBe(label),
  );
});
describe("recovery and damaged storage", () => {
  it("restores players, decks, effects and a committed risk without allowing a reroll", () => {
    const storage = memory();
    let state = transition(
      card(createGame(players(), fixed), "chaos"),
      { type: "COMPLETE" },
      fixed,
    );
    state = transition(card(state, "risk"), { type: "ROLL", value: 2 });
    expect(saveGame(state, storage)).toBe(true);
    const loaded = loadGame(storage);
    expect(loaded.warning).toBe(null);
    expect(loaded.game).toEqual(state);
    expect(transition(loaded.game!, { type: "ROLL", value: 6 })).toBe(
      loaded.game,
    );
  });
  it("recovers interrupted movement directly into the drawn card", () => {
    const storage = memory();
    const state = select(createGame(players(), fixed), "duel");
    saveGame(state, storage);
    const loaded = loadGame(storage).game!;
    expect(loaded.phase).toBe("card");
    expect(loaded.card?.id).toBe(state.card?.id);
    expect(loaded.decks).toEqual(state.decks);
  });
  it("restores final progress and completed results", () => {
    const storage = memory();
    let state = createGame(players(), fixed);
    state.heat = 95;
    state = transition(card(state, "provocation"), { type: "COMPLETE" }, fixed);
    state = transition(state, { type: "START_FINAL" });
    state = transition(state, { type: "FINAL_COMPLETE", completed: true });
    saveGame(state, storage);
    expect(loadGame(storage).game).toEqual(state);
    while (state.phase === "final")
      state = transition(state, { type: "FINAL_COMPLETE", completed: false });
    saveGame(state, storage);
    expect(loadGame(storage).game?.phase).toBe("results");
  });
  it.each(["{broken", "null", "{}", '{"version":9}'])(
    "rejects invalid save %s",
    (raw) => {
      const storage = memory();
      storage.setItem(SAVE_KEY, raw);
      expect(loadGame(storage).game).toBe(null);
      expect(loadGame(storage).warning).toBeTruthy();
    },
  );
  it("handles blocked and full localStorage without crashing", () => {
    const blocked: StorageLike = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    expect(saveGame(createGame(players(), fixed), blocked)).toBe(false);
    expect(loadGame(blocked).game).toBe(null);
    expect(loadGame(blocked).warning).toBeTruthy();
  });
  it("rejects damaged player, deck, and score data", () => {
    const state = createGame(players(), fixed);
    expect(validateGame({ ...state, current: 20 })).toBe(false);
    expect(
      validateGame({
        ...state,
        players: [
          ...state.players.slice(1),
          { ...state.players[0], score: -1 },
        ],
      }),
    ).toBe(false);
    expect(
      validateGame({
        ...state,
        decks: { ...state.decks, duel: ["missing-card"] },
      }),
    ).toBe(false);
  });
});
it("handles a browser that throws when accessing the localStorage property itself", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get: () => {
      throw new Error("SecurityError");
    },
  });
  try {
    expect(loadGame().game).toBe(null);
    expect(saveGame(createGame(players(), fixed))).toBe(false);
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
