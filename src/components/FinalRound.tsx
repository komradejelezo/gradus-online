import { useEffect } from "react";
import type { GameAction, GameState } from "../game/types";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";
export function FinalRound({
  game,
  dispatch,
  sound,
}: {
  game: GameState;
  dispatch: (action: GameAction) => void;
  sound: () => void;
}) {
  useEffect(() => {
    if (game.phase === "final-intro") sound();
  }, [game.phase]); // Sound is best-effort; never changes game state.
  const active = game.players.find(
    (p) => p.id === game.finalOrder[game.finalIndex],
  )!;
  const card = game.finalCards[game.finalIndex];
  return (
    <main className="final-screen page-enter">
      <div className="final-glow" />
      <span className="eyebrow orange">
        <Icon name="fire" size={18} /> ГРАДУСОМЕТР: 100%
      </span>
      {game.phase === "final-intro" ? (
        <>
          <div className="final-emblem">
            <Icon name="bolt" size={68} />
          </div>
          <h1>
            ТОЧКА
            <br />
            <em>КИПЕНИЯ.</em>
          </h1>
          <p className="final-subtitle">
            Вы разогнали этот вечер до максимума.
            <br />
            Теперь — по одному последнему вызову для каждого.
          </p>
          <div className="final-rules">
            <span>
              <strong>1</strong>задание каждому
            </span>
            <span>
              <strong>+5</strong>очков за выполнение
            </span>
            <span>
              <strong>∞</strong>историй на память
            </span>
          </div>
          <button
            className="button button-primary button-xl"
            onClick={() => dispatch({ type: "START_FINAL" })}
          >
            Начать финальный раунд
            <Icon name="arrow" />
          </button>
        </>
      ) : (
        <>
          <div className="final-round-counter">
            ФИНАЛЬНЫЙ ВЫЗОВ {game.finalIndex + 1} / {game.players.length}
          </div>
          <div className="final-player">
            <Avatar avatar={active.avatar} color={active.color} size={74} />
            <h1>{active.name}</h1>
            <span>Твой последний выход. Сделай его легендарным.</span>
          </div>
          <section className="final-task task-card card-revealed">
            <div className="task-card-bar">
              <span>
                <Icon name="flag" size={18} />
                Финальный раунд
              </span>
              <span>+5 ОЧКОВ</span>
            </div>
            <div className="task-card-main">
              <h2>{card.title}</h2>
              <p className="task-text">{card.text}</p>
            </div>
            <div className="task-card-actions">
              <button
                className="button button-primary"
                onClick={() => {
                  sound();
                  dispatch({ type: "FINAL_COMPLETE", completed: true });
                }}
              >
                <Icon name="check" />
                Выполнено · +5
              </button>
              <button
                className="button button-subtle"
                onClick={() =>
                  dispatch({ type: "FINAL_COMPLETE", completed: false })
                }
              >
                Пропустить
              </button>
            </div>
          </section>
          <div className="final-dots">
            {game.finalOrder.map((id, i) => (
              <span
                key={id}
                className={
                  i < game.finalIndex
                    ? "done"
                    : i === game.finalIndex
                      ? "current"
                      : ""
                }
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
