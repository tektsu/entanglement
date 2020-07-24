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
