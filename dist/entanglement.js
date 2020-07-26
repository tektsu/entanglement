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
 * Common components of TangleElement and Tangle.
 */
class TangleBase {

    /**
     * Create a new TangleBase
     */
    constructor() {}

    /**
     * Load options into instance variables.
     * @param {object} options Key/Value pairs.
     */
    loadOptions(options) {
        if (typeof options === 'undefined') options = {};
        if (!('allowableOptions' in options)) {
            options.allowableOptions = {};
        }
        for (const key in this.optionsAllowed) {
            options.allowableOptions[key] = this.optionsAllowed[key];
        }
        let allowable = options.allowableOptions;
        delete options.allowableOptions;
        for (const property in options) {
            if (property in allowable) {
                this[property] = options[property];
            } else {
                console.log("ERROR: Ignoring option: ", property)
            }
        }
        for (const property in allowable) {
            if (typeof this[property] === 'undefined' && typeof allowable[property] !== 'undefined') {
                this[property] = allowable[property];
            }
        }
    }
}

/**
 * @typedef {Object} TangleElementOptions
 * @property {number} debug The debug level.
 * @property {p5.Color} fillColor The color with which to fill shapes.
 * @property {p5.Color} strokeColor The color with which to draw lines.
 */

/**
 * Base class for a repeatable element of a tangle.
 */
class TangleElement extends TangleBase {

    /**
     * Create a TangleElement.
     * @param {p5.Graphics} g The graphics object to write to.
     * @param {Point} center The location of the element.
     * @param {TangleElementOptions} options A map of values to be loaded into instance variables.
     */
    constructor(g, center, options) {
        super();
        this.g = g;
        this.center = center==undefined ? Point(0,0) : center;
        this.poly = [];

        this.optionsAllowed = {
            debug: 0,
            fillColor: 0,
            strokeColor: 0,
        };

        this.loadOptions(options)
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
 * @typedef {Object} TangleOptions
 * @property {number} debug The debug level.
 * @property {p5.Color} background The color with which to fill the background.
 * @property {number} gridSpacing The grid size in pixels. If used, both gridXSpacing and gridYSpacing are set to this.
 * @property {number} gridXSpacing The horizontal grid size in pixels.
 * @property {number} gridYSpacing The vertical grid size in pixels.
 * @property {number} gridVary The grid point location variation in pixels. If used, both gridXVary and gridYVary are set to this.
 * @property {number} gridXVary The horizontal grid point location variation in pixels.
 * @property {number} gridYVary The vertical grid point location variation in pixels.
 * @property {objects} polys Polygons already drawn.
 * @property {boolean} avoidCollisions If true, do not draw over other elements lusted in this.polys.
 */

/**
 * Base class for a tangle, which is an area filled with TangleElements
 */
class Tangle extends TangleBase {

    /**
     * Create a new Tangle
     * @param {number} width
     * @param {number} height
     * @param {TangleOptions} options A map of values to be loaded into instance variables.
     */
    constructor(width, height, options) {
        super();
        this.width = width;
        this.height = height;
        this.g = createGraphics(width, height);
        this.gridPoints = [];

        this.optionsAllowed = {
            debug: 0,
            background: undefined,
            gridSpacing: undefined,
            gridXSpacing: 40,
            gridYSpacing: 40,
            gridVary: undefined,
            gridXVary: undefined,
            gridYVary: undefined,
            polys: [],
            avoidCollisions: true,
        };

        this.loadOptions(options);

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
            this.gridXVary = .02 * this.gridXSpacing;
        }
        if (this.gridYVary === undefined) {
            this.gridYVary = .02 * this.gridYSpacing;
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
     * Draw the grid on the graphics buffer
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
     * @param [p5.Vector] poly The polygon to test.
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

    /**
     * Paste the graphics buffer onto the canvas at the specified position .
     * @param {Point} position The position at which to place the image on the canvas.
     */
    paste(position) {
        image(this.g, position.x, position.y);
    }

}

/**
 * @typedef {Object} DotElementOptions
 * @property {number|Range} size Dot diameter.
 * @property {number} spacing Relative dot spacing expressed as a percentage of diameter; defines the size of the enclosing polygon.
 * @property {value} any Any of the TangleElementOptions may be used here.
 */

/**
 * Define the Dot element.
 */
class Dot extends TangleElement {

    /**
     * Create a new Dot.
     * @param {p5.Graphics} g The graphics object to draw to.
     * @param {Point} center The position of the dot.
     * @param {DotElementOptions} options A map of values to be loaded into instance variables.
     */
    constructor(g, center, options) {
        if (typeof options === 'undefined') options = {};
        options.allowableOptions = {
            spacing: 400,
            size: 3,
        };
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
 * @typedef {Object} AahTipTypes
 * @property {string} any Any members of this object are preset tip types to indicate special processing
 */

/**
 * @typedef {Object} AahElementOptions
 * @property {number} armCount The number of arms for the Aah.
 * @property {number} gapSDP The percentage of initial arm length (which is half the value of size) to use as a standard deviation when randomly varying central gap for each arm.
 * @property {number} lengthSDP The percentage of initial arm length (which is half the value of size) to use as a standard deviation when randomly varying actual arm length.
 * @property {boolean} rotate If true, rotate the final Aah a random number of degrees.
 * @property {number} size The expected size of the Aah. The actual size will vary depending on random factors.
 * @property {number} thetaSD The angle in degrees to use as a standard deviation when randomly varying the angles between the arms.
 * @property {number} tipDistancePercent The percentage up the arm to place the tip. A valve if 100 puts the tip at the end of each arm.
 * @property {number} tipDiameter The diameter of the tip. The special value of Aah.tipType.gap makes the tip for each arm the same as that arm's gap.
 * @property {value} any Any of the TangleElementOptions may be used here.
 */

/**
 * Define the Aah element.
 */
class Aah extends TangleElement {

    /**
     * Special setting for defining Aah tips
     * @type {AahTipTypes}
     */
    static tipType = {
        gap: "gap",
    };

    /**
     * Create a new Aah.
     * @param {p5.Graphics} g The graphics object to draw to.
     * @param {Point} center The position of the aah.
     * @param {AahElementOptions} options A map of values to be loaded into instance variables.
     */
    constructor(g, center, options) {
        if (typeof options === 'undefined') options = {};
        options.allowableOptions = {
            armCount: 8,
            thetaSD: 5,
            lengthSDP: 15,
            gapSDP: 10,
            rotate: true,
            tipDistancePercent: 100,
            tipDiameter: Aah.tipType.gap,
            size: 100,
        };
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
 * @typedef {Object} AahPlan
 * @property {number} sizeSDP The percentage of initial size to use as a standard deviation when randomly varying the size of each Aah.
 * @property {number} desiredCount The number of Aah elements to try to draw. The actual number drawn will depend on how many will fit.
 * @property {value} any Any of the AahOptions may be used here.
 */

/**
 * @typedef {Object} DotPlan
 * @property {value} any Any of the DotOptions may be used here.
 */

/**
 * @typedef {Object} AahsPlan
 * @property {AahPlan} aah Options for generating individual Aah elements.
 * @property {DotPlan} dot Options for generating individual Dot elements.
 */

/**
 * @typedef {Object} AahsPlans
 * @property {AahsPlan} any Any members of this object are named AahsPlan objects to be used as presets.
 */

/**
 * @typedef {Object} AahsOptions
 * @property {AahsPlan} plan A set of options for underlying elements.
 * @property {value} any Any of the TangleOptions may be used here.
 */

/**
 * Define the Aahs tangle
 */
class Aahs extends Tangle {

    /**
     * Preset plans for the Aah tangle.
     * @type {AahsPlans}
     * @static
     */
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
     * @param {AahsOptions} options A map of values to be loaded into instance variables.
     */
    constructor(width, height, options) {
        if (typeof options === 'undefined') options = {};
        options.allowableOptions = {
            plan: Aahs.plans.zentangle,
        };
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
                if (typeof this.plan.aah.armCount !== 'undefined') options.armCount = this.plan.aah.armCount;
                if (typeof this.plan.aah.thetaSD !== 'undefined') options.thetaSD = this.plan.aah.thetaSD;
                if (typeof this.plan.aah.lengthSDP !== 'undefined') options.lengthSDP = this.plan.aah.lengthSDP;
                if (typeof this.plan.aah.gapSDP !== 'undefined') options.gapSDP = this.plan.aah.gapSDP;
                if (typeof this.plan.aah.rotate !== 'undefined') options.rotate = this.plan.aah.rotate;
                if (typeof this.plan.aah.tipDistancePercent !== 'undefined') options.tipDistancePercent = this.plan.aah.tipDistancePercent;
                if (typeof this.plan.aah.tipDiameter !== 'undefined') options.tip.diameter = this.plan.aahTipDiameter;
                if (typeof this.plan.aah.fillColor !== 'undefined') options.fillColor = this.plan.aah.fillColor;
                if (typeof this.plan.aah.strokeColor !== 'undefined') options.strokeColor = this.plan.aah.strokeColor;
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
                if (typeof this.plan.dot.spacing !== 'undefined') options.spacing = this.plan.dot.spacing;
                if (typeof this.plan.dot.fillColor !== 'undefined') options.fillColor = this.plan.dot.fillColor;
                if (typeof this.plan.dot.strokeColor !== 'undefined') options.strokeColor = this.plan.dot.strokeColor;
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
 * @typedef {Object} BoxSpiralElementOptions
 * @property {number|Range} divisions The number of divisions into which to subdivide the quadrilateral sides. The default is 4.
 * @property {string} rotation The direction of the spiral. Must be 'ccw', 'cw' or 'random'. The default is 'ccw'.
 * @property {string} startCorner The corner on which to start the spiral. Must be 'nw', 'ne', 'se', 'sw' or 'random'. The default is 'nw'.
 * @property {number} size If size is specified, the quadrilateral is a square centered on the specified center.
 * @property {Point} nw The northwest corner of the quadrilateral. Overrides size.
 * @property {Point} ne The northeast corner of the quadrilateral. Overrides size.
 * @property {Point} se The southeast corner of the quadrilateral. Overrides size.
 * @property {Point} sw The southwest corner of the quadrilateral. Overrides size.
 * @property {boolean} interior If true, do not touch the sides of the quadrilateral, draw the spiral inside the quadrilateral with two fewer divisions than specified. The default is false.
 * @property {value} any Any of the TangleElementOptions may be used here.
 */

/**
 * Define the BoxSpiral Element.
 */
class BoxSpiralElement extends TangleElement {

    /**
     * Create a box spiral element
     * @param {p5.Graphics} g The graphics buffer on which to draw.
     * @param {Point} center The center of the spiral.
     * @param {BoxSpiralElementOptions} options The options list.
     */
    constructor(g, center, options) {
        if (typeof options === 'undefined') options = {};
        options.allowableOptions = {
            divisions: 4,
            nw: undefined,
            ne: undefined,
            se: undefined,
            sw: undefined,
            rotation: 'ccw',
            size: 50,
            startCorner: 'nw',
            interior: false,
        };
        if (!('fillColor' in options)) {
            options.fillColor = color(0, 0, 0, 0);
        }
        super(g, center, options);
        if (isNaN(this.divisions)) {    // If not a number, this should be a Range
            this.divisions.max += 1;
            this.divisions = Math.floor(this.divisions.rand());
        }
        this.divisions = Math.max(this.interior ? 3 : 2, this.divisions);
        if (this.rotation === 'random') {
            this.rotation = ['cw', 'ccw'][Math.floor(random(0, 2))];
        }
        if (this.startCorner === 'random') {
            this.startCorner = ['nw', 'ne', 'se', 'sw'][Math.floor(random(0, 4))];
        }
        if (this.nw === undefined) this.nw = new Point(center.x-this.size/2, center.y-this.size/2);
        if (this.ne === undefined) this.ne = new Point(center.x+this.size/2, center.y-this.size/2);
        if (this.se === undefined) this.se = new Point(center.x+this.size/2, center.y+this.size/2);
        if (this.sw === undefined) this.sw = new Point(center.x-this.size/2, center.y+this.size/2);

        this.pointPool = this._pointPool();
    }

    /**
     * Alternate BoxSpiralElement constructor using corner coordinates instead of center and size.
     * @param {p5.Graphics} g The graphics buffer on which to draw.g
     * @param {Point} nw The northwest corner of the quadrilateral.
     * @param {Point} ne The northeast corner of the quadrilateral.
     * @param {Point} se The southeast corner of the quadrilateral.
     * @param {Point} sw The southwest corner of the quadrilateral.
     * @param {BoxSpiralElementOptions} options The options list.
     * @returns {BoxSpiralElement}
     */
    static newFromCoordinates(g, nw, ne, se, sw, options) {
        if (typeof options === 'undefined') options = {};
        options.nw = nw;
        options.ne = ne;
        options.se = se;
        options.sw = sw;
        return new BoxSpiralElement(g, new Point((nw.x+ne.x+se.x+sw.x)/4, (nw.y+ne.y+se.y+sw.y)/4), options);
    }

    /**
     * Draw the BoxSpiralElement onto the graphics buffer.
     */
    draw() {

        // Fill Quadrilateral
        this.g.noStroke();
        this.g.fill(this.fillColor);
        this.g.beginShape();
        this.g.vertex(this.nw.x, this.nw.y);
        this.g.vertex(this.ne.x, this.ne.y);
        this.g.vertex(this.se.x, this.se.y);
        this.g.vertex(this.sw.x, this.sw.y);
        this.g.endShape(CLOSE);

        // Draw Spiral
        this.g.stroke(this.strokeColor);
        this.current = this._firstPoint();
        let i = 0;
        while (1) {

            const n = this._nextPoint();
            if (n === undefined) {
                break;
            }
            this.g.line(this.pointPool[this.current].x, this.pointPool[this.current].y, this.pointPool[n].x, this.pointPool[n].y);
            this.current = n;
            if (++i > 5 * this.divisions) {
                console.log('BoxSpiralElement - runaway spiral?');
                break;
            }
        }
    }

    /**
     * Create an array of potential points for this box spiral
     * @returns [{Point}] Array of points
     * @private
     */
    _pointPool() {

        // Create the crosshatch
        const lwyPoints = new Line(this.nw, this.sw).divide(this.divisions);
        const leyPoints = new Line(this.ne, this.se).divide(this.divisions);
        const lnxPoints = new Line(this.nw, this.ne).divide(this.divisions);
        const lsxPoints = new Line(this.sw, this.se).divide(this.divisions);
        let vLines = [];
        let hLines = [];
        for (let i=0; i<=this.divisions; i++) {
            vLines.push(new Line(lnxPoints[i], lsxPoints[i]));
            hLines.push(new Line(lwyPoints[i], leyPoints[i]));
        }

        // Create the point pool from which the spirals will be created, using line intersections
        let points = [];
        for (let h=0; h<=this.divisions; h++) {
            for (let v=0; v<=this.divisions; v++) {
                points.push(hLines[h].intersection(vLines[v]));
            }
        }
        return points;
    }

    /**
     * Set the direction of the next move
     * @private
     */
    _nextDirection() {
        this.direction = this.direction + (this.rotation === 'ccw' ? 1 : -1) % 4;
    }

    /**
     * Find the first point -- the point where the spiral starts.
     * @returns {number} The index of the first point in this.pointPool.
     * @private
     */
    _firstPoint() {
        // this.direction is set to some large number (so it does not go negative for cw rotations)
        this.direction = 4 * this.divisions; // divisable by 4, so the initial direction is 0 (down)
        if (this.rotation === 'cw') {
            this.direction++; // if cw, the initial direction is 1.
        }
        this.current = this.interior ? this.divisions + 2 : 0;       // Index of first point
        this.step =  this.interior ? 2 : 0;
        this.levelCount = 3;    // We need three strokes at the first level, 2 for each subsequent level

        // Modifications if the starting corner is other than nw
        switch(this.startCorner) {
            case 'ne':
                this.current = this.interior ? 2 * this.divisions : this.divisions;
                this.direction += 3;
                break;
            case 'se':
                this.current = this.interior ? Math.pow(this.divisions, 2) + this.divisions - 2 : Math.pow(this.divisions+1, 2) - 1;
                this.direction += 2;
                break;
            case 'sw':
                this.current = this.interior ? Math.pow(this.divisions, 2) : this.divisions * (this.divisions+1);
                this.direction += 1;
                break;
        }

        return this.current;
    }

    /**
     * Find the next point in the spiral.
     * @returns {number|undefined} The index of the next point in this.pointPool, or undefined when there is no next point.
     * @private
     */
    _nextPoint() {
        let p;
        const interval = this.divisions - this.step;
        if (interval === 0)
            return p;
        switch(this.direction % 4) {
            case 0: // down
                p = this.current + interval*(this.divisions+1);
                break;
            case 1: // right
                p = this.current + interval;
                break;
            case 2: // up
                p = this.current - interval*(this.divisions+1);
                break;
            case 3: // left
                p = this.current - interval;
                break;
        }

        // If we have completed the points for this level, move to next
        if (--this.levelCount === 0) {
            ++this.step;
            this.levelCount = 2; // We need 2 points at each level after the first
        }
        this._nextDirection();

        return p;
    }
}

/**
 * @typedef {Object} AmblerOptions
 * @property {value} any Any of the TangleOptions may be used here.
 */

/**
 * Define the Ambler Tangle.
 */
class Ambler extends Tangle {
    /**
     * Create a new Ambler
     * @param {number} width The width of the tangle.
     * @param {number} height The height of the tangle.
     * @param {AmblerOptions} options The options list.
     */
    constructor(width, height, options) {
        if (typeof options === 'undefined') options = {};
        super(width, height, options);

        this.buildGridPoints();

        const starts = ['nw', 'sw', 'se', 'ne'];
        let colRotate = 0;
        let rowRotate = colRotate + 1;
        for (let r = 0; r < this.gridPoints.length - 1; r++) {
            for (let c = 0; c < this.gridPoints[r].length - 1; c++) {
                const nw = this.gridPoints[r][c];
                const ne = this.gridPoints[r][c + 1];
                const se = this.gridPoints[r + 1][c + 1];
                const sw = this.gridPoints[r + 1][c];
                const bse = BoxSpiralElement.newFromCoordinates(this.g, nw, ne, se, sw, {
                    startCorner: starts[colRotate % 4],
                    divisions: 6,
                    interior: true,
                });
                bse.draw();
                colRotate++;
            }
            colRotate = rowRotate++;
        }

        this.grid();
    }
}
