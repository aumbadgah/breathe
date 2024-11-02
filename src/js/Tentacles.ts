// Source code for https://soulwire.co.uk/tentacles/

import { throttle } from "lodash";
import { Tween, Easing } from "@tweenjs/tween.js";
import Widget from "./Widget";
import { ThemeConfig } from "./Theme";

// ——————————————————————————————————————————————————
// Random
// ——————————————————————————————————————————————————

class Random {
  static float(min: number = 0, max: number = 1): number {
    return min + Math.random() * (max - min);
  }
  static int(min: number, max: number): number {
    return Math.round(Random.float(min, max));
  }
  static sign(chance: number = 0.5): number {
    return Math.random() >= chance ? -1 : 1;
  }
  static bool(chance: number = 0.5): boolean {
    return Math.random() < chance;
  }
  static bit(chance: number = 0.5): number {
    return Math.random() < chance ? 0 : 1;
  }
  static item<T>(list: T[]): T {
    return list[~~(Math.random() * list.length)];
  }
}

// ————————————————————————————————————————————————
// Tentacle
// ——————————————————————————————————————————————————

type TentacleParams = {
  x?: number;
  y?: number;
  angle?: number;
  colors: TentacleColors;
};

class Tentacle {
  x: number;
  y: number;
  angle: number;
  segments: any[];
  fillColor: string;
  strokeColor: string;
  lineWidth: number;
  segmentCount: number;
  thickness: number;
  spacing: number;
  curl: number;
  step: number;
  _length: number;

  constructor({
    x = 0,
    y = 0,
    angle = Random.float(Math.PI * 2),
    colors,
  }: TentacleParams) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.segments = [];
    this.fillColor = colors.fill;
    this.strokeColor = colors.stroke;
    this.lineWidth = 0.25;
    this.segmentCount = Random.int(80, 220);

    if (Random.bool(0.05)) {
      this.thickness = Random.float(20, 100);
      this.spacing = Random.float(4.0, 12.0);
    } else {
      this.thickness = Random.float(10, 50);
      this.spacing = Random.float(2.0, 6.0);
    }

    this.curl = Random.float(0.1, 0.85);
    this.step = Random.float(0.01, 0.075);
    this._length = 0;
    this.build();
  }

  build() {
    let theta = this.angle;
    let x = this.x;
    let y = this.y;
    let v = 0;
    for (let i = 0; i < this.segmentCount; i++) {
      let s = Math.sin(theta);
      let c = Math.cos(theta);
      const segment = {
        radius: this.thickness / 2,
        scale: 0,
        theta,
        px: -s,
        py: c,
        x,
        y,
      };
      this.segments.push(segment);
      x += c * this.spacing;
      y += s * this.spacing;
      v += this.step * Random.float(-1, 1);
      v *= 0.9 + this.curl * 0.1;
      theta += v;
    }
  }

  get length() {
    return this._length;
  }

  set length(value: number) {
    const limit = this.segments.length * value;
    const power = Math.pow(value, 0.25);
    this.segments.forEach((segment, index) => {
      segment.scale = index < limit ? (1 - index / limit) * power : 0;
    });
    this._length = value;
  }
}

// —————————————————————————————————————————————————
// Scene
// ——————————————————————————————————————————————————

const MAX_TENTACLES = 10;
type TentacleColors = {
  fill: string;
  stroke: string;
};
type SceneParams = {
  width: number;
  height: number;
};
class Scene {
  tentacles: Tentacle[];
  activeTweens: Tween[];
  width: number;
  height: number;
  colors: TentacleColors = {
    fill: "#111",
    stroke: "#999",
  };
  isRunning = false;

  constructor({ width, height }: SceneParams) {
    this.width = width;
    this.height = height;
    this.tentacles = [];
    this.activeTweens = [];
    this.addTentacle = this.addTentacle.bind(this);
    this.setSize(width, height);
  }

  handleTweenComplete(tentacle: Tentacle) {
    const removalDelay = 2000;
    setTimeout(() => {
      const index = this.tentacles.indexOf(tentacle);
      if (index !== -1) {
        this.tentacles.splice(index, 1);
      }
    }, removalDelay);

    this.addTentacle();
  }

  addTentacle() {
    const angle = Random.float(0, Math.PI * 2);
    const radiusX = this.width * 0.03;
    const radiusY = this.height * 0.03;
    const r = Math.sqrt(Random.float(0, 1));
    const x = this.width / 2 + radiusX * r * Math.cos(angle);
    const y = this.height / 2 + radiusY * r * Math.sin(angle);

    const tentacle = new Tentacle({ x, y, colors: this.colors });
    const duration = Random.float(2.0, 3.0) * 1000;
    this.tentacles.push(tentacle);

    const tween = new Tween(tentacle)
      .to({ length: 0.99 }, duration)
      .easing(Easing.Quadratic.InOut)
      .onComplete(() => {
        this.handleTweenComplete(tentacle);
      })
      .start();

    this.activeTweens.push(tween);

    if (this.activeTweens.length > MAX_TENTACLES * 3) {
      this.activeTweens = this.activeTweens.slice(-MAX_TENTACLES * 3);
    }

    if (this.tentacles.length < MAX_TENTACLES) {
      const delay = Random.int(100, 1000);
      setTimeout(this.addTentacle, delay);
    }
  }

  stopUpdateLoop() {
    this.isRunning = false;
    this.activeTweens.forEach((tween) => tween.stop());
    this.tentacles = [];
    this.activeTweens = [];
  }

  startUpdateLoop() {
    const update = () => {
      if (!this.isRunning) return;
      requestAnimationFrame(update);
      this.activeTweens.forEach((tween) => tween.update());
    };

    if (!this.isRunning) {
      this.addTentacle();
      this.isRunning = true;
      update();
    }
  }

  onSetTheme(theme: ThemeConfig) {
    const themeColors = Object.values(theme);
    this.colors = {
      fill: Random.item(themeColors),
      stroke: Random.item(themeColors),
    };
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}

// —————————————————————————————————————————————————
// Renderer
// ——————————————————————————————————————————————————

const TAU = Math.PI * 2;
const HPI = Math.PI / 2;
const FADE_OVERLAY = "rgba(255, 255, 255, 0.0)";
const CLEAR_INTERVAL = 15.0;
class Renderer {
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  clearAlpha: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.setSize(width, height);
    this.clearAlpha = 0.01;
    this.clear = this.clear.bind(this);
    this.clear();
  }

  clear() {
    const self = this;
    this.context.clearRect(0, 0, this.width, this.height);
    new Tween(self)
      .to({ clearAlpha: 0.08 }, 2 * 1000)
      .easing(Easing.Sinusoidal.Out)
      .pause(CLEAR_INTERVAL * 1000)
      .onComplete(() => {
        new Tween(self)
          .to({ clearAlpha: 0.01 }, 1 * 1000)
          .easing(Easing.Sinusoidal.Out)
          .onComplete(self.clear);
      });
  }

  render(scene: Scene) {
    this.context.globalAlpha = this.clearAlpha;
    this.context.fillStyle = FADE_OVERLAY;
    this.context.fillRect(0, 0, this.width, this.height);
    this.context.globalAlpha = 1;

    scene.tentacles.forEach((tentacle) => {
      this.renderTentacle(tentacle);
    });
  }

  renderTentacle(tentacle: Tentacle) {
    const n = Math.floor(tentacle.segments.length * tentacle.length);
    const segments = tentacle.segments;

    for (let i = 0; i < n - 1; i++) {
      const a = segments[i];
      const b = segments[i + 1];
      const sA = a.radius * a.scale;

      this.context.beginPath();
      if (i === 0) {
        this.context.arc(a.x, a.y, sA, 0, TAU);
      } else {
        const sB = b.radius * b.scale;
        const lxA = a.x - a.px * sA;
        const lyA = a.y - a.py * sA;
        const rxA = a.x + a.px * sA;
        const ryA = a.y + a.py * sA;
        const lxB = b.x - b.px * sB;
        const lyB = b.y - b.py * sB;
        const rxB = b.x + b.px * sB;
        const ryB = b.y + b.py * sB;

        this.context.moveTo(rxA, ryA);
        this.context.arc(
          a.x,
          a.y,
          sA,
          a.theta + Math.PI / 2,
          a.theta - Math.PI / 2
        );
        this.context.lineTo(lxB, lyB);
        this.context.lineTo(rxB, ryB);
        this.context.lineTo(rxA, ryA);
      }

      this.context.fillStyle = tentacle.fillColor;
      this.context.strokeStyle = tentacle.strokeColor;
      this.context.lineWidth = tentacle.lineWidth;
      this.context.fill();
      this.context.stroke();
    }
  }

  setSize(width: number, height: number) {
    const scale = window.devicePixelRatio || 1;
    this.width = width;
    this.height = height;
    this.canvas.width = width * scale;
    this.canvas.height = height * scale;
    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";
    this.context.scale(scale, scale);
  }
}

type TentaclesProps = {
  broadcast: (event: string, value: string) => void;
};
export default class Tentacles extends Widget {
  private renderer?: Renderer;
  private scene?: Scene;
  private isInitialised: boolean = false;
  private isRunning: boolean = false;
  private isThemeSet: boolean = false;
  private animationFrameId?: number;

  constructor(id: string, { broadcast }: TentaclesProps) {
    super(id);

    const { height, width } = this;
    if (!width || !height) return;
    this.renderer = new Renderer(width, height);
    this.scene = new Scene({ width, height });

    if (!this.elem) return;
    this.elem.append(this.renderer.canvas);

    const resize = () => {
      setTimeout(() => {
        if (!this.renderer || !this.scene) return;
        if (!this.width || !this.height) return;
        this.renderer.setSize(this.width, this.height);
        this.scene.setSize(this.width, this.height);
      }, 2);
    };

    if (this.elem) this.elem.click(() => broadcast("setUiState", "full"));

    window.addEventListener("resize", throttle(resize, 5));
    resize();
  }

  render() {
    this.animationFrameId = requestAnimationFrame(this.render.bind(this));
    if (!this.renderer || !this.scene) return;
    this.renderer.render(this.scene);
  }

  public onStopTentacles() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
    this.scene?.stopUpdateLoop();
    this.renderer?.clear();
    this.isRunning = false;
  }

  public onStartTentacles() {
    if (!this.isInitialised) {
      this.isInitialised = true;
    }

    if (!this.isThemeSet) return;

    if (!this.isRunning) {
      this.isRunning = true;
      this.scene?.startUpdateLoop();
      this.render();
    }
  }

  public onSetTheme(theme: ThemeConfig) {
    if (theme && this.scene) {
      this.scene.onSetTheme(theme);

      if (!this.isThemeSet) {
        this.isThemeSet = true;
      }
    }
  }
}
