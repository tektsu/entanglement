const width = 100;
const height = 100;

function setup() {
    createCanvas(width, height);
    background(240);

    let g = createGraphics(width, height);
    const e = new DotElement(g, new Point(width/2, height/2), {
        size: 10,
        stokeColor: 'black',
        fillColor: 'white',
    });
    e.draw();
    image(g, 0, 0);
}
