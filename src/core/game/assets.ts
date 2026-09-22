function createImage(source: string) {
  const image = new Image();
  image.src = source;
  return image;
}

export type Assets = {
  background: HTMLImageElement;
  base: HTMLImageElement;
  birdDown: HTMLImageElement;
  birdMid: HTMLImageElement;
  birdUp: HTMLImageElement;
  gameOver: HTMLImageElement;
  pipe: HTMLImageElement;
  digits: HTMLImageElement[];
};

export function loadAssets(): Assets {
  return {
    background: createImage("/ui/background.png"),
    base: createImage("/ui/base.png"),
    birdDown: createImage("/ui/bird-downflap.png"),
    birdMid: createImage("/ui/bird-midflap.png"),
    birdUp: createImage("/ui/bird-upflap.png"),
    gameOver: createImage("/ui/gameover.png"),
    pipe: createImage("/ui/pipe.png"),
    digits: Array.from({ length: 10 }, (_, digit) => `/ui/${digit}.png`).map(createImage),
  };
}
