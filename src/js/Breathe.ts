import * as d3 from "d3";
import assign from "lodash/assign";
import { ThemeConfig } from "./Theme";
import Widget from "./Widget";

interface BreatheProps {
  bellowsEase: string;
  theme: Partial<ThemeConfig>;
  broadcast: (event: string, value: string) => void;
}

class Breathe extends Widget {
  private config: BreatheProps;
  private svg?: d3.Selection<SVGGElement, unknown, HTMLElement, null>;
  private elements: {
    background?: d3.Selection<SVGRectElement, unknown, HTMLElement, null>;
    bellows?: d3.Selection<SVGEllipseElement, unknown, HTMLElement, null>;
    center?: d3.Selection<SVGEllipseElement, unknown, HTMLElement, null>;
  };
  isFirstLoop: boolean = true;
  isThemeSet: boolean = false;

  delay = 420;
  duration = 5700;

  dimensions = {
    bellows: {
      empty: {
        rx: 0.29,
        ry: 0.23,
      },
      full: {
        rx: 0.55,
        ry: 0.55,
      },
    },
    center: {
      empty: {
        rx: 0.26,
        ry: 0.2,
      },
      full: {
        rx: 0.24,
        ry: 0.18,
      },
    },
  };

  constructor(id: string, config: Partial<BreatheProps>) {
    super(id);

    const defaultTheme: ThemeConfig = {
      backgroundEmpty: "#4A4A4A",
      backgroundFull: "#333333",
      bellowsEmpty: "#6F6F6F",
      bellowsFull: "#656565",
      centerEmpty: "#6D6D6D",
      centerFull: "#6F6F6F",
    };

    const defaultConfig: BreatheProps = {
      bellowsEase: "cubic-in-out",
      theme: defaultTheme,
      broadcast: () => {},
    };

    this.config = assign({}, defaultConfig, config);
    this.config.theme = assign({}, defaultTheme, config.theme);
    this.elements = {};

    if (this.elem)
      this.elem.on("click", () => this.config.broadcast("setUiState", "full"));
  }

  public onSetBreatheDuration(mode: "short" | "medium" | "long"): this {
    if (mode === "short") {
      this.duration = 4400;
    } else if (mode === "medium") {
      this.duration = 5700;
    } else {
      this.duration = 6600;
    }
    return this;
  }

  public onSetTheme(theme: BreatheProps["theme"]): this {
    if (theme) {
      this.config.theme = {
        ...this.config.theme,
        ...theme,
      };
    }

    if (!this.isThemeSet) {
      this.isThemeSet = true;
      this.init();
    }

    return this;
  }

  async transitionFill() {
    if (!this.width || !this.height) {
      return;
    }

    const { backgroundFull, bellowsFull, centerFull } = this.config.theme;

    return Promise.all([
      new Promise((resolve) => {
        if (!backgroundFull) {
          return;
        }

        this.elements.background
          ?.transition()
          .delay(this.delay)
          .duration(this.duration)
          .attr("fill", backgroundFull)
          .on("end", resolve);
      }),
      new Promise((resolve) => {
        if (!this.width || !this.height || !bellowsFull) {
          return;
        }

        this.elements.bellows
          ?.transition()
          .delay(this.delay)
          .duration(this.duration)
          .ease(d3.easeCubicInOut)
          .attr("fill", bellowsFull)
          .attr("rx", this.width * this.dimensions.bellows.full.rx)
          .attr("ry", this.height * this.dimensions.bellows.full.ry)
          .on("end", resolve);
      }),
      new Promise((resolve) => {
        if (!this.width || !this.height || !centerFull) {
          return;
        }

        this.elements.center
          ?.transition()
          .delay(this.delay)
          .duration(this.duration)
          .attr("fill", centerFull)
          .attr("rx", this.width * this.dimensions.center.full.rx)
          .attr("ry", this.height * this.dimensions.center.full.ry)
          .on("end", resolve);
      }),
    ]);
  }

  async transitionEmpty() {
    if (!this.width || !this.height) {
      return;
    }

    const { backgroundEmpty, bellowsEmpty, centerEmpty } = this.config.theme;

    if (this.isFirstLoop) {
      const today = new Date();
      const month = today.getMonth(); // 0-based: October is 9, November is 10
      const day = today.getDate();

      const isHalloweenSeason =
        (month === 9 && day >= 15) || (month === 10 && day <= 15);

      if (isHalloweenSeason) {
        setTimeout(() => {
          this.config.broadcast("setUiState", "spooky");
        }, this.duration / 2);
      }
    }

    return Promise.all([
      new Promise((resolve) => {
        if (!backgroundEmpty) {
          return;
        }
        this.elements.background
          ?.transition()
          .duration(this.duration)
          .attr("fill", backgroundEmpty)
          .on("end", resolve);
      }),
      new Promise((resolve) => {
        if (!this.width || !this.height || !bellowsEmpty) {
          return;
        }

        this.elements.bellows
          ?.transition()
          .ease(d3.easeCubicInOut)
          .duration(this.duration)
          .attr("fill", bellowsEmpty)
          .attr("rx", this.width * this.dimensions.bellows.empty.rx)
          .attr("ry", this.height * this.dimensions.bellows.empty.ry)
          .on("end", resolve);
      }),
      new Promise((resolve) => {
        if (!this.width || !this.height || !centerEmpty) {
          return;
        }

        this.elements.center
          ?.transition()
          .duration(this.duration)
          .attr("fill", centerEmpty)
          .attr("rx", this.width * this.dimensions.center.empty.rx)
          .attr("ry", this.height * this.dimensions.center.empty.ry)
          .on("end", resolve);
      }),
    ]);
  }

  private async loop() {
    const transitions = [
      this.transitionFill.bind(this),
      this.transitionEmpty.bind(this),
    ];

    for (const transition of transitions) {
      await transition();
    }

    if (this.isFirstLoop) {
      this.isFirstLoop = false;
    }
    this.loop();
  }

  private init(): void {
    d3.select(this.id).selectAll("*").remove();

    if (!this.width || !this.height) {
      return;
    }

    const { backgroundEmpty, bellowsEmpty, centerEmpty } = this.config.theme;

    if (!backgroundEmpty || !bellowsEmpty || !centerEmpty) return;

    this.svg = d3
      .select(this.id)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .append("g");

    this.elements.background = this.svg
      .append("rect")
      .attr("id", "background")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", backgroundEmpty);

    this.elements.bellows = this.svg
      .append("ellipse")
      .attr("id", "bellows")
      .attr("rx", this.width * this.dimensions.bellows.empty.rx)
      .attr("ry", this.height * this.dimensions.bellows.empty.ry)
      .attr("fill", bellowsEmpty)
      .attr("cx", "50%")
      .attr("cy", "50%");

    this.elements.center = this.svg
      .append("ellipse")
      .attr("id", "center")
      .attr("rx", this.width * this.dimensions.center.empty.rx)
      .attr("ry", this.height * this.dimensions.center.empty.ry)
      .attr("fill", centerEmpty)
      .attr("cx", "50%")
      .attr("cy", "50%");

    this.loop();
  }
}

export default Breathe;
