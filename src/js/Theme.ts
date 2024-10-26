import { validateHex } from "./util";

enum ThemeKey {
  backgroundEmpty = "backgroundEmpty",
  backgroundFull = "backgroundFull",
  bellowsEmpty = "bellowsEmpty",
  bellowsFull = "bellowsFull",
  centerEmpty = "centerEmpty",
  centerFull = "centerFull",
}
export type ThemeConfig = {
  [key in ThemeKey]: string;
};

class Theme {
  elem?: JQuery;
  name?: string;
  values: ThemeConfig;

  constructor(themeParam: ThemeConfig) {
    this.values = Object.keys(themeParam).reduce((acc, key) => {
      if (
        key in ThemeKey &&
        validateHex(themeParam[key as keyof ThemeConfig])
      ) {
        acc[key as keyof ThemeConfig] = themeParam[key as keyof ThemeConfig];
      }
      return acc;
    }, {} as ThemeConfig);
  }

  static getValidKeys(): ThemeKey[] {
    return Object.values(ThemeKey);
  }

  static getOnlyValidKeys(theme: ThemeConfig): ThemeConfig {
    return Theme.getValidKeys().reduce((newTheme, key) => {
      if (theme && key in theme) {
        newTheme[key] = theme[key];
      }
      return newTheme;
    }, {} as ThemeConfig);
  }

  static validate(theme: ThemeConfig): boolean {
    if (!theme) return false;
    return Theme.getValidKeys().every(
      (key) => typeof theme[key] !== "undefined" && validateHex(theme[key])
    );
  }

  static getRandomColor(theme: ThemeConfig): string {
    const random = Math.floor(Math.random() * Theme.getValidKeys().length);
    return theme[Theme.getValidKeys()[random]];
  }
}

export default Theme;
