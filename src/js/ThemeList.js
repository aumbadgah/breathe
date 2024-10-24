const Config = require("./Config");
const Theme = require("./Theme");
const Tools = require("./Tools");
const Widget = require("./Widget");

const ThemeList = function ThemeList(id, config) {
  Widget.call(this, id);

  const defaults = {
    themes: [],
  };

  this.themes = [];
  this.cookie = {};
  this.themesInvalid = false;

  this.config = _.assign({}, defaults, config);
  this.init();

  return this;
};

ThemeList.prototype = Object.create(Widget.prototype);

ThemeList.parse = function (cookie) {
  let parsedCookie = null;
  try {
    parsedCookie = JSON.parse(cookie);
  } catch (e) {
    console.log("json parse err");
  }
  return parsedCookie;
};

ThemeList.prototype.onSetTheme = function (paramTheme) {
  this.themes.forEach((theme) => {
    if (ThemeList.identical(theme, paramTheme)) {
      theme.elem
        .css("background-color", Theme.getRandomColor(theme))
        .addClass("active");
    } else {
      theme.elem.css("background-color", "#fff").removeClass("active");
    }
  });
  return this;
};

ThemeList.prototype.read = function () {
  let self = this;
  this.cookie =
    ThemeList.parse(decodeURIComponent(Tools.getCookie(Config.cookieName))) ||
    [];
  this.themes = ThemeList.validate(this.cookie);
  if (this.themes.length === 0) {
    this.config.themes.forEach((theme) =>
      this.themes.push(_.assign({}, theme))
    );
  } else {
    setTimeout(function () {
      self.config.broadcast("setTheme", Object.assign({}, self.themes[0]));
    }, 0);
  }
  return this;
};
ThemeList.prototype.save = function () {
  const self = this;
  self.themes = ThemeList.validate(self.themes);
  self.themes = self.themes.slice(0, 8);
  Tools.setCookie(Config.cookieName, JSON.stringify(self.themes));
  return this;
};

ThemeList.validate = function (themes) {
  return themes.filter((theme) => Theme.validate(theme));
};

ThemeList.identical = function (oneTheme, twoTheme) {
  return Theme.getValidKeys().every((key) => oneTheme[key] === twoTheme[key]);
};

ThemeList.prototype.onSaveTheme = function (newTheme) {
  if (Theme.validate(newTheme)) {
    newTheme = Theme.getOnlyValidKeys(newTheme);
    const identical = this.themes.some((theme) =>
      ThemeList.identical(theme, newTheme)
    );
    if (!identical) {
      this.themes.unshift(_.assign({}, newTheme));
      this.save().paint().onSetTheme(newTheme);
    }
  }
  return this;
};

ThemeList.prototype.removeTheme = function (removeTheme) {
  this.config.broadcast("removeTheme");
  this.themes = this.themes.filter(
    (theme) =>
      !Theme.getValidKeys().every((key) => removeTheme[key] === theme[key])
  );
  this.save().paint();
  return this;
};

ThemeList.prototype.paint = function () {
  let self = this;
  this.elem.empty();

  const themeItemClass = (theme) => {
    let itemClass = "theme-item";
    if (typeof theme.name !== "undefined") itemClass += " " + theme.name;
    return itemClass;
  };

  this.themes.map((theme) => {
    const slug = Tools.getSlug();
    theme.elem = $("<div>", {
      id: "theme-item-" + slug,
      class: themeItemClass(theme),
      click: () => {
        self.config.broadcast("setTheme", Object.assign({}, theme));
      },
    });
    const keys = Theme.getValidKeys();
    keys.forEach((key) => {
      theme.elem.append(
        $("<div>", {
          class: "color-item",
        }).css("background-color", theme[key])
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
    this.elem.append(theme.elem);
    return theme;
  });

  this.elem.append($("<div>max 8 themes</div>").addClass("info"));
  this.elem.append(
    $(
      '<div class="credits"><a target="_blank" href="https://aumbadgah.com">aumbadgah</a></div>'
    )
  );

  return this;
};

ThemeList.prototype.init = function () {
  const self = this;

  this.read().paint();
};

module.exports = ThemeList;
