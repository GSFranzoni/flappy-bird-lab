import { LinearLayer, NeuralNetwork, ReLULayer, SigmoidLayer } from "@/core/ai/neural-network";

export type Individual = {
  network: NeuralNetwork;
  fitness: number;
};

export class Evolution {
  private generation = 1;

  private population: Individual[];

  constructor(
    readonly populationSize: number,
    private readonly elitePercent = 0.1,
    private readonly mutationRate = 0.1,
    private readonly mutationAmount = 0.2,
  ) {
    if (populationSize <= 0) {
      throw new Error("populationSize must be greater than 0");
    }

    if (elitePercent <= 0 || elitePercent > 1) {
      throw new Error("elitePercent must be between 0 and 1");
    }

    this.population = Array.from({ length: populationSize }, () => ({
      network: Evolution.createNeuralNetwork(),
      fitness: 0,
    }));
  }

  static createNeuralNetwork() {
    return new NeuralNetwork([
      new LinearLayer(4, 8),
      new ReLULayer(),
      new LinearLayer(8, 1),
      new SigmoidLayer(),
    ]);
  }

  setFitnessResults(fitnessResults: readonly number[]) {
    if (fitnessResults.length !== this.population.length) {
      throw new Error("fitness results must match the population size");
    }

    for (let index = 0; index < this.population.length; index++) {
      this.population[index].fitness = fitnessResults[index];
    }
  }

  next(): void {
    const parents = this.selection();

    const nextPopulation: Individual[] = [];

    for (const parent of parents) {
      nextPopulation.push({
        network: parent.network.clone(Evolution.createNeuralNetwork),
        fitness: 0,
      });
    }

    while (nextPopulation.length < this.population.length) {
      const firstParent = this.selectParent(parents);
      const secondParent = this.selectParent(parents);
      const network = this.crossover(firstParent.network, secondParent.network);

      this.mutate(network);
      nextPopulation.push({ network, fitness: 0 });
    }

    this.generation++;
    this.population = nextPopulation;
  }

  getPopulation(): readonly Individual[] {
    return this.population;
  }

  private selection(): Individual[] {
    const ranked = [...this.population].sort((first, second) => second.fitness - first.fitness);
    const eliteCount = Math.ceil(this.population.length * this.elitePercent);

    return ranked.slice(0, eliteCount);
  }

  getGeneration() {
    return this.generation;
  }

  private selectParent(parents: Individual[]) {
    return parents[Math.floor(Math.random() * parents.length)];
  }

  private crossover(first: NeuralNetwork, second: NeuralNetwork) {
    const offspring = first.clone(Evolution.createNeuralNetwork);
    const offspringParameters = offspring.parameters();
    const secondParameters = second.parameters();

    for (let parameterIndex = 0; parameterIndex < offspringParameters.length; parameterIndex++) {
      const offspringValues = offspringParameters[parameterIndex].values;
      const secondValues = secondParameters[parameterIndex].values;

      for (let valueIndex = 0; valueIndex < offspringValues.length; valueIndex++) {
        if (Math.random() >= 0.5) {
          offspringValues[valueIndex] = secondValues[valueIndex];
        }
      }
    }

    return offspring;
  }

  private mutate(network: NeuralNetwork) {
    for (const parameter of network.parameters()) {
      for (let index = 0; index < parameter.values.length; index++) {
        if (Math.random() >= this.mutationRate) {
          continue;
        }

        parameter.values[index] += (Math.random() * 2 - 1) * this.mutationAmount;
      }
    }
  }
}
