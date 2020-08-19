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
                this.holeSize = Math.min(
                    (typeof this.gridXSpacing === 'object' ? this.gridXSpacing.min : this.gridXSpacing),
                    (typeof this.gridYSpacing === 'object' ? this.gridYSpacing.min : this.gridYSpacing)
                ) / 4;
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
