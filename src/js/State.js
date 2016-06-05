
const Config = require('./Config');
const Theme = require('./Theme');
const Tools = require('./Tools');

const State = function State(config) {
	this.container = config.container;
	this.theme = config.theme;
	this.uiState = Config.defaultUiState;

	return this.init();
};

State.prototype.getActiveTheme = function getActiveTheme() {
	return this.theme;
};

State.prototype.onSetUiState = function onSetUiState(uiState) {
	this.uiState = uiState;
	return this.uiState;
};

State.prototype.onSetTheme = function onSetTheme(theme) {
	this.theme = Theme.validate(theme) ? Theme.getOnlyValidKeys(theme) : this.theme;
	return this.theme;
};

State.prototype.init = function init() {
	
	if (Tools.isMobile()) this.container.addClass('mobile');
	
	let themeJson = Tools.getParameterByName(Config.breatheQueryStringParamName);

	if (Theme.validate(themeJson)) {
		this.theme = themeJson;
	} else {
		let theme = null;
		try {
			if (themeJson) theme = JSON.parse(themeJson);
		} catch(e) {
			console.error('JSON.parse(themeJson) err, themeJson:');
			console.error(themeJson);
		}
		this.theme = Theme.validate(theme) ? theme : Config.defaultThemes[0];
	}
	
	return this;

};

module.exports = State;
