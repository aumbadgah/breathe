
const Config = require('./Config');
const Theme = require('./Theme');
const Tools = require('./Tools');
const Vendor = require('./Vendor');

const Navigation = function Navigation(config) {

	this.available = true;

	this.config = config;
	this.items = [];

	this.init();

	return this;
}

Navigation.prototype.onSetUiState = function onSetUiState(uiState) {
	let self = this;
	if (this.available) {
		this.available = false;

		let validUiStates = this.items.filter((navItem) => (navItem.type === 'nav-item'));

		validUiStates = validUiStates.map((navItem) => {
			if (navItem.name === uiState) {
				navItem.elem.addClass('active');
			} else {
				navItem.elem.removeClass('active');
			}
			return navItem.name;
		});

		if (validUiStates.indexOf(uiState) >= 0) {
			self.config.container
				.removeClass(validUiStates.join(' '))
				.addClass(uiState);
		}

		setTimeout(() => {
			self.available = true;
		}, 500);
	}

	return this;
};

Navigation.prototype.init = function init() {
	let self = this;

	this.config.navbars.forEach((navbar) => {
		let container = $(navbar.container);
		navbar.items.forEach((navItem) => {

			let icon;
			if (typeof navItem.imgSrc !== 'undefined') {
				icon = $('<img src="' + navItem.imgSrc + '">');
			} else if (typeof navItem.fa !== 'undefined') {
				icon = $('<i class="fa ' + navItem.fa + '" aria-hidden="true"></i>');
			}

			let itemConfig = {
				class: 'nav-item',
			};
			if (typeof navItem.id !== 'undefined') {
				itemConfig.id = navItem.id;
			}
			let item = {
				elem: $('<div>', itemConfig)
				.addClass(navItem.type)
				.append(icon),
				name: navItem.name,
				type: navItem.type
			};

			if (navItem.type === 'social-item' && typeof navItem.name !== 'undefined' && typeof navItem.action !== 'undefined') {
				item.elem.click(navItem.action, function (e) {
					Vendor.ga('social', navItem.name);
					self.config.getState('theme', function (theme) {
						e.data( JSON.stringify( Theme.getOnlyValidKeys( theme)));
					});
				});
			} else if (navItem.type === 'nav-item' && typeof navItem.name !== 'undefined') {
				item.elem.click(navItem.name, function (e) {
					self.config.broadcast('setUiState', e.data);
				});
			} else if (typeof navItem.href !== 'undefined') {
				item.elem.click(navItem.href, function (e) {
					self.config.broadcast('openPage', e.data);
					window.open(e.data);
				});
			}

			container.append(item.elem);
			self.items.push(item);
		});
	});

	return this;
};

module.exports = Navigation;
