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
