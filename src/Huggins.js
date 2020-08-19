/**
 * @typedef {Object} HugginsOptions
 * @property {number | string} holeDiameter The diameter of the dots in pixels. If set to 'proportional', which is the default, the diameter will be 1/8 if the smallest grid spacing.
 * @property {p5.Color} holeFillColor The fill color for the dots. The default is 'black'.
 * @property {boolean} holesShow If true, the dots will be drawn, otherwise they will be left out. The default is true.
 * @property {number} curve If set to 1, the connecting lines will be straight. Increasing values add more curve to the lines. Extreme values distort the curves in interesting ways. The default is 5.
 * @property {value} any Any of the GridTangleOptions may be used here.
 */

/**
 * Define the Huggins Tangle. Huggins consists of a grid of dots connected by curved lines to create a woven patten.
 * <br />
 * <img src='images/HugginsTangle.png' />
 */
class Huggins extends GridTangle {

    /**
     * Create a new Huggins.
     * @param {Point[] | Polygon} mask Vertices of a polygon used as a mask. Only the portion of the tangle inside the polygon will be visible.
     * @param {HugginsOptions} options The options list.
     */
    constructor(mask, options) {
        if (typeof options === 'undefined') options = {}
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
                this.holeDiameter = Math.min(
                    (typeof this.gridXSpacing === 'object' ? this.gridXSpacing.min : this.gridXSpacing),
                    (typeof this.gridYSpacing === 'object' ? this.gridYSpacing.min : this.gridYSpacing)
                ) / 4;
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
