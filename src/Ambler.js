/**
 * @typedef {Object} AmblerOptions
 * @property {value} any Any of the TangleOptions may be used here.
 */

/**
 * Define the Ambler Tangle.
 */
class Ambler extends Tangle {
    /**
     * Create a new Ambler
     * @param {number} width The width of the tangle.
     * @param {number} height The height of the tangle.
     * @param {AmblerOptions} options The options list.
     */
    constructor(width, height, options) {
        if (typeof options === 'undefined') options = {};
        super(width, height, options);

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
    }
}
