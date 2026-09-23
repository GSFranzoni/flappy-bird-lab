import { RotateCcw } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { GameCanvas } from "@/components/game/canvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Evolution } from "@/core/ai/evolution";
import {
  clearTrainingProgress,
  loadTrainingProgress,
  saveTrainingProgress,
} from "@/core/ai/progress";
import { Agent } from "@/core/game/agent";
import { NeuralController } from "@/core/game/ai";
import { Bird } from "@/core/game/bird";
import { MAX_SCORE_PER_GENERATION, STATS_UPDATE_INTERVAL } from "@/core/game/constants";
import { GameEngine } from "@/core/game/engine";
import { Sound } from "@/core/game/sound";

const POPULATION_SIZE = 1000;

const SPEEDS = [1, 5, 20, 60] as const;

type Speed = (typeof SPEEDS)[number];

type Metrics = {
  alive: number;
  bestFitness: number;
  score: number;
};

function createEvolution() {
  return new Evolution(POPULATION_SIZE);
}

function createInitialTraining() {
  const evolution = createEvolution();

  const progress = loadTrainingProgress(POPULATION_SIZE);

  if (progress) {
    evolution.restoreSnapshot(progress);
  }

  return {
    evolution,
    allTimeBestScore: progress?.allTimeBestScore ?? 0,
  };
}

function createGame(evolution: Evolution) {
  const agents = evolution
    .getPopulation()
    .map((individual) => new Agent(new Bird(), new NeuralController(individual.network)));

  const game = new GameEngine(agents, new Sound(false));

  game.start();

  return game;
}

function getMetrics(game: GameEngine): Metrics {
  let alive = 0;
  let bestFitness = 0;

  for (const agent of game.getAgents()) {
    if (agent.isAlive()) {
      alive++;
    }

    bestFitness = Math.max(bestFitness, agent.getFitness());
  }

  return {
    alive,
    bestFitness,
    score: game.getScore(),
  };
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
        className={`font-mono text-sm tabular-nums ${
          emphasis ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function TelemetryPanel({
  generation,
  metrics,
  allTimeBest,
  allTimeBestScore,
  speed,
  setSpeed,
  resetTraining,
}: {
  generation: number;
  metrics: Metrics;
  allTimeBest: number;
  allTimeBestScore: number;
  speed: Speed;
  setSpeed: (speed: Speed) => void;
  resetTraining: () => void;
}) {
  return (
    <>
      <StatRow label="Generation" value={String(generation).padStart(3, "0")} emphasis />
      <StatRow label="Alive / Population" value={`${metrics.alive} / ${POPULATION_SIZE}`} />
      <StatRow label="Best fitness" value={metrics.bestFitness.toFixed(2)} />
      <StatRow
        label="All-time best fitness"
        value={Math.max(allTimeBest, metrics.bestFitness).toFixed(2)}
        emphasis
      />
      <StatRow label="Best score" value={String(metrics.score).padStart(2, "0")} />
      <StatRow
        label="All-time best score"
        value={String(Math.max(allTimeBestScore, metrics.score)).padStart(2, "0")}
        emphasis
      />
      <Separator className="my-5" />
      <section aria-labelledby="evolution-title">
        <h2 id="evolution-title" className="text-xs font-semibold tracking-[0.16em] uppercase">
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
          <h2 id="speed-title" className="text-xs font-semibold tracking-[0.16em] uppercase">
            Simulation speed
          </h2>
          <span className="text-muted-foreground font-mono text-[10px]">TICK RATE</span>
        </div>
        <ToggleGroup
          value={[String(speed)]}
          onValueChange={([value]) => {
            if (value) {
              setSpeed(Number(value) as Speed);
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
              {option === 60 ? "Max" : `${option}×`}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </section>
      <Button onClick={resetTraining} variant="outline" size="sm" className="mt-6 w-full">
        <RotateCcw />
        Reset training
      </Button>
    </>
  );
}

type Stats = {
  generation: number;
  metrics: Metrics;
  allTimeBest: number;
  allTimeBestScore: number;
};

export function Training() {
  const [initial] = useState(() => {
    const training = createInitialTraining();

    return {
      ...training,
      game: createGame(training.evolution),
    };
  });

  const evolutionRef = useRef(initial.evolution);

  const gameRef = useRef(initial.game);

  const lastStatsUpdateRef = useRef(0);

  const [stats, setStats] = useState<Stats>(() => ({
    generation: initial.evolution.getGeneration(),
    metrics: getMetrics(initial.game),
    allTimeBest: initial.evolution.getAllTimeBestFitness(),
    allTimeBestScore: initial.allTimeBestScore,
  }));

  const [speed, setSpeed] = useState<Speed>(1);

  const updateTraining = useCallback(
    (deltaTime: number, now: number) => {
      for (let step = 0; step < speed; step++) {
        if (
          gameRef.current.isGameOver() ||
          gameRef.current.getScore() >= MAX_SCORE_PER_GENERATION
        ) {
          const evolution = evolutionRef.current;

          const completed = getMetrics(gameRef.current);

          const allTimeBestScore = Math.max(stats.allTimeBestScore, completed.score);

          evolution.setFitnessResults(
            gameRef.current.getAgents().map((agent) => agent.getFitness()),
          );

          evolution.next();

          saveTrainingProgress(evolution.getSnapshot(allTimeBestScore));

          gameRef.current = createGame(evolution);

          setStats({
            generation: evolution.getGeneration(),
            metrics: getMetrics(gameRef.current),
            allTimeBest: evolution.getAllTimeBestFitness(),
            allTimeBestScore,
          });
        }

        gameRef.current.update(deltaTime);
      }

      if (now - lastStatsUpdateRef.current >= STATS_UPDATE_INTERVAL) {
        lastStatsUpdateRef.current = now;

        setStats((current) => ({
          ...current,
          metrics: getMetrics(gameRef.current),
        }));
      }
    },
    [speed, stats.allTimeBestScore],
  );

  const resetTraining = useCallback(() => {
    clearTrainingProgress();

    const evolution = createEvolution();
    const game = createGame(evolution);

    evolutionRef.current = evolution;
    gameRef.current = game;
    lastStatsUpdateRef.current = 0;

    setStats({
      generation: evolution.getGeneration(),
      metrics: getMetrics(game),
      allTimeBest: 0,
      allTimeBestScore: 0,
    });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="grid items-start gap-6 sm:justify-center md:grid-cols-[26rem_19rem]">
        <section aria-label="Flappy Bird training simulation" className="min-w-0">
          <GameCanvas
            gameRef={gameRef}
            onFrame={updateTraining}
            aria-label="Flappy Bird AI training simulation."
            className="block w-full rounded-2xl [image-rendering:pixelated]"
          />
        </section>

        <aside aria-label="Training controls" className="hidden md:block">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs tracking-[0.16em] uppercase">
                Training telemetry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TelemetryPanel
                {...{
                  ...stats,
                  speed,
                  setSpeed,
                  resetTraining,
                }}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
      <Sheet>
        <SheetTrigger
          render={<Button variant="outline" className="fixed right-4 bottom-4 z-40 md:hidden" />}
        >
          Telemetry
        </SheetTrigger>
        <SheetContent className="w-[90%] md:hidden">
          <SheetHeader>
            <SheetTitle>Training telemetry</SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6">
            <TelemetryPanel
              {...{
                ...stats,
                speed,
                setSpeed,
                resetTraining,
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
