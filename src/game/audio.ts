let context: AudioContext | undefined;
export function playSound(
  enabled: boolean,
  kind: "click" | "success" | "roll" | "final" = "click",
) {
  if (!enabled) return;
  try {
    context ??= new AudioContext();
    const ctx = context;
    void ctx.resume().catch(() => {});
    const tones =
      kind === "final"
        ? [392, 494, 587, 784]
        : kind === "success"
          ? [440, 660]
          : kind === "roll"
            ? [180, 240, 320]
            : [420];
    tones.forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + index * 0.09;
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.05, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.17);
    });
  } catch {
    /* Sound is optional if the browser has no AudioContext. */
  }
}
export function rollDie(): number {
  const data = new Uint32Array(1);
  // Reject the incomplete tail so all six outcomes have the same probability.
  do {
    crypto.getRandomValues(data);
  } while (data[0] >= 4294967292);
  return (data[0] % 6) + 1;
}
