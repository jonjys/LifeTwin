/**
 * Deterministic pseudo-randomness for the mock simulation.
 * Same seed → same result, so the product feels stable, not random.
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

/** Deterministic integer in [min, max] derived from a seed string. */
export function between(seed: string, min: number, max: number): number {
  return Math.round(min + unit(seed) * (max - min));
}

/** Deterministic pick from a pool. */
export function pick<T>(seed: string, pool: readonly T[]): T {
  return pool[hash(seed) % pool.length];
}
