import { getRandomInt, isMobile } from '$lib/utils/ToolBox.js';

export function clearScreenSaver() {
	if (background) {
		background.remove();
		background = null;
	}
	if (logoBox) {
		logoBox.children.forEach((child) => {
			child.remove();
		});
		logoBox.remove();
		logoBox = null;
	}
}

let colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
let currentColor = getRandomInt(0, colors.length - 1);
let boxSize = 200;
let background;
let logoBox;
let velocity;

export function drawScreenSaver(paper) {
	if (isMobile()) {
		boxSize = 50;
	}
	if (!background) {
		background = new paper.Path.Rectangle({
			point: [0, 0],
			size: [paper.view.bounds.width, paper.view.bounds.height],
			fillColor: 'black'
		});
	}
	if (!logoBox) {
		logoBox = createLogoBox(paper);
		changeColor();
		velocity = new paper.Point([Math.random() * 2 - 4, Math.random() * 2 - 4]);
		if (isMobile()) {
			velocity = velocity.multiply(0.3);
		}
	}

	logoBox.position = logoBox.position.add(velocity);
	let bounds = paper.view.bounds;
	if (logoBox.bounds.left < bounds.left || logoBox.bounds.right > bounds.right) {
		velocity.x *= -1;
		changeColor();
	}
	if (logoBox.bounds.top < bounds.top || logoBox.bounds.bottom > bounds.bottom) {
		velocity.y *= -1;
		changeColor();
	}
}

function createLogoBox(paper) {
	let position = [
		(paper.view.bounds.width - boxSize) * Math.random(),
		(paper.view.bounds.height - boxSize) * Math.random()
	];
	let size = [boxSize, boxSize];
	let box = new paper.Group();
	const color = new paper.Path.Rectangle({
		point: position,
		size: size,
		strokeCap: 'round',
		fillColor: 'blue',
		opacity: 1
	});
	color.addTo(box);
	const logo = new paper.Raster('/logo_dvd.png');
	logo.onLoad = () => {
		logo.position = color.position;
		logo.scale(isMobile() ? 0.15 : 0.5, color.center);
		logo.bringToFront();
	};
	logo.addTo(box);
	return box;
}

function changeColor() {
	let color = colors[currentColor];
	currentColor = (currentColor + 1) % colors.length;
	if (logoBox && logoBox.children.length > 0 && logoBox.children[0].fillColor) {
		logoBox.children[0].fillColor = color;
	}
}
