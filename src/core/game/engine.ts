import { Agent } from "@/core/game/agent";
import { Collision } from "@/core/game/collision";
import {
  FLOOR_Y,
  GAME_HEIGHT,
  GAME_WIDTH,
  PIPE_GAP,
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
    if (this.phase !== GamePhase.Playing) {
      return;
    }

    for (const pipe of this.pipes) {
      pipe.update(dt);
    }

    for (const agent of this.agents) {
      if (!agent.isAlive()) {
        continue;
      }

      const bird = agent.getBird();

      const action = agent.decide({
        birdY: bird.getY(),
        birdVelocityY: bird.getVelocityY(),
      });

      if (action === "flap") {
        bird.flap();
        this.sound.play("wing");
      }

      bird.update(dt);
      this.checkAgentCollision(agent);
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

  private removeOffscreenPipes() {
    this.pipes = this.pipes.filter((pipe) => {
      const hitbox = pipe.getHitbox();
      const isOffscreen = hitbox.x + hitbox.width < 0;

      if (isOffscreen) {
        this.scoredPipes.delete(pipe);
      }

      return !isOffscreen;
    });
  }

  private spawnPipes() {
    const gapY = GAME_HEIGHT / 2;

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
