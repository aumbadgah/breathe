
const Widget = function Widget(id) {
	this.elem = $(id);
	this.id = id;

	this.setup();
}

Widget.prototype.setup = function () {

	let self = this;

	const setBaseMeasures = () => {
		self.height = self.elem.height();
		self.width = self.elem.width();
	}
	window.addEventListener('resize', () => {
		setBaseMeasures();
	});
	setBaseMeasures();

	return self;
}

module.exports = Widget;
