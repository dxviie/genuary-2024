import {getRandomInt} from "$lib/utils/ToolBox.js";

export function clearChaos() {
    if (paused) {
        currentIndex = (currentIndex + 1) % stableConfigurations.length;
    }
    planets.forEach(planet => {
        planet.body.remove();
        planet.velocityHandle.remove();
    });
    planets = [];
    if (button) {
        button.remove();
        text.remove();
        button = null;
    }
    paused = true;
}

let planets = [];
let button = null;
let text = null;
let paused = true;
const G = 1;
const speedUp = 3 / getPixelRatio();
let scaleFactor;
let currentIndex = 0;
// Thank you mws262@github for the stable configurations
// https://github.com/mws262/MAE5730_examples/tree/master/3BodySolutions
const stableConfigurations = [
    {name: "8", positions: [[-0.81763, 0.23240], [0.84385, -0.19304], [-0.02622, -0.03936]], velocities: [[-0.54984, -0.43428], [-0.46887, -0.48393], [1.01870, 0.91821]]},
    {name: "The Mediator", positions: [[-0.03470, 1.18562], [0.26930, -1.00202], [-0.23280, -0.59780]], velocities: [[0.24946, -0.10756], [0.20587, -0.93957], [-0.45533, 1.04713]]},
    {name: "Flower Circle", positions: [[-0.60289, 0.05916], [0.25271, 0.05825], [-0.35539, 0.03832]], velocities: [[0.12291, 0.74744], [-0.01933, 1.36924], [-0.10359, -2.11669]]},
    {name: "Love Triangle", positions: [[0.48666, 0.75504], [-0.68174, 0.29366], [-0.02260, -0.61265]], velocities: [[-0.18271, 0.36301], [-0.57907, -0.74816], [0.76178, 0.38514]]},
    {name: "Two to Tango", positions: [[0.66616, -0.08192], [-0.02519, 0.45445], [-0.10301, -0.76581]], velocities: [[0.84120, 0.02975], [0.14264, -0.49232], [-0.98385, 0.46257]]}
];

export function drawChaos(paper, event, debug) {

    let config;
    if (!planets || planets.length === 0) {
        scaleFactor = paper.view.size.width/4;
        config = stableConfigurations[currentIndex];
        const bodies = createBodiesAtNormalizedPositions(paper, debug, config.positions, config.velocities, 20 / getPixelRatio(), 1);
        bodies.forEach(b => planets.push(b));
    }

    if (!button) {
        button = createPlayButton(paper);
        text = new paper.PointText({
            point: [button.position.x + 50/getPixelRatio(), button.position.y + 10/getPixelRatio()],
            content: `${config.name}`,
            fillColor: 'orangered',
            fontSize: 20,
        });
    }

    if (paused) {
        return;
    }
    else {
        button.opacity = 0;
        text.opacity = 0;
    }

    updatePlanets(paper, debug);
}

function updatePlanets(paper, debug) {
    for (let s = 0;  s < speedUp; s++) {
        // Algorithm edited form Sebastian Lague's video on Solar Systems
        // Thank you, Sebastian! https://www.youtube.com/watch?v=7axImc1sxa0

        // update velocity
        for (let i = 0; i < planets.length; i++) {
            let planet = planets[i];
            let currentVelocity = planet.velocity;
            for (let j = 0; j < planets.length; j++) {
                if (i === j) continue;
                let other = planets[j];
                // had to divide by sqrt(scaleFactor) as we're scaling the positions of the planets to fit the screen
                let distance = other.body.position.subtract(planet.body.position).divide(Math.sqrt(scaleFactor));
                let squaredDistance = distance.dot(distance);
                let forceDirection = distance.normalize();
                let force = forceDirection.multiply(G * planet.mass * other.mass / squaredDistance);
                let acceleration = force.divide(planet.mass);
                currentVelocity = currentVelocity.add(acceleration);
            }
            planet.velocity = currentVelocity;
        }

        // update position
        for (let i = 0; i < planets.length; i++) {
            let planet = planets[i];
            planet.body.position = planet.body.position.add(planet.velocity);
            planet.velocityHandle.position = planet.body.position;
            planet.velocityHandle.children[0].segments[0].point = planet.body.position;
            let extraVelocity = new paper.Point(planet.velocity.x * 50, planet.velocity.y * 50);
            planet.velocityHandle.children[0].segments[1].point = planet.body.position.add(extraVelocity);
            planet.velocityHandle.children[1].position = planet.body.position.add(extraVelocity);
            planet.velocityHandle.opacity = debug ? 1 : 0;
        }
    }
}

function createBody(paper, debug, center, radius, mass, velocity) {
    let body = new paper.Path.Circle({
        center: center,
        radius: radius,
        fillColor: 'black',
    });
    let velocityPoint = new paper.Point(velocity[0], velocity[1]);

    // create an arrow from the center of the body to the velocity
    let line = new paper.Path();
    let extraVelocity = new paper.Point(velocity[0]*50, velocity[1]*50);
    let lineEnd = body.position.add(extraVelocity);
    line.add(body.position);
    line.add(lineEnd);
    line.strokeColor = 'orangered';
    line.strokeWidth = 1;
    let dot = new paper.Path.Circle({
        center: lineEnd,
        radius: 10,
        fillColor: 'orangered',
    })
    let velocityHandle = new paper.Group([line, dot]);

    // move the body around when clicked on:
    body.onMouseDown = () => {
        body.dragging = true;
    }
    body.onMouseUp = () => {
        body.dragging = false;
    }
    body.onMouseDrag = (event) => {
        if (paused && body.dragging) {
            body.position = event.point;
            velocityHandle.position = event.point;
            velocityHandle.children[0].segments[0].point = event.point;
            let extraVelocity = new paper.Point(velocity[0]*50, velocity[1]*50);
            velocityHandle.children[0].segments[1].point = event.point.add(extraVelocity);
            velocityHandle.children[1].position = event.point.add(extraVelocity);
        }
    }

    // drag dot to change velocity
    dot.onMouseDown = () => {
        dot.dragging = true;
    }
    dot.onMouseUp = () => {
        dot.dragging = false;
    }
    dot.onMouseDrag = (event) => {
        if (paused && dot.dragging) {
            let newvelocityHandle = event.point.subtract(body.position);
            velocityHandle.children[0].segments[1].point = event.point;
            velocityHandle.children[1].position = event.point;
            velocityPoint.x = newvelocityHandle.x/50;
            velocityPoint.y = newvelocityHandle.y/50;
        }
    }
    velocityHandle.opacity = debug ? 1 : 0;

    return {
        body: body,
        mass: mass,
        velocity: velocityPoint,
        velocityHandle: velocityHandle
    }
}

function createBodiesAtNormalizedPositions(paper, debug, positions, velocities, radius, mass) {
    let bodies = [];
    for (let i = 0; i < positions.length; i++) {
        let transformX = (positions[i][0] * scaleFactor) + paper.view.center.x;
        let transformY = (positions[i][1] * scaleFactor) + paper.view.center.y;
        let body = createBody(paper, debug, [transformX, transformY], radius, mass, velocities[i]);
        bodies.push(body);
    }
    return bodies;
}

function createPlayButton(paper) {
    let button = new paper.Path.Rectangle({
        point: [20/getPixelRatio(), 20/getPixelRatio()], // [paper.view.center.x, paper.view.center.y],
        size: [50/getPixelRatio(), 50/getPixelRatio()],
        fillColor: 'orangered',
        radius: 10/getPixelRatio(),
    });
    let triangle = new paper.Path.RegularPolygon({
        center: [button.position.x + 2/getPixelRatio(), button.position.y + 3/getPixelRatio()],
        sides: 3,
        radius: 15/getPixelRatio(),
        fillColor: 'white',
    });
    triangle.rotate(90);
    let group = new paper.Group([button, triangle]);
    group.onMouseDown = () => {
        if (group.opacity === 0) return;
        paused = !paused;
    }
    return group;
}

function getPixelRatio() {
    return (typeof window !== "undefined") ? window.devicePixelRatio : 1;
}