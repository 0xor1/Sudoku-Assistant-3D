Sudoku Solver Visualization
===========================

##Summary


A demo webGL application implemented using [mrdoob's](https://twitter.com/mrdoob) [three.js](https://github.com/mrdoob/three.js) library.

The main purpose is to allow users to enter an initial gameBoard state and then run a solver on the game,
whilst displaying to the user the logic used to make each value entry in a 3D animation. A command line interface is also provided to show  model-view separation.

Current progress demo available [here](http://0xor1.com/Sudoku).

##Controls


###GameBoard

Click on a cell to select it. The selected cell will turn orange in color. The directional keys can also be used to change the currently selected cell. Starting cells (blue) can not be selected, the directional keys will skip over them when changing the selected cell.

To enter a value in a cell simply select it and then press a relevant key, only empty cells can have values entered into them, to clear a value select the cell and press the _delete_ key. Games accept the following values:

1. **4x4** - 1 &rarr; 4  

2. **9x9** - 1 &rarr; 9  

3. **16x16** - 1 &rarr; 9 + A &rarr; G  

4. **25x25** - 1 &rarr; 9 + A &rarr; P  

5. **36x36** - 1 &rarr; 9 + A &rarr; Z + #  

###Menu

(Coming soon!)
