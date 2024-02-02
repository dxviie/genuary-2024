import {generateHarmonicColors, getPixelRatio, getRandomInt} from "$lib/utils/ToolBox.js";

let flock = [];
const BOIDS = 100;
const TRAIL_LENGTH = 500 / getPixelRatio();
let border = 50;
const MAX_STROKE_WIDTH = 50 / getPixelRatio();
let trailColors;
let chars = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
                "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
                "U", "V", "X", "Y", "Z"];
let text = null;
let letter = null;
let textData = null;
export function clearFlock() {
    flock.forEach((boid) => {
        boid.trail.remove();
        boid.path.remove();
    } );
    flock = [];
    if (text) {
        text.remove();
        text = null;
    }
    if (letter) {
        letter.remove();
        letter = null;
    }
}

export function drawFlock(paper, event, debug) {
    if (!paper || !paper.project || !paper.project.activeLayer) {
        return;
    }

    if (!text) {
        // draw a big letter A filling the view in Arial Black
        letter = new paper.PointText({
            point: [0, 0],
            content: chars[getRandomInt(0, chars.length - 1)],
            fillColor: "red",
            fontFamily: 'Arial Black',
            fontWeight: 'bold',
            fontSize: paper.view.bounds.width,
            strokeColor: debug ? 'red' : null,
            strokeWidth: 1,
            opacity: 1
        });
        letter.fitBounds(paper.view.bounds);

        text = letter.rasterize();
        letter.remove();
        textData = text.getImageData();
        text.sendToBack();
        if (debug) {
            text.opacity = 0.1;
        }
        else {
            text.opacity = 0;
        }

    }

    if (flock.length < 1) {
        trailColors = generateHarmonicColors(getRandomInt(0, 360), 5, getRandomInt(15,50),getRandomInt(10, 100), getRandomInt(30, 150));
        border = getRandomInt(1, paper.view.bounds.width / 4);
        flock = createFlock(paper, getRandomInt(BOIDS/4, BOIDS), debug);
    }

    flock.forEach((boid) => {
        boid.update();
        boid.flock(flock);
    });
}

function createFlock(paper, count, debug) {
    let flock = [];
    let center = paper.view.center;
    let bounds = paper.view.bounds;
    let size = bounds.width * 0.8;
    for (let i = 0; i < count; i++) {
        let position;
        while (!position || !isInsideLetter(paper, position)) {
            position = new paper.Point(
                center.x + getRandomInt(-size / 2, size / 2),
                center.y + getRandomInt(-size / 2, size / 2)
            );
        }
        let boid = new Boid(position, paper, debug);
        flock.push(boid);
    }
    return flock;
}

function isInsideLetter(paper, point) {
    let borderX = (paper.view.bounds.width - textData.width)/2;
    // get text color at boid position
    let posX = Math.floor(point.x - borderX);
    let posY = Math.floor(point.y);
    let index = (Math.floor(posY) * textData.width + Math.floor(posX)) * 4;
    let pixel = textData.data[index];
    return pixel >= 200 && posX >= 0 && posX < textData.width && posY >= 0 && posY < textData.height;
}

class Boid {
    constructor(position, paper, debug) {
        let color = new paper.Color(trailColors[getRandomInt(0, trailColors.length - 1)]);
        this.debug = debug;
        this.position = position;
        this.velocity = new paper.Point(0, 0);
        this.acceleration = new paper.Point(0, 0);
        this.maxForce = 0.2;
        this.maxSpeed = 5;
        this.r = 4.0;
        this.paper = paper;
        this.chosenColor = color;
        this.path = new paper.Path.Circle({
            center: this.position,
            radius: this.r,
            fillColor: color,
            strokeColor: color,
            strokeWidth: 0.5
        });
        this.trail = new paper.Path({
            strokeColor: color,
            strokeWidth: Math.random() * MAX_STROKE_WIDTH,
            strokeCap: "round",
            strokeJoin: "round",
            opacity: 0.5,
            blendMode: "hard-light",
        });
        this.trailLength = getRandomInt(10, TRAIL_LENGTH);
    }

    update() {
        this.velocity = this.velocity.add(this.acceleration);
        if (this.velocity.length > this.maxSpeed) {
            this.velocity = this.velocity.normalize(this.maxSpeed);
        }
        this.position = this.position.add(this.velocity);
        this.acceleration = this.acceleration.multiply(0);
        this.path.position = this.position;
        this.trail.add(this.position);
        if (this.trail.segments.length > this.trailLength) {
            this.trail.removeSegment(0);
        }
    }

    applyForce(force) {
        this.acceleration = this.acceleration.add(force);
    }

    flock(boids) {
        let sep = this.separate(boids);
        let ali = this.align(boids);
        let coh = this.cohesion(boids);

        let desired = null;
        if (isInsideLetter(this.paper, this.position)) {
               this.path.fillColor = this.chosenColor;
               this.trail.strokeColor = this.chosenColor;
        }
        else {
            if (this.debug) {
                this.path.fillColor = "red";
                this.trail.strokeColor = "red";
            }

            // steer away from view edges
            let bounds = this.paper.view.bounds;
            if (this.position.x < bounds.x + this.r + border) {
                desired = new this.paper.Point(this.maxSpeed, this.velocity.y);
            }
            else if (this.position.x > bounds.x + bounds.width - this.r - border) {
                desired = new this.paper.Point(-this.maxSpeed, this.velocity.y);
            }
            if (this.position.y < bounds.y + this.r + border) {
                desired = new this.paper.Point(this.velocity.x, this.maxSpeed);
            }
            else if (this.position.y > bounds.y + bounds.height - this.r - border) {
                desired = new this.paper.Point(this.velocity.x, -this.maxSpeed);
            }

            // if we're not outside the border, check if we're inside the letter

            if (!desired) {
                // check four pixels around boid position
                const space = 50;// / getPixelRatio();
                let upPoint = new this.paper.Point(this.position.x, this.position.y - space);
                let upRightPoint = new this.paper.Point(this.position.x + space, this.position.y - space);
                let rightPoint = new this.paper.Point(this.position.x + space, this.position.y);
                let downRightPoint = new this.paper.Point(this.position.x + space, this.position.y + space);
                let downPoint = new this.paper.Point(this.position.x, this.position.y + space);
                let downLeftPoint = new this.paper.Point(this.position.x - space, this.position.y + space);
                let leftPoint = new this.paper.Point(this.position.x - space, this.position.y);
                let upLeftPoint = new this.paper.Point(this.position.x - space, this.position.y - space);

                if (isInsideLetter(this.paper, upPoint)) {
                    desired = new this.paper.Point(this.velocity.x, -this.maxSpeed);
                } else if (isInsideLetter(this.paper, upRightPoint)) {
                    desired = new this.paper.Point(this.maxSpeed, -this.maxSpeed);
                } else if (isInsideLetter(this.paper, rightPoint)) {
                    desired = new this.paper.Point(this.maxSpeed, this.velocity.y);
                } else if (isInsideLetter(this.paper, downRightPoint)) {
                    desired = new this.paper.Point(this.maxSpeed, this.maxSpeed);
                } else if (isInsideLetter(this.paper, downPoint)) {
                    desired = new this.paper.Point(this.velocity.x, this.maxSpeed);
                } else if (isInsideLetter(this.paper, downLeftPoint)) {
                    desired = new this.paper.Point(-this.maxSpeed, this.maxSpeed);
                } else if (isInsideLetter(this.paper, leftPoint)) {
                    desired = new this.paper.Point(-this.maxSpeed, this.velocity.y);
                } else if (isInsideLetter(this.paper, upLeftPoint)) {
                    desired = new this.paper.Point(-this.maxSpeed, -this.maxSpeed);
                }
            }
        }


        if (desired) {
            let steer = desired.subtract(this.velocity);
            if (steer.length > this.maxForce) {
                steer = steer.normalize(this.maxForce);
            }
            sep = sep.add(steer);
        }

        sep = sep.multiply(2.0);
        ali = ali.multiply(1.0);
        coh = coh.multiply(1.0);

        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);
    }

    seek(target) {
        let desired = target.subtract(this.position);
        desired = desired.normalize();
        desired = desired.multiply(this.maxSpeed);
        let steer = desired.subtract(this.velocity);
        if (steer.length > this.maxForce) {
            steer = steer.normalize(this.maxForce);
        }
        return steer;
    }

    separate(boids) {
        let desiredSeparation = 25.0;
        let steer = new this.paper.Point(0, 0);
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
            let other = boids[i];
            let d = this.position.getDistance(other.position);
            if (d > 0 && d < desiredSeparation) {
                let diff = this.position.subtract(other.position);
                diff = diff.normalize();
                diff = diff.divide(d);
                steer = steer.add(diff);
                count++;
            }
        }
        if (count > 0) {
            steer = steer.divide(count);
        }
        if (!steer.isZero()) {
            steer = steer.normalize();
            steer = steer.multiply(this.maxSpeed);
            steer = steer.subtract(this.velocity);
            if (steer.length > this.maxForce) {
                steer = steer.normalize(this.maxForce);
            }
        }
        return steer;
    }

    align(boids) {
        let neighborDist = 50.0;
        let sum = new this.paper.Point(0, 0);
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
            let other = boids[i];
            let d = this.position.getDistance(other.position);
            if (d > 0 && d < neighborDist) {
                sum = sum.add(other.velocity);
                count++;
            }
        }
        if (count > 0) {
            sum = sum.divide(count);
            sum = sum.normalize();
            sum = sum.multiply(this.maxSpeed);
            let steer = sum.subtract(this.velocity);
            if (steer.length > this.maxForce) {
                steer = steer.normalize(this.maxForce);
            }
            return steer;
        } else {
            return new this.paper.Point(0, 0);
        }
    }

    cohesion(boids) {
        let neighborDist = 50.0;
        let sum = new this.paper.Point(0, 0);
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
            let other = boids[i];
            let d = this.position.getDistance(other.position);
            if (d > 0 && d < neighborDist) {
                sum = sum.add(other.position);
                count++;
            }
        }
        if (count > 0) {
            sum = sum.divide(count);
            return this.seek(sum);
        } else {
            return new this.paper.Point(0, 0);
        }
    }
}
