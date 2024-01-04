export function clearPixels() {

}

export function drawPixels(paper) {
    let canvasSize = paper.view.bounds.width * 0.9;
    let canvasOffset = (paper.view.bounds.width - canvasSize) / 2;

    new paper.Path.Rectangle({
        point: [canvasOffset, canvasOffset],
        size: [canvasSize, canvasSize],
        fillColor: 'rgb(0, 0, 0)',
        strokeColor: 'rgb(0, 0, 0)',
        strokeWidth: 1
    })
}