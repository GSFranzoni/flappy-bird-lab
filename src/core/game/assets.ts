function createImage(source: string) {
  const image = new Image();
  image.src = source;
  return image;
}

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export type Assets = {
  background: HTMLImageElement;
  base: HTMLImageElement;
  birdDown: HTMLImageElement;
  birdMid: HTMLImageElement;
  birdUp: HTMLImageElement;
  gameOver: HTMLImageElement;
  message: HTMLImageElement;
  pipe: HTMLImageElement;
  digits: HTMLImageElement[];
};

export function loadAssets(): Assets {
  return {
    background: createImage(assetUrl("ui/background.png")),
    base: createImage(assetUrl("ui/base.png")),
    birdDown: createImage(assetUrl("ui/bird-downflap.png")),
    birdMid: createImage(assetUrl("ui/bird-midflap.png")),
    birdUp: createImage(assetUrl("ui/bird-upflap.png")),
    gameOver: createImage(assetUrl("ui/gameover.png")),
    message: createImage(assetUrl("ui/message.png")),
    pipe: createImage(assetUrl("ui/pipe.png")),
    digits: Array.from({ length: 10 }, (_, digit) => `ui/${digit}.png`).map(assetUrl).map(createImage),
  };
}
