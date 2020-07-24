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