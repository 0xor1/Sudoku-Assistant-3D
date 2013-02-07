Sudoku Assistant 3D
===========================

##Summary


A demo webGL application implemented using [mrdoob's](https://twitter.com/mrdoob) [three.js](https://github.com/mrdoob/three.js) library.

Users can enter a new Sudoku game and use the assistant to see the possible entries that can be made in any given state.

Current progress demo available [here](http://0xor1.com/Sudoku).

##Controls

###GameBoard

Click on a cell to select it. The selected cell will turn orange in color. The directional keys can also be used to change the currently selected cell. Starting cells (blue) can not be selected, the directional keys will skip over them when changing the selected cell.

To enter a value in a cell simply select it and then press a relevant key, only empty cells can have values entered into them, to clear a value select the cell and press the _delete_ or _0_ keys.

###Menu

The menu system consists of a series of slide out tabs down the left side of the application, in order:

+ **Toggle Assistant** - Turns the assitant cube on and off.
+ **New Game** - Loads a new starting configuration.
+ **Reset Board** - Clears the value from every non-starting cell.
+ **Save Starting Cells** - Gives _Starting Cell_ status to all non-empty cells
+ **Clear Board** - Clears all values and removes _starting cell_ status from all starting cells.

###Assistant

The assistant shows the possible entries that can be made into the gameboard depending on its current state.
Each level of the assistant represents a particular value, so the lowest level (closest to the gameboard) represnets all of the **1**'s that can currently be entered into the board.
The next level represents all of the **2**'s that can be currently entered into the board, _etc_.
Each vertical stack of cubes represents all of the values that can be currently entered into the cell directly beneath it.
The assistant also shows cells which are guaranteed certainties and if there are any errors within the current solution.
Read the assistant cubes as:

+ **White** - Live possibility could be right, could be wrong.
+ **Green** - Guaranteed Certainty, _based on the current gameboard state_.
+ **Blue Wireframe** - Dead Possibility, this value can not be enetered into the associated gameboard cell.
+ **Red** - Error, if there are red cells in the assistant the game is in an insolvable state and will require entries to be removed in order to continue playing to completion.

**Red** Error cells always appear in groups, this is because the information doesn't ever relate to one particular cell/value combination.
The way to read an Error message from the assistant is, for example, if the **i th** row of the **k th** plane above the board was showing **Red** cells, this would be saying that row **i** of the gameboard does not contain the value **k** and of its empty cells non of them can accept the value **k**, therefore the game is insolvable.
Error messages can be given for **Row**, **Column**, **SubGrid** and **Individual Cell**.
When an individual cell contains a stack of red cubes above it, this means that that particular cell is empty and there are no possibilities left alive which could be entered into it.

####Clickable cubes

Live possibility cubes, **White** and **Green**, are included in click hit tests. clicking on a live cube will automatically select the relevant gameboard cell beneath it. Double clicking on a live possibility cube will automaticall enter the value that cell represents into the relevant gamboard cell.
