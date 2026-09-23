import z from "zod";

export type Vector = number[];

export type Matrix = Vector[];

export interface Layer {
  forward(input: Vector): Vector;
  backward(gradient: Vector): Vector;
  parameters(): readonly Parameter[];
}

export interface Parameter {
  readonly values: Vector;
  readonly gradients: Vector;
}

export class ReLULayer implements Layer {
  private input: Vector = [];

  forward(input: Vector): Vector {
    this.input = input;

    return input.map((x) => Math.max(0, x));
  }

  backward(gradient: Vector): Vector {
    return gradient.map((value, i) => (this.input[i] > 0 ? value : 0));
  }

  parameters(): Parameter[] {
    return [];
  }
}

export class TanhLayer implements Layer {
  private output: Vector = [];

  forward(input: Vector): Vector {
    this.output = input.map(Math.tanh);
    return this.output;
  }

  backward(gradient: Vector): Vector {
    return gradient.map((value, index) => value * (1 - this.output[index] ** 2));
  }

  parameters(): Parameter[] {
    return [];
  }
}

export class SigmoidLayer implements Layer {
  private output: Vector = [];

  forward(input: Vector): Vector {
    this.output = input.map((value) => 1 / (1 + Math.exp(-value)));
    return this.output;
  }

  backward(gradient: Vector): Vector {
    return gradient.map((value, index) => value * this.output[index] * (1 - this.output[index]));
  }

  parameters(): Parameter[] {
    return [];
  }
}

export class DenseLayer implements Layer {
  readonly weights: Matrix;

  readonly biases: Vector;

  readonly weightGradients: Matrix;

  readonly biasGradients: Vector;

  readonly inputSize: number;

  readonly outputSize: number;

  private input: Vector = [];

  constructor(inputSize: number, outputSize: number) {
    this.weights = randomWeights(inputSize, outputSize);
    this.biases = Array(outputSize).fill(0.1);
    this.weightGradients = Array.from({ length: outputSize }, () => Array(inputSize).fill(0));
    this.biasGradients = Array(outputSize).fill(0);
    this.inputSize = inputSize;
    this.outputSize = outputSize;
  }

  forward(input: Vector): Vector {
    this.input = input;

    const output = Array(this.outputSize).fill(0);

    for (let j = 0; j < this.outputSize; j++) {
      let sum = this.biases[j];

      for (let i = 0; i < this.inputSize; i++) {
        sum += this.weights[j][i] * input[i];
      }

      output[j] = sum;
    }

    return output;
  }

  backward(outputGradient: Vector): Vector {
    const inputGradient = Array(this.inputSize).fill(0);

    for (let j = 0; j < this.outputSize; j++) {
      // ∂L/∂b_j
      this.biasGradients[j] = outputGradient[j];

      for (let i = 0; i < this.inputSize; i++) {
        // ∂L/∂W_ji = ∂L/∂y_j * x_i
        this.weightGradients[j][i] = outputGradient[j] * this.input[i];

        // ∂L/∂x_i += ∂L/∂y_j * W_ji
        inputGradient[i] += outputGradient[j] * this.weights[j][i];
      }
    }

    return inputGradient;
  }

  parameters(): readonly Parameter[] {
    return [
      ...this.weights.map((values, i) => ({
        values,
        gradients: this.weightGradients[i],
      })),
      {
        values: this.biases,
        gradients: this.biasGradients,
      },
    ];
  }
}

export class LinearLayer extends DenseLayer {}

export function randomWeights(inputSize: number, outputSize: number): Matrix {
  return Array.from({ length: outputSize }, () =>
    Array.from({ length: inputSize }, () => Math.random() - 0.5),
  );
}

const WeightsSchema = z.array(z.array(z.number()));

export class NeuralNetwork implements Layer {
  readonly layers: Layer[] = [];

  constructor(layers: Layer[]) {
    this.layers = layers;
  }

  clone(factory: () => NeuralNetwork): NeuralNetwork {
    const network = factory();

    network.load(this.export());

    return network;
  }

  export() {
    return this.parameters().map((parameter) => [...parameter.values]);
  }

  load(raw: unknown): boolean {
    const state = WeightsSchema.safeParse(raw);

    const parameters = this.parameters();

    if (
      !state.success ||
      state.data.length !== parameters.length ||
      state.data.some((values, index) => values.length !== parameters[index].values.length)
    ) {
      return false;
    }

    for (let i = 0; i < parameters.length; i++) {
      parameters[i].values.splice(0, parameters[i].values.length, ...state.data[i]);
    }

    return true;
  }

  forward(input: Vector): Vector {
    return this.layers.reduce((input, layer) => layer.forward(input), input);
  }

  backward(gradient: Vector): Vector {
    return this.layers.reduceRight((gradient, layer) => layer.backward(gradient), gradient);
  }

  parameters(): readonly Parameter[] {
    return this.layers.flatMap((layer) => layer.parameters());
  }
}
