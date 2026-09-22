import {
  BIRD_RADIUS,
  BIRD_X,
  FLAP_VELOCITY,
  GAME_HEIGHT,
  GAME_WIDTH,
  GRAVITY,
} from "@/core/game/constants";
import type { Circle } from "@/core/game/contracts";

export class Bird {
  private velocityY = 0;

  private x: number;

  private y: number;

  constructor(private radius: number = BIRD_RADIUS) {
    this.x = BIRD_X;
    this.y = GAME_HEIGHT / 2;
  }

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

  startFalling() {
    this.velocityY = FLAP_VELOCITY;
  }

  reset() {
    this.x = BIRD_X;
    this.y = GAME_HEIGHT / 2;
    this.velocityY = 0;
  }

  getHitbox(): Circle {
    return {
      x: this.x,
      y: this.y,
      radius: this.radius,
    };
  }

  isVisible(): boolean {
    return (
      this.getHitbox().x + this.getHitbox().radius >= 0 &&
      this.getHitbox().x - this.getHitbox().radius <= GAME_WIDTH &&
      this.getHitbox().y + this.getHitbox().radius >= 0 &&
      this.getHitbox().y - this.getHitbox().radius <= GAME_HEIGHT
    );
  }

  update(dt: number) {
    this.velocityY += GRAVITY * dt;
    this.y += this.velocityY * dt;
  }
}
