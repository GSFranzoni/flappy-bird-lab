import { Bird } from "@/core/game/bird";
import { Collision } from "@/core/game/collision";
import {
  BIRD_RADIUS,
  FLOOR_Y,
  GAME_HEIGHT,
  GAME_WIDTH,
  PIPE_GAP,
  PIPE_SPAWN_INTERVAL,
  PIPE_WIDTH,
} from "@/core/game/constants";
import { GamePhase, type Controller } from "@/core/game/contracts";
import { Pipe } from "@/core/game/pipe";
import { Sound } from "@/core/game/sound";

export class GameEngine {
  private bird!: Bird;

  private pipes: Pipe[] = [];

  private score = 0;

  private phase: GamePhase = GamePhase.Ready;

  private pipeSpawnTimer = 0;

  private scoredPipes = new Set<Pipe>();

  constructor(
    private controller: Controller,
    private sound: Sound = new Sound(),
  ) {
    this.reset();
  }

  start() {
    if (this.phase === GamePhase.Ready) {
      this.phase = GamePhase.Playing;
    }
  }

  restart() {
    this.reset();
    this.start();
  }

  private reset() {
    this.bird = new Bird(GAME_WIDTH * 0.25, GAME_HEIGHT / 2, BIRD_RADIUS);
    this.pipes = [];
    this.score = 0;
    this.phase = GamePhase.Ready;
    this.pipeSpawnTimer = 0;
    this.scoredPipes.clear();
    this.spawnPipes();
  }

  update(dt: number) {
    if (this.phase !== GamePhase.Playing) {
      return;
    }

    const action = this.controller.decide({
      birdY: this.bird.getY(),
      birdVelocityY: this.bird.getVelocityY(),
    });

    if (action === "flap") {
      this.bird.flap();
      this.sound.play("wing");
    }

    this.bird.update(dt);

    for (const pipe of this.pipes) {
      pipe.update(dt);

      if (Collision.circleWithRect(this.bird.getHitbox(), pipe.getHitbox())) {
        this.endGame();
      }
    }

    this.updateScore();
    this.removeOffscreenPipes();

    this.pipeSpawnTimer += dt;
    while (this.pipeSpawnTimer >= PIPE_SPAWN_INTERVAL) {
      this.pipeSpawnTimer -= PIPE_SPAWN_INTERVAL;
      this.spawnPipes();
    }

    this.checkWorldCollision();
  }

  private updateScore() {
    const birdX = this.bird.getX();

    for (const pipe of this.pipes) {
      const hitbox = pipe.getHitbox();
      const isTopPipe = pipe.getDirection() === "up";
      const hasPassedBird = hitbox.x + hitbox.width < birdX;

      if (isTopPipe && hasPassedBird && !this.scoredPipes.has(pipe)) {
        this.scoredPipes.add(pipe);
        this.score += 1;
        this.sound.play("point");
      }
    }
  }

  private removeOffscreenPipes() {
    this.pipes = this.pipes.filter((pipe) => {
      const hitbox = pipe.getHitbox();
      const isOffscreen = hitbox.x + hitbox.width < 0;

      if (isOffscreen) {
        this.scoredPipes.delete(pipe);
      }

      return !isOffscreen;
    });
  }

  private spawnPipes() {
    const gapY = GAME_HEIGHT / 2;

    const gapTop = gapY - PIPE_GAP / 2;
    const gapBottom = gapY + PIPE_GAP / 2;

    this.pipes.push(new Pipe(GAME_WIDTH, 0, PIPE_WIDTH, gapTop, "up"));

    this.pipes.push(new Pipe(GAME_WIDTH, gapBottom, PIPE_WIDTH, FLOOR_Y - gapBottom, "down"));
  }

  private checkWorldCollision() {
    const bird = this.bird.getHitbox();

    if (bird.y - bird.radius <= 0 || bird.y + bird.radius >= FLOOR_Y) {
      this.endGame();
    }
  }

  private endGame() {
    if (this.phase === GamePhase.GameOver) {
      return;
    }

    this.phase = GamePhase.GameOver;
    this.sound.play("hit");
    this.sound.play("die");
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
    return this.phase === GamePhase.GameOver;
  }

  getPhase() {
    return this.phase;
  }
}
