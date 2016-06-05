
const Theme = require('./Theme');
const Widget = require('./Widget');

const MultiColorPicker = function MultiColorPicker(id, config) {
	Widget.call(this, id);

	const defaults = {
		theme: {
			backgroundEmpty: '#4A4A4A',
			backgroundFull: '#333333',
			bellowsEmpty: '#6F6F6F',
			bellowsFull: '#656565',
			centerEmpty: '#6D6D6D',
			centerFull: '#6F6F6F',
		},
	};

	this.config = _.assign({}, defaults, config);
	this.init();

	return this;
}

MultiColorPicker.prototype = Object.create(Widget.prototype);

MultiColorPicker.prototype.showStatus = function () {
	this.statusSuccess.addClass('show');
	setTimeout(function() {
		this.statusSuccess.removeClass('show');
	}.bind(this), 1500);
}

MultiColorPicker.prototype.onSetTheme = function (theme) {
	this.config.theme = theme;
	this.init();
	return this;
}

MultiColorPicker.prototype.init = function () {

	let self = this;
	
	this.elem.empty()
	this.colorPickers = [];

	for (let property in Theme.getOnlyValidKeys(self.config.theme)) {
		let itemContainer = $('<div>', {
			class: 'color-picker-container',
			height: (100 / Object.keys(self.config.theme).length) * .93 + '%',
		});
		let icon = $('<span><i class="fa fa-ellipsis-h" aria-hidden="true"></i></span>')
			.addClass('color-picker-icon');
		let picker = {
			elem: $('<div>', {
				id: 'color-picker-' + property,
				class: 'color-picker',
				height: '100%',
			}),
			id: '#color-picker-' + property,
			color: self.config.theme[property] || 'grey',
		};

		this.colorPickers.push(picker);
		picker.elem.append(icon);
		itemContainer.append(picker.elem);
		this.elem.append(itemContainer);

		picker.elem.css('background-color', picker.color);

		const handlePickerChange = (color) => {
			color = color.toHexString();
		    picker.elem.css('background-color', color);
		    self.config.theme[property] = color;
		    self.config.broadcast('setTheme', self.config.theme);
		};

		picker.elem.spectrum({
			color: picker.color,
			showInitial: true,
			change: _.throttle(handlePickerChange, 50),
			move: _.throttle(handlePickerChange, 50)
		});
	}

	let widgetControls = $('<div></div>', {
		class: 'widget-controls',
	});
	let control = $('<span>', {
		class: 'control',
		click: () => {
			self.config.broadcast('saveTheme', self.config.theme);
			this.showStatus();
		}
	}).append($('<i class="fa fa-floppy-o" aria-hidden="true"></i>', {
		id: 'control-save-theme',
	}));
	this.statusSuccess = $('<span>', {
		id: 'status-success',
		class: 'status status-success',
	}).append($('<i class="fa fa-check-circle" aria-hidden="true"></i>'));

	this.elem.append(widgetControls.append(control, this.statusSuccess));

	return self;

};

module.exports = MultiColorPicker;
