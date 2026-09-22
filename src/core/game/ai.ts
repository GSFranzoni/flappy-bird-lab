import type { NeuralNetwork } from "@/core/ai/nn";
import type { Action, Controller, Observation } from "@/core/game/contracts";

export class NeuralController implements Controller {
  constructor(private network: NeuralNetwork) {}

  decide(observation: Observation): Action {
    const input = [observation.birdY, observation.birdVelocityY];

    const [output] = this.network.predict(input);

    return output > 0.5 ? "flap" : "none";
  }
}
