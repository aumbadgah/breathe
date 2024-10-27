import $ from "jquery";
import cloneDeep from "lodash/cloneDeep";

declare global {
  interface Window {
    $: typeof $;
    jQuery: typeof $;
  }
}

(window as any).jQuery = $;
(window as any).$ = $;

import "spectrum-colorpicker2";

import Breathe from "./Breathe";
import Config from "./Config";
import MultiColorPicker from "./MultiColorPicker";
import Navigation from "./Navigation";
import State from "./State";
import Theme from "./Theme";
import ThemeList from "./ThemeList";
import Widget from "./Widget";

(function ($) {
  const template =
    '<div id="container" class="container">' +
    '<div class="widgets">' +
    '<div class="widget content-widget" id="breathe"></div>' +
    '<div class="widget control-widget" id="multi-color-picker"></div>' +
    '<div class="widget control-widget" id="theme-list"></div>' +
    "</div>" +
    '<div class="nav-bar" id="bottom-nav"></div>' +
    '<div class="nav-bar" id="top-nav"></div>' +
    "</div>";

  const bottomNav = {
    id: "#bottom-nav",
    items: [
      {
        name: "list",
        fa: "fa-list-ul",
        type: "nav-item",
      },
      {
        name: "colorpicker",
        fa: "fa-paint-brush",
        type: "nav-item",
      },
      {
        name: "full",
        id: "full",
        fa: "fa-desktop",
        type: "nav-item",
      },
    ],
    setActive: true,
  };

  const topNav = {
    id: "#top-nav",
    items: [
      {
        name: "logo",
        href: "https://pilatesoulu.com",
        imgSrc: "img/pilates-oulu-icon.png",
        type: "logo",
      },
    ],
  };

  let state: State;
  let widgets: Widget[] = [];

  const broadcast = (event: string, original: any) => {
    const handler = "on" + event.charAt(0).toUpperCase() + event.slice(1);

    const deepCopy = cloneDeep(original);

    if (typeof state[handler as keyof State] !== "undefined") {
      (state[handler as keyof State] as (value: any) => void)(deepCopy);
    }

    widgets
      .filter((widget) => typeof (widget as any)[handler] !== "undefined")
      .forEach((widget) => (widget as any)[handler](deepCopy));
  };

  const getState = function (property: keyof State, cb: (value: any) => void) {
    // Vendor.ga("getState", property);
    cb(state[property]);
  };

  const init = () => {
    // Vendor.init();

    $("body").html(template);

    state = new State({
      container: $("#container"),
    });

    const currentTheme = state.getActiveTheme();
    widgets = [
      new MultiColorPicker("#multi-color-picker", {
        theme: currentTheme,
        broadcast: broadcast,
      }),
      new Breathe("#breathe", {
        theme: currentTheme,
        broadcast: broadcast,
      }),
      new ThemeList("#theme-list", {
        themes: Config.defaultThemes.map((theme) => new Theme(theme)),
        broadcast: broadcast,
      }),
      new Navigation("", {
        navbars: [bottomNav, topNav],
        getState: getState,
        broadcast: broadcast,
        container: state.container,
      }),
    ];

    broadcast("setUiState", Config.defaultUiState);
  };

  init();
})($);
