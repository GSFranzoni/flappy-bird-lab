import { useEffect, useRef } from "react";

import { loadAssets } from "@/core/game/assets";
import { GAME_HEIGHT, GAME_WIDTH } from "@/core/game/constants";
import { GameEngine } from "@/core/game/engine";
import { HumanController } from "@/core/game/human";
import { GameRenderer } from "@/core/game/renderer";
import { useAnimationFrame } from "@/hooks/use-animation-frame";

const controller = new HumanController();

const game = new GameEngine(controller);

const tapKeys = ["Space", "ArrowUp"];

export function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rendererRef = useRef<GameRenderer | null>(null);

  useAnimationFrame((deltaTime, now) => {
    if (!rendererRef.current) {
      return;
    }

    game.update(deltaTime);
    rendererRef.current.render(game, now);
  });

  const handleInput = () => {
    if (game.isGameOver()) {
      game.restart();
    } else {
      game.start();
    }

    controller.flap();
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return undefined;
    }

    rendererRef.current = new GameRenderer(context, loadAssets());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!tapKeys.includes(event.code)) {
        return;
      }

      event.preventDefault();
      handleInput();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-sky-950 p-4">
      <section className="w-full max-w-100">
        <canvas
          ref={canvasRef}
          aria-label="Flappy Bird game. Click, tap, press Space, or press Arrow Up to flap."
          className="block w-full touch-manipulation rounded-xl shadow-2xl [image-rendering:pixelated]"
          height={GAME_HEIGHT}
          onPointerDown={() => handleInput()}
          width={GAME_WIDTH}
        />
        <p className="mt-3 text-center text-sm font-medium text-sky-100">
          Click, tap, Space, or ↑ to flap
        </p>
      </section>
    </main>
  );
}
