import { useEffect } from "react";

export type AnimationFrameCallback = (deltaTime: number, now: number) => void;

export function useAnimationFrame(onFrame: AnimationFrameCallback) {
  useEffect(() => {
    let animationFrame = 0;
    let previousTime = performance.now();

    const tick = (now: number) => {
      const deltaTime = Math.min((now - previousTime) / 1000, 0.05);
      previousTime = now;
      onFrame(deltaTime, now);
      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, [onFrame]);
}
