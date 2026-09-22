import type { Agent } from "@/core/game/agent";
import type { Assets } from "@/core/game/assets";
import type { Bird } from "@/core/game/bird";
import { FLOOR_HEIGHT, GAME_HEIGHT, GAME_WIDTH, PIPE_SPEED } from "@/core/game/constants";
import { GamePhase } from "@/core/game/contracts";
import type { GameEngine } from "@/core/game/engine";
import type { Pipe } from "@/core/game/pipe";

export class GameRenderer {
  private sceneFreezeTime = 0;

  private wasGameOver = false;

  constructor(
    private context: CanvasRenderingContext2D,
    private assets: Assets,
  ) {}

  render(game: GameEngine, now: number) {
    const isGameOver = game.isGameOver();

    if (isGameOver && !this.wasGameOver) {
      this.sceneFreezeTime = now;
    }

    this.context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    const sceneTime = isGameOver ? this.sceneFreezeTime : now;

    this.drawBackground(sceneTime);
    this.drawPipes(game.getPipes());
    this.drawFloor(sceneTime);
    this.drawScore(game.getScore());

    if (game.getPhase() === GamePhase.Ready) {
      this.drawMessage();
    } else if (isGameOver) {
      this.drawGameOver();
    }

    if (game.getPhase() !== GamePhase.Ready) {
      this.drawBirds(game.getAgents(), now);
    }

    this.wasGameOver = isGameOver;
  }

  private drawBackground(now: number) {
    const tileWidth = Math.ceil(
      (this.assets.background.width / this.assets.background.height) * GAME_HEIGHT,
    );
    this.drawTiledImage(this.assets.background, 0, tileWidth, GAME_HEIGHT, now, PIPE_SPEED * 0.12);
  }

  private drawPipes(pipes: Pipe[]) {
    for (const pipe of pipes) {
      this.drawPipe(pipe);
    }
  }

  private drawPipe(pipe: Pipe) {
    const hitbox = pipe.getHitbox();
    const height = (this.assets.pipe.height / this.assets.pipe.width) * hitbox.width;

    this.context.save();

    if (pipe.getDirection() === "up") {
      this.context.translate(hitbox.x, hitbox.y + hitbox.height);
      this.context.scale(1, -1);
    } else {
      this.context.translate(hitbox.x, hitbox.y);
    }

    this.context.drawImage(this.assets.pipe, 0, 0, hitbox.width, height);
    this.context.restore();
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
      if (!agent.isAlive() && !agent.getBird().isVisible()) {
        continue;
      }

      this.drawBird(agent.getBird(), now);
    }
  }

  private drawFloor(now: number) {
    const tileWidth = Math.ceil((this.assets.base.width / this.assets.base.height) * FLOOR_HEIGHT);
    this.drawTiledImage(
      this.assets.base,
      GAME_HEIGHT - FLOOR_HEIGHT,
      tileWidth,
      FLOOR_HEIGHT,
      now,
      PIPE_SPEED,
    );
  }

  private drawTiledImage(
    image: HTMLImageElement,
    y: number,
    width: number,
    height: number,
    now: number,
    speed: number,
  ) {
    const offset = Math.floor(((now / 1000) * speed) % width);

    for (let x = -offset; x < GAME_WIDTH; x += width) {
      this.context.drawImage(image, x, y, width, height);
    }
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
      this.context.drawImage(image, x, 75, width, image.height * scale);
      x += width;
    }
  }

  private drawGameOver() {
    const width = 192;
    const height = 42;
    this.context.drawImage(this.assets.gameOver, (GAME_WIDTH - width) / 2, 160, width, height);
  }

  private drawMessage() {
    const { message } = this.assets;
    this.context.drawImage(message, (GAME_WIDTH - message.width) / 2, 170);
  }
}
