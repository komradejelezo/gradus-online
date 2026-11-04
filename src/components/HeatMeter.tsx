import { heatLabel } from "../game/engine";
import { Icon } from "./Icon";
export function HeatMeter({
  heat,
  demo = false,
}: {
  heat: number;
  demo?: boolean;
}) {
  return (
    <div
      className={`heat-meter ${heat > 80 ? "boiling" : ""}`}
      role="meter"
      aria-label="Градус вечеринки"
      aria-valuenow={heat}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg className="meter-ring" viewBox="0 0 180 180" aria-hidden="true">
        <circle
          cx="90"
          cy="90"
          r="79"
          fill="#15141e"
          stroke="#323039"
          strokeWidth="2"
        />
        <circle
          cx="90"
          cy="90"
          r="71"
          fill="none"
          stroke="#ff804a"
          strokeOpacity=".1"
          strokeWidth="7"
        />
        <circle
          cx="90"
          cy="90"
          r="71"
          fill="none"
          stroke="#ff804a"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="446.1"
          strokeDashoffset={446.1 * (1 - (demo ? 0.28 : heat / 100))}
          transform="rotate(-90 90 90)"
          className="heat-progress"
        />
      </svg>
      <div className="meter-value">
        {demo ? (
          <>
            <Icon name="bolt" size={36} />
            <span className="demo-meter-title">
              ТВОЙ
              <br />
              ВЕЧЕР
            </span>
          </>
        ) : (
          <>
            <span className="heat-number">
              {heat}
              <sup>%</sup>
            </span>
            <span className="heat-state">{heatLabel(heat)}</span>
          </>
        )}
      </div>
      <span className="meter-caption">
        {demo ? "ЗАЖИГАЙ ПО СВОИМ ПРАВИЛАМ" : "ГРАДУСОМЕТР"}
      </span>
    </div>
  );
}
