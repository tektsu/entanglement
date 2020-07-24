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
 * Define a line segment
 */
class Line {
    /**
     * Create a new line
     * @param {Point} begin
     * @param {Point} end
     */
    constructor(begin, end) {
        this.begin = begin;
        this.end = end;
    }

    /**
     * Return the length of the line
     * @returns {number}
     */
    length() {
        return Math.sqrt(Math.pow(this.begin.x - this.end.x, 2) + Math.pow(this.begin.y - this.end.y, 2));
    }

    /**
     * Divide the line into segments, returning a list of points.
     * @param {number} segments
     * @returns [Point]
     */
    divide(segments) {
        let points = [ this.begin ];
        const xDiff = this.begin.x - this.end.x;
        const yDiff = this.begin.y - this.end.y;
        for (let i=1; i<=segments; i++) {
            points.push(new Point(this.begin.x - i * xDiff / segments, this.begin.y - i * yDiff / segments));
        }

        return points;
    }

    /**
     * Find the point at which two lines intersect. The intersection point may not be on either line segment.
     * @param {Line} l The line to intersect with
     * @returns {Point|undefined}
     */
    intersection(l) {
        const d = ((l.end.y - l.begin.y) * (this.end.x - this.begin.x)) - ((l.end.x - l.begin.x) * (this.end.y - this.begin.y));
        if (d == 0) {
            return undefined;
        }
        const a = this.begin.y - l.begin.y;
        const b = this.begin.x - l.begin.x;
        const n1 = ((l.end.x - l.begin.x) * a) - ((l.end.y - l.begin.y) * b);
        const a1 = n1 / d;
        const x = this.begin.x + (a1 * (this.end.x - this.begin.x));
        const y = this.begin.y + (a1 * (this.end.y - this.begin.y));

        return new Point(x, y);
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
     * @param {p5.Graphics} g The graphics object to write to.
     * @param {Point} center The location of the element.
     */
    constructor(g, center, options) {
        this.g = g;
        this.center = center==undefined ? Point(0,0) : center;
        this.poly = [];
        this.debug = false;
        this.fillColor = 0;
        this.strokeColor = 0;

        const optionsAllowed = [
            'debug',
            'fillColor',
            'strokeColor',
        ];

        // These options are never allowed
        const optionsDisallowed = [
            'g',
            'center',
            'poly',
        ];

        // Load options
        let notAllowable = optionsDisallowed.reduce(function(map, key) {
            map[key] = undefined;
            return map;
        }, {});
        if (typeof options === undefined) options = {};
        if (!('allowableOptions' in options)) {
            options.allowableOptions = [];
        }
        options.allowableOptions = options.allowableOptions.concat(optionsAllowed);
        let allowable = options.allowableOptions.reduce(function(map, key) {
            if (!(key in notAllowable))
                map[key] = undefined;
            return map;
        }, {});
        delete options.allowableOptions;
        for (const property in options) {
            if (property in allowable) {
                this[property] = options[property];
            } else {
                console.log("ERROR: Ignoring option: ", property)
            }
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
    // drawPoly() {
    //     if (!this.debug) {
    //         return;
    //     }
    //     fill(128,0,0,128);
    //     beginShape();
    //     for(let i=0; i<this.poly.length; ++i){
    //         vertex(this.poly[i].x, this.poly[i].y);
    //     }
    //     endShape(CLOSE);
    // }

    /**
     * Draw the TangleElement
     */
    draw() {
        this.g.fill(this.fillColor);
        this.g.stroke(this.strokeColor);
    }
}

/**
 * Base class for a tangle, which is an area filled with TangleElements
 */
class Tangle {

    /**
     * Create a new Tangle
     * @param {number} width
     * @param {number} height
     * @param {object} options A map of values to be loaded into instance variables.
     */
    constructor(width, height, options) {
        this.width = width;
        this.height = height;
        this.g = createGraphics(width, height);
        this.background = undefined;
        this.gridXSpacing = 20;
        this.gridYSpacing = 20;
        this.debug = false;
        this.gridPoints = [];
        this.polys = [];
        this.avoidCollisions = true;

        // Local options allowed
        const optionsAllowed = [
            'background',
            'gridSpacing',
            'gridXSpacing',
            'gridYSpacing',
            'gridVary',
            'gridXVary',
            'gridYVary',
            'poly',
            'avoidCollisions',
            'debug',
        ];

        // These options are never allowed
        const optionsDisallowed = [
            'g',
            'width',
            'height',
            'gridPoints'
        ];

        // Load options
        let notAllowable = optionsDisallowed.reduce(function(map, key) {
            map[key] = undefined;
            return map;
        }, {});
        if (typeof options === undefined) options = {};
        if (!('allowableOptions' in options)) {
            options.allowableOptions = [];
        }
        options.allowableOptions = options.allowableOptions.concat(optionsAllowed);
        let allowable = options.allowableOptions.reduce(function(map, key) {
            if (!(key in notAllowable))
                map[key] = undefined;
            return map;
        }, {});
        delete options.allowableOptions;
        for (const property in options) {
            if (property in allowable) {
                this[property] = options[property];
            } else {
                console.log("ERROR: Ignoring option: ", property)
            }
        }

        // Set background
        if (this.background !== undefined) {
            this.g.background(this.background);
        }

        // Check gridSpacing
        if (this.gridSpacing !== undefined) {
            this.gridXSpacing = this.gridYSpacing = this.gridSpacing;
        }
        if (this.gridVary !== undefined) {
            this.gridXVary = this.gridYVary = this.gridVary;
        }

        if (this.gridXVary === undefined) {
            this.gridXVary = .05 * this.gridXSpacing;
        }
        if (this.gridYVary === undefined) {
            this.gridYVary = .05 * this.gridYSpacing;
        }
    }

    /**
     * Build a set of grid points using the grid* options
     */
    buildGridPoints() {
        for(let y=-this.gridYSpacing/2; y<this.height+this.gridYSpacing; y+=this.gridYSpacing) {
            let row = [];
            for(let x=-this.gridXSpacing/2; x<this.width+this.gridXSpacing; x+=this.gridXSpacing) {
                row.push(new Point(random(x-this.gridXVary, x+this.gridXVary), random(y-this.gridYVary, y+this.gridYVary)));
            }
            this.gridPoints.push(row);
        }
    }

    /**
     * Draw the grid
     */
    grid() {
        if (this.gridPoints.length === 0)
            this.buildGridPoints();
        for(let r=0; r<this.gridPoints.length; r++) {
            for(let c=0; c<this.gridPoints[r].length; c++) {
                let nextPoint = this.gridPoints[r][c+1];
                if(nextPoint !== undefined) {
                    this.g.line(this.gridPoints[r][c].x, this.gridPoints[r][c].y, nextPoint.x, nextPoint.y);
                }
                if (this.gridPoints[r+1] === undefined)
                    continue;
                nextPoint = this.gridPoints[r+1][c];
                this.g.line(this.gridPoints[r][c].x, this.gridPoints[r][c].y, nextPoint.x, nextPoint.y);
            }
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

    paste(position) {
        image(this.g, position.x, position.y);
    }

}

/**
 * Define the Dot element.
 */
class Dot extends TangleElement {

    /**
     * Create a new Dot.
     * @param {p5.Graphics} g The graphics object to draw to.
     * @param {Point} center The position of the dot.
     * @param {object} options A map of values to be loaded into instance variables.
     */
    constructor(g, center, options) {
        if (typeof options == undefined) options = {};
        options.allowableOptions = [
            'spacing',
            'size',
        ];
        options.spacing = options.spacing === undefined ? 400 : options.spacing;
        options.size = options.size === undefined ? 3 : options.size;
        super(g, center, options);
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
        this.g.circle(this.center.x, this.center.y, this.size);
        //this.drawPoly();
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
     * @param {p5.Graphics} g The graphics object to draw to.
     * @param {Point} center The position of the aah.
     * @param {object} options A map of values to be loaded into instance variables.
     */
    constructor(g, center, options) {
        if (typeof options == undefined) options = {};
        options.allowableOptions = [
            'armCount',
            'thetaSD',
            'lengthSDP',
            'gapSDP',
            'rotate',
            'tipDistancePercent',
            'tipDiameter',
            'size',
        ];
        options.armCount = options.armCount === undefined ? 8 : options.armCount;
        options.thetaSD = options.thetaSD === undefined ? 5 : options.thetaSD;
        options.lengthSDP = options.lengthSDP === undefined ? 15 : options.lengthSDP;
        options.gapSDP = options.gapSDP === undefined ? 10 : options.gapSDP;
        options.rotate = options.rotate === undefined ? true : options.rotate;
        options.tipDistancePercent = options.tipDistancePercent === undefined ? 100 : options.tipDistancePercent;
        options.tipDiameter = options.tipDiameter === undefined ? Aah.tipType.gap : options.tipDiameter;
        options.size = options.size === undefined ? 100 : options.size;
        super(g, center, options);
        this.length = this.size/2;
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
            this.g.line(arm.start.x, arm.start.y, arm.stop.x, arm.stop.y);
            this.g.circle(arm.tipCenter.x, arm.tipCenter.y, arm.tipDiameter);
        });
        // this.drawPoly();
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
     * @param {number} width The width of the tangle.
     * @param {number} height The height of the tangle.
     * @param {object} options A map of values to be loaded into instance variables.
     */
    constructor(width, height, options) {
        if (typeof options == undefined) options = {
            plan: Aahs.plans.zentangle
        };
        options.allowableOptions = [
            'plan',
        ];
        options.plan = options.plan === undefined ? Aahs.plans.zentangle : options.plan;
        super(width, height, options);

        if (this.plan.aah === undefined) this.plan.aah = {};
        if (this.plan.dot === undefined) this.plan.dot = {};

        if (this.plan.aah.enable === undefined || this.plan.aah.enable === true) {
            let drawCount = 0;
            let failCount = 0;

            const size = this.plan.aah.size === undefined ?
                Math.min(this.width, this.height) / 8 : this.plan.aah.size;
            if (this.margin === undefined) this.margin = size/6;
            const desiredCount = this.plan.aah.desiredCount === undefined ?
                (this.width / size) * (this.height / size) * 10 : this.plan.aah.desiredCount;
            const sizeSDev = this.plan.aah.sizeSDP === undefined ?
                (this.plan.aah.sizeSDP / 100) * size : this.plan.aah.sizeSDP;

            while (drawCount < desiredCount) {
                let center = new Point(random(this.margin, this.width - this.margin), random(this.margin, this.height - this.margin));

                let options = {
                    debug: this.debug,
                    size: randomGaussian(size, sizeSDev),
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
                const aah = new Aah(this.g, center, options);
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
            const desiredCount = (this.width/ds) * (this.height/ds);
            for (let i = 0; i < desiredCount; ++i) {
                const center = new Point(random(this.margin, this.width - this.margin), random(this.margin, this.height - this.margin));
                let options = {
                    debug: this.debug,
                    size: sizeIsNum ? size : size.rand(),
                };
                if (this.plan.dot.spacing !== undefined) options.spacing = this.plan.dot.spacing;
                if (this.plan.dot.fillColor !== undefined) options.fillColor = this.plan.dot.fillColor;
                if (this.plan.dot.strokeColor !== undefined) options.strokeColor = this.plan.dot.strokeColor;
                const dot = new Dot(this.g, center, options);
                const poly = dot.getPoly();

                const conflict = this.collisionTest(poly);
                if (!conflict) {
                    this.polys.push(poly);
                    dot.draw();
                }
            }
        }
    }
}

/**
 * Define the Ambler Tangle.
 */
class Ambler extends Tangle {
    /**
     * Create a new Ambler
     * @param {number} width The width of the tangle.
     * @param {number} height The height of the tangle.
     * @param {obkect} options The options list.
     */
    constructor(width, height, options) {
        if (typeof options == undefined) options = {};
        super(width, height, options);

        this.grid();

        let colRotate = 0;
        let rowRotate = colRotate + 1;
        for (let r=0; r<this.gridPoints.length-1; r++) {
            for (let c=0; c<this.gridPoints[r].length-1; c++) {
                const p = this._pointPool(this.gridPoints[r][c], this.gridPoints[r][c + 1],
                    this.gridPoints[r + 1][c + 1], this.gridPoints[r + 1][c]);
                let points = [];
                const rotate = colRotate % 4;
                switch(rotate) {    // Different rotations use different points from the pool
                    case 0:
                        points = [p[0], p[14], p[16], p[2], p[1], p[11], p[13], p[5], p[4], p[8]];
                        break;
                    case 1:
                        points = [p[14], p[16], p[2], p[0], p[10], p[13], p[5], p[3], p[7], p[8]];
                        break;
                    case 2:
                        points = [p[16], p[2], p[0], p[14], p[15], p[5], p[3], p[11], p[12], p[8]];
                        break;
                    case 3:
                        points = [p[2], p[0], p[14], p[16], p[6], p[3], p[11], p[13], p[9], p[8]];
                        break;
                }
                for (let i = 1; i < points.length; i++) {
                    this.g.line(points[i-1].x , points[i-1].y, points[i].x, points[i].y);
                }
                colRotate++;
            }
            colRotate = rowRotate++;
        }
    }

    /*
     *  _pointPool() creates a grid of proportionally-spaced points inside a quadrilateral (q). The q is divided into
     *  36 sections (6x6) and a list of interior points defining those sections is returned. There would be 25 such
     *  points, but only 17 are needed to draw an Ambler spiral in all its rotations, so only those are calculated.
     *
     *      +--+--+--+--+--+--+
     *      |                 |     This chart shows the 17 points calculated and the indexes in the
     *      +  0  1  .  .  2  +     returned array which they occupy.
     *      |                 |
     *      +  .  3  4  5  6  +
     *      |                 |
     *      +  .  7  8  9  .  +
     *      |                 |
     *      + 10 11 12 13  . +
     *      |                 |
     *      + 14  .  . 15  16 +
     *      |                 |
     *      +--+--+--+--+--+--+
     *
     *  _pointPool() takes 4 parameters, all of type Point:
     *  the upper-left (northwest), upper-right (northeast),
     *  lower-right (southeast), and lower-left (southwest)
     *  points of the quadrilateral.
     */
    _pointPool(nw, ne, se, sw) {
        const segments = 6;

        // Create the interior lines
        const lwyPoints = new Line(nw, sw).divide(segments);
        const leyPoints = new Line(ne, se).divide(segments);
        const lnxPoints = new Line(nw, ne).divide(segments);
        const lsxPoints = new Line(sw, se).divide(segments);
        let vLines = [];
        let hLines = [];
        for (let i=1; i<segments; i++) {
            vLines.push(new Line(lnxPoints[i], lsxPoints[i]));
            hLines.push(new Line(lwyPoints[i], leyPoints[i]));
        }

        // Create the point pool from which the spirals will be created, using intersections of interior lines
        return  [
            hLines[0].intersection(vLines[0]),
            hLines[0].intersection(vLines[1]),
            hLines[0].intersection(vLines[4]),
            hLines[1].intersection(vLines[1]),
            hLines[1].intersection(vLines[2]),
            hLines[1].intersection(vLines[3]),
            hLines[1].intersection(vLines[4]),
            hLines[2].intersection(vLines[1]),
            hLines[2].intersection(vLines[2]),
            hLines[2].intersection(vLines[3]),
            hLines[3].intersection(vLines[0]),
            hLines[3].intersection(vLines[1]),
            hLines[3].intersection(vLines[2]),
            hLines[3].intersection(vLines[3]),
            hLines[4].intersection(vLines[0]),
            hLines[4].intersection(vLines[3]),
            hLines[4].intersection(vLines[4]),
        ];

    }

}
