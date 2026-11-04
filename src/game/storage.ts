import { CARDS, FINAL_CARDS } from "../data/cards";
import { AVATARS, COLORS } from "../data/zones";
import { ZONE_IDS, type GameState, type Settings } from "./types";
export const SAVE_KEY = "gradus-online:game:v1";
export const SETTINGS_KEY = "gradus-online:settings:v1";
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
const integer = (
  value: unknown,
  min: number,
  max = Number.MAX_SAFE_INTEGER,
): value is number =>
  Number.isInteger(value) && Number(value) >= min && Number(value) <= max;
const isZone = (value: unknown) =>
  ZONE_IDS.includes(value as (typeof ZONE_IDS)[number]);
export function validateGame(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const s = value as GameState;
  if (
    s.version !== 1 ||
    !Array.isArray(s.players) ||
    s.players.length < 3 ||
    s.players.length > 8
  )
    return false;
  if (
    !s.players.every(
      (p) =>
        p &&
        typeof p.id === "string" &&
        p.id.length > 0 &&
        p.id.length < 100 &&
        typeof p.name === "string" &&
        p.name.trim().length > 0 &&
        p.name.length <= 20 &&
        COLORS.includes(p.color) &&
        AVATARS.includes(p.avatar) &&
        integer(p.score, 0) &&
        integer(p.completed, 0) &&
        integer(p.wins, 0) &&
        integer(p.risks, 0) &&
        (p.zone === null || isZone(p.zone)),
    )
  )
    return false;
  if (
    new Set(s.players.map((p) => p.id)).size !== s.players.length ||
    !integer(s.current, 0, s.players.length - 1) ||
    !integer(s.turn, 1) ||
    !integer(s.heat, 0, 100)
  )
    return false;
  if (
    !["choose", "moving", "card", "final-intro", "final", "results"].includes(
      s.phase,
    )
  )
    return false;
  if (
    !Array.isArray(s.choices) ||
    !s.choices.every(isZone) ||
    new Set(s.choices).size !== s.choices.length ||
    (s.phase === "choose" && s.choices.length !== 3)
  )
    return false;
  if (
    !s.decks ||
    !s.lastCards ||
    !ZONE_IDS.every(
      (z) =>
        Array.isArray(s.decks[z]) &&
        new Set(s.decks[z]).size === s.decks[z].length &&
        s.decks[z].every((id) =>
          CARDS.some((c) => c.id === id && c.zone === z),
        ) &&
        (!s.lastCards[z] ||
          CARDS.some((c) => c.id === s.lastCards[z] && c.zone === z)),
    )
  )
    return false;
  if (
    s.card !== null &&
    !CARDS.some((c) => c.id === s.card?.id && c.zone === s.card?.zone)
  )
    return false;
  if (["moving", "card"].includes(s.phase) && !s.card) return false;
  if (
    s.opponentId !== null &&
    !s.players.some((p, i) => p.id === s.opponentId && i !== s.current)
  )
    return false;
  if (s.die !== null && !integer(s.die, 1, 6)) return false;
  if (
    !Array.isArray(s.effects) ||
    !s.effects.every(
      (e) =>
        e &&
        typeof e.id === "string" &&
        typeof e.text === "string" &&
        integer(e.remaining, 1, 4),
    )
  )
    return false;
  if (
    !Array.isArray(s.finalOrder) ||
    !Array.isArray(s.finalCards) ||
    !integer(s.finalIndex, 0, s.players.length)
  )
    return false;
  if (["final-intro", "final", "results"].includes(s.phase)) {
    if (
      s.heat !== 100 ||
      s.finalOrder.length !== s.players.length ||
      new Set(s.finalOrder).size !== s.players.length ||
      !s.finalOrder.every((id) => s.players.some((p) => p.id === id))
    )
      return false;
    if (
      s.finalCards.length !== s.players.length ||
      new Set(s.finalCards.map((c) => c.id)).size !== s.players.length ||
      !s.finalCards.every((c) => FINAL_CARDS.some((f) => f.id === c.id))
    )
      return false;
    if (
      s.phase === "results"
        ? s.finalIndex !== s.players.length
        : s.finalIndex >= s.players.length
    )
      return false;
  }
  return (
    (s.lastEvent === null || typeof s.lastEvent === "string") &&
    integer(s.createdAt, 0)
  );
}
export function loadGame(storage?: StorageLike): {
  game: GameState | null;
  warning: string | null;
} {
  try {
    const raw = (storage ?? globalThis.localStorage).getItem(SAVE_KEY);
    if (!raw) return { game: null, warning: null };
    const value: unknown = JSON.parse(raw);
    if (!validateGame(value))
      return {
        game: null,
        warning:
          "Сохранение повреждено или относится к другой версии. Можно начать новую игру.",
      };
    return {
      game: {
        ...value,
        phase: value.phase === "moving" ? "card" : value.phase,
        card: value.card ? CARDS.find((c) => c.id === value.card!.id)! : null,
        finalCards: value.finalCards.map((c) =>
          FINAL_CARDS.find((f) => f.id === c.id)!,
        ),
      },
      warning: null,
    };
  } catch {
    return {
      game: null,
      warning:
        "Браузер не разрешил прочитать сохранение. Игра доступна без восстановления.",
    };
  }
}
export function saveGame(game: GameState, storage?: StorageLike): boolean {
  try {
    (storage ?? globalThis.localStorage).setItem(
      SAVE_KEY,
      JSON.stringify(game),
    );
    return true;
  } catch {
    return false;
  }
}
export function loadSettings(): Settings {
  try {
    const data = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}");
    return {
      sound: data.sound === true,
      reducedMotion: data.reducedMotion === true,
    };
  } catch {
    return { sound: false, reducedMotion: false };
  }
}
