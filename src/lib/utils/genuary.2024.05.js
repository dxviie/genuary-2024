export function clearVera() {}

let resolution = 3; //78;
let iterations = 1;
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
            let rectangle = new paper.Path.Rectangle({
                point:  [x, y],
                size: size
            });
            rectangle.gridX = i;
            rectangle.gridY = j;
            rectangle.xSpan = 1;
            rectangle.ySpan = 1;
            blocks.push(rectangle);
            if (debug) {
                rectangle.strokeColor = "red";
                rectangle.strokeWidth = 1;
            }
        }
    }

    // for (let i = 0; i < resolution; i++) {
    //     let index = Math.floor(Math.random() * blocks.length);
    //     if (index >= blocks.length - 1) { continue; }
    //
    //     let rectangle = blocks[index];
    //     let rectangle2 = blocks[index + 1];
    //     blocks.splice(index, 2);
    //
    //     let newRect = rectangle.unite(rectangle2)
    //     newRect.fillColor = "yellow";
    //     blocks.push(newRect);
    // }

    // image found & edited from https://www.holo.mg/encounters/vera-molnar/
    let vera = new paper.Raster("/vera.png");
    vera.opacity = 0;
    vera.onLoad = () => {
        vera.fitBounds(bounds);
        vera.opacity = 0.1;
        vera.blendMode = "multiply";
        blocks.forEach(rectangle => {
            let start = new paper.Point(rectangle.bounds.x, rectangle.bounds.y);
            let end = new paper.Point(rectangle.bounds.x + rectangle.bounds.width, rectangle.bounds.y + rectangle.bounds.height);

            let neighbors = findValidNeighbors(blocks, rectangle);
            if (neighbors.length > 0) {
                console.log("neighbors", neighbors.length, neighbors);
            }


            hatchFillRectangle(paper, debug, start, end,  rectangle,5);
        });
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

function findValidNeighbors(blocks, rectangle) {
    let neighbors = [];
    let x = rectangle.gridX;
    let y = rectangle.gridY;
    let xSpan = rectangle.xSpan;
    let ySpan = rectangle.ySpan;
    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        if (block.gridX === x && block.gridY === y) { continue; }
        if ((block.gridX === x && block.gridY >= y && block.gridY <= y + ySpan && block.ySpan === ySpan)
        || (block.gridY === y && block.gridX >= x && block.gridX <= x + xSpan && block.xSpan === xSpan)) {
            neighbors.push(block);
        }
    }
    return neighbors;
}
