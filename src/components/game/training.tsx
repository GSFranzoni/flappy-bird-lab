import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Evolution } from "@/core/ai/evolution";
import { loadAssets } from "@/core/game/assets";
import { GAME_HEIGHT, GAME_WIDTH } from "@/core/game/constants";
import { GameEngine } from "@/core/game/engine";
import { GameRenderer } from "@/core/game/renderer";
import { Sound } from "@/core/game/sound";
import { useAnimationFrame } from "@/hooks/use-animation-frame";

const POPULATION_SIZE = 1000;

const SPEEDS = [1, 5, 20, "MAX"] as const;

type Speed = (typeof SPEEDS)[number];

type Metrics = { alive: number; bestFitness: number; score: number };

function createEvolution() {
  return new Evolution(POPULATION_SIZE);
}

function newGame(evolution: Evolution) {
  const game = new GameEngine(evolution.getPopulation(), new Sound(false));
  game.start();
  return game;
}

function getMetrics(game: GameEngine): Metrics {
  let alive = 0;
  let bestFitness = 0;
  for (const agent of game.getAgents()) {
    if (agent.isAlive()) {
      alive += 1;
    }
    bestFitness = Math.max(bestFitness, agent.getFitness());
  }
  return { alive, bestFitness, score: game.getScore() };
}

function StatRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <span className="text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase">
        {label}
      </span>
      <span
        className={`font-mono text-sm tabular-nums ${emphasis ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

export function Game() {
  const [initialEvolution] = useState(createEvolution);

  const evolutionRef = useRef(initialEvolution);

  const gameRef = useRef<GameEngine | null>(null);

  const rendererRef = useRef<GameRenderer | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const lastStatsUpdateRef = useRef(0);

  const [generation, setGeneration] = useState(1);

  const [metrics, setMetrics] = useState<Metrics>({
    alive: POPULATION_SIZE,
    bestFitness: 0,
    score: 0,
  });

  const [allTimeBest, setAllTimeBest] = useState(0);

  const [speed, setSpeed] = useState<Speed>(1);

  const resetTraining = useCallback(() => {
    const evolution = createEvolution();
    evolutionRef.current = evolution;
    gameRef.current = newGame(evolution);
    setGeneration(evolution.getGeneration());
    setMetrics({ alive: POPULATION_SIZE, bestFitness: 0, score: 0 });
    setAllTimeBest(0);
  }, []);

  useAnimationFrame((deltaTime, now) => {
    const game = gameRef.current;

    const renderer = rendererRef.current;

    if (!renderer || !game) {
      return;
    }

    if (game.isGameOver()) {
      const completed = getMetrics(game);
      const evolution = evolutionRef.current;
      setAllTimeBest((best) => Math.max(best, completed.bestFitness));
      evolution.next();
      gameRef.current = newGame(evolution);
      setGeneration(evolution.getGeneration());
    }

    const activeGame = gameRef.current;
    if (!activeGame) {
      return;
    }

    const steps = speed === "MAX" ? 60 : speed;

    for (let step = 0; step < steps; step += 1) {
      activeGame.update(deltaTime);
    }

    renderer.render(activeGame, now);

    if (now - lastStatsUpdateRef.current > 120) {
      lastStatsUpdateRef.current = now;
      setMetrics(getMetrics(activeGame));
    }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return undefined;
    }
    gameRef.current = newGame(evolutionRef.current);
    rendererRef.current = new GameRenderer(context, loadAssets());
    return () => {
      rendererRef.current = null;
    };
  }, []);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="border-border mb-7 flex items-end justify-between border-b pb-5">
          <div>
            <p className="text-muted-foreground mb-1 font-mono text-[10px] tracking-[0.22em] uppercase">
              Experiment 01
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Flappy Lab</h1>
            <p className="text-muted-foreground mt-1 text-sm">Neuroevolution playground</p>
          </div>
        </header>
        <div className="grid items-start gap-6 lg:grid-cols-[26rem_21rem] lg:justify-center">
          <section aria-label="Flappy Bird training simulation" className="min-w-0">
            <canvas
              ref={canvasRef}
              aria-label="Flappy Bird AI training simulation."
              className="block w-full rounded-2xl [image-rendering:pixelated]"
              height={GAME_HEIGHT}
              width={GAME_WIDTH}
            />
          </section>
          <aside aria-label="Training controls">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs tracking-[0.16em] uppercase">
                  Training telemetry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatRow label="Generation" value={String(generation).padStart(3, "0")} emphasis />
                <StatRow
                  label="Alive / Population"
                  value={`${metrics.alive} / ${POPULATION_SIZE}`}
                />
                <StatRow label="Best fitness" value={metrics.bestFitness.toFixed(2)} />
                <StatRow label="All-time best fitness" value={allTimeBest.toFixed(2)} emphasis />
                <StatRow label="Best score" value={String(metrics.score).padStart(2, "0")} />
                <Separator className="my-5" />
                <section aria-labelledby="evolution-title">
                  <h2
                    id="evolution-title"
                    className="text-xs font-semibold tracking-[0.16em] uppercase"
                  >
                    Evolution
                  </h2>
                  <div className="mt-2">
                    <StatRow label="Population" value="1,000" />
                    <StatRow label="Elite" value="10%" />
                    <StatRow label="Mutation rate" value="10%" />
                    <StatRow label="Mutation amount" value="0.20" />
                  </div>
                </section>
                <Separator className="my-5" />
                <section aria-labelledby="speed-title">
                  <div className="flex items-center justify-between">
                    <h2
                      id="speed-title"
                      className="text-xs font-semibold tracking-[0.16em] uppercase"
                    >
                      Simulation speed
                    </h2>
                    <span className="text-muted-foreground font-mono text-[10px]">TICK RATE</span>
                  </div>
                  <ToggleGroup
                    value={[String(speed)]}
                    onValueChange={(values) => {
                      const nextSpeed = values[0];
                      if (nextSpeed) {
                        setSpeed(
                          nextSpeed === "MAX"
                            ? "MAX"
                            : (Number(nextSpeed) as Exclude<Speed, "MAX">),
                        );
                      }
                    }}
                    variant="outline"
                    size="sm"
                    spacing={0}
                    className="mt-3"
                    aria-label="Simulation speed"
                  >
                    {SPEEDS.map((option) => (
                      <ToggleGroupItem key={option} value={String(option)}>
                        {option === "MAX" ? option : `${option}×`}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </section>
                <Button onClick={resetTraining} variant="outline" size="sm" className="mt-6 w-full">
                  <RotateCcw />
                  Reset training
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
