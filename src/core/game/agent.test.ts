import { describe, expect, it, vi } from "vitest";

import { Agent } from "@/core/game/agent";
import { Bird } from "@/core/game/bird";
import { GAME_HEIGHT } from "@/core/game/constants";

describe("Agent", () => {
  it("delegates decisions and resets its bird when revived", () => {
    const decide = vi.fn(() => "none" as const);
    const bird = new Bird();
    const agent = new Agent(bird, { decide });

    agent.kill();
    bird.update(1);
    agent.reset();

    expect(agent.isAlive()).toBe(true);
    expect(agent.getBird()).toBe(bird);
    expect(agent.getBird().getY()).toBe(GAME_HEIGHT / 2);
    expect(agent.decide({ birdY: GAME_HEIGHT / 2, birdVelocityY: 0 })).toBe("none");
    expect(decide).toHaveBeenCalledWith({ birdY: GAME_HEIGHT / 2, birdVelocityY: 0 });
  });
});
