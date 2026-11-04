import type { CSSProperties } from "react";
import { playerTitle, ranking, winners } from "../game/engine";
import type { GameState } from "../game/types";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";
export function Results({
  game,
  onReplay,
  onMenu,
}: {
  game: GameState;
  onReplay: () => void;
  onMenu: () => void;
}) {
  const leaders = winners(game.players),
    sorted = ranking(game.players);
  return (
    <main className="results-screen page-enter">
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 36 }, (_, i) => (
          <i
            key={i}
            style={
              {
                "--x": `${(i * 37) % 100}%`,
                "--delay": `${-(i % 9)}s`,
                "--rotation": `${i * 31}deg`,
                background: ["#ff804a", "#a58aff", "#51d9f4", "#c8f276"][i % 4],
              } as CSSProperties
            }
          />
        ))}
      </div>
      <span className="eyebrow orange">ЭТОТ ВЕЧЕР УЖЕ В ИСТОРИИ</span>
      <div className="results-trophy">
        <Icon name="trophy" size={54} />
      </div>
      <h1>
        {leaders.length === 1
          ? "У нас есть легенда."
          : "Легенд много не бывает."}
      </h1>
      <p className="winner-names">{leaders.map((p) => p.name).join(" + ")}</p>
      <p className="results-subtitle">
        {leaders.length > 1
          ? "Общая победа. Одинаковое количество очков."
          : "Победитель вечеринки. Компания подтверждает."}
      </p>
      <div className="results-list">
        {sorted.map((p, i) => {
          const place = sorted.findIndex((q) => q.score === p.score) + 1;
          const won = leaders.some((l) => l.id === p.id);
          return (
            <div
              key={p.id}
              className={`result-row ${won ? "result-winner" : ""}`}
              style={{ "--player-color": p.color } as CSSProperties}
            >
              <span className="result-place">
                {won ? (
                  <Icon name="trophy" size={21} />
                ) : (
                  String(place).padStart(2, "0")
                )}
              </span>
              <Avatar avatar={p.avatar} color={p.color} size={52} />
              <div>
                <b>{p.name}</b>
                <span>{playerTitle(p, won)}</span>
              </div>
              <strong>
                {p.score}
                <small>ОЧКОВ</small>
              </strong>
              <span className="sr-only">
                Место {place}, игрок {i + 1}
              </span>
            </div>
          );
        })}
      </div>
      <div className="results-actions">
        <button className="button button-primary button-xl" onClick={onReplay}>
          Сыграть ещё раз
          <Icon name="arrow" />
        </button>
        <button className="button button-ghost" onClick={onMenu}>
          В главное меню
        </button>
      </div>
      <p className="small-muted">
        Вы выполнили {game.players.reduce((n, p) => n + p.completed, 0)}{" "}
        заданий. Но главное — как вы это сделали.
      </p>
    </main>
  );
}
