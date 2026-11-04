import { Arena } from "./Arena";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";
export function MainMenu({
  onStart,
  onContinue,
  onRules,
  hasSave,
}: {
  onStart: () => void;
  onContinue: () => void;
  onRules: () => void;
  hasSave: boolean;
}) {
  return (
    <main className="main-menu">
      <div className="menu-topline">
        <span className="eyebrow">
          <span className="live-dot" /> ВЕЧЕРИНКА НАЧИНАЕТСЯ ЗДЕСЬ
        </span>
        <span className="small-muted">ОДИН ЭКРАН. ВСЯ КОМПАНИЯ.</span>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-edition">
            <span>PARTY GAME</span>
            <span>18+</span>
          </div>
          <h1>
            ГРАДУС
            <span className="outline-word">
              ONLINE<span className="title-star">✳</span>
            </span>
          </h1>
          <p className="hero-tagline">Повышаем градус вечеринки!</p>
          <p className="hero-description">
            Собери своих. Выбирай зону. Принимай вызов.
            <br />
            Этот вечер станет вашей общей историей.
          </p>
          <div className="hero-actions">
            <button
              className="button button-primary button-xl"
              onClick={hasSave ? onContinue : onStart}
            >
              <Icon name="play" size={21} />
              {hasSave ? "Продолжить игру" : "Начать игру"}
              <Icon name="arrow" />
            </button>
            {hasSave ? (
              <button className="button button-ghost" onClick={onStart}>
                Новая игра
              </button>
            ) : (
              <button className="text-button" onClick={onRules}>
                <span className="round-question">?</span>Как это работает
              </button>
            )}
          </div>
          <div className="hero-company">
            <div className="avatar-stack">
              {(["alien", "cat", "ghost", "robot"] as const).map((a, i) => (
                <span
                  key={a}
                  style={{
                    background: ["#35251f", "#2d2640", "#20333b", "#303824"][i],
                  }}
                >
                  <Avatar
                    avatar={a}
                    color={["#ff804a", "#a58aff", "#51d9f4", "#c8f276"][i]}
                    size={30}
                  />
                </span>
              ))}
            </div>
            <div>
              <b>Лучше вместе</b>
              <span>3–8 друзей · 20–40 минут</span>
            </div>
          </div>
        </div>
        <div className="hero-world">
          <div className="world-label">
            <span>ИНТЕРАКТИВНАЯ АРЕНА</span>
            <span>01 — 05</span>
          </div>
          <Arena demo />
        </div>
      </section>
      <section className="menu-features" aria-label="Об игре">
        <div>
          <span className="feature-icon orange">
            <Icon name="fire" size={26} />
          </span>
          <div>
            <h3>50 поводов зажечь</h3>
            <p>Откровения, дуэли и немного хаоса</p>
          </div>
          <span className="feature-number">01</span>
        </div>
        <div>
          <span className="feature-icon purple">
            <Icon name="people" size={26} />
          </span>
          <div>
            <h3>Все здесь и сейчас</h3>
            <p>Один экран. Никаких регистраций.</p>
          </div>
          <span className="feature-number">02</span>
        </div>
        <div>
          <span className="feature-icon cyan">
            <Icon name="bolt" size={26} />
          </span>
          <div>
            <h3>Дойди до точки кипения</h3>
            <p>Зарабатывай очки и забирай победу</p>
          </div>
          <span className="feature-number">03</span>
        </div>
      </section>
      <footer className="menu-footer">
        <span>СОЗДАНО ДЛЯ ЖИВОГО ОБЩЕНИЯ</span>
        <span>Градус — это настроение. Напитки необязательны.</span>
        <span>v0.1 / ПЕРВАЯ ВЕЧЕРИНКА</span>
      </footer>
    </main>
  );
}
