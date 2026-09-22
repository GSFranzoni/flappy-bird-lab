import type { Action, Controller } from "@/core/game/contracts";

export class HumanController implements Controller {
  private shouldFlap: boolean = false;

  flap() {
    this.shouldFlap = true;
  }

  decide(): Action {
    if (this.shouldFlap) {
      this.shouldFlap = false;
      return "flap";
    }

    return "none";
  }
}
