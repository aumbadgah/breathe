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
  private svg?: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  private elements: {
    background?: d3.Selection<SVGRectElement, unknown, HTMLElement, any>;
    bellows?: d3.Selection<SVGEllipseElement, unknown, HTMLElement, any>;
    center?: d3.Selection<SVGEllipseElement, unknown, HTMLElement, any>;
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
      this.elem.click(() => this.config.broadcast("setUiState", "full"));

    this.init();
  }

  public onSetTheme(theme: BreatheProps["theme"]): this {
    if (theme) {
      this.config.theme = {
        ...this.config.theme,
        ...theme,
      };
    }
    return this;
  }

  private loop(): void {
    const delay = 420;
    const duration = 5700;
    let rdy = 0;

    const ready = () => {
      if (++rdy === 3) {
        this.loop();
      }
    };

    if (!this.width || !this.height) return;

    const {
      backgroundEmpty,
      backgroundFull,
      bellowsEmpty,
      bellowsFull,
      centerEmpty,
      centerFull,
    } = this.config.theme;

    if (!backgroundEmpty || !backgroundFull) return;

    this.elements.background
      ?.transition()
      .delay(delay)
      .duration(duration)
      .attr("fill", backgroundFull)
      .on("end", () => {
        this.elements.background
          ?.transition()
          .duration(duration)
          .attr("fill", backgroundEmpty)
          .on("end", ready);
      });

    if (!bellowsEmpty || !bellowsFull) return;

    this.elements.bellows
      ?.transition()
      .delay(delay)
      .duration(duration)
      .ease(d3.easeCubicInOut)
      .attr("fill", bellowsFull)
      .attr("rx", this.width * 0.55)
      .attr("ry", this.height * 0.55)
      .on("end", () => {
        if (!this.width || !this.height) return;
        this.elements.bellows
          ?.transition()
          .ease(d3.easeCubicInOut)
          .duration(duration)
          .attr("fill", bellowsEmpty)
          .attr("rx", this.width * 0.29)
          .attr("ry", this.height * 0.23)
          .on("end", ready);
      });

    if (!centerEmpty || !centerFull) return;

    this.elements.center
      ?.transition()
      .delay(delay)
      .duration(duration)
      .attr("fill", centerFull)
      .attr("rx", this.width * 0.24)
      .attr("ry", this.height * 0.18)
      .on("end", () => {
        if (!this.width || !this.height) return;
        this.elements.center
          ?.transition()
          .duration(duration)
          .attr("fill", centerEmpty)
          .attr("rx", this.width * 0.26)
          .attr("ry", this.height * 0.2)
          .on("end", ready);
      });
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
      .attr("rx", this.width * 0.29)
      .attr("ry", this.height * 0.23)
      .attr("fill", bellowsEmpty)
      .attr("cx", "50%")
      .attr("cy", "50%");

    this.elements.center = this.svg
      .append("ellipse")
      .attr("id", "center")
      .attr("rx", this.width * 0.26)
      .attr("ry", this.height * 0.2)
      .attr("fill", centerEmpty)
      .attr("cx", "50%")
      .attr("cy", "50%");

    this.loop();
  }
}

export default Breathe;
