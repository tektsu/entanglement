/**
 * Define the Dot element.
 */
class Dot extends TangleElement {

    /**
     * Create a new Dot.
     * @param {p5.Graphics} g The graphics object to draw to.
     * @param {Point} center The position of the dot.
     * @param {object} options A map of values to be loaded into instance variables.
     */
    constructor(g, center, options) {
        if (typeof options == undefined) options = {};
        options.allowableOptions = {
            spacing: 400,
            size: 3,
        };
        super(g, center, options);
        this.spacing = Math.max(100, this.spacing);

        let dAngle = TWO_PI/8;
        for (let angle=0; angle<TWO_PI; angle+=dAngle) {
            this.addVertex(new Polar(this.spacing/100 * this.size, angle).toPointCenter(this.center));   // Put a vertex out beyond the tip of the arm
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
 * Define the Aah element.
 */
class Aah extends TangleElement {

    static tipType = {
        gap: "gap",
    };

    /**
     * Create a new Aah.
     * @param {p5.Graphics} g The graphics object to draw to.
     * @param {Point} center The position of the aah.
     * @param {object} options A map of values to be loaded into instance variables.
     */
    constructor(g, center, options) {
        if (typeof options === undefined) options = {};
        options.allowableOptions = {
            armCount: 8,
            thetaSD: 5,
            lengthSDP: 15,
            gapSDP: 10,
            rotate: true,
            tipDistancePercent: 100,
            tipDiameter: Aah.tipType.gap,
            size: 100,
        };
        super(g, center, options);
        this.length = this.size/2;
        if (this.armCount < 3) this.armCount = 3;
        this.arms = [];

        const dAngle = TWO_PI/this.armCount;
        const rotation = this.rotate ? random(0, dAngle) : 0;
        for (let angle=0; angle<TWO_PI-(dAngle/2); angle+=dAngle) {

            // Create the arm
            let c = new Polar(randomGaussian(this.length, this.lengthSDP/100 * this.length), randomGaussian(angle+rotation, this.thetaSD*Math.PI/180));
            const gap = randomGaussian(this.gapSDP, this.gapSDP/7)/100 * this.length;
            let arm = {
                start: new Polar(gap, c.a).toPointCenter(this.center),  // Draw line from here...
                stop: c.toPointCenter(this.center),                     // ...to here
                tipCenter: new Polar(c.r * (this.tipDistancePercent / 100), c.a).toPointCenter(this.center),
                tipDiameter: !isNaN(this.tipDiameter) ? this.tipDiameter : this.tipDiameter === Aah.tipType.gap ? gap : 10,
            };
            this.arms.push(arm);

            // Polygon vertices associated with this arm
            let maxLength = Math.max(c.r, c.r * (this.tipDistancePercent / 100)) + arm.tipDiameter/2;
            this.addVertex(new Polar(maxLength + 5*gap, c.a).toPointCenter(this.center));
            this.addVertex(new Polar(0.6*c.r, c.a+(dAngle/2)).toPointCenter(this.center));
        }
        if(this.debug) console.log("aah: ", this.aah);
    }


    /**
     * Draw the Aah.
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
 * Define the Aahs tangle
 */
class Aahs extends Tangle {

    static plans = {
        zentangle: {
            aah: {
            },
            dot: {
                size: new Range(3, 6),
                fillColor: 255,
            },
        },
    };

    /**
     * Create the Aahs tangle object.
     * @param {number} width The width of the tangle.
     * @param {number} height The height of the tangle.
     * @param {object} options A map of values to be loaded into instance variables.
     */
    constructor(width, height, options) {
        if (typeof options == undefined) options = {};
        options.allowableOptions = {
            plan: Aahs.plans.zentangle,
        };
        options.plan = options.plan === undefined ? Aahs.plans.zentangle : options.plan;
        super(width, height, options);

        if (this.plan.aah === undefined) this.plan.aah = {};
        if (this.plan.dot === undefined) this.plan.dot = {};

        if (this.plan.aah.enable === undefined || this.plan.aah.enable === true) {
            let drawCount = 0;
            let failCount = 0;

            const size = this.plan.aah.size === undefined ?
                Math.min(this.width, this.height) / 8 : this.plan.aah.size;
            if (this.margin === undefined) this.margin = size/6;
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
                if (this.plan.aah.armCount !== undefined) options.armCount = this.plan.aah.armCount;
                if (this.plan.aah.thetaSD !== undefined) options.thetaSD = this.plan.aah.thetaSD;
                if (this.plan.aah.lengthSDP !== undefined) options.lengthSDP = this.plan.aah.lengthSDP;
                if (this.plan.aah.gapSDP !== undefined) options.gapSDP = this.plan.aah.gapSDP;
                if (this.plan.aah.rotate !== undefined) options.rotate = this.plan.aah.rotate;
                if (this.plan.aah.tipDistancePercent !== undefined) options.tipDistancePercent = this.plan.aah.tipDistancePercent;
                if (this.plan.aah.tipDiameter !== undefined) options.tip.diameter = this.plan.aahTipDiameter;
                if (this.plan.aah.fillColor !== undefined) options.fillColor = this.plan.aah.fillColor;
                if (this.plan.aah.strokeColor !== undefined) options.strokeColor = this.plan.aah.strokeColor;
                const aah = new Aah(this.g, center, options);
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
            const ds = (sizeIsNum ? size : size.max)*2;
            const desiredCount = (this.width/ds) * (this.height/ds);
            for (let i = 0; i < desiredCount; ++i) {
                const center = new Point(random(this.margin, this.width - this.margin), random(this.margin, this.height - this.margin));
                let options = {
                    debug: this.debug,
                    size: sizeIsNum ? size : size.rand(),
                };
                if (this.plan.dot.spacing !== undefined) options.spacing = this.plan.dot.spacing;
                if (this.plan.dot.fillColor !== undefined) options.fillColor = this.plan.dot.fillColor;
                if (this.plan.dot.strokeColor !== undefined) options.strokeColor = this.plan.dot.strokeColor;
                const dot = new Dot(this.g, center, options);
                const poly = dot.getPoly();

                const conflict = this.collisionTest(poly);
                if (!conflict) {
                    this.polys.push(poly);
                    dot.draw();
                }
            }
        }
    }
}
