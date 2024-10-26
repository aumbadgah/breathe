import Theme, { ThemeConfig } from "./Theme";
// import Vendor from "./Vendor";
import $ from "jquery";
import Widget from "./Widget";
import State from "./State";

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

      const validUiStates = this.items
        .filter((navItem) => navItem.type === "nav-item")
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

        if (navItem.type === "social-item" && navItem.name && navItem.action) {
          const action = navItem.action;
          if (item.elem) {
            item.elem.click(() => {
              // Vendor.ga("social", navItem.name);
              this.config.getState("theme", (theme) => {
                if (typeof theme === "object" && theme !== null) {
                  action(
                    JSON.stringify(Theme.getOnlyValidKeys(theme as ThemeConfig))
                  );
                }
              });
            });
          }
        } else if (navItem.type === "nav-item" && navItem.name) {
          if (item.elem)
            item.elem.click(() => {
              this.config.broadcast("setUiState", navItem.name);
            });
        } else if (navItem.href) {
          if (item.elem)
            item.elem.click(() => {
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
