import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ZONES } from "../data/zones";
import type { GameAction, GameState, Settings } from "../game/types";
import { Avatar } from "./Avatar";
import { Dice } from "./Dice";
import { Icon } from "./Icon";
function Timer({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running || left <= 0) return;
    const handle = setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(handle);
  }, [running, left]);
  return (
    <div className="task-timer">
      <Icon name="clock" size={17} />
      <span role="timer" aria-label="Осталось секунд">
        {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
      </span>
      <button
        className="text-button"
        onClick={() => {
          if (left === 0) {
            setLeft(seconds);
            setRunning(true);
          } else setRunning(!running);
        }}
      >
        {left === 0
          ? "Ещё раз"
          : running
            ? "Пауза"
            : left === seconds
              ? "Запустить таймер"
              : "Продолжить"}
      </button>
      {left === 0 && <small role="status">Время вышло — можно завершать</small>}
    </div>
  );
}
export function TaskCard({
  game,
  dispatch,
  settings,
  sound,
}: {
  game: GameState;
  dispatch: (action: GameAction) => void;
  settings: Settings;
  sound: (kind?: "click" | "success" | "roll" | "final") => void;
}) {
  const card = game.card!;
  const zone = ZONES[card.zone];
  const active = game.players[game.current];
  const [winner, setWinner] = useState("");
  const [revealed, setRevealed] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const timer = setTimeout(
      () => {
        setRevealed(true);
        heading.current?.focus({ preventScroll: true });
      },
      settings.reducedMotion ? 0 : 130,
    );
    return () => clearTimeout(timer);
  }, [settings.reducedMotion]);
  const isDuel = card.zone === "duel",
    isRisk = card.zone === "risk";
  const opponent = game.players.find((p) => p.id === game.opponentId);
  return (
    <div className="task-overlay">
      <section
        className={`task-card ${revealed ? "card-revealed" : ""}`}
        style={{ "--zone-color": zone.color } as CSSProperties}
        aria-label={`Задание: ${card.title}`}
      >
        <div className="task-card-bar">
          <span>
            <Icon name={zone.icon} size={18} />
            {zone.name}
          </span>
          <span>
            {isRisk ? "+4 / −2 ОЧКА" : isDuel ? "+3 ПОБЕДИТЕЛЮ" : "+2 ОЧКА"}
          </span>
        </div>
        <div className="task-card-main">
          <span className="task-eyebrow">{zone.tag}</span>
          <h2 ref={heading} tabIndex={-1}>
            {card.title}
          </h2>
          <p className="task-text">{card.text}</p>
          <div className="task-hint">
            <Icon name="info" size={17} />
            <p>{card.hint}</p>
          </div>
          {card.duration && <Timer seconds={card.duration} />}
          {card.effect && (
            <div className="upcoming-effect">
              <Icon name="bolt" size={18} />
              <div>
                <b>После выполнения: правило на {card.effect.turns} хода</b>
                <p>{card.effect.text}</p>
              </div>
            </div>
          )}
          {isDuel && (
            <div className="duel-controls">
              <label htmlFor="opponent">Выбери соперника</label>
              <select
                id="opponent"
                value={game.opponentId ?? ""}
                onChange={(e) => {
                  setWinner("");
                  dispatch({ type: "SET_OPPONENT", id: e.target.value });
                }}
              >
                <option value="" disabled>
                  Кому бросишь вызов?
                </option>
                {game.players
                  .filter((p) => p.id !== active.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
              {opponent && (
                <>
                  <span className="winner-label">
                    Компания решила. Кто победил?
                  </span>
                  <div className="winner-buttons">
                    {[active, opponent].map((p) => (
                      <button
                        key={p.id}
                        className={`winner-button ${winner === p.id ? "selected" : ""}`}
                        aria-pressed={winner === p.id}
                        onClick={() => setWinner(p.id)}
                      >
                        <Avatar avatar={p.avatar} color={p.color} size={33} />
                        {p.name}
                        {winner === p.id && <Icon name="check" size={17} />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {isRisk && (
            <Dice
              value={game.die}
              onRoll={(value) => dispatch({ type: "ROLL", value })}
              reducedMotion={settings.reducedMotion}
              sound={() => sound("roll")}
            />
          )}
        </div>
        <div className="task-card-actions">
          <button
            className="button button-zone"
            disabled={
              (isDuel && (!winner || !opponent)) ||
              (isRisk && game.die === null)
            }
            onClick={() => {
              sound("success");
              dispatch({ type: "COMPLETE", winnerId: winner || undefined });
            }}
          >
            <Icon name="check" size={19} />
            {isRisk
              ? "Завершить ход"
              : isDuel
                ? "Засчитать победу"
                : "Выполнено"}
          </button>
          {(!isRisk || game.die === null) && (
            <button
              className="button button-subtle"
              onClick={() => dispatch({ type: "SKIP" })}
            >
              Пропустить
            </button>
          )}
        </div>
        <p className="task-footer">
          {isRisk && game.die !== null
            ? "Бросок сохранён. Результат применится при завершении хода."
            : "Любое задание можно пропустить. Без объяснений и штрафов."}
        </p>
      </section>
    </div>
  );
}
