import { CARDS, FINAL_CARDS } from "../data/cards";
import {
  ZONE_IDS,
  type GameAction,
  type GameState,
  type Player,
  type ZoneId,
} from "./types";
export type Random = () => number;
export function shuffle<T>(
  items: readonly T[],
  random: Random = Math.random,
): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function createGame(
  players: Player[],
  random: Random = Math.random,
): GameState {
  if (
    players.length < 3 ||
    players.length > 8 ||
    players.some((p) => !p.name.trim()) ||
    new Set(players.map((p) => p.id)).size !== players.length
  )
    throw new Error("Нужно от 3 до 8 игроков с именами и уникальными ID.");
  return {
    version: 1,
    players: players.map((p) => ({
      ...p,
      name: p.name.trim().slice(0, 20),
      score: 0,
      zone: null,
      completed: 0,
      wins: 0,
      risks: 0,
    })),
    current: 0,
    turn: 1,
    heat: 0,
    phase: "choose",
    choices: shuffle(ZONE_IDS, random).slice(0, 3),
    decks: Object.fromEntries(
      ZONE_IDS.map((z) => [
        z,
        shuffle(
          CARDS.filter((c) => c.zone === z).map((c) => c.id),
          random,
        ),
      ]),
    ) as Record<ZoneId, string[]>,
    lastCards: {},
    card: null,
    opponentId: null,
    die: null,
    effects: [],
    finalOrder: [],
    finalIndex: 0,
    finalCards: [],
    lastEvent: null,
    createdAt: Date.now(),
  };
}
function endTurn(
  state: GameState,
  completed: boolean,
  winnerId: string | undefined,
  random: Random,
): GameState {
  const card = state.card;
  if (!card) return state;
  const active = state.players[state.current];
  if (
    completed &&
    card.zone === "duel" &&
    (!state.opponentId ||
      ![active.id, state.opponentId].includes(winnerId ?? ""))
  )
    return state;
  if (completed && card.zone === "risk" && !state.die) return state;
  if (!completed && card.zone === "risk" && state.die !== null) return state;
  let change = 0;
  let targetId = active.id;
  if (completed) {
    if (card.zone === "risk") change = state.die! >= 4 ? 4 : -2;
    else if (card.zone === "duel") {
      change = 3;
      targetId = winnerId!;
    } else change = 2;
  }
  const players = state.players.map((p) => ({
    ...p,
    score: p.id === targetId ? Math.max(0, p.score + change) : p.score,
    completed: p.completed + (completed && p.id === active.id ? 1 : 0),
    wins:
      p.wins + (completed && card.zone === "duel" && p.id === targetId ? 1 : 0),
    risks:
      p.risks +
      (completed && card.zone === "risk" && p.id === active.id ? 1 : 0),
  }));
  const heat = Math.min(
    100,
    state.heat + (completed ? (card.zone === "company" ? 10 : 5) : 0),
  );
  const effects = state.effects
    .map((e) => ({ ...e, remaining: e.remaining - 1 }))
    .filter((e) => e.remaining > 0);
  if (completed && card.effect)
    effects.push({
      id: card.id,
      text: card.effect.text,
      remaining: card.effect.turns,
    });
  const current = (state.current + 1) % players.length;
  const finale = heat === 100;
  const target = players.find((p) => p.id === targetId)!;
  const lastEvent = completed
    ? `${target.name}: ${change > 0 ? "+" : "−"}${Math.abs(change)} ${Math.abs(change) === 1 ? "очко" : "очка"} · ${card.title}`
    : `${active.name}: задание пропущено`;
  return {
    ...state,
    players,
    current,
    turn: state.turn + 1,
    heat,
    effects,
    card: null,
    opponentId: null,
    die: null,
    lastEvent,
    phase: finale ? "final-intro" : "choose",
    choices: finale ? [] : shuffle(ZONE_IDS, random).slice(0, 3),
    ...(finale
      ? {
          finalOrder: players.map(
            (_, i) => players[(current + i) % players.length].id,
          ),
          finalIndex: 0,
          finalCards: shuffle(FINAL_CARDS, random).slice(0, players.length),
        }
      : {}),
  };
}
export function transition(
  state: GameState,
  action: GameAction,
  random: Random = Math.random,
): GameState {
  switch (action.type) {
    case "SELECT_ZONE": {
      if (state.phase !== "choose" || !state.choices.includes(action.zone))
        return state;
      let deck = [...state.decks[action.zone]];
      if (!deck.length) {
        deck = shuffle(
          CARDS.filter((c) => c.zone === action.zone).map((c) => c.id),
          random,
        );
        // A new deck also avoids repeating the last card across the shuffle boundary.
        if (deck.length > 1 && deck[0] === state.lastCards[action.zone])
          [deck[0], deck[1]] = [deck[1], deck[0]];
      }
      const id = deck.shift()!;
      return {
        ...state,
        phase: "moving",
        card: CARDS.find((c) => c.id === id)!,
        die: null,
        opponentId: null,
        decks: { ...state.decks, [action.zone]: deck },
        lastCards: { ...state.lastCards, [action.zone]: id },
        players: state.players.map((p, i) =>
          i === state.current ? { ...p, zone: action.zone } : p,
        ),
      };
    }
    case "ARRIVE":
      return state.phase === "moving" ? { ...state, phase: "card" } : state;
    case "SET_OPPONENT":
      return state.phase === "card" &&
        state.card?.zone === "duel" &&
        state.players.some((p, i) => p.id === action.id && i !== state.current)
        ? { ...state, opponentId: action.id }
        : state;
    case "ROLL":
      return state.phase === "card" &&
        state.card?.zone === "risk" &&
        state.die === null &&
        Number.isInteger(action.value) &&
        action.value >= 1 &&
        action.value <= 6
        ? { ...state, die: action.value }
        : state;
    case "COMPLETE":
      return state.phase === "card"
        ? endTurn(state, true, action.winnerId, random)
        : state;
    case "SKIP":
      return state.phase === "card"
        ? endTurn(state, false, undefined, random)
        : state;
    case "START_FINAL":
      return state.phase === "final-intro"
        ? { ...state, phase: "final", effects: [] }
        : state;
    case "FINAL_COMPLETE": {
      if (state.phase !== "final") return state;
      const id = state.finalOrder[state.finalIndex];
      const finalIndex = state.finalIndex + 1;
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === id
            ? {
                ...p,
                score: p.score + (action.completed ? 5 : 0),
                completed: p.completed + (action.completed ? 1 : 0),
              }
            : p,
        ),
        finalIndex,
        phase: finalIndex === state.players.length ? "results" : "final",
        current:
          finalIndex === state.players.length
            ? state.current
            : state.players.findIndex(
                (p) => p.id === state.finalOrder[finalIndex],
              ),
      };
    }
  }
}
export function heatLabel(heat: number) {
  return heat <= 30
    ? "Разогрев"
    : heat <= 60
      ? "Вечеринка"
      : heat <= 80
        ? "Жарко"
        : heat < 100
          ? "Безумие"
          : "Точка кипения";
}
export function ranking(players: Player[]) {
  return [...players].sort((a, b) => b.score - a.score);
}
export function winners(players: Player[]) {
  const best = Math.max(...players.map((p) => p.score));
  return players.filter((p) => p.score === best);
}
export function playerTitle(player: Player, winner: boolean) {
  if (winner) return "Легенда вечеринки";
  if (player.wins > 0) return "Мастер дуэлей";
  if (player.risks > 0) return "Любимчик фортуны";
  if (player.completed >= 4) return "Душа компании";
  return [
    "Министр хорошего настроения",
    "Главный по атмосфере",
    "Секретное оружие компании",
  ][player.id.charCodeAt(0) % 3];
}
