import Config from "./Config";

/**
 * @license
 *
 * http://www.sitepoint.com/how-to-deal-with-cookies-in-javascript/
 * http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
 *
 * modified
 *
 **/

/**
 * @license
 *
 * http://stackoverflow.com/questions/2219526/how-many-bytes-in-a-javascript-string
 *
 **/

/**
 * @license
 *
 * http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
 *
 **/

/**
 * @license
 *
 * http://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
 *
 **/

/**
 * @license
 *
 * http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
 *
 **/

/**
 * @license
 *
 * http://stackoverflow.com/questions/8027423/how-to-check-if-a-string-is-a-valid-hex-color-representation
 *
 **/

export const isLocal = () => {
  return window.location.href.indexOf("localhost") >= 0;
};

export const setCookie = (name: string, value: string) => {
  const days = Config.cookieValidDays;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  const cookieString = `${name}=${value}${expires}; path=/`;
  document.cookie = cookieString;
};

export const getCookie = (name: string) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const getSlug = () => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export function isMobile() {
  const mobileRE =
    /(android|bb\d+|meego).+mobile|armv7l|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|redmi|series[46]0|samsungbrowser.*mobile|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i;
  const notMobileRE = /CrOS/;
  const tabletRE = /android|ipad|playbook|silk/i;

  const ua = navigator.userAgent;
  if (typeof ua !== "string") return false;

  let result =
    (mobileRE.test(ua) && !notMobileRE.test(ua)) || tabletRE.test(ua);

  if (
    !result &&
    navigator &&
    navigator.maxTouchPoints > 1 &&
    ua.indexOf("Macintosh") !== -1 &&
    ua.indexOf("Safari") !== -1
  ) {
    result = true;
  }

  return result;
}

export const getParameterByName = (name: string, url?: string) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

export const validateHex = (value: string) => {
  return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value);
};
