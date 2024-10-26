// @ts-nocheck
// Rest of the file remains unchanged

import Config from "./Config";
import { isLocal } from "./util";

const Vendor = {
  init: () => {
    if (!isLocal()) {
      if (Config.ga.ua.length > 0) {
        (function (i, s, o, g, r, a, m) {
          i["GoogleAnalyticsObject"] = r;
          (i[r] =
            i[r] ||
            function () {
              (i[r].q = i[r].q || []).push(arguments);
            }),
            (i[r].l = 1 * new Date());
          (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
          a.async = 1;
          a.src = g;
          m.parentNode.insertBefore(a, m);
        })(
          window,
          document,
          "script",
          "https://www.google-analytics.com/analytics.js",
          "ga"
        );

        ga("create", Config.ga.ua, "auto");
        ga("send", "pageview");
      }

      if (Config.fb.appid.length > 0) {
        window.fbAsyncInit = function () {
          FB.init({
            appId: Config.fb.appid,
            xfbml: true,
            version: "v2.6",
          });
        };

        (function (d, s, id) {
          var js,
            fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) {
            return;
          }
          js = d.createElement(s);
          js.id = id;
          js.src = "//connect.facebook.net/en_US/sdk.js";
          fjs.parentNode.insertBefore(js, fjs);
        })(document, "script", "facebook-jssdk");
      }
    }
  },
  ga: (eventName, value = "noValue", category = "system") => {
    if (!isLocal() && Config.ga.ua.length > 0) {
      ga("send", "event", category, eventName, value);
    }
  },
  getTinyUrl: (longUri, cb) => {
    if (
      !isLocal() &&
      Config.bitly.url.length > 0 &&
      Config.bitly.apikey.length > 0 &&
      Config.bitly.login.length > 0
    ) {
      $.getJSON(
        Config.bitly.url,
        {
          format: "json",
          apiKey: Config.bitly.apikey,
          login: Config.bitly.login,
          longUrl: longUri,
        },
        (response) => {
          cb(response.data.url);
        }
      );
    }
  },
};

export default Vendor;
