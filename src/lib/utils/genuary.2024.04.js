import {getRandomInt, isMobile} from "$lib/utils/ToolBox.js";

export function clearPixels() {
    if (screen) {
        screen.screen.remove();
        screen.columns.forEach(column => column.remove());
        screen = null;
    }
    if (tracer) {
        tracer.forEach(block => block.remove());
        tracer = null;
    }
    red = getRandomInt(100, 255);
    green = getRandomInt(100, 255);
    blue = getRandomInt(100, 255);
}

let PIXEL_DIM = 27;
let screen = null;
let tracer = null;
let red = 255;
let green = 255;
let blue = 255;

export function drawPixels(paper, event, debug) {
    if (isMobile()) {
        PIXEL_DIM = 16;
    }
    let canvasSize = paper.view.bounds.width * 0.9;
    let canvasOffset = (paper.view.bounds.width - canvasSize) / 2;
    let pixelSize = canvasSize / PIXEL_DIM;
    let shift = pixelSize / 4;

    if (!screen) {
        screen = createCRTScreen(paper, canvasOffset, pixelSize, shift);
    }
    if (!tracer) {
        tracer = createTracer(paper, canvasOffset, canvasSize, pixelSize);
    }

    screen.pixels.filter(pixel => pixel.group.opacity > 0.12).forEach(pixel => {
        pixel.group.opacity -= 0.1;
    });

    let amplitude = (canvasSize / 2) * 0.8;
    let frequency = 6;
    let t = (event && event.time) ? event.time : 0;

    for (let i = 0; i < tracer.length; i++) {
        let block = tracer[i];
        let x = (((block.bounds.x + block.bounds.width / 2) - canvasOffset) / canvasSize) * frequency;
        let y = Math.sin(x+t);

        block.bounds.y = y * amplitude + canvasSize/2 + canvasOffset/2;// * amplitude + canvasOffset + canvasSize/2;
        block.strokeWidth = debug ? 1 : 0;

        let lower = Math.ceil(((block.bounds.y - canvasOffset) / canvasSize) * PIXEL_DIM);
        let upper = Math.floor(((block.bounds.y + block.bounds.height - canvasOffset) / canvasSize) * PIXEL_DIM);
        let pixels = screen.pixelColumns[i];
        if (pixels[lower]) {
            pixels[lower].setRed(red);
            pixels[lower].setGreen(green);
            pixels[lower].setBlue(blue);
            pixels[lower].setGlow('rgb(red, green, blue)');
            pixels[lower].group.opacity = 1;

        }
        if (pixels[upper]) {
            pixels[upper].setRed(red);
            pixels[upper].setGreen(green);
            pixels[upper].setBlue(blue);
            pixels[upper].setGlow('rgb(255, 255, 255)');
            pixels[upper].group.opacity = 1;
        }
    }
}

function createCRTScreen(paper, canvasOffset, pixelSize, shift) {

    let background = new paper.Path.Rectangle({
        point: [0, 0],
        size: [paper.view.bounds.width, paper.view.bounds.height],
        fillColor: 'rgb(0, 0, 0)',
        strokeColor: 'rgb(0, 0, 0)',
        strokeWidth: 1
    })

    let columns = [];
    let pixelColumns = [];
    let pixels = [];
    for (let x = 0; x < PIXEL_DIM; x++) {
        const column = new paper.Group();
        let pixelColumn = [];
        for (let y = 0; y < PIXEL_DIM; y++) {
            let pixel = createCRTPixel(paper, canvasOffset + x * pixelSize, canvasOffset + y * pixelSize, pixelSize);
            column.addChild(pixel.group);
            pixelColumn.push(pixel);
            pixels.push(pixel);
        }
        column.translate(new paper.Point(0, x%2 === 0 ? shift : -shift));
        columns.push(column);
        pixelColumns.push(pixelColumn);
    }
    return {
        columns: columns,
        pixelColumns: pixelColumns,
        pixels: pixels,
        screen: background
    }
}

function createCRTPixel(paper, x, y, size) {
    const width = size / 3 * 0.9;
    const padding = ((size / 3) * 0.1) / 2;
    // Create the red stripe
    var redStripe = new paper.Path.Rectangle({
        topLeft: new paper.Point(x + padding, y),
        size: new paper.Size(width, size),
        radius: width/2,
        strokeColor: 'black',
        strokeWidth: 0,
        fillColor: 'rgb(0, 0, 0)'
    });

    // Create the green stripe
    var greenStripe = new paper.Path.Rectangle({
        topLeft: new paper.Point(x + padding + size/3, y),
        size: new paper.Size(width, size),
        radius: width/2,
        strokeColor: 'black',
        strokeWidth: 0,
        fillColor: 'rgb(0, 0, 0)'
    });

    // Create the blue stripe
    var blueStripe = new paper.Path.Rectangle({
        topLeft: new paper.Point(x + padding + size/3 * 2, y),
        size: new paper.Size(width, size),
        radius: width/2,
        strokeColor: 'black',
        strokeWidth: 0,
        fillColor: 'rgb(0, 0, 0)'
    });

    let glow = new paper.Path.Rectangle({
        topLeft: new paper.Point(x, y),
        size: new paper.Size(size, size),
        radius: width/2,
        fillColor: 'rgb(0, 0, 0)',
        strokeColor: 'rgb(255, 255, 255)',
        strokeWidth: 1,
        opacity: 0.5
    })

    // Group the stripes for easier manipulation
    var crtPixel = new paper.Group([redStripe, greenStripe, blueStripe, glow]);
    glow.sendToBack();
    return {
        group: crtPixel,
        setRed: (value) => {
            redStripe.fillColor = new paper.Color(value/255, 0, 0);
        },
        setGreen: (value) => {
            greenStripe.fillColor = new paper.Color(0, value/255, 0);
        },
        setBlue: (value) => {
            blueStripe.fillColor = new paper.Color(0, 0, value/255);
        },
        setGlow: (color) => {
            glow.fillColor = color;
        }

    };
}

function createTracer(paper, canvasOffset, canvasSize, pixelSize) {
    let tracer = [];
    for (let i = 0; i < Math.floor(canvasSize / pixelSize); i++) {
        let block = new paper.Path.Rectangle({
            point: [canvasOffset + i * pixelSize, canvasOffset],
            size: [pixelSize, pixelSize * 2],
            strokeColor: 'rgb(255, 0, 0)',
            strokeWidth: 1
        })
        tracer.push(block);
    }
    return tracer;
}
