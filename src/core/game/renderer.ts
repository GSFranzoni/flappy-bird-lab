import type { Assets } from "@/core/game/assets";
import type { Agent } from "@/core/game/agent";
import type { Bird } from "@/core/game/bird";
import { FLOOR_HEIGHT, GAME_HEIGHT, GAME_WIDTH } from "@/core/game/constants";
import type { GameEngine } from "@/core/game/engine";
import type { Pipe } from "@/core/game/pipe";

export class GameRenderer {
  constructor(
    private context: CanvasRenderingContext2D,
    private assets: Assets,
  ) {}

  render(game: GameEngine, now: number) {
    this.context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.drawBackground();
    this.drawPipes(game.getPipes());
    this.drawBirds(game.getAgents(), now);
    this.drawFloor();
    this.drawScore(game.getScore());

    if (game.isGameOver()) {
      this.drawGameOver();
    }
  }

  private drawBackground() {
    this.context.drawImage(this.assets.background, 0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  private drawPipes(pipes: Pipe[]) {
    for (const pipe of pipes) {
      const hitbox = pipe.getHitbox();

      if (pipe.getDirection() === "up") {
        this.context.save();
        this.context.translate(hitbox.x, hitbox.height);
        this.context.scale(1, -1);
        this.context.drawImage(this.assets.pipe, 0, 0, hitbox.width, hitbox.height);
        this.context.restore();
      } else {
        this.context.drawImage(this.assets.pipe, hitbox.x, hitbox.y, hitbox.width, hitbox.height);
      }
    }
  }

  private drawBird(bird: Bird, now: number) {
    const frames = [this.assets.birdMid, this.assets.birdUp, this.assets.birdDown];
    const birdImage = frames[Math.floor(now / 120) % frames.length];
    const rotation = Math.max(-0.5, Math.min(1.1, bird.getVelocityY() / 500));

    this.context.save();
    this.context.translate(bird.getX(), bird.getY());
    this.context.rotate(rotation);
    this.context.drawImage(birdImage, -20, -14, 40, 28);
    this.context.restore();
  }

  private drawBirds(agents: Agent[], now: number) {
    for (const agent of agents) {
      this.drawBird(agent.getBird(), now);
    }
  }

  private drawFloor() {
    this.context.drawImage(
      this.assets.base,
      0,
      GAME_HEIGHT - FLOOR_HEIGHT,
      GAME_WIDTH,
      FLOOR_HEIGHT,
    );
  }

  private drawScore(score: number) {
    const digits = String(score).split("").map(Number);
    const scale = 1.25;
    const widths = digits.map((digit) => this.assets.digits[digit].width * scale);
    const totalWidth = widths.reduce((sum, width) => sum + width, 0);
    let x = (GAME_WIDTH - totalWidth) / 2;

    for (let index = 0; index < digits.length; index += 1) {
      const image = this.assets.digits[digits[index]];
      const width = widths[index];
      this.context.drawImage(image, x, 36, width, image.height * scale);
      x += width;
    }
  }

  private drawGameOver() {
    const width = 192;
    const height = 42;
    this.context.drawImage(this.assets.gameOver, (GAME_WIDTH - width) / 2, 160, width, height);
  }
}
