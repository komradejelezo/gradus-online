import type { CSSProperties } from "react";
import { ZONES } from "../data/zones";
import { heatLabel } from "../game/engine";
import type { GameAction, GameState, Settings } from "../game/types";
import { Arena } from "./Arena";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";
import { TaskCard } from "./TaskCard";
export function GameScreen({
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
  const active = game.players[game.current];
  const choose = (zone: (typeof game.choices)[number]) => {
    sound();
    dispatch({ type: "SELECT_ZONE", zone });
  };
  return (
    <main className="game-screen page-enter">
      <div className="game-topline">
        <div className="game-mode">
          <span className="live-dot" />
          ВЕЧЕРИНКА В РАЗГАРЕ
          <span className="topline-divider" />
          ХОД {String(game.turn).padStart(2, "0")}
        </div>
        <span className="small-muted">
          {heatLabel(game.heat).toLocaleUpperCase("ru")} · ГРАДУС {game.heat}%
        </span>
      </div>
      <div className="game-layout">
        <aside className="players-panel">
          <div className="panel-label">
            ВАША КОМПАНИЯ<span>{game.players.length}</span>
          </div>
          <div className="players-list">
            {game.players.map((p, i) => (
              <div
                key={p.id}
                className={`player-row ${i === game.current ? "active-player" : ""}`}
                style={{ "--player-color": p.color } as CSSProperties}
              >
                <div className="player-avatar">
                  <Avatar avatar={p.avatar} color={p.color} size={43} />
                </div>
                <div className="player-row-name">
                  <b>{p.name}</b>
                  <span>
                    {i === game.current
                      ? "Сейчас твой ход"
                      : p.zone
                        ? ZONES[p.zone].name
                        : "Готов к игре"}
                  </span>
                </div>
                <strong className="player-score">
                  {p.score}
                  <small>ОЧК.</small>
                </strong>
              </div>
            ))}
          </div>
          <div className="party-progress">
            <div>
              <Icon name="fire" size={18} />
              <span>До точки кипения</span>
              <b>{game.heat}%</b>
            </div>
            <div className="linear-heat">
              <i style={{ width: `${game.heat}%` }} />
            </div>
            <p>На 100% каждый получит по одному финальному заданию.</p>
          </div>
          {game.effects.length > 0 && (
            <div className="chaos-effects">
              <span className="panel-label cyan">
                <Icon name="bolt" size={15} /> ХАОС АКТИВЕН
              </span>
              {game.effects.map((effect) => (
                <div className="chaos-effect" key={effect.id}>
                  <p>{effect.text}</p>
                  <span>Осталось ходов: {effect.remaining}</span>
                </div>
              ))}
            </div>
          )}
          <div className="sidebar-tip">
            <span>МАЛЕНЬКОЕ НАПОМИНАНИЕ</span>
            <p>Здесь нет неправильных ответов. Есть хорошие истории.</p>
          </div>
        </aside>
        <section className="game-world">
          <div className="turn-heading">
            <div className="turn-avatar">
              <Avatar avatar={active.avatar} color={active.color} size={54} />
            </div>
            <div>
              <span className="eyebrow">ТВОЙ ВЫХОД</span>
              <h1>
                {active.name},{" "}
                {game.phase === "choose"
                  ? "куда отправимся?"
                  : game.phase === "moving"
                    ? "вперёд!"
                    : "время зажигать!"}
              </h1>
            </div>
            <span className="turn-tag">
              {game.phase === "choose" ? "ВЫБЕРИ 1 ИЗ 3 ЗОН" : "ПРИМИ ВЫЗОВ"}
            </span>
          </div>
          <div className="game-arena-wrap">
            <Arena
              players={game.players}
              activeId={active.id}
              choices={game.phase === "choose" ? game.choices : []}
              onChoose={game.phase === "choose" ? choose : undefined}
              heat={game.heat}
              moving={game.phase === "moving"}
            />
            {game.phase === "card" && (
              <TaskCard
                key={game.card!.id + game.turn}
                game={game}
                dispatch={dispatch}
                settings={settings}
                sound={sound}
              />
            )}
          </div>
          {game.phase === "choose" ? (
            <div className="zone-choices">
              {game.choices.map((z) => (
                <button
                  key={z}
                  className="zone-choice"
                  onClick={() => choose(z)}
                  style={{ "--zone-color": ZONES[z].color } as CSSProperties}
                >
                  <span className="choice-icon">
                    <Icon name={ZONES[z].icon} size={26} />
                  </span>
                  <div>
                    <b>{ZONES[z].name}</b>
                    <span>{ZONES[z].reward}</span>
                  </div>
                  <Icon name="arrow" size={19} />
                </button>
              ))}
            </div>
          ) : (
            <div className="stage-instruction">
              <span className="live-dot" />
              {game.phase === "moving"
                ? "Персонаж отправляется в выбранную зону…"
                : "Выполните задание вместе и подтвердите результат."}
            </div>
          )}
          <div className="game-event" role="status">
            {game.lastEvent ??
              "Первая история этого вечера начинается прямо сейчас."}
          </div>
        </section>
      </div>
    </main>
  );
}
