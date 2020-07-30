class Zentangle extends TangleBase {

    constructor(size, shape, options) {
        super();
        if (typeof options === 'undefined') options = {};
        options.allowableOptions = {
            background: 255,
        };
        this.loadOptions(options);

        this.width = size;
        this.height = size;
        this.shape = shape === undefined ? 'square' : shape;
        if (this.shape === 'triangle') {
            this.height *= 0.87;
        }
        this.g = createGraphics(this.width, this.height);
        this.mask = createGraphics(this.width, this.height);
        switch(this.shape) {
            case 'circle':
                this.mask.circle(this.width/2, this.height/2, this.width);
                break;
            case 'triangle':
                this.mask.triangle(0, this.height, this.width/2, 0, this.width, this.height);
                break;
            default:    // square
                this.mask.rect(0, 0, this.width, this.height);
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

    applyMask() {

    }

    draw() {
        let clone;
        (clone = this.g.get()).mask(this.mask.get());
        image(clone, 0, 0);
    }

}
