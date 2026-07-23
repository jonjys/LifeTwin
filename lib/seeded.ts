/**
 * Deterministic pseudo-randomness. Same seed → same result, so the same
 * shopping list on the same day always produces the same optimized cart —
 * prices don't jitter on every re-render, only when the day or the list
 * actually changes.
 */

/** Small deterministic string hash (FNV-1a). */
export function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic value in [0, 1) derived from a seed string. */
export function unit(seed: string): number {
  return hash(seed) / 0xffffffff;
}

/** Deterministic number in [min, max] derived from a seed string. */
export function between(seed: string, min: number, max: number): number {
  return min + unit(seed) * (max - min);
}

/** Deterministic boolean, true with roughly `probability` chance. */
export function chance(seed: string, probability: number): boolean {
  return unit(seed) < probability;
}

/** Deterministic pick from a pool. */
export function pick<T>(seed: string, pool: readonly T[]): T {
  return pool[hash(seed) % pool.length];
}
