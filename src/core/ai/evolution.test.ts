import { describe, expect, it } from "vitest";

import { Evolution } from "@/core/ai/evolution";

describe("Evolution", () => {
  it("selects the fittest agents as parents", () => {
    const evolution = new Evolution(4, 0.5, 0);
    const population = evolution.getPopulation();

    population[0].addFitness(1);
    population[1].addFitness(4);
    population[2].addFitness(2);
    population[3].addFitness(3);

    expect(evolution.selection()).toEqual([population[1], population[3]]);
  });

  it("replaces the population with a new generation", () => {
    const evolution = new Evolution(4, 0.5, 0);
    const population = evolution.getPopulation();

    population[0].addFitness(4);
    evolution.next();

    expect(evolution.getGeneration()).toBe(2);
    expect(evolution.getPopulation()).toHaveLength(4);
    expect(evolution.getPopulation()[0]).not.toBe(population[0]);
    expect(evolution.getPopulation().every((agent) => agent.getFitness() === 0)).toBe(true);
  });
});
