import type { ZoneId } from "../game/types";
export const ZONES: Record<
  ZoneId,
  {
    name: string;
    tag: string;
    description: string;
    color: string;
    reward: string;
    icon: string;
  }
> = {
  provocation: {
    name: "Провокация",
    tag: "ЕСТЬ ЧТО СКРЫВАТЬ?",
    description: "Неудобные вопросы. Очень удобный момент.",
    color: "#ff804a",
    reward: "+2 очка",
    icon: "fire",
  },
  duel: {
    name: "Дуэль",
    tag: "ВЫЗОВ ПРИНЯТ",
    description: "Один на один. Пусть компания решит.",
    color: "#a58aff",
    reward: "+3 победителю",
    icon: "swords",
  },
  chaos: {
    name: "Хаос",
    tag: "ПРАВИЛА? КАКИЕ ПРАВИЛА?",
    description: "Всё идёт не по плану. И это прекрасно.",
    color: "#51d9f4",
    reward: "+2 очка",
    icon: "bolt",
  },
  company: {
    name: "Компания",
    tag: "ВСЕ В ДЕЛЕ",
    description: "Задания, которые объединяют. Или нет.",
    color: "#c8f276",
    reward: "+2 очка",
    icon: "people",
  },
  risk: {
    name: "Риск",
    tag: "ИСПЫТАЙ УДАЧУ",
    description: "Один бросок. Ставки уже сделаны.",
    color: "#ff6fa8",
    reward: "+4 / −2 очка",
    icon: "dice",
  },
};
export const COLORS = [
  "#ff804a",
  "#a58aff",
  "#51d9f4",
  "#c8f276",
  "#ff6fa8",
  "#ffe17a",
  "#6fe5be",
  "#9ba9ff",
];
export const AVATARS = ["alien", "cat", "ghost", "robot"] as const;
