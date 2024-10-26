import Config from "./Config";
import Theme, { ThemeConfig } from "./Theme";
import { isMobile, getParameterByName } from "./util";

interface StateConfig {
  container: JQuery<HTMLElement>;
  theme?: ThemeConfig;
}

class State {
  container: JQuery<HTMLElement>;
  theme?: ThemeConfig;
  uiState: string;

  constructor(config: StateConfig) {
    this.container = config.container;
    if (config.theme) this.theme = config.theme;
    this.uiState = Config.defaultUiState;

    this.init();
  }

  getActiveTheme() {
    return this.theme;
  }

  onSetUiState(uiState: string): string {
    this.uiState = uiState;
    return this.uiState;
  }

  onSetTheme(theme: ThemeConfig): ThemeConfig | undefined {
    this.theme = Theme.validate(theme) ? theme : this.theme;
    return this.theme;
  }

  init(): this {
    if (isMobile()) this.container.addClass("mobile");

    const themeJson = getParameterByName(Config.breatheQueryStringParamName);

    if (themeJson) {
      const theme = JSON.parse(themeJson);
      this.theme = Theme.validate(theme) ? theme : Config.defaultThemes[0];
    }

    return this;
  }
}

export default State;
