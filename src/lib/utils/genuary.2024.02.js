function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateHarmonicColors(baseHue, numberOfColors, hueShift) {
    let colors = [];
    const lightness = 50 + getRandomInt(0, 50);
    const chroma = 100 + getRandomInt(0, 130);
    for (let i = 0; i < numberOfColors; i++) {
        let hue = (baseHue + i * hueShift) % 360;
        colors.push(`lch(${lightness}% ${chroma} ${hue}deg)`);
    }
    return colors;
}

function generateColorPalette() {
    // Generate a random base hue for the first set
    let baseHue = getRandomInt(0, 360);
    // Generate three harmonic colors with a 120-degree shift
    let harmonicSet1 = generateHarmonicColors(baseHue, 3, 50);

    // Generate a contrasting base hue for the second set
    let contrastingBaseHue = (baseHue + 180) % 360;
    // Generate two harmonic colors with a 90-degree shift
    let harmonicSet2 = generateHarmonicColors(contrastingBaseHue, 3, 90);

    return {
        baseSet: harmonicSet1,
        contrastSet: harmonicSet2
    };
}

function createBaseShape(paper, topLeftPoint, size, palette, opacity, blendMode) {
    let shapeSelect = getRandomInt(1, 2);
    let path = null;
    switch(shapeSelect) {
        case 1:
            path = new paper.Path({
                segments: [
                    topLeftPoint,
                    new paper.Point(topLeftPoint.x + size, topLeftPoint.y + size),
                    new paper.Point(topLeftPoint.x, topLeftPoint.y + size),
                ],
                strokeCap: 'round',
                fillColor: buildGradientForPalette(palette, topLeftPoint, new paper.Point(topLeftPoint.x + size, topLeftPoint.y + size)),
                blendMode: blendMode,
                opacity: opacity
            });
            break;
        case 2:
            path = new paper.Path({
                segments: [
                    new paper.Point(topLeftPoint.x, topLeftPoint.y + size / 2),
                    new paper.Point(topLeftPoint.x + size, topLeftPoint.y + size / 2),
                    new paper.Point(topLeftPoint.x + size, topLeftPoint.y + size),
                    new paper.Point(topLeftPoint.x, topLeftPoint.y + size),
                ],
                strokeCap: 'round',
                fillColor: buildGradientForPalette(palette, new paper.Point(topLeftPoint.x, topLeftPoint.y + size / 2), new paper.Point(topLeftPoint.x + size, topLeftPoint.y + size)),
                blendMode: blendMode,
                opacity: opacity
            })
            break;
        default:
            console.error('no shape chosen');
    }
    if (path) {
        path.rotate(getRandomInt(0, 3) * 90, new paper.Point(topLeftPoint.x + size / 2, topLeftPoint.y + size / 2));
    }
    return path;
}

function buildGradientForPalette(palette, origin, destination) {
    const firstStop = getRandomInt(10, 35);
    const secondStop = getRandomInt(65, 90);
    const thirdStop = getRandomInt(firstStop + secondStop, 100);
    return {
        gradient: {
            stops: [
                [palette[0], firstStop / 100],
                [palette[1], secondStop / 100],
                [palette[2], Math.min(thirdStop / 100, 1)]
            ]
        },
        origin: origin,
        destination: destination
    };
}

function createGrainRaster(paper, width, height) {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext('2d');
    let imageData = ctx.createImageData(width, height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        let val = Math.floor(Math.random() * 255);
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = Math.random() * 255;
    }

    ctx.putImageData(imageData, 0, 0);
    return new paper.Raster(canvas);
}

function createParticle(paper, center, size, color, blendMode, opacity) {
    const choice = Math.round(Math.random() * 2);
    let particle = null;
    let strokeWidth = 0;//size * 0.1;
    switch (choice) {
        case 0:
            particle = new paper.Path.Circle({
                center: center,
                radius: size / 2,
                fillColor: color,
                strokeColor: color,
                strokeWidth: strokeWidth,
                opacity: opacity,
                blendMode: blendMode
            });
            break;
        case 1:
            particle = new paper.Path.Rectangle({
                center: center,
                size: [size, size],
                fillColor: color,
                strokeColor: color,
                strokeWidth: strokeWidth,
                opacity: opacity,
                blendMode: blendMode
            });
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
                strokeColor: color,
                strokeWidth: strokeWidth,
                opacity: opacity,
                blendMode: blendMode
            });
            particle.rotate(getRandomInt(0, 3) * 90, center);
            break;
        default:
            console.error('no particle type chosen');
    }
    return particle
}

/*********************************************************
                            SKETCH
*********************************************************/

const LAYERS = 5;
let BLOCKS_PER_LAYER = 4;
let BLOCKS_PER_LAYER_MULTIPLIER = 5;
let colors = {};
let shapes = [];
resetColors();

export function resetColors() {
    shapes.forEach((shape) => shape.remove());
    shapes = [];
    colors = generateColorPalette();
    BLOCKS_PER_LAYER = getRandomInt(2, 5);
    BLOCKS_PER_LAYER_MULTIPLIER = getRandomInt(2, 5);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function drawGenerativeColors(paper, event, debug) {
    // draw a rectangle centered with a 3 step gradient
    if (!paper || !paper.view || !paper.view.bounds) {
        return;
    }
    resetColors();

    const canvasSize = Math.min(paper.view.bounds.width, paper.view.bounds.height) * 0.9;
    const canvasOffset = (Math.max(paper.view.bounds.width, paper.view.bounds.height) - canvasSize) / 2;

    const blendMode = ['multiply', 'screen', 'overlay', 'soft-light', 'hard-light'][getRandomInt(0, 4)];
    const opacity = 0.5 + Math.random() * 0.5;

    let grainRaster = createGrainRaster(paper, paper.view.bounds.width, paper.view.bounds.height);
    grainRaster.position = new paper.Point(paper.view.bounds.width / 2, paper.view.bounds.height / 2);
    grainRaster.blendMode = 'normal';
    grainRaster.opacity = 0.25;
    shapes.push(grainRaster);

    let background = new paper.Path.Rectangle({
        point: [0, 0],
        size: [paper.view.bounds.width, paper.view.bounds.height],
        strokeColor:'rgba(255, 0, 0, 0.33)',
        strokeWidth: 1,
        strokeCap: 'round',
        fillColor: colors.baseSet[0],
        blendMode: 'screen',
        opacity: 0.3
    });
    shapes.push(background);

    let gridBlocks = 1;
    let layerBlocks = BLOCKS_PER_LAYER;
    for (let i = 0; i < LAYERS; i++) {
        const blockSize = canvasSize / gridBlocks;
        const blocks = Math.pow(gridBlocks, 2);
        gridBlocks *= 4;
        console.log("blocks", blocks, "layerBlocks", layerBlocks);
        if (blocks === 1) {
            shapes.push(createBaseShape(paper, new paper.Point(canvasOffset, canvasOffset), blockSize, colors.baseSet, opacity, blendMode));
        }
        else {
            for (let j = 0; j < layerBlocks; j++) {
                let blockIndex = getRandomInt(0, blocks - 1);
                let gridDimension = Math.floor(Math.sqrt(blocks));
                let row = Math.floor(blockIndex / gridDimension);
                let column = blockIndex % gridDimension;
                let center = new paper.Point(canvasOffset + blockSize/2 + column*blockSize,canvasOffset + blockSize/2 + row*blockSize);
                let color = buildGradientForPalette(colors.contrastSet, new paper.Point(canvasOffset, canvasOffset));
                let blockOpacity = Math.max(0.1, opacity * Math.random() * 0.5);
                let particle = createParticle(paper, center, blockSize, color, blendMode, blockOpacity);

                shapes.push(particle);
            }
        }
        layerBlocks *= BLOCKS_PER_LAYER_MULTIPLIER;
    }
}