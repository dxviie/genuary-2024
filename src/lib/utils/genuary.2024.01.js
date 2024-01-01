const particleCount = 4*4*4;
const gridSize = Math.sqrt(particleCount);
let gridElementSize = 0;
let gridOffset = 0;

let emitterPath = null;
let emitter = null;

const totalTime = 5;
export function drawParticles(paper, event) {
    gridElementSize = paper.view.bounds.width / gridSize;
    gridOffset = gridElementSize / 2;

    if (!emitterPath) {
        emitterPath = createEmitterPath(paper);
        emitter = new paper.Path.Circle({
            center: emitterPath.getPointAt(0),
            radius: 10,
            fillColor: 'red'
        });
    }

    const ratio = Math.min(1, (event.time % totalTime) / totalTime);
    const length = emitterPath.length;
    let emitterPosition = emitterPath.getPointAt(length * ratio);
    emitter.position = emitterPosition;
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
    return path;
}