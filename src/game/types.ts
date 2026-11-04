export const ZONE_IDS = [
  "provocation",
  "duel",
  "chaos",
  "company",
  "risk",
] as const;
export type ZoneId = (typeof ZONE_IDS)[number];
export type AvatarId = "alien" | "cat" | "ghost" | "robot";
export interface Player {
  id: string;
  name: string;
  color: string;
  avatar: AvatarId;
  score: number;
  zone: ZoneId | null;
  completed: number;
  wins: number;
  risks: number;
}
export interface Card {
  id: string;
  zone: ZoneId;
  title: string;
  text: string;
  hint: string;
  duration?: number;
  effect?: { text: string; turns: number };
}
export interface FinalCard {
  id: string;
  title: string;
  text: string;
}
export interface ChaosEffect {
  id: string;
  text: string;
  remaining: number;
}
export type GamePhase =
  "choose" | "moving" | "card" | "final-intro" | "final" | "results";
export interface GameState {
  version: 1;
  players: Player[];
  current: number;
  turn: number;
  heat: number;
  phase: GamePhase;
  choices: ZoneId[];
  decks: Record<ZoneId, string[]>;
  lastCards: Partial<Record<ZoneId, string>>;
  card: Card | null;
  opponentId: string | null;
  die: number | null;
  effects: ChaosEffect[];
  finalOrder: string[];
  finalIndex: number;
  finalCards: FinalCard[];
  lastEvent: string | null;
  createdAt: number;
}
export interface Settings {
  sound: boolean;
  reducedMotion: boolean;
}
export type GameAction =
  | { type: "SELECT_ZONE"; zone: ZoneId }
  | { type: "ARRIVE" }
  | { type: "SET_OPPONENT"; id: string }
  | { type: "ROLL"; value: number }
  | { type: "COMPLETE"; winnerId?: string }
  | { type: "SKIP" }
  | { type: "START_FINAL" }
  | { type: "FINAL_COMPLETE"; completed: boolean };
