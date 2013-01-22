Sudoku Assistant 3D
===========================

##Summary


A demo webGL application implemented using [mrdoob's](https://twitter.com/mrdoob) [three.js](https://github.com/mrdoob/three.js) library.

Users can enter a new Sudoku game and use the assistant to see the possible entries that can be made in any given state.

Current progress demo available [here](http://0xor1.com/Sudoku).

##Controls

###3D View


####GameBoard

Click on a cell to select it. The selected cell will turn orange in color. The directional keys can also be used to change the currently selected cell. Starting cells (blue) can not be selected, the directional keys will skip over them when changing the selected cell.

To enter a value in a cell simply select it and then press a relevant key, only empty cells can have values entered into them, to clear a value select the cell and press the _delete_ key. Games accept the following values:

1. **4x4** - 1 &rarr; 4
2. **9x9** - 1 &rarr; 9
3. **16x16** - 1 &rarr; 9 + A &rarr; G
4. **25x25** - 1 &rarr; 9 + A &rarr; P
5. **36x36** - 1 &rarr; 9 + A &rarr; Z + #

####Menu

(Coming soon!!)
