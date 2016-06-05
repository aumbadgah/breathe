
const Breathe = function Breathe (id, config) {

	const _config = {
		bellowsEase: 'cubic-in-out',
		theme: {
			backgroundEmpty: '#4A4A4A',
			backgroundFull: '#333333',
			bellowsEmpty: '#6F6F6F',
			bellowsFull: '#656565',
			centerEmpty: '#6D6D6D',
			centerFull: '#6F6F6F',
		},
	};

	let self = this;
	self.elem = $(id);
	self.id = id;

	self.config = _.assign({}, _config, config);

	const setMetric = () => {
		self.height = self.elem.height();
		self.width = self.elem.width();
		self.metric = (self.elem.height() < self.elem.width()) ? self.elem.height() : self.elem.width();
	}

	window.addEventListener('resize', () => {
		setMetric();
	});

	self.elem.click(() => this.config.broadcast('setUiState', 'full'));
	
	setMetric();

	self.init();

	return self;

};

Breathe.prototype.onSetTheme = function onSetTheme(theme) {
	if (typeof theme !== 'undefined') {
		this.config = _.assign({}, this.config, {theme: theme});
	}
	return this;
};

Breathe.prototype.loop = function loop() {

	const self = this;
	const delay = 420;
	const duration = 5700;

	let rdy = 0;

	const ready = () => {
		if (++rdy == 3) {
			self.loop();
		};
	};

	self.elements.background.transition()
		.delay(delay)
		.duration(duration)
		.attr('fill', self.config.theme.backgroundFull)
		.each('end', function () {
			self.elements.background.transition()
			.duration(duration)
			.attr('fill', self.config.theme.backgroundEmpty)
			.each('end', function () {
				ready();
			});
		});

	self.elements.bellows.transition()
		.delay(delay)
		.duration(duration)
		.ease(self.config.bellowsEase)
		.attr('fill', self.config.theme.bellowsFull)
		.attr('rx', self.width * 0.55)
		.attr('ry', self.height * 0.55)
		.each('end', function () {
			self.elements.bellows.transition()
			.ease(self.config.bellowsEase)
			.duration(duration)
			.attr('fill', self.config.theme.bellowsEmpty)
			.attr('rx', self.width * 0.29)
			.attr('ry', self.height * 0.23)
			.each('end', function () {
				ready();
			});
		});

	self.elements.center.transition()
		.delay(delay)
		.duration(duration)
		.attr('fill', self.config.theme.centerFull)
		.attr('rx', self.width * 0.24)
		.attr('ry', self.height * 0.18)
		.each('end', function () {
			self.elements.center.transition()
			.duration(duration)
			.attr('fill', self.config.theme.centerEmpty)
			.attr('rx', self.width * 0.26)
			.attr('ry', self.height * 0.20)
			.each('end', function () {
				ready();
			});
		});

	return self;

};

Breathe.prototype.init = function init() {
	let self = this;

	d3.select(self.id).selectAll('*').remove();

	self.svg = {};
	self.elements = {};

	self.svg = d3.select(self.id)
		.append('svg')
		.attr('width', '100%')
		.attr('height', '100%')
		.append('g');

	self.elements.background = self.svg
		.append('rect')
		.attr('id', '#background')
		.attr('width', '100%')
		.attr('height', '100%')
		.attr('fill', self.config.theme.backgroundEmpty);

	self.elements.bellows = self.svg
		.append('ellipse')
		.attr('id', '#bellows')
		.attr('rx', self.width * 0.29)
		.attr('ry', self.height * 0.23)
		.attr('fill', self.config.theme.bellowsEmpty)
		.attr('cx', '50%')
		.attr('cy', '50%');

	self.elements.center = self.svg
		.append('ellipse')
		.attr('id', '#center')
		.attr('rx', self.width * 0.26)
		.attr('ry', self.height * 0.20)
		.attr('fill', self.config.theme.centerEmpty)
		.attr('cx', '50%')
		.attr('cy', '50%');

	self.loop();

	return this;
};

module.exports = Breathe;
