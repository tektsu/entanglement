# Entanglement

Entanglement exists as an experiment in generative art. It is a library for drawing [Zentangles](https://zentagle.com) using the [p5.js library](https://p5js.org/) as well as the [p5.collide2d library](https://github.com/bmoren/p5.collide2D). It is in its very early stages so far, and can only draw a few tangles. Also, you may expect breaking changes for the foreseeable future as the features are tweaked.

The goal of Entanglement is to duplicate Zentangle patterns, which are normally hand-drawn. Therefore, there are many random "imprefections" to simulate hand-drawn objects.

## Getting Started

Load the 3 required libraries:

```
    <script src="https://cdn.jsdelivr.net/npm/p5@1.0.0/lib/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/bmoren/p5.collide2d/p5.collide2d.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/tektsu/entanglement@0.0.6/dist/entanglement.js"></script>
```

Review the documentation at https://tektsu.github.io/entanglement/, as well as the example code in the examples/ directory.

### Source Code

The source code can be found in GitHub as https://github.com/tektsu/entanglement.

## Zentangles

The Zentangle, as implemented by the [Zentangle](https://tektsu.github.io/entanglement/Zentangle.html) class represents the finished work. A Zentangle creates the canvas and writes its various components to it. It also creates a border around the work. 

A Zentangle requires a size in pixels and a shape. There are three shapes: 'square' or 'triangle', in which case the size is the length of each side, or 'circle', which the size representing the diameter. Zentangles can also be passed a [ZentangleOptions](https://tektsu.github.io/entanglement/global.html#ZentangleOptions) object with additional instructions for creating the Zentangle.

A program using this library to create a Zentangle would instantiate the Zentangle class, call the addTangle method one or more times to add tangles. Tangles are drawn in the order they are added.

## Tangles

The Tangle is based on the [Tangle](https://tektsu.github.io/entanglement/Tangle.html) class. Tangles are predefined patterns that can be placed on the Zentangle canvas. They correspond roughly to tangle patterns used in the [Zentangle Method](https://zentangle.com/pages/what-is-the-zentangle-method).

| Tangle | Contains Elements |
|:-------|:------------------|
| [Aah](https://tektsu.github.io/entanglement/Aah.html)    | [AahElement](https://tektsu.github.io/entanglement/AahElement.html) <br>[DotElement](https://tektsu.github.io/entanglement/DotElement.html) |
| [Ambler](https://tektsu.github.io/entanglement/Ambler.html) | [BoxSpiralElement](https://tektsu.github.io/entanglement/BoxSpiralElement.html) |
| [BoxSpirals](https://tektsu.github.io/entanglement/BoxSpirals.html) | [BoxSpiralElement](https://tektsu.github.io/entanglement/BoxSpiralElement.html) |
| [Emingle](https://tektsu.github.io/entanglement/Emingle.html) | [BoxSpiralElement](https://tektsu.github.io/entanglement/BoxSpiralElement.html) |
| [Huggins](https://tektsu.github.io/entanglement/Huggins.html) | |
| [W2](https://tektsu.github.io/entanglement/W2.html) | |

## Tangle Elements

Tangle elements are shapes that make up tangle. Generally, a tangle will have a one or more tangle elements repeated over its area. Tangle elements generally have an enclosing polygon defining their local space. Tangle can use these to avoid overlapping the elements. Tangle elements are based on the [TangleElement](https://tektsu.github.io/entanglement/TangleElement.html) class. Not all Tangles use a TangleElement, as they may not be drawn by repeating a design. Other Tangles may use more than one TangleElement.

| Tangle Element   | Used in Tangles |
|:-----------------|:----------------|
| [AahElement](https://tektsu.github.io/entanglement/AahElement.html)       | [Aah](https://tektsu.github.io/entanglement/Aah.html)             |
| [BoxSpiralElement](https://tektsu.github.io/entanglement/BoxSpiralElement.html) | [Ambler](https://tektsu.github.io/entanglement/Ambler.html) <br />[BoxSpirals](https://tektsu.github.io/entanglement/BoxSpirals.html) <br /> [Emingle](https://tektsu.github.io/entanglement/Emingle.html) |
| [DotElement](https://tektsu.github.io/entanglement/DotElement.html)       | [Aah](https://tektsu.github.io/entanglement/Aah.html)             |

## Examples

A Zentangle using Aah for the background, and with several areas of BoxSpirals with increasing brightness.

```
function setup() {
    const z = new Zentangle(600, 'square', {
    });
    z.addTangle(new Aah(z.getFullMask(), {
            background: z.background,
    }));
    for (let i=0; i<12; i++) {
        const a = 20+i*30;
        z.addTangle(new BoxSpirals([
            new Point(z.width/2, z.height/2),
            new Polar(100+10*i, radians(a)).toPointCenter(new Point(z.width/2, z.height/2)),
            new Polar(120+10*i, radians(a+30)).toPointCenter(new Point(z.width/2, z.height/2)),
        ], {
            background: 111+12*i,
            divisions: new Range(6, 10),
            rotation: 'random',
            startCorner: 'random',
            size: new Range(30, 60),
        }));
    }

    z.draw();
}
```

![nautilus.png](https://raw.githubusercontent.com/tektsu/entanglement/master/docs/images/nautilus.png)

