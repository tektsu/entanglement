const height = 600;
const width = 600;

function setup() {
    createCanvas(width, height);
    background(255);
}

function draw() {
    const aahs = new Aahs(width, height, {});
    aahs.paste(new Point(0, 0));
    noLoop();
}
