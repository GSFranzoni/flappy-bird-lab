import { useEffect, useRef } from "react";

import { loadAssets } from "@/core/game/assets";
import { GAME_HEIGHT, GAME_WIDTH } from "@/core/game/constants";
import { GameEngine } from "@/core/game/engine";
import { GameRenderer } from "@/core/game/renderer";
import { useAnimationFrame } from "@/hooks/use-animation-frame";

type GameCanvasProps = Omit<React.ComponentPropsWithoutRef<"canvas">, "height" | "width"> & {
  gameRef: React.RefObject<GameEngine>;
  onFrame?: (game: GameEngine, deltaTime: number, now: number) => void;
};

export function GameCanvas({ gameRef, onFrame, ...props }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rendererRef = useRef<GameRenderer | null>(null);

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");

    if (!context) {
      return;
    }

    rendererRef.current = new GameRenderer(context, loadAssets());

    return () => {
      rendererRef.current = null;
    };
  }, []);

  useAnimationFrame((deltaTime, now) => {
    const game = gameRef.current;
    onFrame?.(game, deltaTime, now);
    rendererRef.current?.render(gameRef.current, now);
  });

  return <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} {...props} />;
}
