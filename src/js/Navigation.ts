import $ from "jquery";
import State from "./State";
import Theme, { ThemeConfig } from "./Theme";
// import Vendor from "./Vendor";
import Widget from "./Widget";

interface NavItem {
  name: string;
  type: string;
  elem?: JQuery;
  imgSrc?: string;
  fa?: string;
  id?: string;
  action?: (theme: string) => void;
  href?: string;
}

interface NavbarConfig {
  container: JQuery;
  items: NavItem[];
}

interface NavbarProps {
  id: string;
  items: NavItem[];
}

interface NavigationConfig {
  container: JQuery;
  navbars: NavbarConfig[];
  broadcast: (event: string, data: unknown) => void;
  getState: (property: keyof State, cb: (value: unknown) => void) => void;
}

interface NavigationProps {
  container: JQuery;
  navbars: NavbarProps[];
  broadcast: (event: string, data: unknown) => void;
  getState: (property: keyof State, cb: (value: unknown) => void) => void;
}

class Navigation extends Widget {
  private available: boolean = true;
  private config: NavigationConfig;
  private items: NavItem[] = [];

  constructor(id: string, config: NavigationProps) {
    super(id);

    this.config = {
      ...config,
      navbars: config.navbars.map((navbar) => ({
        ...navbar,
        container: $(navbar.id),
      })),
    };
    this.init();
  }

  onSetUiState(uiState: string): this {
    if (this.available) {
      this.available = false;

      console.log("uiState", uiState);

      if (uiState === "spooky") {
        const [spooky] = this.items
          .filter((navItem) => navItem.type.includes("nav-item"))
          .filter((navItem) => navItem.name === "spooky");

        if (spooky.elem && !spooky.elem.hasClass("enabled")) {
          spooky.elem.addClass("enabled");
        }

        if (spooky.elem && !spooky.elem.hasClass("active")) {
          spooky.elem.addClass("active");
          this.config.container.addClass("spooky");
          this.config.broadcast("startTentacles", null);
        } else if (spooky.elem && spooky.elem.hasClass("active")) {
          spooky.elem.removeClass("active");
          this.config.container.removeClass("spooky");
          setTimeout(() => {
            this.config.broadcast("stopTentacles", null);
          }, 500);
        }
      } else if (
        uiState === "breathe-short" ||
        uiState === "breathe-medium" ||
        uiState === "breathe-long"
      ) {
        this.config.broadcast(
          "setBreatheDuration",
          uiState.replace("breathe-", "")
        );
        this.items
          .filter((navItem) => navItem.type.includes("nav-item"))
          .filter((navItem) =>
            ["breathe-short", "breathe-medium", "breathe-long"].includes(
              navItem.name
            )
          )
          .map((navItem) => {
            if (navItem.name === uiState && navItem.elem) {
              navItem.elem.addClass("active");
            } else if (navItem.elem) {
              navItem.elem.removeClass("active");
            }
            return navItem.name;
          });
      } else {
        const validUiStates = this.items
          .filter((navItem) => navItem.type.includes("nav-item"))
          .filter((navItem) =>
            ["full", "list", "colorpicker"].includes(navItem.name)
          )
          .map((navItem) => {
            if (navItem.name === uiState && navItem.elem) {
              navItem.elem.addClass("active");
            } else if (navItem.elem) {
              navItem.elem.removeClass("active");
            }
            return navItem.name;
          });

        if (validUiStates.indexOf(uiState) >= 0) {
          this.config.container
            .removeClass(validUiStates.join(" "))
            .addClass(uiState);
        }
      }
      setTimeout(() => {
        this.available = true;
      }, 500);
    }

    return this;
  }

  private init(): this {
    this.config.navbars.forEach((navbar) => {
      const container = $(navbar.container);
      navbar.items.forEach((navItem) => {
        let icon: JQuery | undefined;
        if (navItem.imgSrc) {
          icon = $(`<img src="${navItem.imgSrc}">`);
        } else if (navItem.fa) {
          icon = $(`<i class="fa ${navItem.fa}" aria-hidden="true"></i>`);
        }

        if (!icon) {
          throw new Error("No icon found for nav item");
        }

        const itemConfig: JQuery.PlainObject = {
          class: "nav-item",
        };
        if (navItem.id) {
          itemConfig.id = navItem.id;
        }

        const item: NavItem = {
          elem: $("<div>", itemConfig)
            .addClass(navItem.type)
            .attr("id", navItem.name)
            .append(icon),
          name: navItem.name,
          type: navItem.type,
        };

        if (navItem.type.includes("nav-item") && navItem.name) {
          if (item.elem)
            item.elem.on("click", () => {
              this.config.broadcast("setUiState", navItem.name);
            });
        } else if (navItem.href) {
          if (item.elem)
            item.elem.on("click", () => {
              this.config.broadcast("openPage", navItem.href);
              window.open(navItem.href);
            });
        }

        if (item.elem) container.append(item.elem);
        this.items.push(item);
      });
    });

    return this;
  }
}

export default Navigation;
