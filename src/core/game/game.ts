import { Bird } from "@/core/game/bird";
import { Collision } from "@/core/game/collision";
import { BIRD_RADIUS, GAME_HEIGHT, GAME_WIDTH, PIPE_GAP, PIPE_WIDTH } from "@/core/game/constants";
import type { Controller } from "@/core/game/contracts";
import { Pipe } from "@/core/game/pipe";

export class Game {
  private bird: Bird;

  private pipes: Pipe[] = [];

  private score = 0;

  private gameOver = false;

  constructor(private controller: Controller) {
    this.bird = new Bird(GAME_WIDTH * 0.25, GAME_HEIGHT / 2, BIRD_RADIUS);

    this.spawnPipes();
  }

  update(dt: number) {
    if (this.gameOver) {
      return;
    }

    const action = this.controller.decide({
      birdY: this.bird.getY(),
      birdVelocityY: this.bird.getVelocityY(),
    });

    if (action === "flap") {
      this.bird.flap();
    }

    this.bird.update(dt);

    for (const pipe of this.pipes) {
      pipe.update(dt);

      if (Collision.circleWithRect(this.bird.getHitbox(), pipe.getHitbox())) {
        this.gameOver = true;
      }
    }

    this.checkWorldCollision();
  }

  private spawnPipes() {
    const gapY = GAME_HEIGHT / 2;

    const gapTop = gapY - PIPE_GAP / 2;
    const gapBottom = gapY + PIPE_GAP / 2;

    this.pipes.push(new Pipe(GAME_WIDTH, 0, PIPE_WIDTH, gapTop));

    this.pipes.push(new Pipe(GAME_WIDTH, gapBottom, PIPE_WIDTH, GAME_HEIGHT - gapBottom));
  }

  private checkWorldCollision() {
    const bird = this.bird.getHitbox();

    if (bird.y - bird.radius <= 0 || bird.y + bird.radius >= GAME_HEIGHT) {
      this.gameOver = true;
    }
  }

  getBird() {
    return this.bird;
  }

  getPipes() {
    return this.pipes;
  }

  getScore() {
    return this.score;
  }

  isGameOver() {
    return this.gameOver;
  }
}
