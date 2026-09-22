import { describe, expect, it, vi } from "vitest";

import { NeuralController } from "@/core/game/ai";

describe("NeuralController", () => {
  it("passes bird observations to the network and flaps above the threshold", () => {
    const predict = vi.fn(() => [0.51]);
    const controller = new NeuralController({ predict });

    expect(controller.decide({ birdY: 123, birdVelocityY: -45 })).toBe("flap");
    expect(predict).toHaveBeenCalledWith([123, -45]);
  });

  it("returns none at or below the threshold", () => {
    const predict = vi.fn().mockReturnValueOnce([0.5]).mockReturnValueOnce([0.2]);
    const controller = new NeuralController({ predict });

    expect(controller.decide({ birdY: 1, birdVelocityY: 2 })).toBe("none");
    expect(controller.decide({ birdY: 3, birdVelocityY: 4 })).toBe("none");
  });
});
