function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateHarmonicColors(baseHue, numberOfColors, hueShift) {
    let colors = [];
    for (let i = 0; i < numberOfColors; i++) {
        let hue = (baseHue + i * hueShift) % 360;
        colors.push(`lch(50% ${70}% ${hue}deg)`);
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
    let harmonicSet2 = generateHarmonicColors(contrastingBaseHue, 2, 90);

    return {
        set1: harmonicSet1,
        set2: harmonicSet2
    };
}

// Example usage
let palette = generateColorPalette();
console.log(palette);

let colors = [];
resetColors();

export function resetColors() {
    let palettes = generateColorPalette();
    colors = palettes.set1.concat(palettes.set2);
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

    let rectangle2 = new paper.Path.Rectangle({
        point: [0, 100],
        size: [paper.view.bounds.width, 200],
        fillColor: {
            gradient: {
                stops: [
                    [colors[3], 0.1],
                    [colors[4], 0.9]
                ]
            },
            origin: new paper.Point(paper.view.bounds.width / 2, paper.view.bounds.height / 2),
        }
    });

}