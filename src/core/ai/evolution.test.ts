import { describe, expect, it, vi } from "vitest";

import { Evolution } from "@/core/ai/evolution";

describe("Evolution", () => {
  it("preserves the fittest individuals as elites", () => {
    const evolution = new Evolution(4, 0.5, 0);
    const population = evolution.getPopulation();

    for (let index = 0; index < population.length; index++) {
      for (const parameter of population[index].network.parameters()) {
        parameter.values.fill(index);
      }
    }
    evolution.setFitnessResults([1, 4, 2, 3]);
    evolution.next();

    const nextPopulation = evolution.getPopulation();
    expect(nextPopulation[0].network.export()).toEqual(population[1].network.export());
    expect(nextPopulation[1].network.export()).toEqual(population[3].network.export());
  });

  it("replaces the population with a new generation with zero fitness", () => {
    const evolution = new Evolution(4, 0.5, 0);
    const population = evolution.getPopulation();

    evolution.setFitnessResults([4, 0, 0, 0]);
    evolution.next();

    expect(evolution.getGeneration()).toBe(2);
    expect(evolution.getPopulation()).toHaveLength(4);
    expect(evolution.getPopulation()[0]).not.toBe(population[0]);
    expect(evolution.getPopulation().every((individual) => individual.fitness === 0)).toBe(true);
  });

  it("rejects incomplete fitness results", () => {
    const evolution = new Evolution(4);

    expect(() => evolution.setFitnessResults([1, 2])).toThrow(
      "fitness results must match the population size",
    );
  });

  it("requires a positive population size", () => {
    expect(() => new Evolution(0)).toThrow("populationSize must be greater than 0");
  });

  it("creates offspring with parameters from both selected parents", () => {
    const evolution = new Evolution(4, 0.5, 0);
    const population = evolution.getPopulation();

    for (const parameter of population[0].network.parameters()) {
      parameter.values.fill(1);
    }
    for (const parameter of population[1].network.parameters()) {
      parameter.values.fill(2);
    }
    evolution.setFitnessResults([4, 3, 0, 0]);

    let randomCall = 0;
    const random = vi.spyOn(Math, "random").mockImplementation(() => {
      const call = randomCall++;
      if (call === 0) {
        return 0;
      }
      if (call === 1) {
        return 0.75;
      }
      return call % 2 === 0 ? 0.25 : 0.75;
    });

    evolution.next();
    random.mockRestore();

    const values = evolution
      .getPopulation()[2]
      .network.parameters()
      .flatMap((parameter) => parameter.values);

    expect(values).toContain(1);
    expect(values).toContain(2);
  });
});
