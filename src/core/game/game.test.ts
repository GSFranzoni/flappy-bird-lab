import { describe, expect, it, vi } from "vitest";

import {
  BIRD_RADIUS,
  GAME_HEIGHT,
  GAME_WIDTH,
  PIPE_SPEED,
  PIPE_WIDTH,
} from "@/core/game/constants";
import { Game } from "@/core/game/game";

const controller = (action: "flap" | "none" = "none") => ({
  decide: vi.fn(() => action),
});

describe("Game", () => {
  it("starts with the bird centered and a pipe pair around the gap", () => {
    const game = new Game(controller());
    const [topPipe, bottomPipe] = game.getPipes();

    expect(game.getBird().getHitbox()).toEqual({
      x: GAME_WIDTH * 0.25,
      y: GAME_HEIGHT / 2,
      radius: BIRD_RADIUS,
    });
    expect(topPipe.getHitbox()).toEqual({ x: GAME_WIDTH, y: 0, width: PIPE_WIDTH, height: 225 });
    expect(bottomPipe.getHitbox()).toEqual({
      x: GAME_WIDTH,
      y: 375,
      width: PIPE_WIDTH,
      height: 225,
    });
    expect(game.getScore()).toBe(0);
    expect(game.isGameOver()).toBe(false);
  });

  it("updates the bird and pipes and supplies the controller observation", () => {
    const decide = vi.fn(() => "none" as const);
    const game = new Game({ decide });

    game.update(0.1);

    expect(decide).toHaveBeenCalledWith({ birdY: GAME_HEIGHT / 2, birdVelocityY: 0 });
    expect(game.getBird().getY()).toBe(310);
    expect(game.getBird().getVelocityY()).toBe(100);
    expect(game.getPipes()[0].getX()).toBe(GAME_WIDTH - PIPE_SPEED * 0.1);
  });

  it("applies a flap action before updating the bird", () => {
    const game = new Game(controller("flap"));

    game.update(0.1);

    expect(game.getBird().getVelocityY()).toBe(-250);
    expect(game.getBird().getY()).toBe(275);
  });

  it("ends when the bird hits the top or bottom world boundary", () => {
    const topGame = new Game(controller());
    for (let i = 0; i < 12; i += 1) {
      topGame.getBird().flap();
      topGame.getBird().update(0.1);
    }
    topGame.update(0);
    expect(topGame.isGameOver()).toBe(true);

    const bottomGame = new Game(controller());
    bottomGame.getBird().update(1);
    bottomGame.update(0);
    expect(bottomGame.isGameOver()).toBe(true);
  });

  it("ends when the bird overlaps a pipe", () => {
    const game = new Game(controller());
    const bird = game.getBird();

    bird.flap();
    bird.update(0.1);
    bird.flap();
    bird.update(0.1);
    bird.flap();
    bird.update(0.05);
    game.getPipes()[0].update(2);

    game.update(0);

    expect(game.isGameOver()).toBe(true);
  });

  it("does not update after game over", () => {
    const decide = vi.fn(() => "none" as const);
    const game = new Game({ decide });

    game.getBird().update(1);
    game.update(0);
    const yAtGameOver = game.getBird().getY();
    const pipeXAtGameOver = game.getPipes()[0].getX();

    game.update(1);

    expect(decide).toHaveBeenCalledTimes(1);
    expect(game.getBird().getY()).toBe(yAtGameOver);
    expect(game.getPipes()[0].getX()).toBe(pipeXAtGameOver);
  });
});
