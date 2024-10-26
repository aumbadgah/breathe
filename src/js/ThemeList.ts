import Config from "./Config";
import Theme, { ThemeConfig } from "./Theme";
import Widget from "./Widget";
import { getCookie, setCookie, getSlug } from "./util";

interface ThemeListConfig {
  themes: Theme[];
  broadcast: (event: string, data: any) => void;
}

class ThemeList extends Widget {
  private themes: Theme[] = [];
  private cookie: Theme[] = [];
  private config: ThemeListConfig;

  constructor(id: string, config: Partial<ThemeListConfig>) {
    super(id);

    const defaults: ThemeListConfig = {
      themes: [],
      broadcast: () => {},
    };

    this.config = { ...defaults, ...config };
    this.init();
  }

  static parse(cookie: string): Theme[] {
    try {
      const parsedCookie = JSON.parse(cookie);
      if (Array.isArray(parsedCookie)) {
        const themes = parsedCookie.map((theme) => {
          return new Theme(theme);
        });
        return themes;
      } else {
        return [];
      }
    } catch (e) {
      return [];
    }
  }

  onSetTheme(paramTheme: ThemeConfig): this {
    this.themes.forEach((theme) => {
      if (ThemeList.identical(theme.values, paramTheme)) {
        theme.elem &&
          theme.elem
            .css("background-color", Theme.getRandomColor(theme.values))
            .addClass("active");
      } else {
        theme.elem &&
          theme.elem.css("background-color", "#fff").removeClass("active");
      }
    });
    return this;
  }

  read(): this {
    const rawCookie = getCookie(Config.cookieName);

    if (rawCookie) {
      this.cookie = ThemeList.parse(rawCookie);
    }

    this.themes = ThemeList.validate(this.cookie);

    if (this.themes.length === 0) {
      this.themes = this.config.themes.map((theme) => new Theme(theme.values));
    }

    setTimeout(() => {
      this.config.broadcast("setTheme", this.themes[0].values);
    }, 0);

    return this;
  }

  save(): this {
    this.themes = ThemeList.validate(this.themes);
    this.themes = this.themes.slice(0, 8);

    const cookieValue = JSON.stringify(
      this.themes.map((theme) => theme.values)
    );

    setCookie(Config.cookieName, cookieValue);

    return this;
  }

  static validate(themes: Theme[]): Theme[] {
    return themes.filter((theme) => Theme.validate(theme.values));
  }

  static identical(oneTheme: ThemeConfig, twoTheme: ThemeConfig): boolean {
    console.log("identical called with:", oneTheme, twoTheme);
    return Theme.getValidKeys().every((key) => oneTheme[key] === twoTheme[key]);
  }

  onSaveTheme(newTheme: ThemeConfig): this {
    console.log("onSaveTheme called with:", newTheme);
    if (Theme.validate(newTheme)) {
      console.log("Theme is valid");
      newTheme = Theme.getOnlyValidKeys(newTheme);
      console.log("Filtered theme:", newTheme);
      const identical = this.themes.some((theme) => {
        return ThemeList.identical(theme.values, newTheme);
      });
      console.log("Is theme identical to an existing one?", identical);
      if (!identical) {
        console.log("Adding new theme");
        this.themes.unshift(new Theme(newTheme));
        console.log("Themes after adding:", this.themes);
        this.save().paint().onSetTheme(newTheme);
      } else {
        console.log("Theme already exists, not adding");
      }
    } else {
      console.log("Theme is invalid");
    }
    return this;
  }

  removeTheme(removeTheme: Theme): this {
    this.config.broadcast("removeTheme", removeTheme.values);
    this.themes = this.themes.filter(
      (theme) =>
        !Theme.getValidKeys().every(
          (key) => removeTheme.values[key] === theme.values[key]
        )
    );
    this.save().paint();
    return this;
  }

  paint(): this {
    if (this.elem) this.elem.empty();

    const themeItemClass = (theme: Theme): string => {
      let itemClass = "theme-item";
      if (typeof theme.name !== "undefined") itemClass += " " + theme.name;
      return itemClass;
    };

    this.themes.forEach((theme) => {
      const slug = getSlug();
      theme.elem = $("<div>", {
        id: "theme-item-" + slug,
        class: themeItemClass(theme),
        click: () => {
          this.config.broadcast("setTheme", theme.values);
        },
      });
      const keys = Theme.getValidKeys();
      keys.forEach((key) => {
        theme.elem &&
          theme.elem.append(
            $("<div>", {
              class: "color-item",
            }).css("background-color", theme.values[key])
          );
      });
      let control = $(
        '<span><i class="fa fa-times-circle" aria-hidden="true"></i></span>',
        {
          id: "theme-remove-" + slug,
        }
      )
        .addClass("control")
        .click((e) => {
          e.preventDefault();
          this.removeTheme(theme);
        });
      theme.elem.append(control);
      if (this.elem) this.elem.append(theme.elem);
    });

    if (this.elem)
      this.elem.append($("<div>max 8 themes</div>").addClass("info"));
    if (this.elem)
      this.elem.append(
        $(
          '<div class="credits"><a target="_blank" href="https://aumbadgah.com">aumbadgah</a></div>'
        )
      );

    return this;
  }

  init(): void {
    this.read().paint();
  }
}

export default ThemeList;
