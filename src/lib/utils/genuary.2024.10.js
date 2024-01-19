import {getPixelRatio} from "$lib/utils/ToolBox.js";

export function clearHex() {
    if (world) {
        world.remove();
        world = null;
    }
    if (grid) {
        grid.remove();
        grid = null;
    }
}

let count = 100;
let world = null;
let grid = null;
let ready = false;
let hexesColored = 0;

// hooray for wikipedia
// https://commons.wikimedia.org/wiki/Category:SVG_maps_of_the_world
// and redblob games
// https://www.redblobgames.com/grids/hexagons/
export function drawHex(paper, event, debug) {
    if (!paper || !paper.project || !paper.project.activeLayer) {
        return;
    }

    if (!grid) {
        grid = createHexagonGrid(paper, count/getPixelRatio());
    }

    if (!world) {
        ready = false;
        hexesColored = 0;
        world = new paper.Group();
        console.time("Load SVG");
        fetch('/world-map-edited.svg')
            .then(response => response.text())
            .then(svg => {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
                function processElement(element) {
                    if (element.tagName === 'path') {
                        let worldPiece = new paper.Path({
                            pathData: element.getAttribute('d'),
                            fillColor: 'black',
                            strokeColor: 'black',
                            strokeWidth: 1,
                        });
                        world.addChild(worldPiece);
                    }
                }
                svgDoc.querySelectorAll('path').forEach(element => {
                    processElement(element);
                });
                console.timeEnd("Load SVG");
            })
            .then(() => {
                let target = paper.view.bounds.scale(0.9);//.translate(paper.view.bounds.width * 0.05, paper.view.bounds.height * 0.05);
                world.fitBounds(target);
                grid.bringToFront();
                ready = true;
            });
    }

    if (!ready) {
        return;
    }

    for (let i = hexesColored; i < Math.min(hexesColored + count, grid.children.length); i++) {
        let hexagon = grid.children[i];
        if (world.contains(hexagon.position)) {
            hexagon.fillColor = new paper.Color("orangered");
            hexagon.isMainLand = true;
        }
        else {
            hexagon.fillColor = new paper.Color("aquamarine");
        }
    }
    hexesColored += count;

    if (hexesColored >= grid.children.length) {
        world.opacity = 0;
        grid.children.forEach(hexagon => {
            if (hexagon.isMainLand) {
                return;
            }
            let wobble1 = wobble(hexagon.gridX, hexagon.gridY, event.time * getPixelRatio());
            let normalized = (wobble1 - (-3.5)) / (3.5 - (-3.5));
            let min_scale = 0.95;
            let max_scale = 1.05;
            let actualWobble = (normalized * (max_scale - min_scale) + min_scale);
            hexagon.scale(actualWobble);
        });
    }
}

function createHexagonGrid(paper, resolution) {
    console.log(resolution);
    const hexagonGrid = new paper.Group();
    const hexagonSize = (paper.view.bounds.width * 0.9) / (resolution * 2);
    const hexagonHeight = hexagonSize * Math.sqrt(3);
    const hexagonWidth = hexagonSize * 2;
    const hexagonWidthOffset = hexagonWidth / 2;
    const hexagonYOffset = hexagonHeight / 2 + (paper.view.bounds.height - hexagonHeight * resolution) / 2;
    const hexagonXOffset = hexagonWidth / 2 + (paper.view.bounds.width - hexagonWidth * resolution) / 2 - hexagonHeight / 4;

    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            let hexagon = new paper.Path.RegularPolygon({
                center: [
                    j * hexagonWidth + (i % 2) * hexagonWidthOffset + hexagonXOffset,
                    i * hexagonHeight + hexagonYOffset
                ],
                sides: 6,
                radius: hexagonWidth / Math.sqrt(3)
            });
            hexagon.fillColor = 'white';
            hexagon.strokeColor = 'black';
            hexagon.strokeWidth = 1;
            hexagon.gridX = i;
            hexagon.gridY = j;
            hexagonGrid.addChild(hexagon);
        }
    }
    return hexagonGrid;
}

// 2D noise borrowed from
// https://piterpasma.nl/articles/wobbly
function wobble(x, y, t) {
    return Math.sin(2.31*x+0.11*t+5.95+2.57*Math.sin(1.73*y-0.65*t+1.87)) + Math.sin(3.09*y-0.28*t+4.15+2.31*Math.sin(2.53*x+0.66*t+4.45))+Math.sin(3.06*x-0.18*t+5.16+2.28*Math.sin(2.27*y+0.71*t+3.97))+Math.sin(5.40*y-0.13*t+4.74+2.83*Math.sin(3.71*x+0.96*t+4.42))/2
}
