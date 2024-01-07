import {getRandomInt} from "$lib/utils/ToolBox.js";

let spinner = null;
let sides = 4;
const anglePerSecond = 45;
let sizeDivider = 10;

export function clearSpinner() {
    if (spinner) {
        spinner.remove();
        spinner = null;
    }
    sides = getRandomInt(3, 5);
    sizeDivider = getRandomInt(5, 15);
}

export function drawSpinner(paper, event) {

    if (!spinner) {
        spinner = createSpinner(paper);
        //
    }
    let angle = event && event.delta ? anglePerSecond * Math.max(0.01, event.delta) : 0;
    spinner.children.forEach((triangle) => {
        triangle.rotate(-angle * 3, triangle.center);
    });
    spinner.rotate(angle, paper.view.center);
}

function createSpinner(paper) {
    var center = paper.view.center;
    var size = paper.view.bounds.width / (sizeDivider + sides);
    var triangles = new paper.Group();
    var radius = size * (getRandomInt(1,4)); // Radius of the imaginary circle along which triangles are positioned

    let elements = sides + getRandomInt(0, 3);
    for (var i = 0; i < elements; i++) {
        // Calculate angle and position for each triangle
        var angle = (i * 360 / elements) * (Math.PI / 180); // Convert angle to radians
        var position = new paper.Point(
            center.x + radius * Math.cos(angle),
            center.y + radius * Math.sin(angle)
        );

        var triangle = new paper.Path.RegularPolygon({
            center: position,
            sides: sides,
            radius: size,
            fillColor: 'black',
            opacity: (i + 1) / elements
        });

        // Rotate the triangle to face outwards from the circle center
        triangle.rotate(angle * (180 / Math.PI) + 90);

        // Add the triangle to the group
        triangles.addChild(triangle);
    }

    return triangles;
}

