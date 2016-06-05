
const Config = {
	bitly: {
		url: 'https://api-ssl.bitly.com/v3/shorten?callback=?',
		apikey: '',
		login: '',
	},
	ga: {
		ua: '',
	},
	fb: {
		appid: '',
	},
	breatheQueryStringParamName: 'breathe',
	cookieName: 'BreatheThemes',
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
			backgroundEmpty: "#a59b9b",
			backgroundFull: "#d41919",
			bellowsEmpty: "#c02626",
			bellowsFull: "#f16969",
			centerEmpty: "#843131",
			centerFull: "#f56565",
		},
	],
	defaultUiState: 'full'
};

module.exports = Config;
