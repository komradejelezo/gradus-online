import type { AvatarId } from "../game/types";
export function Avatar({
  avatar = "alien",
  color = "#ff804a",
  size = 48,
}: {
  avatar?: AvatarId;
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 72"
      fill="none"
      aria-hidden="true"
      className="avatar-svg"
    >
      <ellipse cx="32" cy="66" rx="19" ry="5" fill={color} opacity=".2" />
      <path
        d="M22 48v13m20-13v13"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <rect x="16" y="31" width="32" height="24" rx="12" fill={color} />
      <path
        d="m17 37-7 9m37-9 7 9"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
      />
      {avatar === "cat" ? (
        <>
          <path d="M13 29 14 7l15 11h7L51 7l1 22Z" fill={color} />
          <rect x="13" y="17" width="39" height="27" rx="13" fill={color} />
          <path
            d="m20 27 6 3-6 2m24-5-6 3 6 2m-15 4 3 2 3-2"
            stroke="#14141d"
            strokeWidth="2.5"
          />
        </>
      ) : avatar === "ghost" ? (
        <>
          <path
            d="M12 40V25a20 20 0 0 1 40 0v20l-10-5-10 5-10-5-10 5Z"
            fill={color}
          />
          <ellipse cx="25" cy="26" rx="3" ry="5" fill="#14141d" />
          <ellipse cx="40" cy="26" rx="3" ry="5" fill="#14141d" />
          <circle cx="32" cy="36" r="3" fill="#14141d" />
        </>
      ) : avatar === "robot" ? (
        <>
          <path
            d="M32 8V3m-19 19H8v12h5m38-12h5v12h-5"
            stroke={color}
            strokeWidth="4"
          />
          <rect x="12" y="10" width="40" height="34" rx="10" fill={color} />
          <rect x="18" y="18" width="28" height="15" rx="5" fill="#14141d" />
          <path d="M23 24h3m12 0h3m-16 14h14" stroke={color} strokeWidth="3" />
        </>
      ) : (
        <>
          <path
            d="m23 16-7-9m25 9 7-9"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="15" cy="6" r="3" fill={color} />
          <circle cx="49" cy="6" r="3" fill={color} />
          <ellipse cx="32" cy="28" rx="21" ry="18" fill={color} />
          <ellipse
            cx="23"
            cy="27"
            rx="5"
            ry="7"
            transform="rotate(-22 23 27)"
            fill="#14141d"
          />
          <ellipse
            cx="42"
            cy="27"
            rx="5"
            ry="7"
            transform="rotate(22 42 27)"
            fill="#14141d"
          />
          <path
            d="M28 38q4 3 8 0"
            stroke="#14141d"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
      <path d="M21 48h22" stroke="white" strokeOpacity=".2" strokeWidth="2" />
    </svg>
  );
}
