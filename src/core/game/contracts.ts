export type GameState = {};

export type Action = "flap" | "none";

export interface Observation {
  birdY: number;
  birdVelocityY: number;
  // TODO: implement it
  // pipeDistanceX: number;
  // pipeGapY: number;
}

export interface Controller {
  decide(observation: Observation): Action;
}

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Circle = {
  x: number;
  y: number;
  radius: number;
};
