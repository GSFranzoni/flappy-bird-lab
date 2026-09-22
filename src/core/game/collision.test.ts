import { describe, expect, it } from "vitest";

import { Collision } from "@/core/game/collision";

describe("Collision.circleWithRect", () => {
  const rect = { x: 10, y: 20, width: 30, height: 40 };

  it("detects a circle whose center is inside the rectangle", () => {
    expect(Collision.circleWithRect({ x: 25, y: 40, radius: 1 }, rect)).toBe(true);
  });

  it("detects contact on an edge or corner", () => {
    expect(Collision.circleWithRect({ x: 5, y: 40, radius: 5 }, rect)).toBe(true);
    expect(Collision.circleWithRect({ x: 5, y: 15, radius: Math.sqrt(50) }, rect)).toBe(true);
  });

  it("rejects circles outside the rectangle", () => {
    expect(Collision.circleWithRect({ x: 4.99, y: 40, radius: 5 }, rect)).toBe(false);
    expect(Collision.circleWithRect({ x: 50, y: 70, radius: 1 }, rect)).toBe(false);
  });
});
