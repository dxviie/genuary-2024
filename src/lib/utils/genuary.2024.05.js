export function clearVera() {}

let resolution = 39; //78;
export function drawVera(paper, event, debug) {
    if (!paper || !paper.project || !paper.project.activeLayer) {
        return;
    }
    paper.project.activeLayer.removeChildren();

    // image found & edited from https://www.holo.mg/encounters/vera-molnar/
    let vera = new paper.Raster("/vera.png");
    vera.opacity = 0;
    vera.onLoad = () => {
        vera.fitBounds(paper.view.bounds);

        let width = paper.view.bounds.width/ resolution;
        let height = paper.view.bounds.height/ resolution;
        for (let i = 0; i < resolution; i++) {
            let x = width * i;
            for (let j = 0; j < resolution; j++) {
                let y = height * j;
                let point = new paper.Point(x, y);
                let color = vera.getAverageColor(point);
                let rectangle = new paper.Path.Rectangle(point, new paper.Size(width, height));
                if (color) {
                    rectangle.fillColor = color.gray || color;
                }
            }
        }
    }





}
