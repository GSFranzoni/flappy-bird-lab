import { PIPE_SPEED } from "@/core/game/constants";
import type { Rect } from "@/core/game/contracts";

export class Pipe {
  constructor(
    private x: number,
    private y: number,
    private width: number,
    private height: number,
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

  update(dt: number) {
    this.x -= PIPE_SPEED * dt;
  }
}
