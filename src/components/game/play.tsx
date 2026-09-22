import { useCallback, useEffect, useRef, useState } from "react";

import { GameCanvas } from "@/components/game/game-canvas";
import { Agent } from "@/core/game/agent";
import { Bird } from "@/core/game/bird";
import { GameEngine } from "@/core/game/engine";
import { HumanController } from "@/core/game/human";
import { Sound } from "@/core/game/sound";

export function Play() {
  const [controller] = useState(() => new HumanController());

  const gameRef = useRef(new GameEngine([new Agent(new Bird(), controller)], new Sound()));

  const updateGame = useCallback((game: GameEngine, deltaTime: number) => {
    game.update(deltaTime);
  }, []);

  const handleInput = useCallback(() => {
    const game = gameRef.current;

    if (game.isGameOver()) {
      game.restart();
    }

    game.start();
    controller.flap();
  }, [controller]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" && event.code !== "ArrowUp") {
        return;
      }

      event.preventDefault();
      handleInput();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleInput]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <section aria-label="Flappy Bird game" className="mx-auto max-w-104">
        <GameCanvas
          gameRef={gameRef}
          onFrame={updateGame}
          onClick={handleInput}
          aria-label="Flappy Bird game. Press space or click to flap."
          className="block w-full cursor-pointer rounded-2xl [image-rendering:pixelated]"
        />
      </section>
    </div>
  );
}
