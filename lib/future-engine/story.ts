import { pick } from "@/lib/ai/seeded";
import { blockerPhrase, goalPhrase } from "@/lib/ai/themes";
import type { FutureMemory } from "@/lib/future-engine/types";

const OPENERS: ReadonlyArray<(goal: string, blocker: string) => string> = [
  (goal) =>
    `A year from now, ${goal} doesn't feel like a distant plan anymore — it feels like where you actually live.`,
  (goal, blocker) =>
    `One year from today, the version of you who kept showing up despite ${blocker} is unmistakable.`,
  (_goal, blocker) =>
    `By this time next year, the daily pull of ${blocker} has quietly lost its grip.`,
];

const CLOSERS = [
  "None of it happens all at once. It happens one completed day at a time — like this one.",
  "It won't feel sudden from the inside. It rarely does.",
  "The strange part is how ordinary each individual day will have felt.",
] as const;

const MIDDLE_TEMPLATES: ReadonlyArray<(date: string, moment: string) => string> = [
  (date, moment) => `By ${date}, ${moment}`,
  (date, moment) => `Somewhere around ${date}, ${moment}`,
  (date, moment) => `You'll remember ${date} specifically — ${moment}`,
];

const MOMENTUM_LINES = [
  (n: number) => ` You're already ${n} days into becoming that person.`,
  (n: number) => ` ${n} completed days already point in that direction.`,
] as const;

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function stripTrailingPeriod(text: string): string {
  return text.endsWith(".") ? text.slice(0, -1) : text;
}

/**
 * One paragraph describing life a year from today. Reseeded by date and
 * by a progress bucket, so it's never identical two visits in a row —
 * and it always cites one real future memory, so it stays grounded
 * rather than generically inspirational.
 */
export function generateFutureStory(
  goal: string,
  blocker: string,
  seed: string,
  dateKey: string,
  completions: number,
  memories: FutureMemory[]
): string {
  const bucket = Math.min(Math.floor(completions / 2), 5);
  const variantSeed = `${seed}|${blocker}|${dateKey}:${bucket}`;

  const opener = pick(`${variantSeed}:opener`, OPENERS)(
    goalPhrase(goal),
    blockerPhrase(blocker)
  );

  const memory = pick(`${variantSeed}:memory`, memories);
  const moment = lowerFirst(stripTrailingPeriod(memory.description));
  const middle = pick(`${variantSeed}:middle`, MIDDLE_TEMPLATES)(memory.date, moment);

  const closer = pick(`${variantSeed}:closer`, CLOSERS);

  const momentum =
    completions >= 3
      ? pick(`${variantSeed}:momentum`, MOMENTUM_LINES)(completions)
      : "";

  return `${opener} ${middle}. ${closer}${momentum}`;
}
