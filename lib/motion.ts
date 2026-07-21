import type { Transition } from "framer-motion";

/** The one easing curve used everywhere — calm, decelerating, Apple-like. */
export const EASE: Transition["ease"] = [0.22, 1, 0.36, 1];

/** Standard entrance for sections and cards. */
export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: EASE },
});
