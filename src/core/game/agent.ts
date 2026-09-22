import { Bird } from "@/core/game/bird";
import type { Action, Controller, Observation } from "@/core/game/contracts";

export class Agent {
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
  }

  reset() {
    this.bird.reset();
    this.alive = true;
  }
}
