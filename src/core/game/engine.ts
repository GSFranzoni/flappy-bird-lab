import { Agent } from "@/core/game/agent";
import { Collision } from "@/core/game/collision";
import {
  FLOOR_Y,
  GAME_HEIGHT,
  GAME_WIDTH,
  PIPE_GAP,
  PIPE_GAP_MARGIN,
  PIPE_SPAWN_INTERVAL,
  PIPE_WIDTH,
} from "@/core/game/constants";
import { GamePhase } from "@/core/game/contracts";
import { Pipe } from "@/core/game/pipe";
import { Sound } from "@/core/game/sound";

export class GameEngine {
  private pipes: Pipe[] = [];

  private score = 0;

  private phase: GamePhase = GamePhase.Ready;

  private pipeSpawnTimer = 0;

  private scoredPipes = new Set<Pipe>();

  constructor(
    private agents: Agent[],
    private sound: Sound = new Sound(),
  ) {
    this.reset();
  }

  start() {
    if (this.phase === GamePhase.Ready) {
      this.phase = GamePhase.Playing;
    }
  }

  restart() {
    this.reset();
    this.start();
  }

  private reset() {
    for (const agent of this.agents) {
      agent.reset();
    }

    this.pipes = [];
    this.score = 0;
    this.phase = GamePhase.Ready;
    this.pipeSpawnTimer = 0;
    this.scoredPipes.clear();
    this.spawnPipes();
  }

  update(dt: number) {
    if (this.phase === GamePhase.Ready) {
      return;
    }

    if (this.phase === GamePhase.GameOver) {
      this.updateDeadAgents(dt);
      return;
    }

    for (const pipe of this.pipes) {
      pipe.update(dt);
    }

    for (const agent of this.agents) {
      if (!agent.isAlive()) {
        this.updateDeadAgent(agent, dt);
        continue;
      }

      const bird = agent.getBird();

      const action = agent.decide(this.getObservation(agent));

      if (action === "flap") {
        bird.flap();
        this.sound.play("wing");
      }

      bird.update(dt);
      this.checkAgentCollision(agent);
      agent.addFitness(dt);
    }

    this.updateScore();
    this.removeOffscreenPipes();

    this.pipeSpawnTimer += dt;
    while (this.pipeSpawnTimer >= PIPE_SPAWN_INTERVAL) {
      this.pipeSpawnTimer -= PIPE_SPAWN_INTERVAL;
      this.spawnPipes();
    }

    if (this.agents.every((agent) => !agent.isAlive())) {
      this.endGame();
    }
  }

  private updateScore() {
    for (const pipe of this.pipes) {
      const hitbox = pipe.getHitbox();
      const isTopPipe = pipe.getDirection() === "up";
      const hasPassedAnAgent = this.agents.some(
        (agent) => hitbox.x + hitbox.width < agent.getBird().getX(),
      );

      if (isTopPipe && hasPassedAnAgent && !this.scoredPipes.has(pipe)) {
        this.scoredPipes.add(pipe);
        this.score += 1;
        this.sound.play("point");
      }
    }
  }

  private getObservation(agent: Agent) {
    const bird = agent.getBird();

    const nextPipe = this.pipes.find(
      (pipe) => pipe.getDirection() === "down" && pipe.getHitbox().x >= bird.getX(),
    );

    const pipeHitbox = nextPipe?.getHitbox() ?? {
      x: GAME_WIDTH,
      y: GAME_HEIGHT,
    };

    return {
      birdY: bird.getY(),
      birdVelocityY: bird.getVelocityY(),
      pipeDistanceX: pipeHitbox.x - bird.getX(),
      pipeGapY: pipeHitbox.y - PIPE_GAP / 2,
    };
  }

  private removeOffscreenPipes() {
    this.pipes = this.pipes.filter((pipe) => {
      const isVisible = pipe.isVisible();

      if (!isVisible) {
        this.scoredPipes.delete(pipe);
      }

      return isVisible;
    });
  }

  private spawnPipes() {
    const minimumGapY = PIPE_GAP / 2 + PIPE_GAP_MARGIN;
    const maximumGapY = FLOOR_Y - PIPE_GAP / 2 - PIPE_GAP_MARGIN;
    const gapY = minimumGapY + Math.random() * (maximumGapY - minimumGapY);

    const gapTop = gapY - PIPE_GAP / 2;
    const gapBottom = gapY + PIPE_GAP / 2;

    this.pipes.push(new Pipe(GAME_WIDTH, 0, PIPE_WIDTH, gapTop, "up"));

    this.pipes.push(new Pipe(GAME_WIDTH, gapBottom, PIPE_WIDTH, FLOOR_Y - gapBottom, "down"));
  }

  private checkAgentCollision(agent: Agent) {
    const bird = agent.getBird().getHitbox();

    const hitPipe = this.pipes.some((pipe) => Collision.circleWithRect(bird, pipe.getHitbox()));

    const hitWorld = bird.y - bird.radius <= 0 || bird.y + bird.radius >= FLOOR_Y;

    if (hitPipe || hitWorld) {
      agent.kill();
      this.sound.play("hit");
    }
  }

  private updateDeadAgents(dt: number) {
    for (const agent of this.agents) {
      this.updateDeadAgent(agent, dt);
    }
  }

  private updateDeadAgent(agent: Agent, dt: number) {
    agent.getBird().update(dt);
  }

  private endGame() {
    if (this.phase === GamePhase.GameOver) {
      return;
    }

    this.phase = GamePhase.GameOver;
    this.sound.play("die");
  }

  getAgents() {
    return this.agents;
  }

  getPipes() {
    return this.pipes;
  }

  getScore() {
    return this.score;
  }

  isGameOver() {
    return this.phase === GamePhase.GameOver;
  }

  getPhase() {
    return this.phase;
  }
}
