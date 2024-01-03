let PARTICLE_COUNT = 1;
const MAX_PARTICLE_COUNT = 5000;
let GRID_SIZE = Math.sqrt(PARTICLE_COUNT);
let GRID_ELEMENT_SIZE = 0;
let GRID_OFFSET = 0;

let emitterPath = null;
let emitterPathLength = 0;
let emitter = null;

let iterationTime = 1;
let pastIterationTime = 0;
let iterationEndTime = iterationTime;

let particles = [];
let oldParticles = [];

let text = null;

export function clearParticles() {
    PARTICLE_COUNT = 1;
    GRID_SIZE = Math.sqrt(PARTICLE_COUNT);
    iterationEndTime = pastIterationTime + iterationTime;
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

    if (!text) {
        text = new paper.PointText(new paper.Point(10, 10 + paper.view.bounds.width * 0.02));
        text.fillColor = 'black';
        text.fontFamily = 'Courier New';
        text.fontSize = paper.view.bounds.width * 0.02;
        text.content = `${PARTICLE_COUNT} particle, ~${iterationTime} second`;
    }

    // every iteration we remove the old particles
    if (event.time > iterationEndTime) {
        // iteration = currentIteration;
        oldParticles.forEach((particle) => {
            particle.path.remove();
        });
        oldParticles = particles;
        particles = [];

        // and increase the particle count
        PARTICLE_COUNT *= 4;
        if (PARTICLE_COUNT > MAX_PARTICLE_COUNT) {
            PARTICLE_COUNT = 1;
            pastIterationTime = event.time;
            iterationTime = 1;
            iterationEndTime = pastIterationTime + iterationTime;
        }
        else {
            pastIterationTime = event.time;
            iterationTime *= 1.5;
            iterationEndTime = pastIterationTime + iterationTime;
        }
        GRID_SIZE = Math.sqrt(PARTICLE_COUNT);

        text.content = `${PARTICLE_COUNT} particles, ~${Math.ceil(iterationTime)} seconds`;

        if (emitterPath) {
            emitterPath.remove();
            emitterPath = null;
        }
        if (emitter) {
            emitter.remove();
        }
    }

    // calculate the element size
    GRID_ELEMENT_SIZE = paper.view.bounds.width * 0.8 / GRID_SIZE;
    GRID_OFFSET = GRID_ELEMENT_SIZE / 2 + (paper.view.bounds.width * 0.1);

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
        // TODO optimization: generate all particles at the start (invisible)
        console.log('creating particles', PARTICLE_COUNT);
    }

    // move the emitter along the path
    const ratio = Math.min(1, (event.time - pastIterationTime) / iterationTime);
    emitter.position = emitterPath.getPointAt(emitterPathLength * ratio);

    const pathTravelled = emitterPathLength * ratio;
    let expectedParticlesEmitted = Math.floor((pathTravelled) / GRID_ELEMENT_SIZE) + 1;

    if (expectedParticlesEmitted > particles.length ||
        (ratio >= 0.98 && particles.length < PARTICLE_COUNT)) {
        let offset = 0;
        do {
            let center = new paper.Point(emitter.position);
            if (offset > 0) {
                center = emitterPath.getPointAt(emitterPathLength * ratio - (offset * GRID_ELEMENT_SIZE));
            }
            particles.push(createParticle(paper, center, event.time));
            offset++;
        }
        while(particles.length < expectedParticlesEmitted);
    }

    particles.forEach((particle) => {
        particle.path.opacity = 1 - (event.time - particle.startTime) / particle.lifeTime;
    });
    oldParticles.forEach((particle) => {
        particle.path.opacity = 1 - (event.time - particle.startTime) / particle.lifeTime;
    });
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
            prevPoint = new paper.Point(
                prevPoint.x,
                prevPoint.y + GRID_ELEMENT_SIZE
            );
            path.add(prevPoint);
        }
        else if (row % 2 === 0) {
            // even rows go right
            prevPoint = new paper.Point(
                prevPoint.x + GRID_ELEMENT_SIZE,
                prevPoint.y
            );
            path.add(prevPoint);
        }
        else {
            // odd rows go left
            prevPoint = new paper.Point(
                prevPoint.x - GRID_ELEMENT_SIZE,
                prevPoint.y
            );
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
    let strokeWidth = GRID_ELEMENT_SIZE * 0.1;
    switch (choice) {
        case 0:
            particle = new paper.Path.Circle({
                center: center,
                radius: GRID_ELEMENT_SIZE / 2,
                fillColor: fill,
                strokeColor: 'rgb(0, 0, 0)',
                strokeWidth: strokeWidth,
                opacity: 1
            });
            break;
        case 1:
            particle = new paper.Path.Rectangle({
                center: center,
                size: [GRID_ELEMENT_SIZE, GRID_ELEMENT_SIZE],
                fillColor: fill,
                strokeColor: 'rgb(0, 0, 0)',
                strokeWidth: strokeWidth,
                opacity: 1
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
                opacity: 1
            });
            if (Math.random() > 0.5) {
                particle.rotate(180);
                particle.translate({x: 0, y: strokeWidth});
            }
            else {
                particle.translate({x: 0, y: strokeWidth * 2});
            }
            break;
        default:
           console.error('no particle type chosen');
    }
    return {
        path: particle,
        startTime: time,
        lifeTime: iterationTime + (Math.random() * timeVariation - timeVariationHalf)
    }
}