import Config from "./Config";
import Theme, { ThemeConfig } from "./Theme";
import Widget from "./Widget";
import { setCookie, getSlug } from "./util";

interface ThemeListConfig {
  themes: Theme[];
  broadcast: (event: string, data: unknown) => void;
}

class ThemeList extends Widget {
  private themes: Theme[] = [];
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
    const shuffledThemes = [...this.config.themes].sort(
      () => Math.random() - 0.5
    );
    for (let i = shuffledThemes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledThemes[i], shuffledThemes[j]] = [
        shuffledThemes[j],
        shuffledThemes[i],
      ];
    }
    this.themes = shuffledThemes.map((theme) => new Theme(theme.values));

    setTimeout(() => {
      this.config.broadcast("setTheme", this.themes[0].values);
    }, 2);

    return this;
  }

  save(): this {
    this.themes = ThemeList.validate(this.themes);
    this.themes = this.themes.slice(0, 8);

    return this;
  }

  static validate(themes: Theme[]): Theme[] {
    return themes.filter((theme) => Theme.validate(theme.values));
  }

  static identical(oneTheme: ThemeConfig, twoTheme: ThemeConfig): boolean {
    return Theme.getValidKeys().every((key) => oneTheme[key] === twoTheme[key]);
  }

  onSaveTheme(newTheme: ThemeConfig): this {
    if (Theme.validate(newTheme)) {
      newTheme = Theme.getOnlyValidKeys(newTheme);
      const identical = this.themes.some((theme) => {
        return ThemeList.identical(theme.values, newTheme);
      });
      if (!identical) {
        this.themes.unshift(new Theme(newTheme));
        this.save().paint().onSetTheme(newTheme);
      }
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

      Theme.getValidKeys()
        .map((key) =>
          $("<div>", {
            class: "color-item",
          }).css("background-color", theme.values[key])
        )
        .forEach((elemThemeColor) => {
          theme.elem && theme.elem.append(elemThemeColor);
        });

      const controlRemoveTheme = $(
        '<span><i class="fa fa-regular fa-circle-xmark" aria-hidden="true"></i></span>',
        {
          id: "theme-remove-" + slug,
        }
      )
        .addClass("control")
        .on("click", (e) => {
          e.preventDefault();
          this.removeTheme(theme);
        });

      theme.elem.append(controlRemoveTheme);
      if (this.elem) this.elem.append(theme.elem);
    });

    const reset = $(
      '<div class="reset"><i class="fa fa-solid fa-rotate" aria-hidden="true"></i></div>'
    ).on("click", (e) => {
      e.preventDefault();
      this.init();
    });

    const credits = $(
      '<div class="credits"><a target="_blank" href="https://aumbadgah.com">aumbadgah</a></div>'
    );

    if (this.elem) this.elem.append(reset).append(credits);

    return this;
  }

  init(): void {
    this.read().paint();
  }
}

export default ThemeList;
