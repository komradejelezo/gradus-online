import { useState, type CSSProperties } from "react";
import { AVATARS, COLORS } from "../data/zones";
import type { Player } from "../game/types";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";
export function makePlayer(index: number): Player {
  return {
    id: crypto.randomUUID(),
    name: "",
    color: COLORS[index % COLORS.length],
    avatar: AVATARS[index % AVATARS.length],
    score: 0,
    zone: null,
    completed: 0,
    wins: 0,
    risks: 0,
  };
}
export function PlayerSetup({
  initial,
  onStart,
  onBack,
}: {
  initial?: Player[];
  onStart: (players: Player[]) => void;
  onBack: () => void;
}) {
  const [players, setPlayers] = useState<Player[]>(
    () =>
      initial?.map((p) => ({ ...p })) ??
      Array.from({ length: 3 }, (_, i) => makePlayer(i)),
  );
  const [error, setError] = useState("");
  function update(id: string, patch: Partial<Player>) {
    setPlayers((list) =>
      list.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
    setError("");
  }
  const names = players.map((p) => p.name.trim().toLocaleLowerCase("ru"));
  function start() {
    if (players.some((p) => !p.name.trim())) {
      setError("Как зовут каждого? Заполните все имена.");
      return;
    }
    if (new Set(names).size !== players.length) {
      setError(
        "Выберите разные имена или добавьте прозвища — так проще следить за ходами.",
      );
      return;
    }
    onStart(players);
  }
  return (
    <main className="setup-screen page-enter">
      <button className="text-button back-link" onClick={onBack}>
        <Icon name="back" size={18} />В главное меню
      </button>
      <div className="section-heading">
        <div>
          <span className="eyebrow orange">ШАГ 01 / СОБЕРИ СВОИХ</span>
          <h1>
            Кто сегодня <em>зажигает?</em>
          </h1>
          <p>От 3 до 8 человек. Имена настоящие, характеры — любые.</p>
        </div>
        <div className="player-count">
          <strong>{players.length}</strong>
          <span>
            / 8<br />
            ИГРОКОВ
          </span>
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start();
        }}
      >
        <div className="setup-grid">
          {players.map((p, i) => (
            <article
              key={p.id}
              className="setup-player"
              style={{ "--player-color": p.color } as CSSProperties}
            >
              <div className="setup-player-top">
                <span>ИГРОК {String(i + 1).padStart(2, "0")}</span>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() =>
                    setPlayers((list) => list.filter((q) => q.id !== p.id))
                  }
                  disabled={players.length <= 3}
                  aria-label={`Удалить игрока ${i + 1}`}
                  title={
                    players.length <= 3
                      ? "Нужно минимум 3 игрока"
                      : "Удалить игрока"
                  }
                >
                  <Icon name="close" size={18} />
                </button>
              </div>
              <div className="setup-avatar">
                <Avatar avatar={p.avatar} color={p.color} size={100} />
                <div className="avatar-halo" />
              </div>
              <label className="sr-only" htmlFor={`name-${p.id}`}>
                Имя игрока {i + 1}
              </label>
              <input
                id={`name-${p.id}`}
                placeholder={`Как тебя зовут?`}
                value={p.name}
                maxLength={20}
                autoComplete="off"
                onChange={(e) => update(p.id, { name: e.target.value })}
              />
              <div
                className="avatar-options"
                role="group"
                aria-label={`Персонаж игрока ${i + 1}`}
              >
                {AVATARS.map((a, j) => (
                  <button
                    type="button"
                    key={a}
                    className={p.avatar === a ? "selected" : ""}
                    aria-label={
                      ["Инопланетянин", "Кот", "Привидение", "Робот"][j]
                    }
                    aria-pressed={p.avatar === a}
                    onClick={() => update(p.id, { avatar: a })}
                  >
                    <Avatar
                      avatar={a}
                      color={p.avatar === a ? p.color : "#777286"}
                      size={31}
                    />
                  </button>
                ))}
              </div>
              <div
                className="color-options"
                role="group"
                aria-label={`Цвет игрока ${i + 1}`}
              >
                {COLORS.map((color, j) => (
                  <button
                    type="button"
                    key={color}
                    style={{ background: color }}
                    aria-label={`Цвет ${["оранжевый", "фиолетовый", "голубой", "салатовый", "розовый", "жёлтый", "мятный", "сиреневый"][j]}`}
                    aria-pressed={p.color === color}
                    onClick={() => update(p.id, { color })}
                  >
                    {p.color === color && <Icon name="check" size={14} />}
                  </button>
                ))}
              </div>
            </article>
          ))}
          {players.length < 8 && (
            <button
              type="button"
              className="add-player"
              onClick={() => {
                const used = new Set(players.map((p) => p.color));
                const player = makePlayer(players.length);
                player.color = COLORS.find((c) => !used.has(c)) ?? player.color;
                setPlayers([...players, player]);
              }}
            >
              <span>
                <Icon name="plus" size={30} />
              </span>
              <b>Ещё один свой</b>
              <small>Добавить игрока</small>
            </button>
          )}
        </div>
        <div className="setup-bottom">
          <div>
            <p className="setup-note">
              <Icon name="info" size={18} />
              Порядок карточек — порядок ходов. Первый игрок начинает.
            </p>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <button className="button button-primary button-xl" type="submit">
            Начать вечеринку
            <Icon name="arrow" />
          </button>
        </div>
      </form>
    </main>
  );
}
