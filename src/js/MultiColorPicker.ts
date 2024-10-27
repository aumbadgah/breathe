import $ from "jquery";
import assign from "lodash/assign";
import throttle from "lodash/throttle";
import "spectrum-colorpicker2";

import Theme, { ThemeConfig } from "./Theme";
import Widget from "./Widget";

class MultiColorPicker extends Widget {
  private colorPickers: Array<{ elem: JQuery; id: string; color: string }> = [];
  private statusSuccess?: JQuery;
  private config: any;

  constructor(id: string, config: any) {
    super(id);

    const defaults = {
      theme: {
        backgroundEmpty: "#4A4A4A",
        backgroundFull: "#333333",
        bellowsEmpty: "#6F6F6F",
        bellowsFull: "#656565",
        centerEmpty: "#6D6D6D",
        centerFull: "#6F6F6F",
      },
    };

    this.config = assign({}, defaults, config);
    this.init();
  }

  showStatus(): void {
    if (this.statusSuccess) {
      this.statusSuccess.addClass("show");
      setTimeout(() => {
        if (this.statusSuccess) this.statusSuccess.removeClass("show");
      }, 1500);
    }
  }

  onSetTheme(theme: ThemeConfig): this {
    this.config.theme = theme;
    this.init();
    return this;
  }

  init(): this {
    if (this.elem) this.elem.empty();
    this.colorPickers = [];

    for (const property in Theme.getOnlyValidKeys(this.config.theme)) {
      const itemContainer = $("<div>", {
        class: "color-picker-container",
        height: `${(100 / Object.keys(this.config.theme).length) * 0.93}%`,
      });
      const icon = $(
        '<span><i class="fa fa-ellipsis-h" aria-hidden="true"></i></span>'
      ).addClass("color-picker-icon");
      const picker = {
        elem: $("<div>", {
          id: `color-picker-${property}`,
          class: "color-picker",
          height: "100%",
        }),
        id: `#color-picker-${property}`,
        color: this.config.theme[property] || "grey",
      };

      this.colorPickers.push(picker);
      picker.elem.append(icon);
      itemContainer.append(picker.elem);
      if (this.elem) this.elem.append(itemContainer);

      picker.elem.css("background-color", picker.color);

      const handleColorPickerChange = (color: any) => {
        if (!color) return;
        const hexColor = color.toHexString();

        picker.elem.css("background-color", hexColor);
        this.config.theme[property] = hexColor;
        this.config.broadcast("setTheme", this.config.theme);
      };

      picker.elem.spectrum({
        color: picker.color,
        showInitial: true,
        change: throttle(handleColorPickerChange, 50),
        move: throttle(handleColorPickerChange, 50),
      });
    }

    const widgetControls = $("<div>", {
      class: "widget-controls",
    });
    const control = $("<span>", {
      class: "control",
      click: () => {
        this.config.broadcast("saveTheme", this.config.theme);
        this.showStatus();
      },
    }).append(
      $('<i class="fa fa-floppy-o" aria-hidden="true"></i>', {
        id: "control-save-theme",
      })
    );
    this.statusSuccess = $("<span>", {
      id: "status-success",
      class: "status status-success",
    }).append($('<i class="fa fa-check-circle" aria-hidden="true"></i>'));

    if (this.elem)
      this.elem.append(widgetControls.append(control, this.statusSuccess));

    return this;
  }
}

export default MultiColorPicker;
