const height = 600;
const width = 600;

function setup() {
    createCanvas(width, height);
    background(255);
    const aah = new Aah([
        new Point(0, 0),
        new Point( width, 0),
        new Point(width, height),
        new Point(0, height),
    ], {});
    image(aah.g, 0, 0);
}
