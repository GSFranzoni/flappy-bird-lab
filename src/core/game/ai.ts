import type { NeuralNetwork } from "@/core/ai/neural-network";
import { FLAP_VELOCITY, GAME_HEIGHT, GAME_WIDTH } from "@/core/game/constants";
import type { Action, Controller, Observation } from "@/core/game/contracts";

export class NeuralController implements Controller {
  constructor(private network: NeuralNetwork) {}

  decide(observation: Observation): Action {
    const input = [
      observation.birdY / GAME_HEIGHT,
      observation.birdVelocityY / -FLAP_VELOCITY,
      observation.pipeDistanceX / GAME_WIDTH,
      observation.pipeGapY / GAME_HEIGHT,
    ];

    const [output] = this.network.forward(input);

    return output > 0.5 ? "flap" : "none";
  }

  getNeuralNetwork() {
    return this.network;
  }
}
