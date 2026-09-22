import { useEffect, useRef } from "react";

export type AnimationFrameCallback = (deltaTime: number, now: number) => void;

export function useAnimationFrame(onFrame: AnimationFrameCallback) {
  const onFrameRef = useRef(onFrame);

  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    let animationFrame = 0;
    let previousTime = performance.now();

    const tick = (now: number) => {
      const deltaTime = Math.min((now - previousTime) / 1000, 0.05);
      previousTime = now;
      onFrameRef.current(deltaTime, now);
      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, []);
}
