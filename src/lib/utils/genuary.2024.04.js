export function clearPixels() {
    shapes.forEach((shape) => {
        shape.remove();
    });
    shapes = [];
}

const PIXEL_DIM = 49;
let shapes = [];
export function drawPixels(paper, event, debug) {
    let canvasSize = paper.view.bounds.width * 0.9;
    let canvasOffset = (paper.view.bounds.width - canvasSize) / 2;

    let background = new paper.Path.Rectangle({
        point: [0, 0],
        size: [paper.view.bounds.width, paper.view.bounds.height],
        fillColor: 'rgb(0, 0, 0)',
        strokeColor: 'rgb(0, 0, 0)',
        strokeWidth: 1
    })
    shapes.push(background);

    let pixelSize = canvasSize / PIXEL_DIM;
    let shift = pixelSize / 4;

    const pixelColor = {
        red: 1,
        green: 1,
        blue: 1
    }

    for (let x = 0; x < PIXEL_DIM; x++) {
        const column = new paper.Group();
        for (let y = 0; y < PIXEL_DIM; y++) {
            let pixel = createCRTPixel(paper, canvasOffset + x * pixelSize, canvasOffset + y * pixelSize, pixelSize, pixelColor, debug);
            column.addChild(pixel);
        }
        column.translate(new paper.Point(0, x%2 === 0 ? shift : -shift));
        shapes.push(column);
    }
}

function createCRTPixel(paper, x, y, size, color, debug) {
    const width = size / 3 * 0.9;
    const padding = ((size / 3) * 0.1) / 2;
    // Create the red stripe
    var redStripe = new paper.Path.Rectangle({
        topLeft: new paper.Point(x + padding, y),
        size: new paper.Size(width, size),
        radius: width/2,
        strokeColor: 'black',
        strokeWidth: 0
    });
    redStripe.fillColor = (color && color.red) ? new paper.Color(color.red/255, 0, 0) : 'rgb(255, 0, 0)';

    // Create the green stripe
    var greenStripe = new paper.Path.Rectangle({
        topLeft: new paper.Point(x + padding + size/3, y),
        size: new paper.Size(width, size),
        radius: width/2,
        strokeColor: 'black',
        strokeWidth: 0
    });
    greenStripe.fillColor = (color && color.green) ? new paper.Color(0, color.green/255, 0) : 'rgb(0, 255, 0)';

    // Create the blue stripe
    var blueStripe = new paper.Path.Rectangle({
        topLeft: new paper.Point(x + padding + size/3 * 2, y),
        size: new paper.Size(width, size),
        radius: width/2,
        strokeColor: 'black',
        strokeWidth: 0
    });
    blueStripe.fillColor = (color && color.blue) ? new paper.Color(0, 0, color.blue/255) : 'rgb(0, 0, 255)';

    let glow = new paper.Path.Rectangle({
        topLeft: new paper.Point(x, y),
        size: new paper.Size(size, size),
        radius: width/2,
        fillColor: color,
        strokeColor: 'rgb(255, 255, 255)',
        strokeWidth: debug ? 1 : 0,
        opacity: 0.3
    })

    // Group the stripes for easier manipulation
    var crtPixel = new paper.Group([redStripe, greenStripe, blueStripe, glow]);
    glow.sendToBack();
    return crtPixel;
}
