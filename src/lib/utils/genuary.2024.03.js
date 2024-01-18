import { getRandomInt } from '$lib/utils/ToolBox.js';

export function clearDroste() {
	shapes.forEach((shape) => shape.remove());
	shapes = [];
}

const CANVAS_RATIO = 0.9;
const LAYERS = 6;
let shapes = [];

export function drawDroste(paper, event, debug) {
	clearDroste();
	const drosteQuadrant = getRandomInt(0, 3);

	let canvasSize = paper.view.bounds.width * CANVAS_RATIO;
	let canvasOffset = (paper.view.bounds.width - canvasSize) / 2;
	let quadrantSize = canvasSize / 2;

	const drosteScaleCenter = new paper.Point(
		drosteQuadrant === 0 || drosteQuadrant === 2 ? 0 : canvasSize,
		drosteQuadrant === 0 || drosteQuadrant === 1 ? 0 : canvasSize
	);

	const canvasLayer = new paper.Layer();
	shapes.push(canvasLayer);

	const droste = createDrosteGroup(paper, drosteQuadrant, quadrantSize, debug);
	shapes.push(droste);

	canvasLayer.addChild(droste);

	for (let l = 1; l < LAYERS; l++) {
		let clone = droste.clone();
		let scale = 1 / Math.pow(2, l);
		clone.scale(scale, drosteScaleCenter);
		clone.bringToFront();
		shapes.push(clone);
		canvasLayer.addChild(clone);
	}

	canvasLayer.translate([canvasOffset, canvasOffset]);

	if (debug) {
		let centerPoint = new paper.Path.Circle({
			center: drosteScaleCenter,
			radius: 5,
			fillColor: 'rgb(255, 0, 0)',
			strokeColor: 'rgb(255, 0, 0)',
			strokeWidth: 0
		});
		shapes.push(centerPoint);
		centerPoint.bringToFront();
	}
}

function createDrosteGroup(paper, quadrant, quadrantSize, debug) {
	let droste = new paper.Group();

	new paper.Path.Rectangle({
		point: [0, 0],
		size: [quadrantSize * 2, quadrantSize * 2],
		fillColor: 'rgb(255, 255, 255)',
		strokeColor: 'rgb(255, 0, 0)',
		strokeWidth: debug ? 1 : 0
	}).addTo(droste);

	for (let q = 0; q < 4; q++) {
		const topLeft = new paper.Point((q % 2) * quadrantSize, Math.floor(q / 2) * quadrantSize);
		if (quadrant === q) {
			let drosteBox = new paper.Path.Rectangle({
				topLeft: topLeft,
				size: [quadrantSize, quadrantSize],
				fillColor: 'rgb(0, 0, 0)'
			});
			drosteBox.addTo(droste);
		} else {
			let particle = createParticle(
				paper,
				topLeft.add(new paper.Point(quadrantSize / 2, quadrantSize / 2)),
				quadrantSize,
				'rgb(0, 0, 0)',
				'normal',
				1
			);
			particle.addTo(droste);
		}
	}
	return droste;
}

function createParticle(paper, center, size, color, blendMode, opacity) {
	const choice = getRandomInt(0, 2);
	let particle = null;
	switch (choice) {
		case 0:
			particle = new paper.Path.Circle({
				center: center,
				radius: size / 2,
				fillColor: color,
				opacity: opacity,
				blendMode: blendMode
			});
			break;
		case 1:
			particle = new paper.Path.Rectangle({
				center: [center.x, center.y - size / 4],
				size: [size, size / 2],
				fillColor: color,
				opacity: opacity,
				blendMode: blendMode
			});
			particle.rotate(getRandomInt(0, 3) * 90, center);
			break;
		case 2:
			particle = new paper.Path({
				segments: [
					new paper.Point(center.x - size / 2, center.y - size / 2),
					new paper.Point(center.x + size / 2, center.y - size / 2),
					new paper.Point(center.x - size / 2, center.y + size / 2)
				],
				closed: true,
				strokeCap: 'round',
				fillColor: color,
				opacity: opacity,
				blendMode: blendMode
			});
			particle.rotate(getRandomInt(0, 3) * 90, center);
			break;
		default:
			console.error('no particle type chosen');
	}
	return particle;
}
