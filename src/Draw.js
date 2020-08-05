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
     * Rotate the point in the coordinate system around another point
     * @param degrees
     * @param center
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
