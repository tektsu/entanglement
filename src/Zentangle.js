class Zentangle extends TangleBase {

    constructor(size, shape, options) {
        super();
        if (typeof options === 'undefined') options = {};
        options.allowableOptions = {
            background: 255,
            borderSize: 20,
        };
        this.loadOptions(options);

        this.width = size;
        this.height = size;
        this.shape = shape === undefined ? 'square' : shape;
        if (this.shape === 'triangle') {
            this.height *= 0.87;
        }
        this.g = createGraphics(this.width, this.height);
        let center = new Point(this.width/2, this.height/2);
        switch(this.shape) {
            case 'circle':
                this.edgePoly = [];
                for (let d=0; d<360; d++) {
                    this.edgePoly.push(new Polar(this.width/2-1, radians(d)).toPointCenter(center));
                }
                this.borderPoly = [];
                for (let d=0; d<360; d++) {
                    this.borderPoly.push(new Polar(this.width/2-this.borderSize, radians(d)).toPointCenter(center).vary(1));
                }
                break;
            case 'triangle':
                center = new Point(this.width/2, 2*this.height/3);
                this.edgePoly = [
                    new Point(0, this.height),
                    new Point(this.width/2, 0),
                    new Point(this.width, this.height),
                ];
                const distance = 2*this.height/3 - 2*this.borderSize;
                this.borderPoly = this._createBorderPolyFromLines([
                    new Polar(distance, radians(270)).toPointCenter(center),
                    new Polar(distance, radians(30)).toPointCenter(center),
                    new Polar(distance, radians(150)).toPointCenter(center),
                ]);
                break;
            default:    // square
                this.edgePoly = [
                    new Point(0, 0),
                    new Point(this.width, 0),
                    new Point(this.width, this.height),
                    new Point(0, this.height),
                ];
                this.borderPoly = this._createBorderPolyFromLines([
                    new Point(this.borderSize, this.borderSize),
                    new Point(this.width-this.borderSize, this.borderSize),
                    new Point(this.width-this.borderSize, this.height-this.borderSize),
                    new Point(this.borderSize, this.height-this.borderSize),
                ]);
                break;
        }
        this.tangles = [];

        createCanvas(this.width, this.height);
        background(this.background);
    }

    addTangle(nw, tangle, mask) {
        this.tangles.push({
            nw: nw,
            tangle: tangle,
            mask: mask,
        });
        this.g.image(tangle.g, nw.x, nw.y);
    }

    draw() {

        // Create border mask
        let border = createGraphics(this.width, this.height);
        border.noStroke();
        border.fill(255, 255, 255, 0);
        border.beginShape();
        for (let p = 0; p < this.edgePoly.length; p++) {
            border.vertex(this.edgePoly[p].x, this.edgePoly[p].y);
        }
        border.endShape(CLOSE);
        border.fill(255, 255, 255, 255);
        border.beginShape();
        for (let p = 0; p < this.borderPoly.length; p++) {
            border.vertex(this.borderPoly[p].x, this.borderPoly[p].y);
        }
        border.endShape(CLOSE);

        // Draw the zentangle
        let clone;
        (clone = this.g.get()).mask(border.get());
        image(clone, 0, 0);

        // Draw the border
        stroke(0);
        fill(255, 255, 255, 0);
        beginShape();
        for (let p = 0; p < this.borderPoly.length; p++) {
            vertex(this.borderPoly[p].x, this.borderPoly[p].y);
        }
        endShape(CLOSE);

        // Draw the edge
        beginShape();
        for (let p = 0; p < this.edgePoly.length; p++) {
            vertex(this.edgePoly[p].x, this.edgePoly[p].y);
        }
        endShape(CLOSE);
    }

    _createBorderPolyFromLines(lines) {
        let poly = [];
        for (let start=0; start<lines.length; start++) {
            let end = start+1;
            if (end === lines.length) {
                end = 0;
            }
            const points = new Line(lines[start], lines[end]).divide(100);
            for (let p=0; p<points.length; p++) {
                poly.push(points[p].vary(1));
            }
        }

        return poly;
    }
}
