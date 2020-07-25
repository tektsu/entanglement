# Entanglement

Entanglement exists as an experiment in generative art. It is a library for drawing [Zentangles](https://zentagle.com) using the [p5.js library](https://p5js.org/) as well as the [p5.collide2d library](https://github.com/bmoren/p5.collide2D). It is in its very early stages so far, and can only draw a few tangles. Also, you may expect breaking changes for the foreseeable future as the features are tweaked.

The goal of Entanglement is to duplicate Zentangle patterns, which are normally hand-drawn. Therefore, there are many random "imprefections" to simulate hand-drawn objects.

## Getting Started

Load the 3 required libraries:

```
    <script src="https://cdn.jsdelivr.net/npm/p5@1.0.0/lib/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/bmoren/p5.collide2d/p5.collide2d.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/tektsu/entanglement/dist/entanglement.js"></script>
```

Review the documentation at https://tektsu.github.io/entanglement/, as well as the example code in the examples/ directory.

### Source Code

The source code can be found in GitHub as https://github.com/tektsu/entanglement.

## Tangle Elements

Tangle elements are shapes that make up tangle. Generally, a tangle will have a one or more tangle elements repeated over its area. Tangle elements generally have an enclosing polygon defining their local space. Tangle can use these to avoid overlapping the elements.

### Aah

An [Aah](https://tektsu.github.io/entanglement/Aah.html) element is star-shaped. It needs an approximate size and a position. The size is approximate because the aah's components are buikt with some size variations. In addition, an aah can be rotated randomly, and the angle between the arms can vary.

![AAH.png](https://raw.githubusercontent.com/tektsu/entanglement/master/images/AAH.png)

### Dot

The [Dot](https://tektsu.github.io/entanglement/Dot.html) element is a simple dot or circle on the canvas. A Dot is created with a size (diameter), a position, and an options object.

## Tangles

Tangles are complete patterns created with multiple tangle elements. They fill an area, and me extend outside that area at times.

### Aahs

The Aahs tangle is a complete implementation of the AAH zentangle. _Note: the class is called Aahs, but the zentangle it implements is called AAH. Yes, it is confusing. Sorry._ Ahhs, is composed of repeating patterns of Aah and Dot, placed randomly on the screen. Aahs takes a width, a height and an [AahsOptions](https://tektsu.github.io/entanglement/global.html#AahsOptions) as a parameters.

#### Aahs Examples

##### Draw a traditional AAH tangle.

No options are passed in, since a traditional AAH is the default.

```
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
```
![AahsTangle.png](https://raw.githubusercontent.com/tektsu/entanglement/master/images/AahsTangle.png)

##### Increase the aah size variation

Increasing the standard deviation of the aah size, here expressed as a percentage, increases the range of aah sizes in the resulting image.

```
    const aahs = new Aahs(width, height, {
        plan: {
            aah: {
                sizeSDP: 50,
            },
        },
    });
```
![AahsSizeVariation.png](https://raw.githubusercontent.com/tektsu/entanglement/master/images/AahsSizeVariation.png)

##### Turn off Aah rotation and reduce the variation of the arm angles

Turning off random rotation and reducing the theta standard deviation resulting in all the aah elements being oriented in the same direction. 

```
    const aahs = new Aahs(width, height, {
        plan: {
            aah: {
                rotate: false,
                thetaSD: 1,
            },
        },
    });
```

![AahsNoRotation.png](https://raw.githubusercontent.com/tektsu/entanglement/master/images/AahsNoRotation.png)

##### Increase the varibility of arm length

```
    const aahs = new Aahs(width, height, {
        plan: {
            aah: {
                // Set the standard deviation used to generate arm lengths to 50% of the original requested length
                lengthSDP: 50,
            },
        },
    });
```

![AahsVaryArmLength.png](https://raw.githubusercontent.com/tektsu/entanglement/master/images/AahsVaryArmLength.png)

##### Increase the arm count to 11, and allow the dots to be bigger and closer together.

```
    const aahs = new Aahs(width, height, {
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
```

![AahsEleven.png](https://raw.githubusercontent.com/tektsu/entanglement/master/images/AahsEleven.png)

### Ambler

Ambler is an implementation of the AMBLER zentangle. It consists of a grid containing rotated box spirals. Aahs takes a width, a height and an [AmblerOptions](https://tektsu.github.io/entanglement/global.html#AmblerOptions) as a parameters.

#### Ambler Examples

##### A traditional Ambler

A traditional Amber requires no options.

```
const height = 600;
const width = 600;

function setup() {
    createCanvas(width, height);
    background(255);
}

function draw() {
    let amb = new Ambler(width, height, {});
    amb.paste(new Point(0, 0));
    noLoop();
}
```

![AmblerTangle.png](https://raw.githubusercontent.com/tektsu/entanglement/master/images/AmblerTangle.png)

##### Warp the grid

The gridVary option will randomly move each point in the grid by up to the specified number of pixels. A value greater than the gridSpacing, which defaults to 40 pixels, will tend to deteriorate the image since the corners ot some grid "squares" may end up inside other squares.

```
    const amb = new Ambler(width, height, {
        gridVary: 20,
    });
```

![AmblerCubes.png](https://raw.githubusercontent.com/tektsu/entanglement/master/images/AmblerCubes.png)
