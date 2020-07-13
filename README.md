# Entanglement

Entanglement exists as an experiment in generative art. It is a library for drawing [Zentangles](https://zentagle.com) using the [p5.js library](https://p5js.org/) as well as the [p5.collide2d library](https://github.com/bmoren/p5.collide2D). It is in its very early stages so far, and can only draw a few tangles. Also, you may expect breaking changes for the foreseeable future as the features are tweaked.

The goal of Entanglement is to duplicate Zentangle patterns, which are normally hand-drawn. Therefore, there are many random "imprefections" to simulate hand-drawn objects.

## Getting Started

Load the 3 required libraries:

```
    <script src="https://cdn.jsdelivr.net/npm/p5@1.0.0/lib/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/bmoren/p5.collide2d/p5.collide2d.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/tektsu/entanglement/dist/entanglement.min.js"></script>
```

Review the documentation at https://tektsu.github.io/entanglement/, as well as the example code in the examples/ directory.

### Source Code

The source code can be found in GitHub as https://github.com/tektsu/entanglement.

## Tangle Elements

Tangle elements are shapes that make up tangle. Generally, a tangle will have a one or more tangle elements repeated over its area. Tangle elements generally have an enclosing polygon defining their local space. Tangle can use these to avoid overlapping the elements.

### Dot

The [Dot](https://tektsu.github.io/entanglement/Dot.html) element is a simple dot or circle on the canvas. A Dot is created with a size (diameter), a position, and an options object.

#### Dot Options

All elements of the options object are optional. The values show in the example below are the default values.

```
{
    spacing: 400,   // The size of the enclosing polygon expressed as a
                    // percentage of the Dot's size. The minimum value is 150.
    fillColor: 0,   // The color used to fill any shapes
    strokeColor: 0, // The color used to draw lines
}
```

### Aah

An [Aah](https://tektsu.github.io/entanglement/Aah.html) element is star-shaped. It needs an approximate size and a position. The size is approximate because the aah's components are buikt with some size variations. In addition, an aah can be rotated randomly, and the angle between the arms can vary.

![AAH.png](https://raw.githubusercontent.com/tektsu/entanglement/master/images/AAH.png)

#### Aah Options

All elements of the options object are optional. The values show in the example below are the default values.

```
{
    armCount: 8,    // The number of arms.
    thetaSD: 5,     // The number of degrees to use as a standard deviation
                    // when randomizing the angle of the arms.
    lengthSDP: 15   // The standard deviation used to vary the length of each arm
                    // is this percentage of the length of the arm.
    gapSDP: 10      // The standard deviation used to vary how close to the center 
                    // each are is is this percentage of the length of the arm. 
    rotate: true,   // If true, each generated ahh will be rotated a random amount.
    tipDistancePercent: 100,  // The distance of the dot at the end of arm from the
                    // center, expressed in a percantage of the arm's length. A value 
                    // of 100 puts the dot on the end of the arm. 
    tipDiameter: Aah.tipType.gap, // Can be a diameter in pixels or Aah.tipType.gap,
                    // Aah.tipType.gap sets the diameter to be the same as the
                    // generated gap size for that arm. 
    fillColor: 0,   // The color used to fill any shapes
    strokeColor: 0, // The color used to draw lines
}
```

## Tangles

Tangles are complete patterns created with multiple tangle elements. They fill an area, and me extend outside that area at times.

### Aahs

The Aahs tangle is a complete implementation of the AAH zentangle. _Note: the class is called Aahs, but the zentangle it implements is called AAH. Yes, it is confusing. Sorry._ Ahhs, is composed of repeating patterns of Aah and Dot, placed randomly on the screen. Aahs takes a [Box](file:///Users/steve/Development/art/entanglement/docs/Box.html) as a parameter, which defines the area on the canvas where it should draw.

![AahsTangle.png](https://raw.githubusercontent.com/tektsu/entanglement/master/images/AahsTangle.png)

#### Aahs Options

All elements of the options object are optional. The values show in the example below are the default values.

```
{
    polys: [],          // A list of existing enclosing polygons to avoid.
    avoidCollisions: true, // If false, tangle elements will be placed without regard
                        // the enclosing polygons, and will likly overlap.
    margin: size/6,     // The percentage of the box to used as a margin. Aahs are
                        // not centered outside the margins, but msy extend outside.
    plan: Aah.plans.zentangle, The basic settings to use when generating tangle
                        // elements. Aah.plans.zentangle is a preset, but a plan
                        // can also be built manually. See below.
}
```

One of the options fields is `plan`. This is set of extended options affecting the internal tangle elements. If one of the presets is not used (currently, Aah.plans.zentangle is the only preset -- it generates an image that looks as much as possible like a traditional AAH zentangle) then a plan can be created as a plan object. The following example shows an Aahs plan object.

```
{
    aah: {
        enabled: true,  // Set to false to disable aah elements
        size: 100,      // The requested size if each aah,
        sizeSDP: 15,    // The percentage of the requested size to use as a standard
                        // deviation to vary the actual size.
        desiredCount: 10, // The number of aahs to try to print. Defaults to 10 times
                        // the number of the requested size that COULD fit.

        // The remainder are the same as the Aah options, above
        armCount: 8,    // The number of arms.
        thetaSD: 5,     // The number of degrees to use as a standard deviation
                        // when randomizing the angle of the arms.
        lengthSDP: 15   // The standard deviation used to vary the length of each arm
                        // is this percentage of the length of the arm.
        gapSDP: 10      // The standard deviation used to vary how close to the center 
                        // each are is is this percentage of the length of the arm. 
        rotate: true,   // If true, each generated ahh will be rotated a random amount.
        tipDistancePercent: 100,  // The distance of the dot at the end of arm from the
                        // center, expressed in a percantage of the arm's length. A value 
                        // of 100 puts the dot on the end of the arm. 
        tipDiameter: Aah.tipType.gap, // Can be a diameter in pixels or Aah.tipType.gap,
                        // Aah.tipType.gap sets the diameter to be the same as the
                        // generated gap size for that arm. 
        fillColor: 0,   // The color used to fill any shapes.
        strokeColor: 0, // The color used to draw lines.
    },
    dot: {
        enabled: true,  // Set to false to disable dot elements.
        size: 3,        // The diameter of the dot; can be a number or a Range.

        // The remainder are the same as the Dot options, above
        spacing: 400,   // The size of the enclosing polygon expressed as a
                        // percentage of the Dot's size. The minimum value is 150.
        fillColor: 0,   // The color used to fill any shapes.
        strokeColor: 0, // The color used to draw lines.
    },
}
```

## Examples

### Draw a traditional AAH zentangle.

```
// Canvas size
const height = 600;
const width = 600;

function setup() {
    createCanvas(width, height);
    background(240);
}

function draw() {
    let aahs = new Aahs(Box.newFromXY(0, 0, width, height), {});
    aahs.draw();
    noLoop();
}
```
![AahsTangle.png](https://raw.githubusercontent.com/tektsu/entanglement/master/images/AahsTangle.png)

### Increase the aah size variation

```
// Canvas size
const height = 600;
const width = 600;

function setup() {
    createCanvas(width, height);
    background(240);
}

function draw() {

    let aahs = new Aahs(Box.newFromXY(0, 0, width, height), {
        plan: {
            aah: {
                sizeSDP: 50,
            },
        },
    });
    aahs.draw();
    noLoop();
}
```
![AahsSizeVariation.png](https://raw.githubusercontent.com/tektsu/entanglement/master/images/AahsSizeVariation.png)

### Turn off Aah rotation and reduce the variation of the arm angles

```
// Canvas size
const height = 600;
const width = 600;

function setup() {
    createCanvas(width, height);
    background(240);
}

function draw() {
    let aahs = new Aahs(Box.newFromXY(0, 0, width, height), {
        plan: {
            aah: {
                rotate: false,
                thetaSD: 1,
            },
        },
    });
    aahs.draw();
    noLoop();
}
```

![AahsNoRotation.png](https://raw.githubusercontent.com/tektsu/entanglement/master/images/AahsNoRotation.png)

### Increase the varibility of arm length

```
// Canvas size
const height = 600;
const width = 600;

function setup() {
    createCanvas(width, height);
    background(240);
}

function draw() {
    let aahs = new Aahs(Box.newFromXY(0, 0, width, height), {
        plan: {
            aah: {
                // Set the standard deviation used to generate arm lengths to 50% of the original requested length
                lengthSDP: 50,
            },
        },
    });
    aahs.draw();
    noLoop();
}
```

![AahsVaryArmLength.png](https://raw.githubusercontent.com/tektsu/entanglement/master/images/AahsVaryArmLength.png)

### Increase the arm count to 11, and allow the dots to be bigger and closer together.

```
// Canvas size
const height = 600;
const width = 600;

function setup() {
    createCanvas(width, height);
    background(240);
}

function draw() {
    let aahs = new Aahs(Box.newFromXY(0, 0, width, height), {
        plan: {
            dot: {
                size: new Range(1,10),
                spacing: 150,
                fillColor: 255,
            },
            aah: {
                armCount: 11,
            }
        },
    });
    aahs.draw();
    noLoop();
}
```

![AahsEleven.png](https://raw.githubusercontent.com/tektsu/entanglement/master/images/AahsEleven.png)
