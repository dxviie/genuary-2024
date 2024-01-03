const colors = [
    `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255}`,
    `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255}`,
    `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255}`
];

export function resetColors() {
    colors[0] = `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255}`;
    colors[1] = `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255}`;
    colors[2] = `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255}`;
}

export function drawGenerativeColors(paper, event, debug) {

    // clear the screen
    // paper.project.activeLayer.removeChildren();
    // draw a rectangle centered with a 3 step gradient
    if (!paper || !paper.view || !paper.view.bounds) {
        return;
    }
    let rectangle = new paper.Path.Rectangle({
        point: [0, 0],
        size: [paper.view.bounds.width, paper.view.bounds.height],
        fillColor: {
            gradient: {
                stops: [
                    [colors[0], 0.25],
                    [colors[1], 0.5],
                    [colors[2], 0.75]
                ],
                radial: true
            },
            origin: new paper.Point(paper.view.bounds.width / 2, paper.view.bounds.height / 2),
            destination: paper.view.bounds.bottomRight
        }
    });
}