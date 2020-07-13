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
