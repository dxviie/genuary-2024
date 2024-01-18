import { isMobile } from '$lib/utils/ToolBox.js';

let PARTICLE_COUNT = 0;
let MAX_PARTICLE_COUNT = 5000;
let GRID_SIZE = 0;
let GRID_ELEMENT_SIZE = 0;
let GRID_OFFSET = 0;

let emitterPath = null;
let emitterPathLength = 0;
let emitter = null;

let iterationTime = 5;
let iterationBufferTime = 2.5;
let pastIterationTime = 0;
let iterationEndTime = iterationTime;

let particles = [];
let oldParticles = [];
let activeParticleCount = 0;

let text = null;

export function clearParticles() {
	PARTICLE_COUNT = 1;
	GRID_SIZE = Math.sqrt(PARTICLE_COUNT);
	iterationEndTime = pastIterationTime + iterationTime + iterationBufferTime;
	iterationTime = 1;
	pastIterationTime = 0;
	if (text) {
		text.remove();
		text = null;
	}
	particles.forEach((particle) => {
		particle.path.remove();
	});
	oldParticles.forEach((particle) => {
		particle.path.remove();
	});
	particles = [];
	oldParticles = [];
	if (emitterPath) {
		emitterPath.remove();
		emitterPath = null;
	}
	if (emitter) {
		emitter.remove();
	}
}

export function drawParticles(paper, event, debug) {
	if (isMobile()) {
		MAX_PARTICLE_COUNT = 1100;
	}

	if (!text) {
		text = new paper.PointText(new paper.Point(10, 10 + paper.view.bounds.width * 0.02));
		text.fillColor = 'black';
		text.fontFamily = 'Courier New';
		text.fontSize = paper.view.bounds.width * 0.02;
		text.content = '';
	}

	// every iteration we remove the old particles
	if (event.time > iterationEndTime) {
		// iteration = currentIteration;
		oldParticles.forEach((particle) => {
			particle.path.remove();
		});
		oldParticles = particles;
		activeParticleCount = 0;
		particles = [];

		// and increase the particle count
		PARTICLE_COUNT *= 4;
		if (PARTICLE_COUNT > MAX_PARTICLE_COUNT) {
			PARTICLE_COUNT = 1;
			pastIterationTime = event.time;
			iterationTime = 1;
			iterationEndTime = pastIterationTime + iterationTime + iterationBufferTime;
		} else {
			pastIterationTime = event.time;
			// iterationTime *= 1.2;
			iterationEndTime = pastIterationTime + iterationTime + iterationBufferTime;
		}
		GRID_SIZE = Math.sqrt(PARTICLE_COUNT);

		if (emitterPath) {
			emitterPath.remove();
			emitterPath = null;
		}
		if (emitter) {
			emitter.remove();
		}
	}

	// calculate the element size
	GRID_ELEMENT_SIZE = (paper.view.bounds.width * 0.8) / GRID_SIZE;
	GRID_OFFSET = GRID_ELEMENT_SIZE / 2 + paper.view.bounds.width * 0.1;

	// create the emitter & its path if it doesn't exist
	if (!emitterPath) {
		emitterPath = createEmitterPath(paper, debug);
		emitterPathLength = emitterPath.length;
		emitter = new paper.Path.Circle({
			center: emitterPath.getPointAt(0),
			radius: 10,
			fillColor: debug ? 'red' : null
		});
	}

	// create the particles if they don't exist
	if (particles.length === 0) {
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			const center = emitterPath.getPointAt(Math.min(emitterPath.length, i * GRID_ELEMENT_SIZE));
			particles.push(createParticle(paper, center, event.time));
		}
	}

	// move the emitter along the path
	const ratio = Math.min(1, (event.time - pastIterationTime) / iterationTime);
	emitter.position = emitterPath.getPointAt(emitterPathLength * ratio);

	const pathTravelled = emitterPathLength * ratio;
	let expectedParticlesActive = Math.floor(pathTravelled / GRID_ELEMENT_SIZE) + 1;

	if (
		expectedParticlesActive > activeParticleCount ||
		(ratio >= 0.98 && activeParticleCount < PARTICLE_COUNT)
	) {
		for (let i = activeParticleCount; i < expectedParticlesActive; i++) {
			particles[i].active = true;
			particles[i].path.opacity = 1;
			particles[i].startTime = event.time;
			activeParticleCount++;
		}
	}

	// TODO: possible optimization?: pushing fading out to the browser (CSS opacity transform)
	let visibleParticleCount = 0;
	particles.forEach((particle) => {
		if (!particle.active) {
			return;
		}
		particle.path.opacity = 1 - (event.time - particle.startTime) / particle.lifeTime;
		if (particle.path.opacity <= 0) {
			particle.active = false;
		} else {
			visibleParticleCount++;
		}
	});
	oldParticles.forEach((particle) => {
		if (!particle.active) {
			return;
		}
		particle.path.opacity = 1 - (event.time - particle.startTime) / particle.lifeTime;
		if (particle.path.opacity <= 0) {
			particle.active = false;
		} else {
			visibleParticleCount++;
		}
	});

	if (text) {
		text.content = `particles: ${visibleParticleCount}`;
	}
}

function createEmitterPath(paper, debug) {
	const path = new paper.Path({
		strokeColor: debug ? 'rgba(255, 0, 0, 0.33)' : 'rgba(0, 0, 0, 0)',
		strokeWidth: 1,
		strokeCap: 'round'
	});

	let prevPoint = new paper.Point(GRID_OFFSET, GRID_OFFSET);
	path.add(prevPoint);
	for (let i = 0; i < PARTICLE_COUNT - 1; i++) {
		const row = Math.floor(i / GRID_SIZE);
		const atEdge = (i + 1) % GRID_SIZE === 0;
		if (atEdge) {
			// go down
			prevPoint = new paper.Point(prevPoint.x, prevPoint.y + GRID_ELEMENT_SIZE);
			path.add(prevPoint);
		} else if (row % 2 === 0) {
			// even rows go right
			prevPoint = new paper.Point(prevPoint.x + GRID_ELEMENT_SIZE, prevPoint.y);
			path.add(prevPoint);
		} else {
			// odd rows go left
			prevPoint = new paper.Point(prevPoint.x - GRID_ELEMENT_SIZE, prevPoint.y);
			path.add(prevPoint);
		}
	}
	if (path.length < 2) {
		// handling 1 particle edge case. 1 point doesn't define a path.
		path.add(prevPoint);
	}
	return path;
}

const timeVariation = iterationTime;
const timeVariationHalf = timeVariation / 2;
function createParticle(paper, center, time) {
	const choice = Math.round(Math.random() * 2);
	let particle = null;
	let fill = Math.random() > 0.5 ? 'rgb(0, 0, 0)' : null;
	let strokeWidth = GRID_ELEMENT_SIZE * 0.15;
	switch (choice) {
		case 0:
			particle = new paper.Path.Circle({
				center: center,
				radius: GRID_ELEMENT_SIZE / 2,
				fillColor: fill,
				strokeColor: 'rgb(0, 0, 0)',
				strokeWidth: strokeWidth,
				opacity: 0
			});
			break;
		case 1:
			particle = new paper.Path.Rectangle({
				center: center,
				size: [GRID_ELEMENT_SIZE, GRID_ELEMENT_SIZE],
				fillColor: fill,
				strokeColor: 'rgb(0, 0, 0)',
				strokeWidth: strokeWidth,
				opacity: 0
			});
			break;
		case 2:
			particle = new paper.Path.RegularPolygon({
				center: center,
				sides: 3,
				radius: GRID_ELEMENT_SIZE / 1.75,
				fillColor: fill,
				strokeColor: 'rgb(0, 0, 0)',
				strokeWidth: strokeWidth,
				opacity: 0
			});
			if (Math.random() > 0.5) {
				particle.rotate(180);
				particle.translate({ x: 0, y: strokeWidth * 0.45 });
			} else {
				particle.translate({ x: 0, y: strokeWidth * 1.45 });
			}
			break;
		default:
			console.error('no particle type chosen');
	}
	return {
		active: false,
		path: particle,
		startTime: time,
		lifeTime: iterationTime + (Math.random() * timeVariation - timeVariationHalf)
	};
}
