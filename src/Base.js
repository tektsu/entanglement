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
        this.build = function() {}

        this.optionsAllowed = {
            debug: 0,
            background: undefined,
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

        this.build();
        if (!this.ignoreMask) {
            this.applyMask();
        }
    }
}

/**
 * @typedef {Object} GridTangleOptions
 * @property {boolean} gridShow If true, and this is a grid-based tangle, draw the grid lines after building the tangle. The default is true.
 * @property {number | Range} gridSpacing The grid size in pixels. If used, both gridXSpacing and gridYSpacing are set to this.
 * @property {number | Range} gridXSpacing The horizontal grid size in pixels. The default is 40. If set to a Range, the gridSpacingMode determines how that range is used.
 * @property {number | Range} gridYSpacing The vertical grid size in pixels. The default is 40.  If set to a Range, the gridSpacingMode determines how that range is used.
 * @property {string} gridXSpacingMode The horizontal grid size in pixels. The default is 'static'.
 * @property {string} gridYSpacingMode The vertical grid size in pixels. The default is 'static'.
 * @property {number} gridVary The grid point location variation in pixels. If used, both gridXVary and gridYVary are set to this.
 * @property {number} gridXVary The horizontal grid point location variation in pixels.
 * @property {number} gridYVary The vertical grid point location variation in pixels.
 */

/**
 * Base class for a grid tangle, which is an area containg a design based on a grid.
 */
class GridTangle extends Tangle {

    /**
     * Create a new Tangle
     * @param {Point[] | Polygon} mask Vertices of a polygon used as a mask. Only the portion of the tangle inside the polygon will be visible.
     * @param {TangleOptions} options A map of values to be loaded into instance variables.
     */
    constructor(mask, options) {
        if (typeof options === 'undefined') options = {}
        if (typeof options.allowableOptions == 'undefined') options.allowableOptions = {}
        options.allowableOptions = {
            ...options.allowableOptions,
            ...{
                gridShow: false,
                gridSpacing: undefined,
                gridDivisions: undefined,
                gridXDivisions: undefined,
                gridYDivisions: undefined,
                gridXSpacing: 40,
                gridYSpacing: 40,
                gridXSpacingMode: 'static',
                gridYSpacingMode: 'static',
                gridVary: undefined,
                gridXVary: undefined,
                gridYVary: undefined,
            },
        };
        super(mask, options);

        this.gridPoints = [];
        this.gridMeta = [];
        this.gridVariation = [];

        // Check gridSpacing
        if (this.gridSpacing !== undefined) {
            if (typeof this.gridSpacing === 'object') {
                // gridSpacing is a Range
                this.gridXSpacing = new Range(this.gridSpacing.min, this.gridSpacing.max);
                this.gridYSpacing = new Range(this.gridSpacing.min, this.gridSpacing.max);
            } else {
                this.gridXSpacing = this.gridYSpacing = this.gridSpacing;
            }
        }
        if (this.gridVary !== undefined) {
            this.gridXVary = this.gridYVary = this.gridVary;
        }

        if (this.gridXVary === undefined) {
            this.gridXVary = .02 * (typeof this.gridXSpacing === 'object' ? this.gridXSpacing.min : this.gridXSpacing);
        }
        if (this.gridYVary === undefined) {
            this.gridYVary = .02 * (typeof this.gridYSpacing === 'object' ? this.gridYSpacing.min : this.gridYSpacing);
        }

        if (this.gridDivisions !== undefined) {
            this.gridXDivisions = this.gridYDivisions = this.gridDivisions;
        }
    }

    /**
     * Calculate the position of a point according to the current algorithm, based on row and column index.
     * @param (number} r Row index.
     * @param {number} c Column index.
     * @private
     */
    _updateMeta(r, c) {
        // Progress along a row
        if (c > 0) {
            if (typeof this.gridXSpacing === 'number')
                this.gridMeta[r][c].x = this.gridMeta[r][c-1].x + this.gridXSpacing;
            else {
                switch (this.gridXSpacingMode) {
                    case 'random':
                        this.gridMeta[r][c].x = this.gridMeta[r][c-1].x + this.gridXSpacing.rand();
                        break;
                    case 'linear':
                        this.gridMeta[r][c].x = this.gridMeta[r][c-1].x + this.gridXSpacing.min + (c/this.maxCols) * (this.gridXSpacing.max - this.gridXSpacing.min);
                        break
                    default:
                        this.gridMeta[r][c].x = this.gridMeta[r][c-1].x + this.gridXSpacing.min;
                        break;
                }
            }
            this.gridMeta[r][c].y = this.gridMeta[r][c-1].y;
        }
        else {
            if (r > 0) {
                // New Row
                if (typeof this.gridYSpacing === 'number')
                    this.gridMeta[r][c].y = this.gridMeta[r - 1][c].y + this.gridYSpacing;
                else {
                    switch (this.gridYSpacingMode) {
                        case 'random':
                            this.gridMeta[r][c].y = this.gridMeta[r - 1][c].y + this.gridYSpacing.rand();
                            break;
                        case 'linear':
                            this.gridMeta[r][c].y = this.gridMeta[r - 1][c].y + this.gridYSpacing.min + (r/this.maxRows) * (this.gridYSpacing.max - this.gridYSpacing.min);
                            break
                        default:
                            this.gridMeta[r][c].y = this.gridMeta[r - 1][c].y + this.gridYSpacing.min;
                            break;
                    }
                }
            }
        }
    }

    /**
     * Build a set of grid points using the grid* options. There will be enough ppints to fill the rectangular area
     * defined by the mask. Some of the points may be well outside the area, depending on the algorithm used to
     * produce the points.
     */
    buildGridPoints() {
        const minXSpacing = (typeof this.gridXSpacing === 'object' ? this.gridXSpacing.min : this.gridXSpacing);
        const minYSpacing = (typeof this.gridYSpacing === 'object' ? this.gridYSpacing.min : this.gridYSpacing);
        this.maxCols = (this.width / minXSpacing) + 2;
        this.maxRows = (this.height / minYSpacing) + 2;

        this.gridPoints = [];
        this.gridMeta = []
        for (let r=0; r<this.maxRows; r++) {
            this.gridPoints[r] = [];
            this.gridMeta[r] = [];
            for (let c=0; c<this.maxCols; c++) {
                this.gridMeta[r][c] = {
                    x: -minXSpacing / 2,
                    y: -minYSpacing / 2,
                };
                this._updateMeta(r, c);
                this.gridPoints[r][c] = new Point(
                    random(this.gridMeta[r][c].x-this.gridXVary, this.gridMeta[r][c].x+this.gridXVary),
                    random(this.gridMeta[r][c].y-this.gridYVary, this.gridMeta[r][c].y+this.gridYVary),
                );
            }
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
     * Build the tangle. Executes the this.build method with before and after processing appropriate to the tangle type.
     * This is normally the last method called by a child class.
     */
    execute() {

        this.buildGridPoints();

        this.build();

        if (this.gridShow) {
            this.showGrid();
        }

        if (!this.ignoreMask) {
            this.applyMask();
        }
    }
}
