import { GAME_WIDTH, PIPE_SPEED } from "@/core/game/constants";
import type { Rect } from "@/core/game/contracts";

export type PipeDirection = "up" | "down";

export class Pipe {
  constructor(
    private x: number,
    private y: number,
    private width: number,
    private height: number,
    private direction: PipeDirection,
  ) {}

  getHitbox(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  getX() {
    return this.x;
  }

  getDirection() {
    return this.direction;
  }

  isVisible() {
    const hitbox = this.getHitbox();

    return hitbox.x + hitbox.width >= 0 && hitbox.x <= GAME_WIDTH;
  }

  update(dt: number) {
    this.x -= PIPE_SPEED * dt;
  }
}
