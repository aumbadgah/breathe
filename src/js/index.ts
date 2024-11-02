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
import Tentacles from "./Tentacles";
import Theme from "./Theme";
import ThemeList from "./ThemeList";
import Widget from "./Widget";

(function ($) {
  const template =
    '<div id="container" class="container">' +
    '<div class="widgets">' +
    '<div class="widget content-widget" id="breathe"></div>' +
    '<div class="widget content-widget" id="tentacles"></div>' +
    '<div class="widget control-widget" id="multi-color-picker"></div>' +
    '<div class="widget control-widget" id="theme-list"></div>' +
    "</div>" +
    '<div class="nav-bar" id="bottom-nav"></div>' +
    '<div class="nav-bar" id="right-nav"></div>' +
    '<div class="nav-bar" id="top-nav"></div>' +
    "</div>";

  const bottomNav = {
    id: "#bottom-nav",
    items: [
      {
        name: "spooky",
        fa: "fa-solid fa-ghost",
        type: "nav-item left",
      },
      {
        name: "list",
        fa: "fa-solid fa-list-ul",
        type: "nav-item",
      },
      {
        name: "colorpicker",
        fa: "fa-solid fa-paintbrush",
        type: "nav-item",
      },
      {
        name: "full",
        // id: "full",
        fa: "fa-solid fa-desktop",
        type: "nav-item",
      },
    ],
  };

  const rightNav = {
    id: "#right-nav",
    items: [
      {
        name: "breathe-short",
        fa: "fa-solid fa-lungs",
        type: "nav-item",
        label: "8.8 sec",
      },
      {
        name: "breathe-medium",
        fa: "fa-solid fa-lungs",
        type: "nav-item active",
        label: "11.4 sec",
      },
      {
        name: "breathe-long",
        fa: "fa-solid fa-lungs",
        type: "nav-item",
        label: "13.2 sec",
      },
    ],
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

  type Event = {
    event: string;
    payload: any;
  };
  const queue: Event[] = [];
  let broadcasting = false;

  const broadcast = (event: string, originalPayload: any) => {
    queue.push({ event, payload: cloneDeep(originalPayload) });

    if (!broadcasting) {
      broadcasting = true;
      while (queue.length > 0) {
        const { event, payload } = queue.shift()!;
        const handler = "on" + event.charAt(0).toUpperCase() + event.slice(1);

        if (typeof state[handler as keyof State] !== "undefined") {
          (state[handler as keyof State] as (value: any) => void)(payload);
        }

        widgets
          .filter((widget) => typeof (widget as any)[handler] !== "undefined")
          .forEach((widget) => (widget as any)[handler](payload));
      }
      broadcasting = false;
    }
  };

  const getState = function (property: keyof State, cb: (value: any) => void) {
    cb(state[property]);
  };

  const init = () => {
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
      new Tentacles("#tentacles", {
        broadcast: broadcast,
      }),
      new ThemeList("#theme-list", {
        themes: Config.defaultThemes.map((theme) => new Theme(theme)),
        broadcast: broadcast,
      }),
      new Navigation("", {
        navbars: [bottomNav, rightNav, topNav],
        getState: getState,
        broadcast: broadcast,
        container: state.container,
      }),
    ];

    broadcast("setUiState", Config.defaultUiState);
  };

  init();

  $(window).on("load", () => {
    $(window).trigger("resize");
  });
})($);
