import type { CSSProperties } from "react";
const shapes: Record<string, React.ReactNode> = {
  bolt: <path d="m13 2-9 12h7l-1 8 10-13h-8l1-7Z" />,
  fire: (
    <path d="M12 3c1 5-5 6-5 11a5 5 0 0 0 10 0c0-2-1-3-2-4 0 3-2 3-2 3 1-4 0-7-1-10Z" />
  ),
  swords: (
    <>
      <path d="m4 3 5 1 11 13-3 3L5 8 4 3Zm16 0-5 1-4 5m-3 4-4 4 3 3 4-4M3 15l6 6m6-6 6 6M3 21l3-3m12 0 3 3" />
    </>
  ),
  people: (
    <>
      <circle cx="12" cy="7" r="3" />
      <path d="M6 21v-3a6 6 0 0 1 12 0v3M18 5a3 3 0 0 1 0 6m3 9v-3a5 5 0 0 0-2-4M6 5a3 3 0 0 0 0 6M3 20v-3a5 5 0 0 1 2-4" />
    </>
  ),
  dice: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path
        d="M7.5 7.5h.01m9 0h.01m-9 9h.01m9 0h.01m-4.5-4.5h.01"
        strokeWidth="3"
      />
    </>
  ),
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  play: <path d="m9 5 11 7-11 7V5Z" />,
  sound: (
    <>
      <path d="m11 4-6 5H2v6h3l6 5V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />
    </>
  ),
  mute: (
    <>
      <path d="m11 4-6 5H2v6h3l6 5V4Zm5 5 6 6m0-6-6 6" />
    </>
  ),
  settings: (
    <>
      <path d="m10 3-1 3-3 1-3-1-2 4 3 2v3l-1 3 4 2 2-2h3l3 2 4-3-1-3 1-3 3-1-1-4-3-1-2-3-3 1-3-1Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  close: <path d="m6 6 12 12M6 18 18 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  back: <path d="M20 12H5m6-6-6 6 6 6" />,
  trophy: (
    <>
      <path d="M7 3h10v6a5 5 0 0 1-10 0V3Zm0 2H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 2v5m-4 2h8" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6m0-10h.01" />
    </>
  ),
  flag: (
    <>
      <path d="M5 22V3m0 1c5-4 9 4 15 0v10c-6 4-10-4-15 0" />
    </>
  ),
  expand: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />,
};
export function Icon({
  name,
  size = 22,
  style,
  className = "",
}: {
  name: string;
  size?: number;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
      className={className}
    >
      {shapes[name] ?? shapes.bolt}
    </svg>
  );
}
