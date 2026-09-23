import { describe, expect, it, vi } from "vitest";

import { NeuralNetwork } from "@/core/ai/network";
import { NeuralController } from "@/core/game/ai";

describe("NeuralController", () => {
  it("passes bird observations to the network and flaps above the threshold", () => {
    const network = new NeuralNetwork([]);
    const forward = vi.spyOn(network, "forward").mockReturnValue([0.51]);
    const controller = new NeuralController(network);

    expect(
      controller.decide({ birdY: 123, birdVelocityY: -45, pipeDistanceX: 200, pipeGapY: 300 }),
    ).toBe("flap");
    expect(forward).toHaveBeenCalledWith([0.205, -45 / 350, 0.5, 0.5]);
  });

  it("returns none at or below the threshold", () => {
    const network = new NeuralNetwork([]);
    vi.spyOn(network, "forward").mockReturnValueOnce([0.5]).mockReturnValueOnce([0.2]);
    const controller = new NeuralController(network);

    expect(controller.decide({ birdY: 1, birdVelocityY: 2, pipeDistanceX: 3, pipeGapY: 4 })).toBe(
      "none",
    );
    expect(controller.decide({ birdY: 3, birdVelocityY: 4, pipeDistanceX: 5, pipeGapY: 6 })).toBe(
      "none",
    );
  });
});
