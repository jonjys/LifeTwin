"use client";

import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

type ScoreRingProps = {
  /** 0–100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  /** Breathing ambient glow behind the ring (dashboard hero only). */
  glow?: boolean;
  children?: React.ReactNode;
};

/** Circular progress ring with a glowing animated arc. */
export function ScoreRing({
  value,
  size = 220,
  strokeWidth = 10,
  glow = false,
  children,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {glow && (
        <div
          aria-hidden
          className="absolute inset-6 animate-pulse-slow rounded-full bg-primary/15 blur-2xl"
        />
      )}
      <svg width={size} height={size} className="relative -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1F1F29"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: circumference * (1 - value / 100),
          }}
          transition={{ duration: 1.6, ease: EASE }}
          style={{ filter: "drop-shadow(0 0 12px rgba(0, 232, 255, 0.5))" }}
        />
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E8FF" />
            <stop offset="100%" stopColor="#00FF88" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
