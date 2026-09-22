import { describe, expect, it } from "vitest";

import { HumanController } from "@/core/game/human";

describe("HumanController", () => {
  it("does not flap until requested", () => {
    const controller = new HumanController();

    expect(controller.decide()).toBe("none");
  });

  it("queues one flap and consumes it on the next decision", () => {
    const controller = new HumanController();

    controller.flap();

    expect(controller.decide()).toBe("flap");
    expect(controller.decide()).toBe("none");
  });

  it("coalesces repeated input until it is consumed", () => {
    const controller = new HumanController();

    controller.flap();
    controller.flap();

    expect(controller.decide()).toBe("flap");
    expect(controller.decide()).toBe("none");
  });
});
