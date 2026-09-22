import { useEffect, useRef, useState } from "react";

import { Evolution } from "@/core/ai/evolution";
import { loadAssets } from "@/core/game/assets";
import { GAME_HEIGHT, GAME_WIDTH } from "@/core/game/constants";
import { GameEngine } from "@/core/game/engine";
import { GameRenderer } from "@/core/game/renderer";
import { Sound } from "@/core/game/sound";
import { useAnimationFrame } from "@/hooks/use-animation-frame";

const evolution = new Evolution(100);

function newGame() {
  const nextGame = new GameEngine(evolution.getPopulation(), new Sound(false));
  nextGame.start();
  return nextGame;
}

export function Game() {
  const [generation, setGeneration] = useState(evolution.getGeneration());

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const gameRef = useRef<GameEngine>(null);

  const rendererRef = useRef<GameRenderer | null>(null);

  useAnimationFrame((deltaTime, now) => {
    if (!rendererRef.current || !gameRef.current) {
      return;
    }

    if (gameRef.current.isGameOver()) {
      evolution.next();
      gameRef.current = newGame();
      setGeneration(evolution.getGeneration());
    }

    gameRef.current.update(deltaTime);
    rendererRef.current.render(gameRef.current, now);
  });

  useEffect(() => {
    const canvas = canvasRef.current;

    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return undefined;
    }

    gameRef.current = newGame();

    rendererRef.current = new GameRenderer(context, loadAssets());

    return () => {
      rendererRef.current = null;
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-sky-950 p-4">
      <section className="w-full max-w-100">
        <canvas
          ref={canvasRef}
          aria-label="Flappy Bird AI training simulation."
          className="block w-full touch-manipulation rounded-xl shadow-2xl [image-rendering:pixelated]"
          height={GAME_HEIGHT}
          width={GAME_WIDTH}
        />
        <p className="mt-3 text-center text-sm font-medium text-sky-100">
          AI training generation {generation}
        </p>
      </section>
    </main>
  );
}
