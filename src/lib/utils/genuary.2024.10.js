import {generateHarmonicColors, getPixelRatio, getRandomInt} from "$lib/utils/ToolBox.js";

export function clearHex() {
    if (world) {
        world.remove();
        world = null;
    }
    if (grid) {
        grid.remove();
        grid = null;
    }
    hexesPerFrame = 1;
    frameCount = 0;
    count = 2;
}

const FRAMES_PER_COUNT = 125;
const MAX_COUNT = 64;
const COUNT_MULTIPLIER = 2;
let hexesPerFrame = 1;
let frameCount = 0;
let count = 2;
let world = null;
let grid = null;
let ready = false;
let hexesColored = 0;
let waterColors = [];
let landColors = [];

// hooray for wikipedia
// https://commons.wikimedia.org/wiki/Category:SVG_maps_of_the_world
// and redblob games
// https://www.redblobgames.com/grids/hexagons/
export function drawHex(paper, event, debug) {
    if (!paper || !paper.project || !paper.project.activeLayer) {
        return;
    }

    if (count < MAX_COUNT && frameCount++ >= FRAMES_PER_COUNT) {
        count *= COUNT_MULTIPLIER;
        hexesPerFrame *= (COUNT_MULTIPLIER + 1);
        count = Math.min(count, MAX_COUNT);
        if (world) {
            world.remove();
            world = null;
        }
        if (grid) {
            grid.remove();
            grid = null;
        }
        frameCount = 0;
    }

    if (!grid) {
        landColors = generateHarmonicColors(getRandomInt(320, 420),  10, 10, getRandomInt(50, 100), getRandomInt(100, 130));
        waterColors = generateHarmonicColors(getRandomInt(180, 200), 10, 10, getRandomInt(50, 100), getRandomInt(75, 125));
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
                            opacity: 0
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

    for (let i = hexesColored; i < Math.min(hexesColored + hexesPerFrame, grid.children.length); i++) {
        let hexagon = grid.children[i];
        hexagon.opacity = 1;
        if (world.contains(hexagon.position)) {
            hexagon.fillColor = landColors[Math.floor(Math.random() * landColors.length)];
            hexagon.isMainLand = true;
        }
        else {
            hexagon.fillColor = waterColors[Math.floor(Math.random() * waterColors.length)];
        }
    }
    hexesColored += hexesPerFrame;

    if (hexesColored >= grid.children.length) {
        world.opacity = 0;
        grid.children.forEach(hexagon => {
            if (hexagon.isMainLand) {
                return;
            }
            let wobble1 = wobble(hexagon.gridX, hexagon.gridY, event.time * getPixelRatio() * 2);
            let normalized = (wobble1 - (-3.5)) / (3.5 - (-3.5));
            hexagon.translate(new paper.Point(0, normalized - 0.5));
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
            hexagon.opacity = 0;
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
