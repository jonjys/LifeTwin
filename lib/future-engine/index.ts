import { generateFutureMemories } from "@/lib/future-engine/memories";
import { generateFutureStory } from "@/lib/future-engine/story";
import type { FutureEngineInput, FutureEngineOutput } from "@/lib/future-engine/types";

export type {
  FutureEngineInput,
  FutureEngineOutput,
  FutureMemory,
  MemoryCategory,
} from "@/lib/future-engine/types";

/**
 * The Future Engine's single entry point. Pure and synchronous, same as
 * the Life Engine — it turns metrics that already exist into memories
 * and a story, never generating its own numbers from scratch. A real AI
 * integration can later replace `generateFutureStory` (and the copy
 * inside `generateFutureMemories`) with generated prose while keeping
 * every confidence value exactly as computed here.
 */
export function runFutureEngine(input: FutureEngineInput): FutureEngineOutput {
  const memories = generateFutureMemories(
    input.goal,
    input.blocker,
    input.seed,
    input.dateKey,
    input.completions,
    input.metrics,
    input.ceiling
  );

  const story = generateFutureStory(
    input.goal,
    input.blocker,
    input.seed,
    input.dateKey,
    input.completions,
    memories
  );

  return { memories, story };
}
