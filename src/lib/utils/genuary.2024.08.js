export function clearChaos() {
    planets.forEach(planet => {
        planet.body.remove();
        planet.velocityVector.remove();
    });
    planets = [];
    if (button) {
        button.remove();
        button = null;
    }
    paused = true;
}

let planets = [];
let button = null;
let paused = true;
const G = 9.81;

export function drawChaos(paper, event, debug) {

    if (!planets || planets.length === 0) {
        /*
        (array([ 1.42907461e+84, -1.67890934e+84,  2.80312229e+84]),
             [(1, 0), (-1, 0), (0, 1.7320508075688772)],
             [(1, 0), (-1, 0), (0, -1.7320508075688772)])
         */
        let b1 = createBody(paper, [300, 300], 20, 100, [0, 0]);
        let b2 = createBody(paper, [500, 300], 20, 100, [0, 0]);
        let b3 = createBody(paper, [400, 480], 20, 100, [0, 0]);
        planets.push(b1, b2, b3);
    }

    if (!button) {
        button = createPlayButton(paper);
    }

    if (paused) {
        return;
    }
    else {
        button.opacity = 0;
    }

    // update velocity
    // Thank you Sebastian! https://www.youtube.com/watch?v=7axImc1sxa0
    for (let i = 0; i < planets.length; i++) {
        let planet = planets[i];
        let currentVelocity = planet.velocity;
        for (let j = 0; j < planets.length; j++) {
            if (i === j) continue;
            let other = planets[j];
            let distance = other.body.position.subtract(planet.body.position);
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
        planet.velocityVector.position = planet.body.position;
        planet.velocityVector.children[0].segments[0].point = planet.body.position;
        let extraVelocity = new paper.Point(planet.velocity.x*50, planet.velocity.y*50);
        planet.velocityVector.children[0].segments[1].point = planet.body.position.add(extraVelocity);
        planet.velocityVector.children[1].position = planet.body.position.add(extraVelocity);
    }
}

function createBody(paper, center, radius, mass, velocity) {
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
    line.strokeColor = 'red';
    line.strokeWidth = 1;
    let dot = new paper.Path.Circle({
        center: lineEnd,
        radius: 4,
        fillColor: 'red',
    })
    let velocityVector = new paper.Group([line, dot]);

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
            velocityVector.position = event.point;
            velocityVector.children[0].segments[0].point = event.point;
            let extraVelocity = new paper.Point(velocity[0]*50, velocity[1]*50);
            velocityVector.children[0].segments[1].point = event.point.add(extraVelocity);
            velocityVector.children[1].position = event.point.add(extraVelocity);
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
            let newVelocityVector = event.point.subtract(body.position);
            velocityVector.children[0].segments[1].point = event.point;
            velocityVector.children[1].position = event.point;
            velocityPoint.x = newVelocityVector.x/50;
            velocityPoint.y = newVelocityVector.y/50;
        }
    }

    return {
        body: body,
        mass: mass,
        velocity: velocityPoint,
        velocityVector: velocityVector
    }
}

function createPlayButton(paper) {
    let button = new paper.Path.Rectangle({
        point: [paper.view.center.x, paper.view.center.y],
        size: [40, 40],
        fillColor: 'red',
        radius: 10,
    });
    let triangle = new paper.Path.RegularPolygon({
        center: [button.position.x + 2, button.position.y + 3],
        sides: 3,
        radius: 15,
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