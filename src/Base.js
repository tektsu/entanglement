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
 * @property {number} gridSpacing The grid size in pixels. If used, both gridXSpacing and gridYSpacing are set to this.
 * @property {number} gridXSpacing The horizontal grid size in pixels.
 * @property {number} gridYSpacing The vertical grid size in pixels.
 * @property {number} gridVary The grid point location variation in pixels. If used, both gridXVary and gridYVary are set to this.
 * @property {number} gridXVary The horizontal grid point location variation in pixels.
 * @property {number} gridYVary The vertical grid point location variation in pixels.
 * @property {objects} polys Polygons already drawn.
 * @property {boolean} avoidCollisions If true, do not draw over other elements listed in this.polys.
 * @property {Point[]} maskPoly A set of points defining a polygon. Only the portion of the image inside the polygon will be displayed, unless ignoreMask is true.
 * @property {boolean} addStrings If true, the boundaries of the maskPoly are drawn. Default is true.
 * @property {boolean} ignoreMask If true, do not mask the result, drawn the entire rectangle. Default is false.
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
        const br = this.maskPoly.getBoundingRectangle();
        this.origin = br.getOrigin();
        this.width = br.getWidth();
        this.height = br.getHeight();
        this.g = createGraphics(this.width, this.height);
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
            addStrings: true,
            ignoreMask: false,
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
}
