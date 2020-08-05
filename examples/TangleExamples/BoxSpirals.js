const height = 600;
const width = 600;

function setup() {
    createCanvas(width, height);
    background(255);
    const t = new BoxSpirals([
        new Point(0, 0),
        new Point( width, 0),
        new Point(width, height),
        new Point(0, height),
    ], {
        background: 255,
        divisions: new Range(6, 10),
        rotation: 'random',
        startCorner: 'random',
        size: new Range(30, 60),
    });
    image(t.g, 0, 0);
}
