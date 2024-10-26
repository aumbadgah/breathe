const Config = {
  bitly: {
    url: "https://api-ssl.bitly.com/v3/shorten?callback=?",
    apikey: "",
    login: "",
  },
  ga: {
    ua: "",
  },
  fb: {
    appid: "",
  },
  breatheQueryStringParamName: "breathe",
  cookieName: "breathe",
  cookieValidDays: 900,
  defaultThemes: [
    {
      backgroundEmpty: "#aeaeae",
      backgroundFull: "#d41919",
      bellowsEmpty: "#c02626",
      bellowsFull: "#ffe7e7",
      centerEmpty: "#702929",
      centerFull: "#ffeaea",
    },
    {
      backgroundEmpty: "#9bf0f0",
      backgroundFull: "#d41919",
      bellowsEmpty: "#e368ef",
      bellowsFull: "#ffe7e7",
      centerEmpty: "#7ec2ff",
      centerFull: "#ffeaea",
    },
    {
      backgroundEmpty: "#9bf0f0",
      backgroundFull: "#d41919",
      bellowsEmpty: "#1f70f7",
      bellowsFull: "#ffe7e7",
      centerEmpty: "#52a1f1",
      centerFull: "#ffeaea",
    },
  ],
  defaultUiState: "full",
};

export default Config;
