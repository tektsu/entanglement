/*jshint esversion: 9 */

/**
 * @typedef {Object} DotElementOptions
 * @property {number|Range} size Dot diameter.
 * @property {number} spacing Relative dot spacing expressed as a percentage of diameter; defines the size of the enclosing polygon.
 * @property {value} any Any of the TangleElementOptions may be used here.
 */

/**
 * Define the Dot element. . The Dot element is a simple dot or circle on the canvas.
 * <br />
 * <img src='images/DotElement.png' />
 */
class DotElement extends TangleElement {

    /**
     * Create a new DotElement
     * @param {p5.Graphics} g The graphics object to draw to.
     * @param {Point} center The position of the dot.
     * @param {DotElementOptions} options A map of values to be loaded into instance variables.
     */
    constructor(g, center, options) {
        if (typeof options === 'undefined') options = {};
        options.allowableOptions = {
            spacing: 400,
            size: 3,
        };
        super(g, center, options);
        this.spacing = Math.max(100, this.spacing);

        let dAngle = TWO_PI / 8;
        for (let angle = 0; angle < TWO_PI; angle += dAngle) {
            this.addVertex(new Polar(this.spacing / 100 * this.size, angle).toPointCenter(this.center)); // Put a vertex out beyond the tip of the arm
        }
    }

    /**
     * Draw the Dot.
     */
    draw() {
        super.draw();
        this.g.circle(this.center.x, this.center.y, this.size);
        //this.drawPoly();
    }
}

/**
 * @typedef {Object} AahElementTipTypes
 * @property {string} any Any members of this object are preset tip types to indicate special processing
 */

/**
 * @typedef {Object} AahElementOptions
 * @property {number} armCount The number of arms for the Aah.
 * @property {number} gapSDP The percentage of initial arm length (which is half the value of size) to use as a standard deviation when randomly varying central gap for each arm.
 * @property {number} lengthSDP The percentage of initial arm length (which is half the value of size) to use as a standard deviation when randomly varying actual arm length.
 * @property {boolean} rotate If true, rotate the final Aah a random number of degrees.
 * @property {number} size The expected size of the Aah. The actual size will vary depending on random factors.
 * @property {number} thetaSD The angle in degrees to use as a standard deviation when randomly varying the angles between the arms.
 * @property {number} tipDistancePercent The percentage up the arm to place the tip. A valve if 100 puts the tip at the end of each arm.
 * @property {number} tipDiameter The diameter of the tip. The special value of AahElement.tipType.gap makes the tip for each arm the same as that arm's gap.
 * @property {value} any Any of the TangleElementOptions may be used here.
 */

/**
 * Define the Aah element. An Aah element is star-shaped. It needs an approximate size and a position.
 * The size is approximate because the aah's components are built with some size variations.
 * In addition, an Aah can be rotated randomly, and the angle between the arms can vary.
 * <br />
 * <img src='images/AahElement.png' />
 */
class AahElement extends TangleElement {

    /**
     * Special setting for defining Aah tips
     * @type {AahElementTipTypes}
     */
    static tipType = {
        gap: "gap",
    };

    /**
     * Create a new Aah.
     * @param {p5.Graphics} g The graphics object to draw to.
     * @param {Point} center The position of the aah.
     * @param {AahElementOptions} options A map of values to be loaded into instance variables.
     */
    constructor(g, center, options) {
        if (typeof options === 'undefined') options = {};
        options.allowableOptions = {
            armCount: 8,
            thetaSD: 5,
            lengthSDP: 15,
            gapSDP: 10,
            rotate: true,
            tipDistancePercent: 100,
            tipDiameter: AahElement.tipType.gap,
            size: 100,
        };
        super(g, center, options);
        this.length = this.size / 2;
        if (this.armCount < 3) this.armCount = 3;
        this.arms = [];

        const dAngle = TWO_PI / this.armCount;
        const rotation = this.rotate ? random(0, dAngle) : 0;
        for (let angle = 0; angle < TWO_PI - (dAngle / 2); angle += dAngle) {

            // Create the arm
            let c = new Polar(randomGaussian(this.length, this.lengthSDP / 100 * this.length), randomGaussian(angle + rotation, this.thetaSD * Math.PI / 180));
            const gap = randomGaussian(this.gapSDP, this.gapSDP / 7) / 100 * this.length;
            let arm = {
                start: new Polar(gap, c.a).toPointCenter(this.center), // Draw line from here...
                stop: c.toPointCenter(this.center), // ...to here
                tipCenter: new Polar(c.r * (this.tipDistancePercent / 100), c.a).toPointCenter(this.center),
                tipDiameter: !isNaN(this.tipDiameter) ? this.tipDiameter : this.tipDiameter === AahElement.tipType.gap ? gap : 10,
            };
            this.arms.push(arm);

            // Polygon vertices associated with this arm
            let maxLength = Math.max(c.r, c.r * (this.tipDistancePercent / 100)) + arm.tipDiameter / 2;
            this.addVertex(new Polar(maxLength + 5 * gap, c.a).toPointCenter(this.center));
            this.addVertex(new Polar(0.6 * c.r, c.a + (dAngle / 2)).toPointCenter(this.center));
        }
        if (this.debug) console.log("aah: ", this.aah);
    }


    /**
     * Draw the AahElement to the buffer.
     */
    draw() {
        super.draw();
        this.arms.forEach(arm => {
            this.g.line(arm.start.x, arm.start.y, arm.stop.x, arm.stop.y);
            this.g.circle(arm.tipCenter.x, arm.tipCenter.y, arm.tipDiameter);
        });
        // this.drawPoly();
    }
}

/**
 * @typedef {Object} AahElementPlan
 * @property {number} sizeSDP The percentage of initial size to use as a standard deviation when randomly varying the size of each Aah.
 * @property {number} desiredCount The number of Aah elements to try to draw. The actual number drawn will depend on how many will fit.
 * @property {value} any Any of the AahOptions may be used here.
 */

/**
 * @typedef {Object} DotElementPlan
 * @property {value} any Any of the DotOptions may be used here.
 */

/**
 * @typedef {Object} AahPlan
 * @property {AahElementPlan} aah Options for generating individual Aah elements.
 * @property {DotElementPlan} dot Options for generating individual Dot elements.
 */

/**
 * @typedef {Object} AahPlans
 * @property {AahPlan} any Any members of this object are named AahPlan objects to be used as presets.
 */

/**
 * @typedef {Object} AahOptions
 * @property {AahPlan} plan A set of options for underlying elements.
 * @property {value} any Any of the TangleOptions may be used here.
 */

/**
 * Define the Aah tangle.
 * Aah is composed of repeating patterns of AahElement and DotElement, placed randomly on the screen.
 * <br />
 * <img src='images/AahTangle.png' />
 */
class Aah extends Tangle {

    /**
     * Preset plans for the Aah tangle.
     * @type {AahPlans}
     * @static
     */
    static plans = {
        zentangle: {
            aah: {},
            dot: {
                size: new Range(3, 6),
                fillColor: 255,
            },
        },
    };

    /**
     * Create the Aah tangle object.
     * @param {Point[] | Polygon} mask Vertices of a polygon used as a mask. Only the portion of the tangle inside the polygon will be visible.
     * @param {AahOptions} options A map of values to be loaded into instance variables.
     */
    constructor(mask, options) {
        if (typeof options === 'undefined') options = {};
        options.allowableOptions = {
            plan: Aah.plans.zentangle,
        };
        options.plan = options.plan === undefined ? Aah.plans.zentangle : options.plan;
        super(mask, options);

        this.build = function () {

            if (this.plan.aah === undefined) this.plan.aah = {};
            if (this.plan.dot === undefined) this.plan.dot = {};

            if (this.plan.aah.enable === undefined || this.plan.aah.enable === true) {
                let drawCount = 0;
                let failCount = 0;

                const size = this.plan.aah.size === undefined ?
                    Math.min(this.width, this.height) / 8 : this.plan.aah.size;
                if (this.margin === undefined) this.margin = size / 6;
                const desiredCount = this.plan.aah.desiredCount === undefined ?
                    (this.width / size) * (this.height / size) * 10 : this.plan.aah.desiredCount;
                const sizeSDev = this.plan.aah.sizeSDP === undefined ?
                    (this.plan.aah.sizeSDP / 100) * size : this.plan.aah.sizeSDP;

                while (drawCount < desiredCount) {
                    let center = new Point(random(this.margin, this.width - this.margin), random(this.margin, this.height - this.margin));

                    let options = {
                        debug: this.debug,
                        size: randomGaussian(size, sizeSDev),
                    };
                    if (typeof this.plan.aah.armCount !== 'undefined') options.armCount = this.plan.aah.armCount;
                    if (typeof this.plan.aah.thetaSD !== 'undefined') options.thetaSD = this.plan.aah.thetaSD;
                    if (typeof this.plan.aah.lengthSDP !== 'undefined') options.lengthSDP = this.plan.aah.lengthSDP;
                    if (typeof this.plan.aah.gapSDP !== 'undefined') options.gapSDP = this.plan.aah.gapSDP;
                    if (typeof this.plan.aah.rotate !== 'undefined') options.rotate = this.plan.aah.rotate;
                    if (typeof this.plan.aah.tipDistancePercent !== 'undefined') options.tipDistancePercent = this.plan.aah.tipDistancePercent;
                    if (typeof this.plan.aah.tipDiameter !== 'undefined') options.tip.diameter = this.plan.aahTipDiameter;
                    if (typeof this.plan.aah.fillColor !== 'undefined') options.fillColor = this.plan.aah.fillColor;
                    if (typeof this.plan.aah.strokeColor !== 'undefined') options.strokeColor = this.plan.aah.strokeColor;
                    const aah = new AahElement(this.g, center, options);
                    const poly = aah.getPoly();

                    const conflict = this.collisionTest(poly);
                    if (conflict) {
                        ++failCount;
                        if (failCount > desiredCount * 3) {
                            break;
                        }
                    } else {
                        this.polys.push(poly);
                        aah.draw();
                        ++drawCount;
                    }
                }
            }

            if (this.plan.dot.enable === undefined || this.plan.dot.enable === true) {
                const size = this.plan.dot.size === undefined ? 3 : this.plan.dot.size;
                const sizeIsNum = isNaN(size) ? false : true;
                const ds = (sizeIsNum ? size : size.max) * 2;
                const desiredCount = (this.width / ds) * (this.height / ds);
                for (let i = 0; i < desiredCount; ++i) {
                    const center = new Point(random(this.margin, this.width - this.margin), random(this.margin, this.height - this.margin));
                    let options = {
                        debug: this.debug,
                        size: sizeIsNum ? size : size.rand(),
                    };
                    if (typeof this.plan.dot.spacing !== 'undefined') options.spacing = this.plan.dot.spacing;
                    if (typeof this.plan.dot.fillColor !== 'undefined') options.fillColor = this.plan.dot.fillColor;
                    if (typeof this.plan.dot.strokeColor !== 'undefined') options.strokeColor = this.plan.dot.strokeColor;
                    const dot = new DotElement(this.g, center, options);
                    const poly = dot.getPoly();

                    const conflict = this.collisionTest(poly);
                    if (!conflict) {
                        this.polys.push(poly);
                        dot.draw();
                    }
                }
            }
        };

        this.execute();
    }
}