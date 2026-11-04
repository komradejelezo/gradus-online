import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { COLORS, ZONES } from "../data/zones";
import { createGame, transition } from "../game/engine";
import { ZONE_IDS, type GameState, type Player } from "../game/types";
import { MainMenu } from "./MainMenu";
import { PlayerSetup } from "./PlayerSetup";
import { GameScreen } from "./GameScreen";
import { FinalRound } from "./FinalRound";
import { Results } from "./Results";
const noop = () => {};
const group: Player[] = Array.from({ length: 8 }, (_, i) => ({
  id: `player-${i}`,
  name: `Друг ${i + 1}`,
  avatar: i % 2 ? "ghost" : "cat",
  color: COLORS[i],
  score: 0,
  zone: null,
  completed: 0,
  wins: 0,
  risks: 0,
}));
const settings = { sound: false, reducedMotion: true };
describe("screen rendering smoke checks", () => {
  it("renders the menu with start, rules and all five arena zones", () => {
    const markup = renderToStaticMarkup(
      <MainMenu
        onStart={noop}
        onContinue={noop}
        onRules={noop}
        hasSave={false}
      />,
    );
    expect(markup).toContain("Начать игру");
    expect(markup).toContain("Повышаем градус вечеринки!");
    for (const id of ZONE_IDS)
      expect(markup).toContain(ZONES[id].name.toLocaleUpperCase("ru"));
  });
  it("renders continue only with an existing save", () =>
    expect(
      renderToStaticMarkup(
        <MainMenu onStart={noop} onContinue={noop} onRules={noop} hasSave />,
      ),
    ).toContain("Продолжить игру"));
  it("renders eight player editors with no ninth-player button", () => {
    const markup = renderToStaticMarkup(
      <PlayerSetup initial={group} onStart={noop} onBack={noop} />,
    );
    expect(markup.match(/Как тебя зовут/g)).toHaveLength(8);
    expect(markup).not.toContain("Добавить игрока");
    expect(markup).toContain("Начать вечеринку");
  });
  it.each(ZONE_IDS)("renders a playable %s card and eight players", (zone) => {
    let game = createGame(group);
    game = {
      ...game,
      choices: [zone, ...ZONE_IDS.filter((z) => z !== zone).slice(0, 2)],
    };
    game = transition(transition(game, { type: "SELECT_ZONE", zone }), {
      type: "ARRIVE",
    });
    const markup = renderToStaticMarkup(
      <GameScreen
        game={game}
        dispatch={noop}
        settings={settings}
        sound={noop}
      />,
    );
    expect(markup).toContain(game.card!.title);
    expect(markup).toContain("Пропустить");
    for (const p of group) expect(markup).toContain(p.name);
  });
  it("renders the final intro, final task, and tied results without exceptions", () => {
    let game: GameState = createGame(group);
    game.heat = 95;
    game.choices = ["company", "risk", "duel"];
    game = transition(
      transition(transition(game, { type: "SELECT_ZONE", zone: "company" }), {
        type: "ARRIVE",
      }),
      { type: "COMPLETE" },
    );
    expect(
      renderToStaticMarkup(
        <FinalRound game={game} dispatch={noop} sound={noop} />,
      ),
    ).toContain("КИПЕНИЯ.");
    game = transition(game, { type: "START_FINAL" });
    expect(
      renderToStaticMarkup(
        <FinalRound game={game} dispatch={noop} sound={noop} />,
      ),
    ).toContain(game.finalCards[0].title);
    while (game.phase === "final")
      game = transition(game, { type: "FINAL_COMPLETE", completed: true });
    const tied = {
      ...game,
      players: game.players.map((p) => ({ ...p, score: 10 })),
    };
    const markup = renderToStaticMarkup(
      <Results game={tied} onReplay={noop} onMenu={noop} />,
    );
    expect(markup).toContain("Легенд много не бывает.");
    expect(markup).toContain("Сыграть ещё раз");
  });
});
