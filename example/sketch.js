// Canvas size
const height = 600;
const width = 600;

function setup() {
    createCanvas(width, height);
    background(240);
}

function draw() {
    // const aah = new Aah(100, new Point(width/2, height/2), {
    //     debug: true,
    // });
    // aah.generate();
    // aah.draw();

    let aahs = new Aahs(Box.newFromXY(0, 0, width, height), {
        // debug: true,
        // avoidCollisions: false,
        // size: 100,
    });
    aahs.draw();
    noLoop();
}

