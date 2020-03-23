const Widget = require('./Widget');

const CookieInfo = function CookieInfo(id) {
	Widget.call(this, id);

	this.init();

	return this;
}

CookieInfo.prototype = Object.create(Widget.prototype);

CookieInfo.prototype.init = function () {
	let infoContainer = $('<div>', {
		class: 'cookie-info',
		click: () => {
			$('#cookie-info').remove();
		}
	});
	let infoWrapper = $('<span class="info-wrapper"></span>');
	infoWrapper.append('<span class="text">This site uses cookies to enable saving color themes in your browser. By continuing to browse the site, you are agreeing to our use of cookies.</span>');
	infoWrapper.append('<br>');
	infoWrapper.append('<span class="confirm">OK</span>');
	infoContainer.append(infoWrapper);
	this.elem.append(infoContainer);
}

module.exports = CookieInfo;
