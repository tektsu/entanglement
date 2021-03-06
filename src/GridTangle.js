/*jshint esversion: 9 */

/**
 * @typedef {Object} GridTangleOptions
 * @property {boolean} gridShow If true, and this is a grid-based tangle, draw the grid lines after building the tangle. The default is true.
 * @property {number | Range} gridSpacing The grid size in pixels. If used, both gridXSpacing and gridYSpacing are set to this.
 * @property {number | Range} gridXSpacing The horizontal grid size in pixels. The default is 40. If set to a Range, the gridSpacingMode determines how that range is used.
 * @property {number | Range} gridYSpacing The vertical grid size in pixels. The default is 40.  If set to a Range, the gridSpacingMode determines how that range is used.
 * @property {string} gridXSpacingMode The horizontal grid size in pixels. The default is 'static'.
 * @property {string} gridYSpacingMode The vertical grid size in pixels. The default is 'static'.
 * @property {number} gridVary The grid point location variation in pixels. If used, both gridXVary and gridYVary are set to this.
 * @property {number} gridXVary The horizontal grid point location variation in pixels.
 * @property {number} gridYVary The vertical grid point location variation in pixels.
 * @property {number} gridDivisions The number of columns and rows the grid should have. If used, both gridXDivisions and gridYDivisions are set to this.
 * @property {number} gridXDivisions The number of columns the grid should have. If not set, this is calculated from width and gridXSpacing.
 * @property {number} gridYDivisions The number of rows the grid should have. If not set, this is calculated from height and gridYSpacing.
 * @property {number | Range} gridXOrigin The x-coodinate of the upper left corner of the graph. The grid mode may modify this.
 * @property {number | Range} gridYOrigin The y-coodinate of the upper left corner of the graph. The grid mode may modify this.
 * @property {number | Range} gridXFrequency The grid horizontal wave frequency. The grid mode may ignore this or interpret it as it pleases.
 * @property {number | Range} gridYFrequency The grid vertical wave frequency. The grid mode may ignore this or interpret it as it pleases.
 * @property {number | Range} gridXAmplitude The grid horizontal wave amplitude. The grid mode may ignore this or interpret it as it pleases.
 * @property {number | Range} gridYAmplitude The grid vertical wave amplitude. The grid mode may ignore this or interpret it as it pleases.
 */

/**
 * Base class for a grid tangle, which is an area containg a design based on a grid.
 */
class GridTangle extends Tangle {

    /**
     * Create a new GridTangle
     * @param {Point[] | Polygon} mask Vertices of a polygon used as a mask. Only the portion of the tangle inside the polygon will be visible.
     * @param {GridTangleOptions} options A map of values to be loaded into instance variables.
     */
    constructor(mask, options) {
        if (typeof options === 'undefined') options = {};
        if (typeof options.allowableOptions == 'undefined') options.allowableOptions = {};
        options.allowableOptions = {
            ...options.allowableOptions,
            ...{
                gridShow: false,
                gridSpacing: undefined,
                gridXSpacing: 40,
                gridYSpacing: 40,
                gridXSpacingMode: 'static',
                gridYSpacingMode: 'static',
                gridVary: undefined,
                gridXVary: undefined,
                gridYVary: undefined,
                gridDivisions: undefined,
                gridXDivisions: undefined,
                gridYDivisions: undefined,
                gridXOrigin: undefined,
                gridYOrigin: undefined,
                gridXFrequency: undefined,
                gridYFrequency: undefined,
                gridXAmplitude: undefined,
                gridYAmplitude: undefined,
            },
        };
        super(mask, options);

        this.gridPoints = [];
        this.gridMeta = [];
        this.gridVariation = [];

        // Check gridSpacing
        if (this.gridSpacing !== undefined) {
            if (typeof this.gridSpacing === 'object') {
                // gridSpacing is a Range
                this.gridXSpacing = new Range(this.gridSpacing.min, this.gridSpacing.max);
                this.gridYSpacing = new Range(this.gridSpacing.min, this.gridSpacing.max);
            } else {
                this.gridXSpacing = this.gridYSpacing = this.gridSpacing;
            }
        }
        if (this.gridVary !== undefined) {
            this.gridXVary = this.gridYVary = this.gridVary;
        }

        if (this.gridXVary === undefined) {
            this.gridXVary = 0.02 * (typeof this.gridXSpacing === 'object' ? this.gridXSpacing.min : this.gridXSpacing);
        }
        if (this.gridYVary === undefined) {
            this.gridYVary = 0.02 * (typeof this.gridYSpacing === 'object' ? this.gridYSpacing.min : this.gridYSpacing);
        }

        if (this.gridDivisions !== undefined) {
            this.gridXDivisions = this.gridYDivisions = this.gridDivisions;
        }

        if (this.gridXDivisions === undefined) {
            const minXSpacing = (typeof this.gridXSpacing === 'object' ? this.gridXSpacing.min : this.gridXSpacing);
            this.gridXDivisions = (this.width / minXSpacing) + 2;
        }
        if (this.gridYDivisions === undefined) {
            const minYSpacing = (typeof this.gridYSpacing === 'object' ? this.gridYSpacing.min : this.gridYSpacing);
            this.gridYDivisions = (this.height / minYSpacing) + 2;
        }

        if (this.gridXOrigin === undefined) {
            this.gridXOrigin = -Entanglement.getMinValue(this.gridXSpacing) / 2;
        }
        if (this.gridYOrigin === undefined) {
            this.gridYOrigin = -Entanglement.getMinValue(this.gridYSpacing) / 2;
        }
    }

    /**
     * Build a set of grid points using the grid* options. There will be enough ppints to fill the rectangular area
     * defined by the mask. Some of the points may be well outside the area, depending on the algorithm used to
     * produce the points.
     */
    buildGridPoints() {
        this.gridPoints = [];
        this.gridMeta = [];
        let colGen, rowGen;
        switch (this.gridXSpacingMode) {
            case 'wave':
                colGen = new GridSpacingModeWave(this);
                break;
            case 'compression':
                colGen = new GridSpacingModeCompression(this);
                break;
            case 'linear':
                colGen = new GridSpacingModeLinear(this);
                break;
            default:
                colGen = new GridSpacingModeStatic(this);
                break;
        }
        if (this.gridXSpacingMode === this.gridYSpacingMode) {
            rowGen = colGen;
        } else {
            switch (this.gridYSpacingMode) {
                case 'wave':
                    rowGen = new GridSpacingModeWave(this);
                    break;
                case 'compression':
                    rowGen = new GridSpacingModeCompression(this);
                    break;
                case 'linear':
                    rowGen = new GridSpacingModeLinear(this);
                    break;
                default:
                    rowGen = new GridSpacingModeStatic(this);
                    break;
            }
        }
        for (let r = 0; r < this.gridYDivisions; r++) {
            this.gridPoints[r] = [];
            this.gridMeta[r] = [];
            for (let c = 0; c < this.gridXDivisions; c++) {
                this.gridMeta[r][c] = new Point(colGen.x(r, c), rowGen.y(r, c));
                this.gridPoints[r][c] = new Point(
                    random(this.gridMeta[r][c].x - this.gridXVary, this.gridMeta[r][c].x + this.gridXVary),
                    random(this.gridMeta[r][c].y - this.gridYVary, this.gridMeta[r][c].y + this.gridYVary),
                );
            }
        }
        console.log(this.gridPoints);
    }

    /**
     * Draw the grid on the graphics buffer
     */
    showGrid() {
        if (this.gridPoints.length === 0)
            this.buildGridPoints();
        for (let r = 0; r < this.gridPoints.length; r++) {
            for (let c = 0; c < this.gridPoints[r].length; c++) {
                let nextPoint = this.gridPoints[r][c + 1];
                if (nextPoint !== undefined) {
                    this.g.line(this.gridPoints[r][c].x, this.gridPoints[r][c].y, nextPoint.x, nextPoint.y);
                }
                if (this.gridPoints[r + 1] === undefined)
                    continue;
                nextPoint = this.gridPoints[r + 1][c];
                this.g.line(this.gridPoints[r][c].x, this.gridPoints[r][c].y, nextPoint.x, nextPoint.y);
            }
        }
    }

    /**
     * Build the tangle. Executes the this.build method with before and after processing appropriate to the tangle type.
     * This is normally the last method called by a child class.
     */
    execute() {

        this.buildGridPoints();

        this.build();

        if (this.gridShow) {
            this.showGrid();
        }

        if (!this.ignoreMask) {
            this.applyMask();
        }
    }
}

/**
 * Create a rectangular grid with even spacing.
 */
class GridSpacingModeStatic {

    /**
     * Create a grid spacing mode generator.
     * @param {object} tangle The 'this' value from the calling Tangle class.
     */
    constructor(tangle) {
        this.tangle = tangle;
    }

    /**
     * Get the x value for the specified coordinate.
     * @param {integer} r Row
     * @param {integer} c Column
     */
    x(r, c) {
        const spacing = Entanglement.getValue(this.tangle.gridXSpacing);
        let x = Entanglement.getValue(this.tangle.gridXOrigin) - spacing / 2;
        if (c) {
            x = this.tangle.gridPoints[r][c - 1].x + spacing;
        }
        return x;
    }

    /**
     * Get the y value for the specified coordinate.
     * @param {integer} r Row
     * @param {integer} c Column
     */
    y(r, c) {
        const spacing = Entanglement.getValue(this.tangle.gridYSpacing);
        let y = Entanglement.getValue(this.tangle.gridYOrigin) - spacing / 2;
        if (r) {
            y = this.tangle.gridPoints[r - 1][c].y + spacing;
        }
        return y;
    }
}

/**
 * Create a rectangular grid with linearly increasing spacing.
 */
class GridSpacingModeLinear {

    /**
     * Create a grid spacing mode generator.
     * @param {object} tangle The 'this' value from the calling Tangle class.
     */
    constructor(tangle) {
        this.tangle = tangle;
        if (typeof this.tangle.gridXSpacing === 'object') {
            this.xMin = this.tangle.gridXSpacing.min;
            this.xRange = this.tangle.gridXSpacing.max - this.tangle.gridXSpacing.min;
        } else {
            this.xMin = this.tangle.gridXSpacing;
            this.xRange = 0;
        }
        if (typeof this.tangle.gridYSpacing === 'object') {
            this.yMin = this.tangle.gridYSpacing.min;
            this.yRange = this.tangle.gridYSpacing.max - this.tangle.gridYSpacing.min;
        } else {
            this.yMin = this.tangle.gridYSpacing;
            this.yRange = 0;
        }
    }

    /**
     * Get the x value for the specified coordinate.
     * @param {integer} r Row
     * @param {integer} c Column
     */
    x(r, c) {
        let x = Entanglement.getValue(this.tangle.gridXOrigin) - this.xMin / 2;
        if (c) {
            x = this.tangle.gridPoints[r][c - 1].x + this.xMin + this.xRange * (c / this.tangle.gridXDivisions);
        }
        return x;
    }

    /**
     * Get the y value for the specified coordinate.
     * @param {integer} r Row
     * @param {integer} c Column
     */
    y(r, c) {
        let y = Entanglement.getValue(this.tangle.gridYOrigin) - this.yMin / 2;
        if (r) {
            y = this.tangle.gridPoints[r - 1][c].y + this.yMin + this.yRange * (r / this.tangle.gridYDivisions);
        }
        return y;
    }
}

/**
 * Create a rectangular grid with a sine wave.
 */
class GridSpacingModeWave {

    /**
     * Create a grid spacing mode generator.
     * @param {object} tangle The 'this' value from the calling Tangle class.
     */
    constructor(tangle) {
        this.tangle = tangle;
        this.xAmplitude = typeof this.tangle.gridXAmplitude === 'undefined' ?
            1 : Entanglement.getValue(this.tangle.gridXAmplitude);
        this.yAmplitude = typeof this.tangle.gridYAmplitude === 'undefined' ?
            1 : Entanglement.getValue(this.tangle.gridYAmplitude);
        this.xFrequency = typeof this.tangle.gridXFrequency === 'undefined' ?
            360 / this.tangle.gridXDivisions : Entanglement.getValue(this.tangle.gridXFrequency);
        this.yFrequency = typeof this.tangle.gridYFrequency === 'undefined' ?
            360 / this.tangle.gridYDivisions : Entanglement.getValue(this.tangle.gridYFrequency);
    }

    /**
     * Get the x value for the specified coordinate.
     * @param {integer} r Row
     * @param {integer} c Column
     */
    x(r, c) {
        const spacing = Entanglement.getValue(this.tangle.gridXSpacing);
        let x = Entanglement.getValue(this.tangle.gridXOrigin) + Math.sin(radians(this.xFrequency * r)) * spacing * this.xAmplitude;
        if (c) {
            x = this.tangle.gridPoints[0][c - 1].x + spacing + Math.sin(radians(this.xFrequency * r)) * spacing * this.xAmplitude;
        }
        return x;
    }

    /**
     * Get the y value for the specified coordinate.
     * @param {integer} r Row
     * @param {integer} c Column
     */
    y(r, c) {
        const spacing = Entanglement.getValue(this.tangle.gridYSpacing);
        let y = Entanglement.getValue(this.tangle.gridYOrigin) + Math.sin(radians(this.yFrequency * c)) * spacing * this.yAmplitude;
        if (r) {
            y = this.tangle.gridPoints[r - 1][0].y + spacing + Math.sin(radians(this.yFrequency * c)) * spacing * this.yAmplitude;
        }
        return y;
    }
}

/**
 * Create a rectangular grid with a compression wave.
 */
class GridSpacingModeCompression {

    /**
     * Create a grid spacing mode generator.
     * @param {object} tangle The 'this' value from the calling Tangle class.
     */
    constructor(tangle) {
        this.tangle = tangle;
        this.xAmplitude = typeof this.tangle.gridXAmplitude === 'undefined' ?
            0.5 : Entanglement.getValue(this.tangle.gridXAmplitude);
        this.yAmplitude = typeof this.tangle.gridYAmplitude === 'undefined' ?
            0.5 : Entanglement.getValue(this.tangle.gridYAmplitude);
        this.xFrequency = typeof this.tangle.gridXFrequency === 'undefined' ?
            360 / this.tangle.gridXDivisions : Entanglement.getValue(this.tangle.gridXFrequency);
        this.yFrequency = typeof this.tangle.gridYFrequency === 'undefined' ?
            360 / this.tangle.gridYDivisions : Entanglement.getValue(this.tangle.gridYFrequency);
    }

    /**
     * Get the x value for the specified coordinate.
     * @param {integer} r Row
     * @param {integer} c Column
     */
    x(r, c) {
        const spacing = Entanglement.getValue(this.tangle.gridXSpacing);
        let x = Entanglement.getValue(this.tangle.gridXOrigin) - spacing / 2;
        if (c) {
            x = this.tangle.gridPoints[0][c - 1].x + spacing + Math.sin(radians(this.xFrequency * c)) * spacing * this.xAmplitude;
        }
        return x;
    }

    /**
     * Get the y value for the specified coordinate.
     * @param {integer} r Row
     * @param {integer} c Column
     */
    y(r, c) {
        const spacing = Entanglement.getValue(this.tangle.gridYSpacing);
        let y = Entanglement.getValue(this.tangle.gridYOrigin) - spacing / 2;
        if (r) {
            y = this.tangle.gridPoints[r - 1][0].y + spacing + Math.sin(radians(this.yFrequency * r)) * spacing * this.yAmplitude;
        }
        return y;
    }
}