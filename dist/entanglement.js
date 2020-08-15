/**
 * Utilities routines for the Entanglement library.
 */
class Entanglement {

    static version = '0.0.6';

    /**
     * Choose a value
     * @param {number|Range} v A value or value range.
     */
    static getValue(v) {
        let ret = v;
        if (isNaN(v)) {
            ret = v.rand();
        }
        return ret;
    }

    /**
     * Choose an integer value
     * @param {number|Range} v A value or value range.
     */
    static getInt(v) {
        let ret = v;
        if (isNaN(v)) {
            ret = random(v.min, v.max+1);
        }
        return Math.floor(ret);
    }
}

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

    /**
     * Rotate the point in the coordinate system around another point.
     * @param {number} degrees The nunber of degrees clockwise to rotate.
     * @param {Point} center The point around which to rotate.
     */
    rotate(degrees, center) {
        const r = radians(degrees);
        const x = this.x - center.x;
        const y = this.y - center.y;
        this.x = x*cos(r)-y*sin(r) + center.x;
        this.y = x*sin(r)+y*cos(r) + center.y;
    }

    /**
     * Vary the point location (both x and y) by up to v.
     * @param {number} v The number of pixels to vary the point.
     * @returns {Point} This point, after being modified.
     */
    vary(v) {
        this.x += random(-v, v);
        this.y += random(-v, v);
        return this;
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
     * @param {number} segments Number of segments.
     * @returns {Point[]} List of points.
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
     * Convert a line into an array of Points with slight variations.
     * @param {number} divisions The number of lines to divide the Line into.
     * @param {number} variation The number of pixels of variation in X and Y to allow.
     * @returns {Point[]}
     */
    handDrawn(divisions, variation) {
        if (divisions === undefined) {
            divisions = Math.floor(this.length()/6);
        }
        if (divisions === 0) {
            return [this.begin, this.end];
        }
        if (variation === undefined) {
            variation = 1;
        }

        let variedPoints = [];
        const points = this.divide(divisions);
        for (let p=0; p<points.length; p++) {
            if (p===0 || p===points.length-1) {
                variedPoints.push(points[p])
            } else {
                variedPoints.push(points[p].vary(variation));
            }
        }

        return variedPoints;
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
 * Define a Polygon.
 */
class Polygon {

    /**
     * Create a polygon.
     * @param {Point[] | Polygon} vertices The vertices of the polygon.
     */
    constructor(vertices) {
        this.boundingRectangle = undefined;
        this.vertices = []
        if (typeof vertices !== 'undefined') {
            this.vertices = vertices;
        }
    }

    /**
     * Add a vertex to the polygon.
     * @param {Point} v The vertex to add.
     */
    addVertex(v) {
        this.vertices.push(v);
        this.boundingRectangle = undefined;
    }

    /**
     * Calculates the bounding rectangle. It's worth noting that the first point in the bounding rectangle is the
     * upper left corner, and subsequent points proceed clockwise. Certain methods rely on this ordering.
     * @returns {Polygon} The bounding rectangle for this polygon.
     */
    getBoundingRectangle() {
        if (this.boundingRectangle === undefined) {
            let minX = this.vertices[0].x;
            let minY = this.vertices[0].y;
            let maxX = minX;
            let maxY = minY;
            for (let i = 1; i < this.vertices.length; i++) {
                if (this.vertices[i].x < minX)
                    minX = this.vertices[i].x;
                if (this.vertices[i].y < minY)
                    minY = this.vertices[i].y;
                if (this.vertices[i].x > maxX)
                    maxX = this.vertices[i].x;
                if (this.vertices[i].y > maxY)
                    maxY = this.vertices[i].y;
            }
            this.boundingRectangle = new Polygon([
                new Point(minX, minY),
                new Point(maxX, minY),
                new Point(maxX, maxY),
                new Point(minX, maxY),
            ]);
        }

        return this.boundingRectangle;
    }

    /**
     * Calculate the center of the polygon.
     * @returns {Point} The center.
     */
    getCenter() {
        this.getBoundingRectangle();
        return new Point(
            (this.boundingRectangle.vertices[0].x + this.boundingRectangle.vertices[1].x)/2,
            (this.boundingRectangle.vertices[0].y + this.boundingRectangle.vertices[3].y)/2,
        );
    }

    /**
     * Get the upper left corner (origin) of the bounding rectangle.
     * @returns {Point} The upper left corner.
     */
    getOrigin() {
        this.getBoundingRectangle();
        return this.boundingRectangle.vertices[0];
    }

    /**
     * Get the width of the bounding rectangle.
     * @returns {number} The difference between max and min X values.
     */
    getWidth() {
        this.getBoundingRectangle();
        return Math.ceil(this.boundingRectangle.vertices[2].x - this.boundingRectangle.vertices[0].x);
    }

    /**
     * Get the height of the bounding rectangle.
     * @returns {number} The difference between max and min Y values.
     */
    getHeight() {
        this.getBoundingRectangle();
        return Math.ceil(this.boundingRectangle.vertices[2].y - this.boundingRectangle.vertices[0].y);
    }

    /**
     * Rotate the polygon around a point.
     * @param {number} degrees The number of degrees to rotate.
     * @param {Point} center The point around which to rotate. If not supplied, the physical center of the polygon is used.
     */
    rotate(degrees, center) {
        if (typeof(center) === 'undefined') {
            center = this.getCenter();
        }
        for (let i=0; i<this.vertices.length; i++) {
            this.vertices[i].rotate(degrees, center);
        }

        this.boundingRectangle = undefined;
    }

    /**
     * Make a copy of the polygon.
     * @returns {Polygon} New Polygon.
     */
    copy() {
        const poly = new Polygon();
        for (let i=0; i<this.vertices.length; i++) {
            poly.addVertex(new Point(this.vertices[i].x, this.vertices[i].y));
        }

        return poly;
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

        this.loadOptions(options);
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
 * @property {boolean} grid If true, this is a grid-based tangle. The default is false.
 * @property {boolean} gridShow If true, and this is a grid-based tangle, draw the grid lines after building the tangle. The default is true.
 * @property {number} gridSpacing The grid size in pixels. If used, both gridXSpacing and gridYSpacing are set to this.
 * @property {number} gridXSpacing The horizontal grid size in pixels. The default is 40.
 * @property {number} gridYSpacing The vertical grid size in pixels. The Default is 40.
 * @property {number} gridVary The grid point location variation in pixels. If used, both gridXVary and gridYVary are set to this.
 * @property {number} gridXVary The horizontal grid point location variation in pixels.
 * @property {number} gridYVary The vertical grid point location variation in pixels.
 * @property {object[]} polys Polygons already drawn.
 * @property {boolean} avoidCollisions If true, do not draw over other elements listed in this.polys. The default is true.
 * @property {Point[]} maskPoly A set of points defining a polygon. Only the portion of the image inside the polygon will be displayed, unless ignoreMask is true.
 * @property {boolean} addStrings If true, the boundaries of the maskPoly are drawn. The default is true.
 * @property {boolean} ignoreMask If true, do not mask the result, draw the entire rectangle. The default is false.
 * @property {number} tangleRotate The number of degrees by which to rotate the tangle before applying the mask. The default is 0.
 */

/**
 * Base class for a tangle, which is an area filled with TangleElements
 */
class Tangle extends TangleBase {

    /**
     * Create a new Tangle
     * @param {Point[] | Polygon} mask Vertices of a polygon used as a mask. Only the portion of the tangle inside the polygon will be visible.
     * @param {TangleOptions} options A map of values to be loaded into instance variables.
     */
    constructor(mask, options) {
        super();
        this.maskPoly = mask;
        if (Array.isArray(mask)) {
            this.maskPoly = new Polygon(mask);
        }
        this.gridPoints = [];
        this.build = function() {}

        this.optionsAllowed = {
            debug: 0,
            background: undefined,
            grid: false,
            gridShow: false,
            gridSpacing: undefined,
            gridXSpacing: 40,
            gridYSpacing: 40,
            gridVary: undefined,
            gridXVary: undefined,
            gridYVary: undefined,
            polys: [],
            avoidCollisions: true,
            addStrings: true,
            ignoreMask: false,
            tangleRotate: 0,
        };

        this.loadOptions(options);

        const br = this.maskPoly.getBoundingRectangle().copy();
        this.origin = br.getOrigin();
        this.width = br.getWidth();
        this.height = br.getHeight();
        if (this.tangleRotate) {
            // Rotate the mask area, but make sure the bounding rectangle always covers at least the original mask area.
            let minX = this.origin.x;
            let minY = this.origin.y;
            let maxX = minX + this.width;
            let maxY = minY + this.height;
            br.rotate(this.tangleRotate);
            const origin = br.getOrigin();
            const width = br.getWidth();
            const height = br.getHeight();
            minX = Math.floor(Math.min(minX, origin.x));
            minY = Math.floor(Math.min(minY, origin.y));
            maxX = Math.ceil(Math.max(maxX, origin.x+width));
            maxY = Math.ceil(Math.max(maxY, origin.y+height));
            this.origin = new Point(minX, minY);
            this.width = maxX-minX;
            this.height = maxY-minY;
        }
        this.g = createGraphics(this.width, this.height);
        if (this.tangleRotate) {
            // Translate the center of the tangle back to the center of the bounding rectangle
            const r = radians(this.tangleRotate);
            const x = this.width/2;
            const y = this.height/2;
            const dx = Math.floor(x-(x*cos(r)-y*sin(r)));
            const dy = Math.floor(y-(x*sin(r)+y*cos(r)));
            this.g.translate(dx, dy);
            this.g.rotate(r);
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
    showGrid() {
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
     * @param {p5.Vector[]} poly The polygon to test.
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

    /**
     * Apply the mask polygon to this tangle. Only the portion of the tangle inside the mask polygon will be displayed.
     */
    applyMask() {
        if (this.ignoreMask) {
            return;
        }

        // Create the mask from the maskPoly
        let mask = createGraphics(this.width, this.height);
        mask.noStroke();
        mask.fill(255, 255, 255, 255);
        mask.beginShape();
        for (let p = 0; p < this.maskPoly.vertices.length; p++) {
            mask.vertex(this.maskPoly.vertices[p].x-this.origin.x, this.maskPoly.vertices[p].y-this.origin.y);
        }
        mask.endShape(CLOSE);

        // Create a masked cloned image
        let clone;
        (clone = this.g.get()).mask(mask.get());

        // Recreate the renderer with the cloned image
        this.g = createGraphics(this.width, this.height);
        this.g.image(clone, 0, 0);

        // If we are drawing strings, do so now
        if (this.addStrings) {
            this.g.stroke(0);
            this.g.fill(0, 0, 0, 0);
            this.g.beginShape();
            for (let p = 0; p < this.maskPoly.vertices.length; p++) {
                this.g.vertex(this.maskPoly.vertices[p].x-this.origin.x, this.maskPoly.vertices[p].y-this.origin.y);
            }
            this.g.endShape(CLOSE);
        }
    }

    /**
     * Build the tangle. Executes the this.build method with before and after processing appropriate to the tangle type.
     * This is normally the last method called by a child class.
     */
    execute() {

        if (this.grid) {
            this.buildGridPoints();
        }

        this.build();

        if (this.grid && this.gridShow) {
            this.showGrid();
        }

        if (!this.ignoreMask) {
            this.applyMask();
        }
    }
}

/**
 * @typedef {Object} DotElementOptions
 * @property {number|Range} size Dot diameter.
 * @property {number} spacing Relative dot spacing expressed as a percentage of diameter; defines the size of the enclosing polygon.
 * @property {value} any Any of the TangleElementOptions may be used here.
 */

/**
 * Define the Dot element. . The Dot element is a simple dot or circle on the canvas.
 * <br />
 * <img src='images/DotElement.png' />
 */
class DotElement extends TangleElement {

    /**
     * Create a new DotElement
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
 * @typedef {Object} AahElementTipTypes
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
 * @property {number} tipDiameter The diameter of the tip. The special value of AahElement.tipType.gap makes the tip for each arm the same as that arm's gap.
 * @property {value} any Any of the TangleElementOptions may be used here.
 */

/**
 * Define the Aah element. An Aah element is star-shaped. It needs an approximate size and a position.
 * The size is approximate because the aah's components are built with some size variations.
 * In addition, an Aah can be rotated randomly, and the angle between the arms can vary.
 * <br />
 * <img src='images/AahElement.png' />
 */
class AahElement extends TangleElement {

    /**
     * Special setting for defining Aah tips
     * @type {AahElementTipTypes}
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
            tipDiameter: AahElement.tipType.gap,
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
                tipDiameter: !isNaN(this.tipDiameter) ? this.tipDiameter : this.tipDiameter === AahElement.tipType.gap ? gap : 10,
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
     * Draw the AahElement to the buffer.
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
 * @typedef {Object} AahElementPlan
 * @property {number} sizeSDP The percentage of initial size to use as a standard deviation when randomly varying the size of each Aah.
 * @property {number} desiredCount The number of Aah elements to try to draw. The actual number drawn will depend on how many will fit.
 * @property {value} any Any of the AahOptions may be used here.
 */

/**
 * @typedef {Object} DotElementPlan
 * @property {value} any Any of the DotOptions may be used here.
 */

/**
 * @typedef {Object} AahPlan
 * @property {AahElementPlan} aah Options for generating individual Aah elements.
 * @property {DotElementPlan} dot Options for generating individual Dot elements.
 */

/**
 * @typedef {Object} AahPlans
 * @property {AahPlan} any Any members of this object are named AahPlan objects to be used as presets.
 */

/**
 * @typedef {Object} AahOptions
 * @property {AahPlan} plan A set of options for underlying elements.
 * @property {value} any Any of the TangleOptions may be used here.
 */

/**
 * Define the Aah tangle.
 * Aah is composed of repeating patterns of AahElement and DotElement, placed randomly on the screen.
 * <br />
 * <img src='images/AahTangle.png' />
 */
class Aah extends Tangle {

    /**
     * Preset plans for the Aah tangle.
     * @type {AahPlans}
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
     * Create the Aah tangle object.
     * @param {Point[] | Polygon} mask Vertices of a polygon used as a mask. Only the portion of the tangle inside the polygon will be visible.
     * @param {AahOptions} options A map of values to be loaded into instance variables.
     */
    constructor(mask, options) {
        if (typeof options === 'undefined') options = {};
        options.allowableOptions = {
            plan: Aah.plans.zentangle,
        };
        options.plan = options.plan === undefined ? Aah.plans.zentangle : options.plan;
        super(mask, options);

        this.build = function() {

            if (this.plan.aah === undefined) this.plan.aah = {};
            if (this.plan.dot === undefined) this.plan.dot = {};

            if (this.plan.aah.enable === undefined || this.plan.aah.enable === true) {
                let drawCount = 0;
                let failCount = 0;

                const size = this.plan.aah.size === undefined ?
                    Math.min(this.width, this.height) / 8 : this.plan.aah.size;
                if (this.margin === undefined) this.margin = size / 6;
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
                    const aah = new AahElement(this.g, center, options);
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
                const ds = (sizeIsNum ? size : size.max) * 2;
                const desiredCount = (this.width / ds) * (this.height / ds);
                for (let i = 0; i < desiredCount; ++i) {
                    const center = new Point(random(this.margin, this.width - this.margin), random(this.margin, this.height - this.margin));
                    let options = {
                        debug: this.debug,
                        size: sizeIsNum ? size : size.rand(),
                    };
                    if (typeof this.plan.dot.spacing !== 'undefined') options.spacing = this.plan.dot.spacing;
                    if (typeof this.plan.dot.fillColor !== 'undefined') options.fillColor = this.plan.dot.fillColor;
                    if (typeof this.plan.dot.strokeColor !== 'undefined') options.strokeColor = this.plan.dot.strokeColor;
                    const dot = new DotElement(this.g, center, options);
                    const poly = dot.getPoly();

                    const conflict = this.collisionTest(poly);
                    if (!conflict) {
                        this.polys.push(poly);
                        dot.draw();
                    }
                }
            }
        };

        this.execute();
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
 * @property {number|Range} rotate Number of degress to rotate the spiral.
 * @property {value} any Any of the TangleElementOptions may be used here.
 */

/**
 * Define the BoxSpiral Element. The BoxSpiral element is a square spiral which is used in several tangles.
 * Its size and direction of rotation (cw or ccw) can be specified in the options.
 * The spiral can be made to fit any quarilateral; it need not be limited to a square.
 * <br />
 * <img src='images/BoxSpiralElement.png' />
 */
class BoxSpiralElement extends TangleElement {

    /**
     * Create a box spiral element.
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
            rotate: undefined,
        };
        if (!('fillColor' in options)) {
            options.fillColor = color(0, 0, 0, 0);
        }
        super(g, center, options);
        this.divisions = Entanglement.getInt(this.divisions);
        this.divisions = Math.max(this.interior ? 3 : 2, this.divisions);
        if (this.rotation === 'random') {
            this.rotation = ['cw', 'ccw'][Math.floor(random(0, 2))];
        }
        if (this.startCorner === 'random') {
            this.startCorner = ['nw', 'ne', 'se', 'sw'][Math.floor(random(0, 4))];
        }

        // If any corners are undefined at this point, create them from the size parameter
        if (this.nw === undefined) this.nw = new Point(center.x-this.size/2, center.y-this.size/2);
        if (this.ne === undefined) this.ne = new Point(center.x+this.size/2, center.y-this.size/2);
        if (this.se === undefined) this.se = new Point(center.x+this.size/2, center.y+this.size/2);
        if (this.sw === undefined) this.sw = new Point(center.x-this.size/2, center.y+this.size/2);

        // Do any requested rotation
        if (this.rotate !== undefined) {
            const degrees = Entanglement.getValue(this.rotate);
            this.nw.rotate(degrees, this.center);
            this.ne.rotate(degrees, this.center);
            this.se.rotate(degrees, this.center);
            this.sw.rotate(degrees, this.center);
        }

        // Create the enclosing polygon
        this.addVertex(this.nw);
        this.addVertex(this.ne);
        this.addVertex(this.se);
        this.addVertex(this.sw);

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
     * @returns {Point[]} Array of points
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
 * @typedef {Object} BoxSpiralOptions
 * @property {number} desiredCount The number of spirals to generate.
 * @property {number|Range} size Size or size range of spirals to generate. The default is 50.
 * @property {number|Range} divisions Number of divisions for each spiral.
 * @property {value} any Any of the TangleOptions may be used here.
 */

/**
 * Define the BoxSpiral Tangle. The BoxSpiral tangle is a collection of BoxSpiralElements placed randomly.
 * It is expected that some elements will partially or completely cover other elements.
 * Generally, enough elements are placed in the area to ensure the area background is completely covered.
 * The spirals may vary in size and rotation.
 * <br />
 * <img src='images/BoxSpiralsTangle.png' />
 */
class BoxSpirals extends Tangle {

    /**
     * Create a new BoxSpiral
     * @param {Point[] | Polygon} mask Vertices of a polygon used as a mask. Only the portion of the tangle inside the polygon will be visible.
     * @param {BoxSpiralOptions} options The options list.
     */
    constructor(mask, options) {
        if (typeof options === 'undefined') options = {};
        options.allowableOptions = {
            size: 50,
            desiredCount: undefined,
            divisions: undefined,
            rotation: undefined,
            startCorner: undefined,
            rotate: new Range(0, 90),
        };
        super(mask, options);

        this.build = function() {

            if (this.desiredCount === undefined) {
                const s = isNaN(this.size) ? this.size.min : this.size;
                this.desiredCount = Math.floor(this.width / s * this.height / s * 10); // An amount that should cover the buffer
            }

            for (let i = 0; i < this.desiredCount; i++) {
                let bseOpt = {
                    size: Entanglement.getInt(this.size),
                    fillColor: this.background,
                };
                if (this.divisions) bseOpt.divisions = this.divisions;
                if (this.rotation) bseOpt.rotation = this.rotation;
                if (this.rotate) bseOpt.rotate = this.rotate;
                if (this.startCorner) bseOpt.startCorner = this.startCorner;
                const bse = new BoxSpiralElement(this.g, new Point(random(0, this.width), random(0, this.height)), bseOpt);
                bse.draw();
            }
        };

        this.execute();
    }
}

/**
 * @typedef {Object} AmblerOptions
 * @property {value} any Any of the TangleOptions may be used here.
 */

/**
 * Define the Ambler Tangle. Ambler consists of a grid containing rotated box spirals.
 * <br />
 * <img src='images/AmblerTangle.png' />
 */
class Ambler extends Tangle {
    /**
     * Create a new Ambler.
     * @param {Point[] | Polygon} mask Vertices of a polygon used as a mask. Only the portion of the tangle inside the polygon will be visible.
     * @param {AmblerOptions} options The options list.
     */
    constructor(mask, options) {
        if (typeof options === 'undefined') options = {};
        options.grid = true;
        if (typeof options.gridShow === 'undefined') {
            options.gridShow = true;
        }
        super(mask, options);

        this.build = function() {
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
        };

        this.execute();
    }
}

/**
 * @typedef {Object} EmingleOptions
 * @property {string} startCorner The corner at which to start the box spiral. Can be 'nw', ne', 'se', 'sw' or 'random'. The default is 'nw'.
 * @property {value} any Any of the TangleOptions may be used here.
 */

/**
 * Define the Emingle Tangle. Emingle consists of a grid containing box spirals.
 * <br />
 * <img src='images/EmingleTangle.png' />
 */
class Emingle extends Tangle {
    /**
     * Create a new Emingle.
     * @param {Point[] | Polygon} mask Vertices of a polygon used as a mask. Only the portion of the tangle inside the polygon will be visible.
     * @param {EmingleOptions} options The options list.
     */
    constructor(mask, options) {
        if (typeof options === 'undefined') options = {}
        options.grid = true;
        if (typeof options.gridShow === 'undefined') {
            options.gridShow = true;
        }
        options.allowableOptions = {
            startCorner: 'nw',
        };
        super(mask, options);

        this.build = function() {
            const starts = ['nw', 'sw', 'se', 'ne'];
            if (this.startCorner === 'random') {
                this.startCorner = starts[Math.floor(random(0, 4))];
            }
            for (let r = 0; r < this.gridPoints.length - 1; r++) {
                for (let c = 0; c < this.gridPoints[r].length - 1; c++) {
                    const nw = this.gridPoints[r][c];
                    const ne = this.gridPoints[r][c + 1];
                    const se = this.gridPoints[r + 1][c + 1];
                    const sw = this.gridPoints[r + 1][c];
                    const bse = BoxSpiralElement.newFromCoordinates(this.g, nw, ne, se, sw, {
                        startCorner: this.startCorner,
                        divisions: 6,
                        interior: true,
                    });
                    bse.draw();
                }
            }
        };

        this.execute();
    }
}

/**
 * @typedef {Object} HugginsOptions
 * @property {number | string} holeDiameter The diameter of the dots in pixels. If set to 'proportional', which is the default, the diameter will be 1/8 if the smallest grid spacing.
 * @property {p5.Color} holeFillColor The fill color for the dots. The default is 'black'.
 * @property {boolean} holesShow If true, the dots will be drawn, otherwise they will be left out. The default is true.
 * @property {number} curve If set to 1, the connecting lines will be straight. Increasing values add more curve to the lines. Extreme values distort the curves in interesting ways. The default is 5.
 * @property {value} any Any of the TangleOptions may be used here.
 */

/**
 * Define the Huggins Tangle. Huggins consists of a grid of dots connected by curved lines to create a woven patten.
 * <br />
 * <img src='images/HugginsTangle.png' />
 */
class Huggins extends Tangle {

    /**
     * Create a new Huggins.
     * @param {Point[] | Polygon} mask Vertices of a polygon used as a mask. Only the portion of the tangle inside the polygon will be visible.
     * @param {HugginsOptions} options The options list.
     */
    constructor(mask, options) {
        if (typeof options === 'undefined') options = {}
        options.grid = true;
        options.gridShow = false;
        options.allowableOptions = {
            holeDiameter: 'proportional',
            holeFillColor: 'black',
            holesShow: true,
            curve: 5,
        };
        super(mask, options);

        this.build = function() {
            if (this.holeDiameter === 'proportional') {
                this.holeDiameter = Math.min(this.gridXSpacing, this.gridYSpacing) / 4;
            }
            const radius = this.holeDiameter/2;
            const control = this.curve*radius;
            this.g.curveTightness(0);

            // Create cache for control points
            let controlPoints = [];
            for (let r = 0; r < this.gridPoints.length; r++) {
                let row = [];
                for (let c = 0; c < this.gridPoints[r].length; c++) {
                    // Create the control points
                    let points = [];
                    points.push(new Polar(radius, radians(225)).toPointCenter(this.gridPoints[r][c]));
                    points.push(new Polar(radius, radians(315)).toPointCenter(this.gridPoints[r][c]));
                    points.push(new Polar(radius, radians(45)).toPointCenter(this.gridPoints[r][c]));
                    points.push(new Polar(radius, radians(135)).toPointCenter(this.gridPoints[r][c]));
                    points.push(new Polar(control, radians(225)).toPointCenter(this.gridPoints[r][c]));
                    points.push(new Polar(control, radians(315)).toPointCenter(this.gridPoints[r][c]));
                    points.push(new Polar(control, radians(45)).toPointCenter(this.gridPoints[r][c]));
                    points.push(new Polar(control, radians(135)).toPointCenter(this.gridPoints[r][c]));
                    row.push(points);
                }
                controlPoints.push(row);
            }

            this.g.fill(0, 0, 0, 0);

            // Draw the horizontal curves
            let colInd = 0;
            let rowInd = 1;
            for (let r = 0; r < this.gridPoints.length; r++) {
                for (let c = 0; c < this.gridPoints[r].length - 1; c++) {
                    let c1 = controlPoints[r][c][7];
                    let p1 = controlPoints[r][c][0];
                    let p2 = controlPoints[r][c+1][1];
                    let c2 = controlPoints[r][c+1][6];
                    if (colInd++ % 2) {
                        c1 = controlPoints[r][c][4];
                        p1 = controlPoints[r][c][3];
                        p2 = controlPoints[r][c+1][2];
                        c2 = controlPoints[r][c+1][5];
                    }
                    this.g.curve(c1.x, c1.y, p1.x, p1.y, p2.x, p2.y, c2.x, c2.y);
                }
                colInd = rowInd++;
            }

            // Draw the vertical curves
            colInd = 0;
            rowInd = 1;
            for (let r = 0; r < this.gridPoints.length - 1; r++) {
                for (let c = 0; c < this.gridPoints[r].length; c++) {
                    let c1 = controlPoints[r][c][4];
                    let p1 = controlPoints[r][c][1];
                    let p2 = controlPoints[r+1][c][2];
                    let c2 = controlPoints[r+1][c][7];
                    if (colInd++ % 2) {
                        c1 = controlPoints[r][c][5];
                        p1 = controlPoints[r][c][0];
                        p2 = controlPoints[r+1][c][3];
                        c2 = controlPoints[r+1][c][6];
                    }
                    this.g.curve(c1.x, c1.y, p1.x, p1.y, p2.x, p2.y, c2.x, c2.y);
                }
                colInd = rowInd++;
            }

            // Draw the holes
            if (this.holesShow) {
                this.g.fill(this.holeFillColor);
                for (let r = 0; r < this.gridPoints.length; r++) {
                    for (let c = 0; c < this.gridPoints[r].length; c++) {
                        this.g.circle(this.gridPoints[r][c].x, this.gridPoints[r][c].y, this.holeDiameter);
                    }
                }
            }
        };

        this.execute();
    }

}

/**
 * @typedef {Object} W2Options
 * @property {number | string} holeSize The size of the squares in pixels. If set to 'proportional', which is the default, the size will be 1/4 if the smallest grid spacing.
 * @property {p5.Color} holeFillColor The fill color for the dots. The default is 'black'.
 * @property {boolean} holesShow If true, the dots will be drawn, otherwise they will be left out. The default is true.
 * @property {number} curve If set to 1, the connecting lines will be straight. Increasing values add more curve to the lines. Extreme values distort the curves in interesting ways. The default is 5.
 * @property {value} any Any of the TangleOptions may be used here.
 */

/**
 * Define the W2 Tangle. W2 consists of a grid of squares connected by straight lines to create a woven patten.
 * <br />
 * <img src='images/W2Tangle.png' />
 */
class W2 extends Tangle {

    /**
     * Create a new W2.
     * @param {Point[] | Polygon} mask Vertices of a polygon used as a mask. Only the portion of the tangle inside the polygon will be visible.
     * @param {W2Options} options The options list.
     */
    constructor(mask, options) {
        if (typeof options === 'undefined') options = {}
        options.grid = true;
        options.gridShow = false;
        options.allowableOptions = {
            holeSize: 'proportional',
            holeFillColor: 'black',
            holesShow: true,
        };
        super(mask, options);

        this.build = function() {
            if (this.holeSize === 'proportional') {
                this.holeSize = Math.min(this.gridXSpacing, this.gridYSpacing) / 4;
            }
            const halfSize = this.holeSize/2;

            // Create cache for control points
            let controlPoints = [];
            for (let r = 0; r < this.gridPoints.length; r++) {
                let row = [];
                for (let c = 0; c < this.gridPoints[r].length; c++) {
                    // Create the control points
                    let points = [];
                    points.push(new Point(this.gridPoints[r][c].x-halfSize, this.gridPoints[r][c].y-halfSize));
                    points.push(new Point(this.gridPoints[r][c].x+halfSize, this.gridPoints[r][c].y-halfSize));
                    points.push(new Point(this.gridPoints[r][c].x+halfSize, this.gridPoints[r][c].y+halfSize));
                    points.push(new Point(this.gridPoints[r][c].x-halfSize, this.gridPoints[r][c].y+halfSize));
                    row.push(points);
                }
                controlPoints.push(row);
            }

            this.g.fill(0, 0, 0, 0);

            // Draw the horizontal curves
            let colInd = 0;
            let rowInd = 1;
            for (let r = 0; r < this.gridPoints.length; r++) {
                for (let c = 0; c < this.gridPoints[r].length - 1; c++) {
                    let p1 = controlPoints[r][c][1];
                    let p2 = controlPoints[r][c+1][0];
                    if (colInd++ % 2) {
                        p1 = controlPoints[r][c][2];
                        p2 = controlPoints[r][c+1][3];
                    }
                    this.g.line(p1.x, p1.y, p2.x, p2.y);
                }
                colInd = rowInd++;
            }

            // Draw the vertical curves
            colInd = 0;
            rowInd = 1;
            for (let r = 0; r < this.gridPoints.length - 1; r++) {
                for (let c = 0; c < this.gridPoints[r].length; c++) {
                    let p1 = controlPoints[r][c][2];
                    let p2 = controlPoints[r+1][c][1];
                    if (colInd++ % 2) {
                        p1 = controlPoints[r][c][3];
                        p2 = controlPoints[r+1][c][0];
                    }
                    this.g.line(p1.x, p1.y, p2.x, p2.y);
                }
                colInd = rowInd++;
            }

            // Draw the holes
            if (this.holesShow) {
                this.g.fill(this.holeFillColor);
                for (let r = 0; r < this.gridPoints.length; r++) {
                    for (let c = 0; c < this.gridPoints[r].length; c++) {
                        this.g.rect(controlPoints[r][c][0].x, controlPoints[r][c][0].y, this.holeSize, this.holeSize);
                    }
                }
            }
        };

        this.execute();
    }

}

/**
 * @typedef {Object} ZentangleOptions
 * @property {p5.Color} background The background of the Zentangle canvas.
 * @property {number} borderSize The average width of the border in pixels.
 * @property {value} any Any of the TangleElementOptions may be used here.
 */

/**
 * Define a complete Zentangle.
 */
class Zentangle extends TangleBase {

    /**
     * Create a Zentangle object.
     * @param {number} size The size of the Zentangle in pixels. There is only one number, as Zentagles are a square or a triangle (in which case size is the length of the side), or a circle (in which case the size is the diameter.)
     * @param {string} shape The shape of the Zentangle. Can be 'square' (the default), 'triangle' or 'circle'.
     * @param {ZentangleOptions} options
     */
    constructor(size, shape, options) {
        super();
        if (typeof options === 'undefined') options = {};
        options.allowableOptions = {
            background: 255,
            borderSize: 30,
        };
        this.loadOptions(options);

        this.width = size;
        this.height = size;
        this.shape = shape === undefined ? 'square' : shape;
        if (this.shape === 'triangle') {
            this.height *= 0.87;
        }
        this.g = createGraphics(this.width, this.height);
        let center = new Point(this.width/2, this.height/2);
        switch(this.shape) {
            case 'circle':
                this.edgePoly = new Polygon();
                for (let d=0; d<360; d++) {
                    this.edgePoly.addVertex(new Polar(this.width/2-1, radians(d)).toPointCenter(center));
                }
                this.borderPoly = new Polygon();
                for (let d=0; d<360; d++) {
                    this.borderPoly.addVertex(new Polar(this.width/2-this.borderSize, radians(d)).toPointCenter(center).vary(1));
                }
                break;
            case 'triangle':
                center = new Point(this.width/2, 2*this.height/3);
                this.edgePoly = new Polygon([
                    new Point(0, this.height),
                    new Point(this.width/2, 0),
                    new Point(this.width, this.height),
                ]);
                const distance = 2*this.height/3 - 2*this.borderSize;
                this.borderPoly = this._createBorderPolyFromLines([
                    new Polar(distance, radians(270)).toPointCenter(center),
                    new Polar(distance, radians(30)).toPointCenter(center),
                    new Polar(distance, radians(150)).toPointCenter(center),
                ]);
                break;
            default:    // square
                this.edgePoly = new Polygon([
                    new Point(0, 0),
                    new Point(this.width, 0),
                    new Point(this.width, this.height),
                    new Point(0, this.height),
                ]);
                this.borderPoly = this._createBorderPolyFromLines([
                    new Point(this.borderSize, this.borderSize),
                    new Point(this.width-this.borderSize, this.borderSize),
                    new Point(this.width-this.borderSize, this.height-this.borderSize),
                    new Point(this.borderSize, this.height-this.borderSize),
                ]);
                break;
        }
        this.areas = [];

        createCanvas(this.width, this.height);
        background(this.background);
    }

    /**
     * Get a mask covering the entire Zentangle.
     * @returns {Point[]} A rectangular mask covering the entire Zentangle canvas.
     */
    getFullMask() {
        return new Polygon([
            new Point(0, 0),
            new Point(this.width, 0),
            new Point(this.width, this.height),
            new Point(0, this.height),
        ]);
    }

    /**
     * Add a tangle to this Zentangle.
     * @param {Tangle} tangle The pattern to draw in this area.
     */
    addTangle(tangle) {
        this.areas.push(tangle);
        this.g.image(tangle.g, tangle.origin.x, tangle.origin.y);
    }

    /**
     * Draw the complete Zentangle on the canvas.
     */
    draw() {

        // Create border mask
        let border = createGraphics(this.width, this.height);
        border.noStroke();
        border.fill(255, 255, 255, 0);
        border.beginShape();
        for (let p = 0; p < this.edgePoly.vertices.length; p++) {
            border.vertex(this.edgePoly.vertices[p].x, this.edgePoly.vertices[p].y);
        }
        border.endShape(CLOSE);
        border.fill(255, 255, 255, 255);
        border.beginShape();
        for (let p = 0; p < this.borderPoly.vertices.length; p++) {
            border.vertex(this.borderPoly.vertices[p].x, this.borderPoly.vertices[p].y);
        }
        border.endShape(CLOSE);

        // Draw the zentangle
        let clone;
        (clone = this.g.get()).mask(border.get());
        image(clone, 0, 0);

        // Draw the border
        stroke(0);
        fill(255, 255, 255, 0);
        beginShape();
        for (let p = 0; p < this.borderPoly.vertices.length; p++) {
            vertex(this.borderPoly.vertices[p].x, this.borderPoly.vertices[p].y);
        }
        endShape(CLOSE);

        // Draw the edge
        beginShape();
        for (let p = 0; p < this.edgePoly.vertices.length; p++) {
            vertex(this.edgePoly.vertices[p].x, this.edgePoly.vertices[p].y);
        }
        endShape(CLOSE);
    }

    /**
     * Extend and randomize vertices. This is intended to make the border look hand-drawn.
     * @param {Point[]} vertices List of points defining thr border.
     * @returns {Point[]} New vertex list.
     * @private
     */
    _createBorderPolyFromLines(vertices) {
        let poly = new Polygon();
        for (let start=0; start<vertices.length; start++) {
            let end = start+1;
            if (end === vertices.length) {
                end = 0;
            }
            const points = new Line(vertices[start], vertices[end]).handDrawn();
            for (let i=0; i<points.length; i++) {
                poly.addVertex(points[i]);
            }
        }

        return poly;
    }
}
