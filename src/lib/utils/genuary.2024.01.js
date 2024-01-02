let particleCount = 4 * 4 * 4 * 4;
let gridSize = Math.sqrt(particleCount);
let gridElementSize = 0;
let gridOffset = 0;

let emitterPath = null;
let emitterPathLength = 0;
let emitter = null;

let totalTime = 2;
let iteration = 0;

let particles = [];
let oldParticles = [];
export function drawParticles(paper, event) {
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

    gridElementSize = paper.view.bounds.width / gridSize;
    gridOffset = gridElementSize / 2;

    // create the emitter & its path if it doesn't exist
    if (!emitterPath) {
        emitterPath = createEmitterPath(paper);
        emitterPathLength = emitterPath.length;
        emitter = new paper.Path.Circle({
            center: emitterPath.getPointAt(0),
            radius: 10,
            fillColor: 'red'
        });
    }

    const ratio = Math.min(1, (event.time % totalTime) / totalTime);
    emitter.position = emitterPath.getPointAt(emitterPathLength * ratio);



    const pathTravelled = emitterPathLength * ratio;
    let expectedParticlesEmitted = Math.floor((pathTravelled) / gridElementSize) + 1;

    if (expectedParticlesEmitted > particles.length ||
        (ratio >= 0.975 && particles.length < particleCount)) {
        let offset = 0;
        do {
            let center = new paper.Point(emitter.position);
            if (offset > 0) {
                center = emitterPath.getPointAt(emitterPathLength * ratio - (offset * gridElementSize));
            }
            particles.push(createParticle(paper, center, event.time, offset > 0));
            console.log('particles', particles.length)
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


function createEmitterPath(paper) {
    const path = new paper.Path({
        strokeColor: 'rgba(255, 0, 0, 0.33)',
        strokeWidth: 1,
        strokeCap: 'round'
    });

    let prevPoint = new paper.Point(gridOffset, gridOffset);
    path.add(prevPoint);
    for (let i = 0; i < particleCount - 1; i++) {
        const row = Math.floor(i / gridSize);
        const atEdge = (i + 1) % gridSize === 0;
        if (atEdge) {
            // go down
            prevPoint = new paper.Point(
                prevPoint.x,
                prevPoint.y + gridElementSize
            );
            path.add(prevPoint);
        }
        else if (row % 2 === 0) {
            // even rows go right
            prevPoint = new paper.Point(
                prevPoint.x + gridElementSize,
                prevPoint.y
            );
            path.add(prevPoint);
        }
        else {
            // odd rows go left
            prevPoint = new paper.Point(
                prevPoint.x - gridElementSize,
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

function createParticle(paper, center, time, isExtra) {
    const particle = new paper.Path.Circle({
        center: center,
        radius: gridElementSize / 1.8,
        fillColor: isExtra ? 'rgba(255, 0, 0, 1)' : 'rgba(0, 0, 0, 1)'
    });

    const timeVariation = totalTime * 0.5;
    const timeVariationHalf = timeVariation / 2;
    return {
        path: particle,
        startTime: time,
        lifeTime: totalTime + (Math.random() * timeVariation - timeVariationHalf)
    }
}