import { describe, expect, it, vi } from "vitest";

import { Agent } from "@/core/game/agent";
import { Bird } from "@/core/game/bird";
import {
  BIRD_RADIUS,
  FLOOR_Y,
  GAME_HEIGHT,
  GAME_WIDTH,
  PIPE_SPEED,
  PIPE_WIDTH,
} from "@/core/game/constants";
import { GameEngine } from "@/core/game/engine";
import { Sound } from "@/core/game/sound";

const controller = (action: "flap" | "none" = "none") => ({
  decide: vi.fn(() => action),
});

const agent = (action: "flap" | "none" = "none") => new Agent(new Bird(), controller(action));

describe("Game Engine", () => {
  it("starts with the bird centered and a pipe pair around the gap", () => {
    const game = new GameEngine([agent()]);
    const [topPipe, bottomPipe] = game.getPipes();

    expect(game.getAgents()[0].getBird().getHitbox()).toEqual({
      x: GAME_WIDTH * 0.25,
      y: GAME_HEIGHT / 2,
      radius: BIRD_RADIUS,
    });
    expect(topPipe.getHitbox()).toEqual({ x: GAME_WIDTH, y: 0, width: PIPE_WIDTH, height: 225 });
    expect(bottomPipe.getHitbox()).toEqual({
      x: GAME_WIDTH,
      y: 375,
      width: PIPE_WIDTH,
      height: FLOOR_Y - 375,
    });
    expect(topPipe.getDirection()).toBe("up");
    expect(bottomPipe.getDirection()).toBe("down");
    expect(game.getScore()).toBe(0);
    expect(game.isGameOver()).toBe(false);
  });

  it("updates the bird and pipes and supplies the controller observation", () => {
    const decide = vi.fn(() => "none" as const);
    const game = new GameEngine([new Agent(new Bird(), { decide })]);

    game.start();
    game.update(0.1);

    expect(decide).toHaveBeenCalledWith({ birdY: GAME_HEIGHT / 2, birdVelocityY: 0 });
    expect(game.getAgents()[0].getBird().getY()).toBe(310);
    expect(game.getAgents()[0].getBird().getVelocityY()).toBe(100);
    expect(game.getPipes()[0].getX()).toBe(GAME_WIDTH - PIPE_SPEED * 0.1);
  });

  it("applies a flap action before updating the bird", () => {
    const sound = new Sound();
    const play = vi.spyOn(sound, "play");
    const game = new GameEngine([agent("flap")], sound);

    game.start();
    game.update(0.1);

    expect(game.getAgents()[0].getBird().getVelocityY()).toBe(-250);
    expect(game.getAgents()[0].getBird().getY()).toBe(275);
    expect(play).toHaveBeenCalledWith("wing");
  });

  it("ends when the bird hits the top or bottom world boundary", () => {
    const topGame = new GameEngine([agent()]);
    for (let i = 0; i < 12; i += 1) {
      topGame.getAgents()[0].getBird().flap();
      topGame.getAgents()[0].getBird().update(0.1);
    }
    topGame.start();
    topGame.update(0);
    expect(topGame.isGameOver()).toBe(true);

    const bottomGame = new GameEngine([agent()]);
    bottomGame.getAgents()[0].getBird().update(0.4);
    bottomGame.start();
    bottomGame.update(0.05);
    expect(bottomGame.isGameOver()).toBe(true);
  });

  it("ends when the bird overlaps a pipe", () => {
    const game = new GameEngine([agent()]);
    const bird = game.getAgents()[0].getBird();

    bird.flap();
    bird.update(0.1);
    bird.flap();
    bird.update(0.1);
    bird.flap();
    bird.update(0.05);
    game.getPipes()[0].update(2);

    game.start();
    game.update(0);

    expect(game.isGameOver()).toBe(true);

    const xAtDeath = bird.getX();
    const yAtDeath = bird.getY();
    game.update(0.1);

    expect(bird.getX()).toBe(xAtDeath);
    expect(bird.getY()).toBeLessThan(yAtDeath);
  });

  it("increments the score after the bird clears a pipe pair", () => {
    const sound = new Sound();
    const play = vi.spyOn(sound, "play");
    const game = new GameEngine([agent()], sound);

    game.getPipes()[0].update(2.5);
    game.getPipes()[1].update(2.5);
    game.start();
    game.update(0);

    expect(game.getScore()).toBe(1);
    expect(play).toHaveBeenCalledWith("point");
  });

  it("does not update pipes or controllers after game over", () => {
    const decide = vi.fn(() => "none" as const);
    const game = new GameEngine([new Agent(new Bird(), { decide })]);

    game.getAgents()[0].getBird().update(1);
    game.start();
    game.update(0);
    const yAtGameOver = game.getAgents()[0].getBird().getY();
    const xAtGameOver = game.getAgents()[0].getBird().getX();
    const pipeXAtGameOver = game.getPipes()[0].getX();

    game.update(1);

    expect(decide).toHaveBeenCalledTimes(1);
    expect(game.getAgents()[0].getBird().getY()).toBeGreaterThan(yAtGameOver);
    expect(game.getAgents()[0].getBird().getX()).toBe(xAtGameOver);
    expect(game.getPipes()[0].getX()).toBe(pipeXAtGameOver);
  });

  it("resets game state when restarted", () => {
    const game = new GameEngine([agent()]);

    game.start();
    game.update(1);
    expect(game.isGameOver()).toBe(true);

    game.restart();
    expect(game.isGameOver()).toBe(false);
    expect(game.getAgents()[0].getBird().getY()).toBe(GAME_HEIGHT / 2);
  });

  it("updates each alive agent while moving shared pipes once", () => {
    const firstDecide = vi.fn(() => "none" as const);
    const secondDecide = vi.fn(() => "flap" as const);
    const game = new GameEngine([
      new Agent(new Bird(), { decide: firstDecide }),
      new Agent(new Bird(), {
        decide: secondDecide,
      }),
    ]);

    game.start();
    game.update(0.1);

    expect(firstDecide).toHaveBeenCalledOnce();
    expect(secondDecide).toHaveBeenCalledOnce();
    expect(game.getAgents()[0].getBird().getY()).toBe(310);
    expect(game.getAgents()[1].getBird().getY()).toBe(275);
    expect(game.getPipes()[0].getX()).toBe(GAME_WIDTH - PIPE_SPEED * 0.1);
  });

  it("kills only the colliding agent and ends after all agents die", () => {
    const first = agent();
    const second = agent();
    const game = new GameEngine([first, second]);

    first.getBird().update(1);
    game.start();
    game.update(0);

    expect(first.isAlive()).toBe(false);
    expect(second.isAlive()).toBe(true);
    expect(game.isGameOver()).toBe(false);

    second.getBird().update(1);
    game.update(0);

    expect(second.isAlive()).toBe(false);
    expect(game.isGameOver()).toBe(true);
  });
});
