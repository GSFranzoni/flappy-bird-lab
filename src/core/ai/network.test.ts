import { describe, expect, it } from "vitest";

import { LinearLayer } from "@/core/ai/network";

describe("LinearLayer", () => {
  it("applies weights and biases to produce the requested output size", () => {
    const layer = new LinearLayer(2, 2);
    layer.weights[0] = [2, 3];
    layer.weights[1] = [-1, 4];
    layer.biases[0] = 1;
    layer.biases[1] = -2;

    expect(layer.forward([5, 7])).toEqual([32, 21]);
  });
});
