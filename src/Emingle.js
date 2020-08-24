/*jshint esversion: 9 */

/**
 * @typedef {Object} EmingleOptions
 * @property {string} startCorner The corner at which to start the box spiral. Can be 'nw', ne', 'se', 'sw' or 'random'. The default is 'nw'.
 * @property {value} any Any of the GridTangleOptions may be used here.
 */

/**
 * Define the Emingle Tangle. Emingle consists of a grid containing box spirals.
 * <br />
 * <img src='images/EmingleTangle.png' />
 */
class Emingle extends GridTangle {
    /**
     * Create a new Emingle.
     * @param {Point[] | Polygon} mask Vertices of a polygon used as a mask. Only the portion of the tangle inside the polygon will be visible.
     * @param {EmingleOptions} options The options list.
     */
    constructor(mask, options) {
        if (typeof options === 'undefined') options = {};
        if (typeof options.gridShow === 'undefined') {
            options.gridShow = true;
        }
        options.allowableOptions = {
            startCorner: 'nw',
        };
        super(mask, options);

        this.build = function () {
            const starts = ['nw', 'sw', 'se', 'ne'];
            if (this.startCorner === 'random') {
                this.startCorner = starts[Math.floor(random(0, 4))];
            }
            for (let r = 0; r < this.gridPoints.length - 1; r++) {
                for (let c = 0; c < this.gridPoints[r].length - 1; c++) {
                    const nw = this.gridPoints[r][c];
                    const ne = this.gridPoints[r][c + 1];
                    const se = this.gridPoints[r + 1][c + 1];
                    const sw = this.gridPoints[r + 1][c];
                    const bse = BoxSpiralElement.newFromCoordinates(this.g, nw, ne, se, sw, {
                        startCorner: this.startCorner,
                        divisions: 6,
                        interior: true,
                    });
                    bse.draw();
                }
            }
        };

        this.execute();
    }
}