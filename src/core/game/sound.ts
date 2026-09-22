export type SoundEffect = "die" | "hit" | "point" | "swoosh" | "wing";

const sources: Record<SoundEffect, string> = {
  die: "/sfx/die.ogg",
  hit: "/sfx/hit.ogg",
  point: "/sfx/point.ogg",
  swoosh: "/sfx/swoosh.ogg",
  wing: "/sfx/wing.ogg",
};

export class Sound {
  play(effect: SoundEffect) {
    const AudioConstructor = globalThis.Audio;

    if (!AudioConstructor) {
      return;
    }

    const audio = new AudioConstructor(sources[effect]);

    audio.volume = 0.35;

    void audio.play().catch(() => undefined);
  }
}
