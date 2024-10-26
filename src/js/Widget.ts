import $ from "jquery";

class Widget {
  elem?: JQuery<HTMLElement>;
  id: string;
  height?: number;
  width?: number;

  constructor(id: string) {
    this.id = id;
    if (id.length > 0) this.elem = $(id);

    this.setup();
  }

  setup(): this {
    const setBaseMeasures = () => {
      if (this.elem) this.height = this.elem.height() || 0;
      if (this.elem) this.width = this.elem.width() || 0;
    };

    window.addEventListener("resize", () => {
      setBaseMeasures();
    });

    setBaseMeasures();

    return this;
  }
}

export default Widget;
