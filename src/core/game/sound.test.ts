import { afterEach, describe, expect, it, vi } from "vitest";

import { Sound } from "@/core/game/sound";

describe("Sound", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates and plays the matching sound at the configured volume", () => {
    const play = vi.fn(() => Promise.resolve());
    const audio = { play, volume: 0 };
    const Audio = vi.fn(function Audio() {
      return audio;
    });
    vi.stubGlobal("Audio", Audio);
    const sound = new Sound();

    sound.play("wing");

    expect(Audio).toHaveBeenCalledWith("/sfx/wing.ogg");
    expect(audio.volume).toBe(0.35);
    expect(play).toHaveBeenCalledOnce();
  });

  it("does nothing outside the browser audio environment", () => {
    vi.stubGlobal("Audio", undefined);
    const sound = new Sound();

    expect(() => sound.play("point")).not.toThrow();
  });
});
