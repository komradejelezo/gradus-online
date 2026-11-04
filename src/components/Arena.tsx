import type { CSSProperties } from "react";
import { ZONES } from "../data/zones";
import { ZONE_IDS, type Player, type ZoneId } from "../game/types";
import { Avatar } from "./Avatar";
import { HeatMeter } from "./HeatMeter";
import { Icon } from "./Icon";
const POS: Record<ZoneId, [number, number]> = {
  provocation: [246, 174],
  duel: [658, 174],
  chaos: [162, 371],
  company: [738, 371],
  risk: [450, 513],
};
const demoPlayers: Player[] = [
  {
    id: "demo1",
    name: "Ты",
    color: "#ff804a",
    avatar: "alien",
    zone: "provocation",
    score: 0,
    completed: 0,
    wins: 0,
    risks: 0,
  },
  {
    id: "demo2",
    name: "Твоя компания",
    color: "#a58aff",
    avatar: "cat",
    zone: "duel",
    score: 0,
    completed: 0,
    wins: 0,
    risks: 0,
  },
  {
    id: "demo3",
    name: "",
    color: "#51d9f4",
    avatar: "ghost",
    zone: "chaos",
    score: 0,
    completed: 0,
    wins: 0,
    risks: 0,
  },
  {
    id: "demo4",
    name: "",
    color: "#c8f276",
    avatar: "robot",
    zone: "company",
    score: 0,
    completed: 0,
    wins: 0,
    risks: 0,
  },
];
export function Arena({
  players,
  activeId,
  choices = [],
  onChoose,
  heat = 0,
  demo = false,
  moving = false,
}: {
  players?: Player[];
  activeId?: string;
  choices?: ZoneId[];
  onChoose?: (zone: ZoneId) => void;
  heat?: number;
  demo?: boolean;
  moving?: boolean;
}) {
  const people = demo ? demoPlayers : (players ?? []);
  return (
    <div
      className={`arena ${demo ? "demo-arena" : ""} ${heat > 60 ? "arena-hot" : ""}`}
    >
      <div className="arena-ambient" />
      <div className="arena-orbit orbit-one" />
      <div className="arena-orbit orbit-two" />
      <svg
        className="arena-scene"
        viewBox="0 0 900 650"
        aria-label={
          demo
            ? "Арена с пятью игровыми зонами"
            : "Карта игры. Выберите одну из трёх подсвеченных зон"
        }
      >
        <defs>
          <pattern
            id="grid"
            width="42"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M21 0 42 12 21 24 0 12Z"
              fill="none"
              stroke="#ffffff"
              strokeOpacity=".035"
            />
          </pattern>
          <radialGradient id="floor">
            <stop offset="0" stopColor="#292331" stopOpacity=".75" />
            <stop offset="1" stopColor="#13131c" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <ellipse cx="450" cy="355" rx="420" ry="260" fill="url(#floor)" />
        <path d="M450 52 890 307 450 610 10 307Z" fill="url(#grid)" />
        <ellipse
          cx="450"
          cy="335"
          rx="305"
          ry="183"
          fill="none"
          stroke="#4a405c"
          strokeDasharray="2 12"
        />
        <path
          d="M246 191 450 304 658 191M162 388l288-84 288 84M450 304v218"
          stroke="#393041"
          strokeWidth="14"
          fill="none"
        />
        <path
          d="M246 191 450 304 658 191M162 388l288-84 288 84M450 304v218"
          stroke="#73647b"
          strokeWidth="1.5"
          strokeDasharray="5 10"
          fill="none"
          opacity=".7"
        />
        <ellipse
          cx="450"
          cy="334"
          rx="105"
          ry="57"
          fill="#0e0e17"
          stroke="#554143"
        />
        <ellipse
          cx="450"
          cy="317"
          rx="105"
          ry="57"
          fill="#241c25"
          stroke="#ff804a"
          strokeOpacity=".45"
        />
        <ellipse
          cx="450"
          cy="317"
          rx="88"
          ry="46"
          fill="none"
          stroke="#ff804a"
          strokeOpacity=".2"
        />
        {ZONE_IDS.map((id, index) => {
          const z = ZONES[id],
            [x, y] = POS[id];
          const enabled = choices.includes(id) && !!onChoose;
          return (
            <g
              key={id}
              className={`arena-island ${enabled ? "island-enabled" : ""} ${choices.length && !enabled ? "island-muted" : ""}`}
              style={{ "--zone-color": z.color } as CSSProperties}
              role={onChoose ? "button" : undefined}
              tabIndex={enabled ? 0 : undefined}
              aria-label={
                onChoose
                  ? `${z.name}, ${z.reward}${enabled ? ", выбрать" : ", недоступна в этот ход"}`
                  : undefined
              }
              aria-disabled={onChoose ? !enabled : undefined}
              onClick={() => enabled && onChoose?.(id)}
              onKeyDown={(e) => {
                if (enabled && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onChoose?.(id);
                }
              }}
            >
              <ellipse
                cx={x}
                cy={y + 40}
                rx="109"
                ry="45"
                fill={z.color}
                opacity={enabled ? ".13" : ".05"}
                filter="url(#glow)"
              />
              <path
                d={`M${x - 106} ${y}v25l106 58 106-58V${y}l-106 58Z`}
                fill="#1d1c2c"
                stroke={z.color}
                strokeOpacity=".3"
              />
              <path
                d={`M${x} ${y + 58}v25l106-58V${y}Z`}
                fill={z.color}
                opacity=".08"
              />
              <path
                d={`M${x - 106} ${y}l106-58 106 58-106 58Z`}
                fill="#22212e"
                stroke={z.color}
                strokeOpacity={enabled ? ".9" : ".45"}
                strokeWidth={enabled ? "2" : "1"}
              />
              <path
                d={`M${x - 90} ${y}l90-49 90 49-90 49Z`}
                fill={z.color}
                fillOpacity=".06"
                stroke={z.color}
                strokeOpacity=".15"
              />
              <path
                d={`M${x - 105} ${y + 25}l105 58 105-58`}
                stroke={z.color}
                strokeWidth="2"
                strokeOpacity=".6"
                fill="none"
              />
              <g
                transform={`translate(${x - 23},${y - 39})`}
                style={{ color: z.color }}
                className="zone-sculpture"
              >
                <Icon name={z.icon} size={46} />
              </g>
              <text
                x={x}
                y={y + 22}
                textAnchor="middle"
                fill={z.color}
                fontSize="12"
                fontWeight="800"
                letterSpacing="1.7"
              >
                {z.name.toLocaleUpperCase("ru")}
              </text>
              <text
                x={x}
                y={y + 105}
                textAnchor="middle"
                fill={enabled ? z.color : "#8b879b"}
                fontSize="10"
                letterSpacing="1.5"
              >
                0{index + 1} / {z.reward.toLocaleUpperCase("ru")}
              </text>
              {enabled && (
                <circle
                  cx={x + 75}
                  cy={y - 36}
                  r="5"
                  fill={z.color}
                  className="zone-beacon"
                />
              )}
            </g>
          );
        })}
        <g fill="#777082">
          <path d="m381 95 4-7 4 7-4 7Z" />
          <path d="m548 459 4-7 4 7-4 7Z" />
          <path d="m85 234 3-5 3 5-3 5Z" />
          <path d="m810 245 3-5 3 5-3 5Z" />
        </g>
        <text
          x="450"
          y="628"
          textAnchor="middle"
          fill="#696375"
          fontSize="10"
          letterSpacing="3"
        >
          {demo
            ? "ПЯТЬ ЗОН. БЕСКОНЕЧНО МНОГО ИСТОРИЙ."
            : moving
              ? "ПЕРЕМЕЩАЕМСЯ…"
              : "ТВОЙ ХОД — ТВОИ ПРАВИЛА"}
        </text>
      </svg>
      <div className="arena-center">
        <HeatMeter heat={heat} demo={demo} />
      </div>
      {people.map((p, i) => {
        const [x, y] = p.zone
          ? POS[p.zone]
          : [355 + (i % 4) * 63, 393 + Math.floor(i / 4) * 63];
        const same = people.filter((q) => q.zone === p.zone);
        const slot = same.findIndex((q) => q.id === p.id);
        const dx = p.zone ? (slot - (same.length - 1) / 2) * 30 : 0;
        return (
          <div
            key={p.id}
            className={`arena-player ${p.id === activeId ? "current-token" : ""} ${moving && p.id === activeId ? "token-moving" : ""}`}
            style={
              {
                left: `${(x + dx + (demo ? 40 : 0)) / 9}%`,
                top: `${(y + (p.zone ? 14 : 0)) / 6.5}%`,
                "--player-color": p.color,
              } as CSSProperties
            }
          >
            <Avatar avatar={p.avatar} color={p.color} size={demo ? 50 : 39} />
            {p.name && <span>{p.name}</span>}
            {p.id === activeId && <i />}
          </div>
        );
      })}
      {demo && (
        <>
          <div className="arena-note note-one">
            <span className="live-dot" /> ЖИВОЕ ОБЩЕНИЕ
          </div>
          <div className="arena-note note-two">
            <Icon name="bolt" size={15} /> СКУЧНО НЕ БУДЕТ
          </div>
        </>
      )}
    </div>
  );
}
