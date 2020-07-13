/**
 * Define a point with cartesian coordinates.
 */
class Point {

    /**
     * Create a new point.
     * @param {number} x The X Coordinate.
     * @param {number} y The Y Coordinate.
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Add another Point to this point.
     * @param {Point} p The Point to be added.
     */
    add(p) {
        this.x += p.x;
        this.y += p.y;
    }
}

/**
 * Define a point with polar coordinates.
 */
class Polar {

    /**
     * Create a new point.
     * @param {number} r The distance for the origin.
     * @param {number} a The angle in radians.
     */
    constructor(r, a) {
        this.r = r;
        this.a = a;
    }

    /**
     * Convert a Polar to a Point.
     * @returns {Point}
     */
    toPoint() {
        return new Point(this.r * cos(this.a), this.r * sin(this.a));
    }

    /**
     * Convert a Polar to a Point, specifying the origin.
     * @param {Point} center The origin.
     * @returns {Point}
     */
    toPointCenter(center) {
        let p = this.toPoint();
        p.add(center);
        return p;
    }
}

/**
 * Define a rectangle.
 */
class Box {

    /**
     * Create a new Box.
     * @param {Point} position The position of the upper left corner.
     * @param {number} width The width of the box.
     * @param {number} height The height of the box.
     */
    constructor(position, width, height) {
        this.position = position;
        this.width = width === undefined ? 100 : width;
        this.height = height === undefined ? 100 : height;
    }

    /**
     * Create a new Box. This is an alternate constructor that accepts discrete x and y coordinates instead of a Point to define position.
     * @param {number} x The X position of the upper left corner.
     * @param {number} y The y position of the upper left corner.
     * @param {number} width The width of the box.
     * @param {number} height The height of the box.
     * @returns {Box}
     */
    static newFromXY(x, y, width, height) {
        if (x === undefined) x=0;
        if (y === undefined) y=0;
        return new Box(new Point(x, y), width, height);
    }
}

/**
 * Define a range which a value could take.
 */
class Range {

    /**
     * Create a new Range.
     * @param {number} min The minimum value.
     * @param {number} max The maximum value.
     */
    constructor(min, max) {
        if (min > max) {
            this.min = max;
            this.max = min;
        } else {
            this.min = min;
            this.max = max;
        }
    }

    /**
     * Return a random value, evenly distributed, from the range.
     * @returns {number}
     */
    rand() {
        return random(this.min, this.max);
    }
}

/**
 * Base class for a repeatable element of a tangle.
 */
class TangleElement {

    /**
     * Create a TangleElement.
     * @param {number} size The size of the element. What this means depends on the implementing class.
     * @param {Point} center The location of the element.
     */
    constructor(size, center) {
        this.size = size===undefined ? 100 : size;
        this.center = center==undefined ? Point(0,0) : center;
        this.poly = [];
        this.debug = false;
        this.fillColor = 0;
        this.strokeColor = 0;
    }

    /**
     * Load the options object into instance variables. Each element becomes and instance variable of the same name.
     * @param {object} options The map of options.
     */
    loadOptions(options) {
        if (options === undefined)
            return;
        for (const property in options) {
            this[property] = options[property];
        }
    }

    /**
     * Add a vertex to the enclosing polygon for this TangleElement.
     * @param {Point} p A Point describing the vertex location.
     */
    addVertex(p) {
        this.poly.push(createVector(p.x, p.y));
    }

    /**
     * Get the vertices of the enclosing polygon.
     * @returns [p5.Vector] An array of vertices for the enclosing polygon.
     */
    getPoly() {
        return this.poly
    }

    /**
     * Draw the enclosing polygon. This is done with some transparency, and is meant as a debugging aid.
     */
    drawPoly() {
        if (!this.debug) {
            return;
        }
        fill(128,0,0,128);
        beginShape();
        for(let i=0; i<this.poly.length; ++i){
            vertex(this.poly[i].x, this.poly[i].y);
        }
        endShape(CLOSE);
    }

    /**
     * Draw the TangleElement
     */
    draw() {
        fill(this.fillColor);
        stroke(this.strokeColor);
    }
}

/**
 * Base class for a tangle, which is an area filled with TangleElements
 */
class Tangle {

    /**
     * Create a Tangle.
     * @param {Box} box The area to be filled.
     */
    constructor(box) {
        this.box = box;
        this.debug = false;
    }

    /**
     * Load the options object into instance variables. Each element becomes and instance variable of the same name.
     * @param {object} options The map of options.
     */
    loadOptions(options) {
        if (options === undefined)
            return;
        for (const property in options) {
            this[property] = options[property];
        }
    }

    /**
     * Test an polygon for collisions with existing polygons.
     * @param [p5.Vector] poly
     * @returns {boolean} True if there is a collision.
     */
    collisionTest(poly) {
        if (!this.avoidCollisions)
            return false;
        for (let i = 0; i < this.polys.length; ++i) {
            if (collidePolyPoly(poly, this.polys[i], true)) {
                return true;
            }
        }

        return false;
    }
}

/**
 * Define the Dot element.
 */
class Dot extends TangleElement {

    /**
     * Create a new Dot.
     * @param {number} size The diameter of the dot.
     * @param {Point} center The position of the dot.
     * @param {object} options A map of values to be loaded into instance variables.
     */
    constructor(size, center, options) {
        super(size, center);
        this.spacing = 400;
        this.loadOptions(options);
        this.spacing = Math.max(100, this.spacing);

        let dAngle = TWO_PI/8;
        for (let angle=0; angle<TWO_PI; angle+=dAngle) {
            this.addVertex(new Polar(this.spacing/100 * this.size, angle).toPointCenter(this.center));   // Put a vertex out beyond the tip of the arm
        }
    }

    /**
     * Draw the Dot.
     */
    draw() {
        super.draw();
        circle(this.center.x, this.center.y, this.size);
        this.drawPoly();
    }
}

/**
 * Define the Aah element.
 */
class Aah extends TangleElement {

    static tipType = {
        gap: "gap",
    };

    /**
     * Create a new Aah.
     * @param {number} size The diameter of the aah.
     * @param {Point} center The position of the aah.
     * @param {object} options A map of values to be loaded into instance variables.
     */
    constructor(size, center, options) {
        super(size, center);
        this.armCount = 8;
        this.thetaSD = 5;
        this.lengthSDP = 15;  //
        this.gapSDP = 10;
        this.rotate = true;
        this.tipDistancePercent = 100;
        this.tipDiameter = Aah.tipType.gap;
        this.loadOptions(options);
        this.length = size/2;
        if (this.armCount < 3) this.armCount = 3;
        this.arms = [];

        const dAngle = TWO_PI/this.armCount;
        const rotation = this.rotate ? random(0, dAngle) : 0;
        for (let angle=0; angle<TWO_PI-(dAngle/2); angle+=dAngle) {

            // Create the arm
            let c = new Polar(randomGaussian(this.length, this.lengthSDP/100 * this.length), randomGaussian(angle+rotation, this.thetaSD*Math.PI/180));
            const gap = randomGaussian(this.gapSDP, this.gapSDP/7)/100 * this.length;
            let arm = {
                start: new Polar(gap, c.a).toPointCenter(this.center),  // Draw line from here...
                stop: c.toPointCenter(this.center),                     // ...to here
                tipCenter: new Polar(c.r * (this.tipDistancePercent / 100), c.a).toPointCenter(this.center),
                tipDiameter: !isNaN(this.tipDiameter) ? this.tipDiameter : this.tipDiameter === Aah.tipType.gap ? gap : 10,
            };
            this.arms.push(arm);

            // Polygon vertices associated with this arm
            let maxLength = Math.max(c.r, c.r * (this.tipDistancePercent / 100)) + arm.tipDiameter/2;
            this.addVertex(new Polar(maxLength + 5*gap, c.a).toPointCenter(this.center));
            this.addVertex(new Polar(0.6*c.r, c.a+(dAngle/2)).toPointCenter(this.center));
        }
        if(this.debug) console.log("aah: ", this.aah);
    }


    /**
     * Draw the Aah.
     */
    draw() {
        super.draw();
        this.arms.forEach(arm => {
            line(arm.start.x, arm.start.y, arm.stop.x, arm.stop.y);
            circle(arm.tipCenter.x, arm.tipCenter.y, arm.tipDiameter);
        });
        this.drawPoly();
    }
}

/**
 * Define the Aahs tangle
 */
class Aahs extends Tangle {

    static plans = {
        zentangle: {
            aah: {
            },
            dot: {
                size: new Range(3, 6),
                fillColor: 255,
            },
        },
    };

    /**
     * Create the Aahs tangle object.
     * @param {Box} box The rectangle where the AAhs should be drawn.
     * @param {object} options A map of values to be loaded into instance variables.
     */
    constructor(box, options) {
        super(box);
        this.polys = [];
        this.avoidCollisions = true;
        this.plan = Aahs.plans.zentangle;
        this.loadOptions(options);
        if (this.plan.aah === undefined) this.plan.aah = {};
        if (this.plan.dot === undefined) this.plan.dot = {};
    }

    /**
     * Draw the Aahs.
     */
    draw() {
        if (this.plan.aah.enable === undefined || this.plan.aah.enable === true) {
            let drawCount = 0;
            let failCount = 0;

            const size = this.plan.aah.size === undefined ?
                Math.min(this.box.width, this.box.height) / 8 : this.plan.aah.size;
            if (this.margin === undefined) this.margin = size/6;
            const desiredCount =  this.plan.aah.desiredCount === undefined ?
                (this.box.width / size) * (this.box.height / size) * 10 : this.plan.aah.desiredCount;
            console.log(desiredCount);
            const sizeSDev = this.plan.aah.sizeSDP === undefined ?
                (this.plan.aah.sizeSDP / 100) * size : this.plan.aah.sizeSDP;

            while (drawCount < desiredCount) {
                let center = new Point(random(this.box.position.x + this.margin, this.box.width - this.margin),
                    random(this.box.position.y + this.margin, this.box.height - this.margin));

                let options = {
                    debug: this.debug,
                };
                if (this.plan.aah.armCount !== undefined) options.armCount = this.plan.aah.armCount;
                if (this.plan.aah.thetaSD !== undefined) options.thetaSD = this.plan.aah.thetaSD;
                if (this.plan.aah.lengthSDP !== undefined) options.lengthSDP = this.plan.aah.lengthSDP;
                if (this.plan.aah.gapSDP !== undefined) options.gapSDP = this.plan.aah.gapSDP;
                if (this.plan.aah.rotate !== undefined) options.rotate = this.plan.aah.rotate;
                if (this.plan.aah.tipDistancePercent !== undefined) options.tipDistancePercent = this.plan.aah.tipDistancePercent;
                if (this.plan.aah.tipDiameter !== undefined) options.tip.diameter = this.plan.aahTipDiameter;
                if (this.plan.aah.fillColor !== undefined) options.fillColor = this.plan.aah.fillColor;
                if (this.plan.aah.strokeColor !== undefined) options.strokeColor = this.plan.aah.strokeColor;
                const aah = new Aah(randomGaussian(size, sizeSDev), center, options);
                const poly = aah.getPoly();

                const conflict = this.collisionTest(poly);
                if (conflict) {
                    ++failCount;
                    if (failCount > desiredCount * 3) {
                        break;
                    }
                } else {
                    this.polys.push(poly);
                    aah.draw();
                    ++drawCount;
                }
            }
        }

        if (this.plan.dot.enable === undefined || this.plan.dot.enable === true) {
            const size = this.plan.dot.size === undefined ? 3 : this.plan.dot.size;
            const sizeIsNum = isNaN(size) ? false : true;
            const ds = (sizeIsNum ? size : size.max)*2;
            const desiredCount = (this.box.width/ds) * (this.box.height/ds);
            for (let i = 0; i < desiredCount; ++i) {
                const center = new Point(random(this.box.position.x + this.margin, this.box.width - this.margin),
                    random(this.box.position.y + this.margin, this.box.height - this.margin));
                const diameter = sizeIsNum ? size : size.rand();
                let options = {
                    debug: this.debug,
                };
                if (this.plan.dot.spacing !== undefined) options.spacing = this.plan.dot.spacing;
                if (this.plan.dot.fillColor !== undefined) options.fillColor = this.plan.dot.fillColor;
                if (this.plan.dot.strokeColor !== undefined) options.strokeColor = this.plan.dot.strokeColor;
                const dot = new Dot(diameter, center, options);
                const poly = dot.getPoly();

                const conflict = this.collisionTest(poly);
                if (!conflict) {
                    this.polys.push(poly);
                    dot.draw();
                }
            }
        }

        return this.polys;
    }
}
