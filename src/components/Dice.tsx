import { useEffect, useRef, useState } from "react";
import { rollDie } from "../game/audio";
import { Icon } from "./Icon";
const positions: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};
export function Dice({
  value,
  onRoll,
  reducedMotion,
  sound,
}: {
  value: number | null;
  onRoll: (value: number) => void;
  reducedMotion: boolean;
  sound: () => void;
}) {
  const [rolling, setRolling] = useState(false);
  const [face, setFace] = useState(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frame = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (frame.current) clearInterval(frame.current);
    },
    [],
  );
  function roll() {
    if (rolling || value !== null) return;
    sound();
    // Commit immediately: refreshing during the animation must not permit another roll.
    const result = rollDie();
    onRoll(result);
    if (reducedMotion) {
      setFace(result);
      return;
    }
    setRolling(true);
    frame.current = setInterval(() => setFace((f) => (f % 6) + 1), 70);
    timer.current = setTimeout(() => {
      if (frame.current) clearInterval(frame.current);
      setFace(result);
      setRolling(false);
    }, 850);
  }
  const shown = rolling ? face : (value ?? 1);
  return (
    <div className="dice-block">
      <div
        className={`dice ${rolling ? "dice-rolling" : ""} ${value !== null && !rolling ? (value >= 4 ? "dice-won" : "dice-lost") : ""}`}
        aria-label={
          rolling
            ? "Кубик вращается"
            : value
              ? `Выпало ${value}`
              : "Шестигранный кубик"
        }
      >
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            className={positions[shown].includes(i) ? "pip visible" : "pip"}
          />
        ))}
      </div>
      {value === null ? (
        <>
          <button className="button button-zone" onClick={roll}>
            <Icon name="dice" />
            Бросить кубик
          </button>
          <small>4–6 → +4 очка · 1–3 → −2 очка</small>
        </>
      ) : (
        <div className="dice-result" role="status">
          {rolling ? (
            "Фортуна думает…"
          ) : (
            <>
              <strong>
                {value >= 4
                  ? "+4 очка. Вот это удача!"
                  : "−2 очка. В следующий раз!"}
              </strong>
              <span>Выпало {value} · Градус +5%</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
