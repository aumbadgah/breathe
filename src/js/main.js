
(function (_, $) {

	const Breathe = require('./Breathe');
	const Config = require('./Config');
	const CookieInfo = require('./CookieInfo');
	const MultiColorPicker = require('./MultiColorPicker');
	const Navigation = require('./Navigation');
	const State = require('./State');
	const ThemeList = require('./ThemeList');
	const Tools = require('./Tools');
	const Vendor = require('./Vendor');

	const template = 	'<div id="container" class="container">' +
							'<div class="widgets">' +
								'<div class="widget content-widget" id="cookie-info"></div>' +
								'<div class="widget content-widget" id="breathe"></div>' +
								'<div class="widget control-widget" id="multi-color-picker"></div>' +
								'<div class="widget control-widget" id="theme-list"></div>' +
							'</div>' +
							'<div class="nav-bar" id="bottom-nav"></div>' +
							'<div class="nav-bar" id="top-nav"></div>' +
						'</div>';

	const bottomNav = {
		container: '#bottom-nav',
		items: [
			{
				name: 'list',
				fa: 'fa-list-ul',
				type: 'nav-item'
			},
			{
				name: 'colorpicker',
				fa: 'fa-paint-brush',
				type: 'nav-item'
			},
			{
				name: 'full',
				id: 'full',
				fa: 'fa-desktop',
				type: 'nav-item'
			},
		],
		setActive: true
	};

	const topNav = {
		container: '#top-nav',
		items: [
			{
				name: 'logo',
				href: 'https://pilatesoulu.com',
				imgSrc: 'img/pilates-oulu-icon.png',
				type: 'logo'
			},
			// {
			// 	name: 'facebook',
			// 	fa: 'fa-facebook-official',
			// 	type: 'social-item',
			// 	action: function (queryStringParam) {
			// 		const uri = window.location.origin + window.location.pathname + '?' + Config.breatheQueryStringParamName + '=' + queryStringParam;
			// 		if (Tools.isLocal()) {
			// 			console.log('Vendor.getTinyUrl(uri');
			// 			console.log(uri);
			// 		} else {
			// 			Vendor.getTinyUrl(uri, (tinyUri) => {
			// 				FB.ui({
			// 					method: 'share',
			// 					href: tinyUri,
			// 				}, function(response){});
			// 			});
			// 		}
			// 	}
			// },
			// {
			// 	name: 'whatsapp',
			// 	fa: 'fa-whatsapp',
			// 	type: 'social-item',
			// 	action: function (queryStringParam) {
			// 		const uri = window.location.origin + window.location.pathname + '?' + Config.breatheQueryStringParamName + '=' + queryStringParam;
			// 		if (Tools.isLocal()) {
			// 			console.log('Vendor.getTinyUrl(uri');
			// 			console.log(uri);
			// 		} else {
			// 			Vendor.getTinyUrl(uri, (tinyUri) => {
			// 				window.open("whatsapp://send?text=" + tinyUri);
			// 			});
			// 		}
			// 	}
			// },
		]
	};

	let state = {};
	let widgets = [];

	const broadcast = (event, value) => {
		Vendor.ga(event, value);

		const handler = 'on' + event.charAt(0).toUpperCase() + event.slice(1);

		if (typeof state[handler] !== 'undefined') state[handler](value);
		
		widgets
			.filter((widget) => typeof widget[handler] !== 'undefined')
			.forEach((widget) => widget[handler](value));
	}

	const getState = function (property, cb) {
		Vendor.ga('getState', property);
		cb(state[property]);
	}

	const init = () => {
		Vendor.init();

		$('body').html(template);

		state = new State({
			container: $('#container'),
		});

		const currentTheme = state.getActiveTheme();
		widgets = [
			new CookieInfo('#cookie-info'),
			new MultiColorPicker('#multi-color-picker', {
				theme: currentTheme,
				broadcast: broadcast,
			}),
			new Breathe('#breathe', {
				theme: currentTheme,
				broadcast: broadcast,
			}),
			new ThemeList('#theme-list', {
				theme: currentTheme,
				themes: Config.defaultThemes,
				broadcast: broadcast,
			}),
			new Navigation({
				navbars: [
					bottomNav,
					topNav
				],
				getState: getState,
				broadcast: broadcast,
				container: state.container
			})
		];

		broadcast('setUiState', Config.defaultUiState);

	};

	init();

})(_, jQuery);
