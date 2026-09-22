import { LinearLayer, NeuralNetwork, ReLULayer, SigmoidLayer } from "@/core/ai/neural-network";
import { Agent } from "@/core/game/agent";
import { NeuralController } from "@/core/game/ai";
import { Bird } from "@/core/game/bird";

export class Evolution {
  private generation = 1;

  private population: Agent[];

  constructor(
    readonly populationSize: number,
    private readonly elitePercent = 0.1,
    private readonly mutationRate = 0.1,
    private readonly mutationAmount = 0.2,
  ) {
    if (elitePercent <= 0 || elitePercent > 1) {
      throw new Error("elitePercent must be between 0 and 1");
    }
    this.population = Array.from(
      { length: populationSize },
      () => new Agent(new Bird(), new NeuralController(Evolution.createNeuralNetwork())),
    );
  }

  static createNeuralNetwork() {
    return new NeuralNetwork([
      new LinearLayer(4, 8),
      new ReLULayer(),
      new LinearLayer(8, 1),
      new SigmoidLayer(),
    ]);
  }

  next(): void {
    const parents = this.selection();

    const nextPopulation: Agent[] = [];

    for (const parent of parents) {
      const controller = parent.getController() as NeuralController;

      const network = controller.getNeuralNetwork().clone(() => Evolution.createNeuralNetwork());

      nextPopulation.push(new Agent(new Bird(), new NeuralController(network)));
    }

    while (nextPopulation.length < this.population.length) {
      const parent = parents[Math.floor(Math.random() * parents.length)];

      const controller = parent.getController() as NeuralController;

      const network = controller.getNeuralNetwork().clone(() => Evolution.createNeuralNetwork());

      this.mutate(network);

      nextPopulation.push(new Agent(new Bird(), new NeuralController(network)));
    }

    this.generation++;

    this.population = nextPopulation;
  }

  private mutate(network: NeuralNetwork) {
    for (const parameter of network.parameters()) {
      for (let i = 0; i < parameter.values.length; i++) {
        if (Math.random() >= this.mutationRate) {
          continue;
        }

        parameter.values[i] += (Math.random() * 2 - 1) * this.mutationAmount;
      }
    }
  }

  selection(): Agent[] {
    const ranked = [...this.population].sort((a, b) => b.getFitness() - a.getFitness());

    const eliteCount = Math.ceil(this.population.length * this.elitePercent);

    return ranked.slice(0, eliteCount);
  }

  getGeneration() {
    return this.generation;
  }

  getPopulation() {
    return this.population;
  }
}
