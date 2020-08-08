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
     * @param [Point] mask Vertices of a polygon used as a mask. Only the portion of the tangle inside the polygon will be visible.
     * @param {AmblerOptions} options The options list.
     */
    constructor(mask, options) {
        if (typeof options === 'undefined') options = {};
        super(mask, options);

        this.buildGridPoints();

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

        this.grid();

        this.applyMask();
    }
}
