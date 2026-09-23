export type SoundEffect = "die" | "hit" | "point" | "swoosh" | "wing";

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const sources: Record<SoundEffect, string> = {
  die: assetUrl("sfx/die.ogg"),
  hit: assetUrl("sfx/hit.ogg"),
  point: assetUrl("sfx/point.ogg"),
  swoosh: assetUrl("sfx/swoosh.ogg"),
  wing: assetUrl("sfx/wing.ogg"),
};

export class Sound {
  constructor(private enabled = true) {}

  play(effect: SoundEffect) {
    if (!this.enabled) {
      return;
    }

    const AudioConstructor = globalThis.Audio;

    if (!AudioConstructor) {
      return;
    }

    const audio = new AudioConstructor(sources[effect]);

    audio.volume = 0.35;

    void audio.play().catch(() => undefined);
  }
}
