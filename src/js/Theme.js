
const Tools = require('./Tools');

const Theme = function Theme() {
}

Theme.getValidKeys = () => {
	return [
		'backgroundEmpty',
		'backgroundFull',
		'bellowsEmpty',
		'bellowsFull',
		'centerEmpty',
		'centerFull',
	];
};

Theme.getOnlyValidKeys = (theme) => {
	const keys = Object.keys(theme);
	let newTheme = {};
	Theme.getValidKeys().forEach((key) => {
		newTheme[key] = theme[key];
	});
	return newTheme;
};

Theme.validate = (theme) => {
	if (!theme) return false;
	return Theme.getValidKeys().every((key) => typeof theme[key] !== 'undefined' && Tools.validateHex(theme[key]));
};

Theme.getRandomColor = (theme) => {
	const random = Math.floor(Math.random() * 5);
	return theme[Theme.getValidKeys()[random]];
}

module.exports = Theme;
