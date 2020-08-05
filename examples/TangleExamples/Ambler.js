const height = 600;
const width = 600;

function setup() {
    createCanvas(width, height);
    background(255);
    const t = new Ambler([
        new Point(0, 0),
        new Point( width, 0),
        new Point(width, height),
        new Point(0, height),
    ], {
    });
    image(t.g, 0, 0);
}
