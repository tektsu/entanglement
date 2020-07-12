#!/bin/bash

rm -rf docs entanglement.min.js
jsdoc -d ./docs entanglement.js
minify entanglement.js >entanglement.min.js
