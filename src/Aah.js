/**
 * Define the Dot element.
 */
class Dot extends TangleElement {

    /**
     * Create a new Dot.
     * @param {number} size The diameter of the dot.
     * @param {Point} center The position of the dot.
     * @param {object} options A map of values to be loaded into instance variables.
     */
    constructor(size, center, options) {
        super(size, center);
        this.spacing = 400;
        this.loadOptions(options);
        this.spacing = Math.max(150, this.spacing);

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
        circle(this.center.x, this.center.y, this.size);
        this.drawPoly();
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
     * @param {number} size The diameter of the aah.
     * @param {Point} center The position of the aah.
     * @param {object} options A map of values to be loaded into instance variables.
     */
    constructor(size, center, options) {
        super(size, center);
        this.armCount = 8;
        this.thetaSD = 5;
        this.lengthSDP = 15;  //
        this.gapSDP = 10;
        this.rotate = true;
        this.tipDistancePercent = 100;
        this.tipDiameter = Aah.tipType.gap;
        this.loadOptions(options);
        this.length = size/2;
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
            line(arm.start.x, arm.start.y, arm.stop.x, arm.stop.y);
            circle(arm.tipCenter.x, arm.tipCenter.y, arm.tipDiameter);
        });
        this.drawPoly();
    }
}

/**
 * Define the Aahs tangle
 */
class Aahs extends Tangle {

    static plans = {
        zentangle: {
            aahs: true,
            dots: true,
            dotSize: new Range(3, 6),
            dotDrawPre: function() {
                fill(255, 255, 255);
                stroke,(0, 0, 0);
            },
        },
    };

    /**
     * Create the Aahs tangle object.
     * @param {Box} box The rectangle where the AAhs should be drawn.
     * @param {object} options A map of values to be loaded into instance variables.
     */
    constructor(box, options) {
        super(box);
        this.polys = [];
        this.size = Math.min(box.width, box.height) / 8;
        this.sizeSDP = 15;
        this.margin = this.size/6;
        this.avoidCollisions = true;
        this.plan = Aahs.plans.zentangle;
        this.loadOptions(options);
    }

    /**
     * Draw the Aahs.
     */
    draw() {
        if (this.plan.aahs) {
            let drawCount = 0;
            let failCount = 0;

            if (this.desiredCount === undefined) this.desiredCount = (this.box.width / this.size) * (this.box.height / this.size) * 10;

            let sizeSDev = (this.sizeSDP / 100) * this.size;
            while (drawCount < this.desiredCount) {
                let center = new Point(random(this.box.position.x + this.margin, this.box.width - this.margin),
                    random(this.box.position.y + this.margin, this.box.height - this.margin));

                let options = {
                    debug: this.debug,
                };
                if (this.plan.aahArmCount) options.armCount = this.plan.aahArmCount;
                if (this.plan.aahThetaSD) options.thetaSD = this.plan.aahThetaSD;
                if (this.plan.aahLengthSDP) options.lengthSDP = this.plan.aahLengthSDP;
                if (this.plan.aahGapSDP) options.gapSDP = this.plan.aahGapSDP;
                if (this.plan.aahRotate) options.rotate = this.plan.aahRotate;
                if (this.plan.aahTipDistancePercent) options.tipDistancePercent = this.plan.aahTipDistancePercent;
                if (this.plan.aahTipDiameter) options.tipDiameter = this.plan.aahTipDiameter;
                const aah = new Aah(randomGaussian(this.size, sizeSDev), center, options);
                const poly = aah.getPoly();

                const conflict = this.collisionTest(poly);
                if (conflict) {
                    ++failCount;
                    if (failCount > this.desiredCount * 3) {
                        break;
                    }
                } else {
                    this.polys.push(poly);
                    aah.draw();
                    ++drawCount;
                }
            }
        }

        if (this.plan.dots) {
            const dotSize = this.plan.dotSize === undefined ? 3 : this.plan.dotSize;
            const dotSizeNum = isNaN(dotSize) ? false : true;
            const ds = (dotSizeNum ? dotSize : dotSize.max)*2;
            const desiredCount = (this.box.width/ds) * (this.box.height/ds);
            for (let i = 0; i < desiredCount; i++) {
                const center = new Point(random(this.box.position.x + this.margin, this.box.width - this.margin),
                    random(this.box.position.y + this.margin, this.box.height - this.margin));
                const diameter = dotSizeNum ? dotSize : dotSize.rand();
                let options = {
                    debug: this.debug,
                };
                if (this.plan.dotDrawPre) options.drawPre = this.plan.dotDrawPre;
                if (this.plan.dotSpacing) options.spacing = this.plan.dotSpacing;
                const dot = new Dot(diameter, center, options);
                const poly = dot.getPoly();

                const conflict = this.collisionTest(poly);
                if (!conflict) {
                    this.polys.push(poly);
                    dot.draw();
                }
            }
        }

        return this.polys;
    }
}
