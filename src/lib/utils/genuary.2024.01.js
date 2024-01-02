let PARTICLE_COUNT = 4 * 4 * 4 * 4;
let GRID_SIZE = Math.sqrt(PARTICLE_COUNT);
let GRID_ELEMENT_SIZE = 0;
let GRID_OFFSET = 0;

let emitterPath = null;
let emitterPathLength = 0;
let emitter = null;

let totalTime = 10;
let iteration = 0;

let particles = [];
let oldParticles = [];
export function drawParticles(paper, event, debug) {
    // every iteration we remove the old particles
    const currentIteration = Math.floor(event.time / totalTime);
    if (currentIteration > iteration) {
        iteration = currentIteration;
        oldParticles.forEach((particle) => {
            particle.path.remove();
        });
        oldParticles = particles;
        particles = [];

        // and increase the particle count
        // particleCount *= 4;
        // totalTime *= 2;
        // iterationEndTime = event.time + totalTime;
        // gridSize = Math.sqrt(particleCount);
        // emitterPath.remove();
        // emitter.remove();
        // emitterPath = null;
    }

    GRID_ELEMENT_SIZE = paper.view.bounds.width / GRID_SIZE;
    GRID_OFFSET = GRID_ELEMENT_SIZE / 2;

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

    const ratio = Math.min(1, (event.time % totalTime) / totalTime);
    emitter.position = emitterPath.getPointAt(emitterPathLength * ratio);



    const pathTravelled = emitterPathLength * ratio;
    let expectedParticlesEmitted = Math.floor((pathTravelled) / GRID_ELEMENT_SIZE) + 1;

    if (expectedParticlesEmitted > particles.length ||
        (ratio >= 0.975 && particles.length < PARTICLE_COUNT)) {
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

const timeVariation = totalTime * 0.5;
const timeVariationHalf = timeVariation / 2;
function createParticle(paper, center, time) {
    const choice = Math.round(Math.random() * 3) + 3;
    let particle = new paper.Path.RegularPolygon({
        center: center,
        sides: choice,
        radius: GRID_ELEMENT_SIZE / 1.75 * Math.random(),
        fillColor: Math.random() > 0.5 ? 'rgb(0, 0, 0)' : null,
        strokeColor: 'rgb(0, 0, 0)',
        strokeWidth: Math.random() * 10 + 5,
        opacity: 1
    });

    particle.rotate(Math.random() * 360);

    return {
        path: particle,
        startTime: time,
        lifeTime: totalTime + (Math.random() * timeVariation - timeVariationHalf)
    }
}