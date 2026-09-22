import { FLAP_VELOCITY, GRAVITY } from "@/core/game/constants";
import type { Circle } from "@/core/game/contracts";

export class Bird {
  private velocityY = 0;

  constructor(
    private x: number,
    private y: number,
    private radius: number,
  ) {}

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getVelocityY() {
    return this.velocityY;
  }

  flap() {
    this.velocityY = FLAP_VELOCITY;
  }

  getHitbox(): Circle {
    return {
      x: this.x,
      y: this.y,
      radius: this.radius,
    };
  }

  update(dt: number) {
    this.velocityY += GRAVITY * dt;
    this.y += this.velocityY * dt;
  }
}
