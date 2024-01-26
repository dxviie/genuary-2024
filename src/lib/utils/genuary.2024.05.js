export function clearVera() {}

let resolution = 27; //78;
let iterations = 1;
let tolerance = 0.5;
export function drawVera(paper, event, debug) {
    if (!paper || !paper.project || !paper.project.activeLayer) {
        return;
    }
    paper.project.activeLayer.removeChildren();

    const bounds = paper.view.bounds.scale(0.9);
    const offset = bounds.width * 0.05;
    const width = bounds.width / resolution;
    const height = bounds.height / resolution;
    const size = new paper.Size(width, height);

    let blocks = [];

    // build base raster
    for (let i = 0; i < resolution; i++) {
        let x = offset + width * i;
        for (let j = 0; j < resolution; j++) {
            let y = offset + height * j;
            let block = new paper.Path.Rectangle({
                point:  [x, y],
                size: size
            });
            block.gridX = i;
            block.gridY = j;
            block.xSpan = 1;
            block.ySpan = 1;
            block.used = false;
            blocks.push(block);
            if (debug) {
                block.strokeColor = "red";
                block.strokeWidth = 1;
            }
        }
    }

    // image found & edited from https://www.holo.mg/encounters/vera-molnar/
    let vera = new paper.Raster("/vera.png");
    vera.opacity = 0;
    vera.onLoad = () => {
        vera.fitBounds(bounds);
        vera.opacity = 0.1;
        vera.blendMode = "multiply";

        // group blocks in iterations
        let toRemove = [];
        let toAdd = [];
        for (let i = 0; i < blocks.length; i++) {
            let block = blocks[i];
            if (block.used) { continue; }
            let blockColor = vera.getAverageColor(block.bounds);
            let neighbors = findValidNeighbors(blocks, block);
            let neighborDiffs = neighbors.map(n => {
                let neighborColor = vera.getAverageColor(n.bounds);
                return Math.abs(blockColor.gray - neighborColor.gray);
            });
            // find the index in neighborDiffs of the smallest element
            let minIndex = neighborDiffs.indexOf(Math.min(...neighborDiffs));
            if (minIndex >= 0) {
                let neighbor = neighbors[minIndex];
                let neighborColor = vera.getAverageColor(neighbor.bounds);
                if (blockColor && neighborColor && Math.abs(blockColor.gray - neighborColor.gray) < tolerance) {
                    toRemove.push(block);
                    toRemove.push(neighbor);
                    block.used = true;
                    neighbor.used = true;
                    let newRect = block.unite(neighbor);
                    newRect.fillColor = "yellow";
                    toAdd.push(newRect);
                    // break;
                    console.log(blocks.map(b => b.used));
                }
            }
        }

        for (let r = 0; r < toRemove.length; r++) {
            let index = blocks.indexOf(toRemove[r]);
            if (index >= 0) {
                blocks.splice(index, 1);
            }
            toRemove[r].remove();
        }
        for (let a = 0; a < toAdd.length; a++) {
            blocks.push(toAdd[a]);
        }

        // hatch fill remaining blocks
        for (let i = 0; i < blocks.length; i++) {
            let rectangle = blocks[i];
            let start = new paper.Point(rectangle.bounds.x, rectangle.bounds.y);
            let end = new paper.Point(rectangle.bounds.x + rectangle.bounds.width, rectangle.bounds.y + rectangle.bounds.height);
            hatchFillRectangle(paper, debug, start, end,  rectangle,5);
        }
    }
}

function hatchFillRectangle(paper, debug, start, end, rectangle, lineCount) {
    let direction = new paper.Path.Line(start, end);
    if (debug) {
        direction.strokeColor = "red";
    }
    for (var i = 0; i < lineCount; i++) {
        let linePoint = direction.getPointAt(i * direction.length / (lineCount-1));
        if (!linePoint) {
            console.error("linePoint is null", i, lineCount, direction.length, direction);
            continue;
        }
        if (debug) {
            let circle = new paper.Path.Circle(linePoint, 2);
            circle.fillColor = "red";
        }
        // draw a line perpendicular to direction through linePoint
        let perpendicular = direction.getNormalAt(i * direction.length / (lineCount-1));
        let lineStart = linePoint.subtract(perpendicular.multiply(direction.length));
        let lineEnd = linePoint.add(perpendicular.multiply(direction.length));

        let line = new paper.Path.Line(lineStart, lineEnd);
        let hrs = rectangle.getIntersections(line);
        if (hrs && hrs.length > 0) {
            line.remove();
            line = new paper.Path.Line(hrs[0].point, hrs[hrs.length-1].point);
        }
        line.strokeColor = "black";

    }
}

function findValidNeighbors(blocks, block) {
    let neighbors = [];
    let x = block.gridX;
    let y = block.gridY;
    let xSpan = block.xSpan;
    let ySpan = block.ySpan;
    for (let i = 0; i < blocks.length; i++) {
        let neighbor = blocks[i];
        if (neighbor.gridX === x && neighbor.gridY === y) { continue; }
        if ((neighbor.gridX === x && neighbor.gridY >= y && neighbor.gridY <= y + ySpan && neighbor.ySpan === ySpan)
        || (neighbor.gridY === y && neighbor.gridX >= x && neighbor.gridX <= x + xSpan && neighbor.xSpan === xSpan)) {
            if (!neighbor.used) {
                neighbors.push(neighbor);
            }
        }
    }
    return neighbors;
}
