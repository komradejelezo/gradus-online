import { useEffect, useState } from "react";
import { ZONES } from "./data/zones";
import { playSound } from "./game/audio";
import { createGame, transition } from "./game/engine";
import { loadGame, loadSettings, saveGame, SETTINGS_KEY } from "./game/storage";
import { ZONE_IDS, type GameAction, type Player } from "./game/types";
import { FinalRound } from "./components/FinalRound";
import { GameScreen } from "./components/GameScreen";
import { Icon } from "./components/Icon";
import { MainMenu } from "./components/MainMenu";
import { Modal } from "./components/Modal";
import { PlayerSetup } from "./components/PlayerSetup";
import { Results } from "./components/Results";
export default function App() {
  const [snapshot] = useState(() => loadGame());
  const [game, setGame] = useState(snapshot.game);
  const [screen, setScreen] = useState<"menu" | "setup" | "game">(() =>
    snapshot.game ? "game" : "menu",
  );
  const [settings, setSettings] = useState(loadSettings);
  const [modal, setModal] = useState<"rules" | "settings" | null>(null);
  const [saved, setSaved] = useState(true);
  const [notice, setNotice] = useState(snapshot.warning);
  const [replay, setReplay] = useState(false);
  const sound = (kind: "click" | "success" | "roll" | "final" = "click") =>
    playSound(settings.sound, kind);
  const dispatch = (action: GameAction) =>
    setGame((previous) => (previous ? transition(previous, action) : null));
  useEffect(() => {
    if (game) setSaved(saveGame(game));
  }, [game]);
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      setNotice(
        "Настройки действуют до закрытия страницы: хранилище браузера недоступно.",
      );
    }
  }, [settings]);
  useEffect(() => {
    document.documentElement.dataset.motion = settings.reducedMotion
      ? "reduced"
      : "full";
  }, [settings.reducedMotion]);
  useEffect(() => {
    if (game?.phase !== "moving" || screen !== "game") return;
    const timer = setTimeout(
      () => dispatch({ type: "ARRIVE" }),
      settings.reducedMotion ? 40 : 800,
    );
    return () => clearTimeout(timer);
  }, [game?.phase, screen, settings.reducedMotion]);
  function start(players: Player[]) {
    sound("success");
    setGame(createGame(players));
    setScreen("game");
  }
  function setup(again = false) {
    sound();
    setReplay(again);
    setScreen("setup");
  }
  function home() {
    setScreen("menu");
    sound();
  }
  return (
    <div
      data-heat={
        game
          ? game.heat <= 30
            ? "warm"
            : game.heat <= 60
              ? "party"
              : game.heat <= 80
                ? "hot"
                : game.heat < 100
                  ? "mad"
                  : "boil"
          : "warm"
      }
      className={`app ${screen === "game" && game && game.heat > 80 ? "hot-atmosphere" : ""}`}
    >
      <div className="noise" aria-hidden="true" />
      <header className="site-header">
        <button
          className="brand"
          onClick={home}
          aria-label="Градус Online — главное меню"
        >
          <span className="brand-symbol">
            <Icon name="bolt" size={24} />
          </span>
          <span>
            ГРАДУС<span className="brand-online">ONLINE</span>
          </span>
          <span className="version-tag">v0.1</span>
        </button>
        <div className="header-right">
          {screen === "game" && (
            <span
              className={`save-status ${!saved ? "save-error" : ""}`}
              role="status"
            >
              <span />
              {saved ? "Партия сохранена" : "Сохранение недоступно"}
            </span>
          )}
          <button className="header-rules" onClick={() => setModal("rules")}>
            <Icon name="info" size={17} />
            <span>Правила</span>
          </button>
          <button
            className={`icon-button ${settings.sound ? "sound-on" : ""}`}
            aria-label={settings.sound ? "Выключить звук" : "Включить звук"}
            aria-pressed={settings.sound}
            onClick={() => {
              setSettings((s) => ({ ...s, sound: !s.sound }));
              playSound(!settings.sound);
            }}
            title={settings.sound ? "Выключить звук" : "Включить звук"}
          >
            <Icon name={settings.sound ? "sound" : "mute"} size={20} />
          </button>
          <button
            className="icon-button"
            onClick={() => setModal("settings")}
            aria-label="Настройки"
            title="Настройки"
          >
            <Icon name="settings" size={20} />
          </button>
        </div>
      </header>
      {notice && (
        <div className="notice" role="status">
          <Icon name="info" size={18} />
          <span>{notice}</span>
          <button
            className="icon-button"
            aria-label="Скрыть уведомление"
            onClick={() => setNotice(null)}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {!saved && screen === "game" && (
        <div className="notice">
          Партия работает, но браузер не разрешает сохранение. Не обновляйте
          страницу до конца игры.
        </div>
      )}
      {screen === "menu" && (
        <MainMenu
          onStart={() => setup()}
          onContinue={() => setScreen("game")}
          onRules={() => setModal("rules")}
          hasSave={!!game}
        />
      )}
      {screen === "setup" && (
        <>
          <PlayerSetup
            key={replay ? "replay" : "new"}
            initial={replay ? game?.players : undefined}
            onStart={start}
            onBack={home}
          />
          {game && (
            <p className="replace-note">
              Текущая партия заменится, когда вы нажмёте «Начать вечеринку».
            </p>
          )}
        </>
      )}
      {screen === "game" &&
        game &&
        (game.phase === "results" ? (
          <Results game={game} onReplay={() => setup(true)} onMenu={home} />
        ) : game.phase === "final-intro" || game.phase === "final" ? (
          <FinalRound
            game={game}
            dispatch={dispatch}
            sound={() => sound("final")}
          />
        ) : (
          <GameScreen
            game={game}
            dispatch={dispatch}
            settings={settings}
            sound={sound}
          />
        ))}
      {modal === "rules" && (
        <Modal
          title="Хороший вечер. Простые правила."
          onClose={() => setModal(null)}
          wide
        >
          <p className="modal-intro">
            3–8 взрослых, один экран и 20–40 минут. Играйте по очереди,
            общайтесь вживую — остальное посчитаем мы.
          </p>
          <div className="rules-steps">
            <div>
              <b>01</b>
              <p>
                <strong>Выбери зону</strong>На каждом ходу доступны 3 разные
                зоны. Персонаж перемещается сам — кубик для этого не нужен.
              </p>
            </div>
            <div>
              <b>02</b>
              <p>
                <strong>Прими вызов</strong>Прочитайте карточку вслух. Выполните
                задание или пропустите его без штрафа. Карточки не повторяются,
                пока не закончится колода.
              </p>
            </div>
            <div>
              <b>03</b>
              <p>
                <strong>Разогрей компанию</strong>За выполнение растёт градус.
                На 100% начинается финал: по одному заданию каждому, +5 очков за
                выполнение.
              </p>
            </div>
          </div>
          <div className="rules-zones">
            {ZONE_IDS.map((id) => (
              <div key={id}>
                <Icon
                  name={ZONES[id].icon}
                  style={{ color: ZONES[id].color }}
                />
                <div>
                  <strong style={{ color: ZONES[id].color }}>
                    {ZONES[id].name}
                    <span>{ZONES[id].reward}</span>
                  </strong>
                  <p>{ZONES[id].description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="rules-detail">
            Дуэль: выберите соперника, а компания определит победителя. Риск:
            4–6 на кубике дают +4 очка, 1–3 отнимают 2. После броска пропуск
            недоступен. Счёт не бывает ниже нуля.
          </p>
          <p className="rules-detail">
            Компания повышает градус на 10%, любое другое завершённое задание —
            на 5%. Пропуск не повышает градус. Временные правила хаоса
            отсчитываются по завершённым ходам, включая пропуски. Побеждает
            самый высокий счёт; при равенстве победа общая.
          </p>
          <div className="rules-note">
            <Icon name="people" />
            <p>
              Комфорт важнее любого задания. Можно не отвечать, менять личные
              детали и играть без алкоголя. Градусометр показывает настроение
              компании.
            </p>
          </div>
          <button
            className="button button-primary modal-done"
            onClick={() => setModal(null)}
          >
            Всё понятно, погнали
            <Icon name="arrow" />
          </button>
        </Modal>
      )}
      {modal === "settings" && (
        <Modal title="Настроим атмосферу" onClose={() => setModal(null)}>
          <p className="modal-intro">Пара настроек — и вы готовы к вечеру.</p>
          <label className="setting-row">
            <span>
              <b>Звуковые эффекты</b>
              <small>Короткие сигналы действий и побед</small>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={settings.sound}
              onChange={(e) => {
                setSettings((s) => ({ ...s, sound: e.target.checked }));
                playSound(e.target.checked, "success");
              }}
            />
          </label>
          <label className="setting-row">
            <span>
              <b>Меньше движения</b>
              <small>Спокойные переходы, без конфетти</small>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={settings.reducedMotion}
              onChange={(e) =>
                setSettings((s) => ({ ...s, reducedMotion: e.target.checked }))
              }
            />
          </label>
          <div className="settings-tip">
            <Icon name="info" />
            <p>
              Партия автоматически сохраняется в этом браузере. Для телевизора
              подключите компьютер по HDMI и включите полноэкранный режим
              браузера клавишей F11.
            </p>
          </div>
          <button
            className="button button-primary modal-done"
            onClick={() => setModal(null)}
          >
            Готово
            <Icon name="check" />
          </button>
        </Modal>
      )}
    </div>
  );
}
