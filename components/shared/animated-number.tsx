"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";

type AnimatedNumberProps = {
  value: number;
  /** Appended after the number, e.g. "%". */
  suffix?: string;
  className?: string;
  duration?: number;
};

/** Counts smoothly toward `value` whenever it changes. */
export function AnimatedNumber({
  value,
  suffix = "",
  className,
  duration = 1.4,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [motionValue, value, duration]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
