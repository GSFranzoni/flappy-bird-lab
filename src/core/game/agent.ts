import { Bird } from "@/core/game/bird";
import type { Action, Controller, Observation } from "@/core/game/contracts";

export class Agent {
  private fitness = 0;

  private alive = true;

  constructor(
    private readonly bird: Bird,
    private controller: Controller,
  ) {}

  decide(observation: Observation): Action {
    return this.controller.decide(observation);
  }

  getBird() {
    return this.bird;
  }

  isAlive() {
    return this.alive;
  }

  kill() {
    this.alive = false;
    this.bird.startFalling();
  }

  addFitness(value: number) {
    this.fitness += value;
  }

  getFitness() {
    return this.fitness;
  }

  getController() {
    return this.controller;
  }

  reset() {
    this.bird.reset();
    this.alive = true;
    this.fitness = 0;
  }
}
