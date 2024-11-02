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
      backgroundEmpty: "#F98623",
      backgroundFull: "#33444C",
      bellowsEmpty: "#1D6D91",
      bellowsFull: "#F0BCA6",
      centerEmpty: "#CDB5BD",
      centerFull: "#7AA0C2",
    },
    {
      backgroundEmpty: "#EE8B78",
      backgroundFull: "#647490",
      bellowsEmpty: "#F9C985",
      bellowsFull: "#513B57",
      centerEmpty: "#EBA25D",
      centerFull: "#786B94",
    },
    {
      backgroundEmpty: "#86856A",
      backgroundFull: "#5F1301",
      bellowsEmpty: "#A4946A",
      bellowsFull: "#C6A058",
      centerEmpty: "#86856A",
      centerFull: "#8A2A0D",
    },
    {
      backgroundEmpty: "#48ACF1",
      backgroundFull: "#2641B3",
      bellowsEmpty: "#3F9187",
      bellowsFull: "#EE4265",
      centerEmpty: "#3BCEAC",
      centerFull: "#FFD340",
    },
    {
      backgroundEmpty: "#A8BBB2",
      backgroundFull: "#3BBFBE",
      bellowsEmpty: "#71BDB7",
      bellowsFull: "#F8B8A9",
      centerEmpty: "#FDE5DB",
      centerFull: "#F8B8A9",
    },
    {
      backgroundEmpty: "#5B6DC0",
      backgroundFull: "#272425",
      bellowsEmpty: "#EF8BB6",
      bellowsFull: "#FAC6FC",
      centerEmpty: "#A07ABD",
      centerFull: "#EF8BB6",
    },
  ],
  defaultUiState: "full",
  defaultBreatheState: "breathe-medium",
};

export default Config;
