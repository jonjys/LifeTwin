"use client";

import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

/** Soft cross-route transition — every page eases in, never snaps. */
export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
