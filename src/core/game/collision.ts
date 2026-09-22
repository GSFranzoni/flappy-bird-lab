import type { Circle, Rect } from "@/core/game/contracts";

export class Collision {
  static circleWithRect(circle: Circle, rect: Rect) {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));

    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    const dx = circle.x - closestX;
    const dy = circle.y - closestY;

    return dx * dx + dy * dy <= circle.radius * circle.radius;
  }
}
