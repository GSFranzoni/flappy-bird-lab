import { RotateCcw } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { GameCanvas } from "@/components/game/game-canvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Evolution } from "@/core/ai/evolution";
import { Agent } from "@/core/game/agent";
import { NeuralController } from "@/core/game/ai";
import { Bird } from "@/core/game/bird";
import { MAX_SCORE_PER_GENERATION } from "@/core/game/constants";
import { GameEngine } from "@/core/game/engine";
import { Sound } from "@/core/game/sound";

const POPULATION_SIZE = 1000;

const SPEEDS = [1, 5, 20, "MAX"] as const;

type Speed = (typeof SPEEDS)[number];

type Metrics = {
  alive: number;
  bestFitness: number;
  score: number;
};

function createEvolution() {
  return new Evolution(POPULATION_SIZE);
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
  speed,
  setSpeed,
  resetTraining,
}: {
  generation: number;
  metrics: Metrics;
  allTimeBest: number;
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
          onValueChange={(values) => {
            const value = values[0];
            if (value) {
              setSpeed(value === "MAX" ? "MAX" : (Number(value) as Exclude<Speed, "MAX">));
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
    </>
  );
}

export function Training() {
  const [initialEvolution] = useState(createEvolution);

  const [initialGame] = useState(() => createGame(initialEvolution));

  const evolutionRef = useRef<Evolution>(initialEvolution);

  const gameRef = useRef<GameEngine>(initialGame);

  const lastStatsUpdateRef = useRef(0);

  const [generation, setGeneration] = useState(initialEvolution.getGeneration());

  const [metrics, setMetrics] = useState<Metrics>({
    alive: POPULATION_SIZE,
    bestFitness: 0,
    score: 0,
  });

  const [allTimeBest, setAllTimeBest] = useState(0);

  const [speed, setSpeed] = useState<Speed>(1);

  const updateTraining = useCallback(
    (game: GameEngine, deltaTime: number, now: number) => {
      const steps = speed === "MAX" ? 60 : speed;

      for (let step = 0; step < steps; step++) {
        if (game.isGameOver() || game.getScore() >= MAX_SCORE_PER_GENERATION) {
          const completed = getMetrics(game);
          const agents = game.getAgents();

          setAllTimeBest((best) => Math.max(best, completed.bestFitness));

          const evolution = evolutionRef.current!;

          evolution.setFitnessResults(agents.map((agent) => agent.getFitness()));
          evolution.next();

          game = createGame(evolution);
          gameRef.current = game;

          setGeneration(evolution.getGeneration());
        }

        game.update(deltaTime);
      }

      if (now - lastStatsUpdateRef.current >= 120) {
        lastStatsUpdateRef.current = now;
        setMetrics(getMetrics(game));
      }
    },
    [speed],
  );

  const resetTraining = useCallback(() => {
    const evolution = createEvolution();
    const game = createGame(evolution);

    evolutionRef.current = evolution;
    gameRef.current = game;

    lastStatsUpdateRef.current = 0;

    setGeneration(evolution.getGeneration());
    setMetrics(getMetrics(game));
    setAllTimeBest(0);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="grid items-start gap-6 lg:grid-cols-[26rem_21rem] lg:justify-center">
        <section aria-label="Flappy Bird training simulation" className="min-w-0">
          <GameCanvas
            gameRef={gameRef}
            onFrame={updateTraining}
            aria-label="Flappy Bird AI training simulation."
            className="block w-full rounded-2xl [image-rendering:pixelated]"
          />
        </section>

        <aside aria-label="Training controls" className="hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs tracking-[0.16em] uppercase">
                Training telemetry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TelemetryPanel
                {...{ generation, metrics, allTimeBest, speed, setSpeed, resetTraining }}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
      <Sheet>
        <SheetTrigger
          render={<Button variant="outline" className="fixed right-4 bottom-4 z-40 lg:hidden" />}
        >
          Telemetry
        </SheetTrigger>
        <SheetContent className="w-[90%] lg:hidden">
          <SheetHeader>
            <SheetTitle>Training telemetry</SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6">
            <TelemetryPanel
              {...{ generation, metrics, allTimeBest, speed, setSpeed, resetTraining }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
