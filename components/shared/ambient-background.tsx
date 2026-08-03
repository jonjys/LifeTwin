"use client";

import { motion } from "framer-motion";

/** Slow-drifting glow orbs behind every screen. Purely decorative. */
export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden"
    >
      <motion.div
        className="absolute -top-40 left-1/4 size-[560px] rounded-full bg-primary/[0.07] blur-[140px]"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-48 right-1/5 size-[480px] rounded-full bg-success/[0.05] blur-[140px]"
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-32 size-[420px] rounded-full bg-[#4D5AFF]/[0.06] blur-[140px]"
        animate={{ y: [0, 50, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
