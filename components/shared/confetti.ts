import confetti from "canvas-confetti";

const BRAND_COLORS = ["#00E8FF", "#00FF88", "#FFFFFF", "#4D5AFF"];

/** Celebration burst fired on a rewarding user action. */
export function celebrate(origin?: { x: number; y: number }) {
  const base = {
    colors: BRAND_COLORS,
    disableForReducedMotion: true,
    origin: origin ?? { x: 0.5, y: 0.6 },
  };

  confetti({ ...base, particleCount: 90, spread: 75, startVelocity: 42 });
  window.setTimeout(() => {
    confetti({ ...base, particleCount: 50, spread: 100, startVelocity: 32, scalar: 0.8 });
  }, 200);
  window.setTimeout(() => {
    confetti({ ...base, particleCount: 30, spread: 130, startVelocity: 24, scalar: 0.6 });
  }, 420);
}
