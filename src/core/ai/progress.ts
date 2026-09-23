import { z } from "zod";

const STORAGE_KEY = "flappy-lab.training-progress";

const NETWORK_PARAMETER_LENGTHS = [4, 4, 4, 4, 4, 4, 4, 4, 8, 8, 1];

const NetworkSchema = z.array(z.array(z.number())).superRefine((parameters, context) => {
  if (parameters.length !== NETWORK_PARAMETER_LENGTHS.length) {
    context.addIssue({ code: "custom", message: "invalid network parameter count" });
    return;
  }

  for (let index = 0; index < NETWORK_PARAMETER_LENGTHS.length; index++) {
    if (parameters[index].length !== NETWORK_PARAMETER_LENGTHS[index]) {
      context.addIssue({
        code: "custom",
        message: "invalid network parameter shape",
        path: [index],
      });
    }
  }
});

const TrainingProgressSchema = z.object({
  version: z.literal(1),
  generation: z.number().int().positive(),
  population: z.array(
    z.object({
      network: NetworkSchema,
      fitness: z.number(),
    }),
  ),
  allTimeBest: z.number().nonnegative().default(0),
  allTimeBestScore: z.number().nonnegative().default(0),
});

export type TrainingProgress = z.infer<typeof TrainingProgressSchema>;

export function loadTrainingProgress(populationSize: number): TrainingProgress | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const result = TrainingProgressSchema.safeParse(JSON.parse(raw));

    if (!result.success || result.data.population.length !== populationSize) {
      return null;
    }

    return result.data;
  } catch {
    return null;
  }
}

export function saveTrainingProgress(snapshot: TrainingProgress) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {}
}

export function clearTrainingProgress() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
