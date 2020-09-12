// Bear in mind that we import nodes[][], MAX_ROW, MAX_COL from main.js

let maxDepth = 0;

//Function which sets everything up before calling the maze generator
function createMazeRecursive() {
  if (isMazeDone === true) {
    isMazeDone = false;
    clearGrid();
    maxDepth = 0;
    generateMazeRecursive(
      [0, 0],
      [MAX_COL, MAX_ROW],
      chooseOrientation(MAX_COL, MAX_ROW),
      1
    );
    let speed = 2000 + WALL_DRAW_SPEED * (maxDepth + 2);
    setTimeout(() => {
      isMazeDone = true;
    }, speed);
  }
}

//topCoords = [col,row] the coordinate in the top left corner of the rectangle, botCoords (bottom right)
function generateMazeRecursive(topCoords, botCoords, orientation, depth) {
  let width = botCoords[0] - topCoords[0];
  let height = botCoords[1] - topCoords[1];

  if (height <= SPACING || width <= SPACING) {
    return;
  }

  if (depth > maxDepth) {
    maxDepth = depth + 1;
  }

  let chosenCol = randomGenerator(width - 1) + topCoords[0];
  let chosenRow = randomGenerator(height - 1) + topCoords[1];

  if (orientation === "horizontal") {
    if (chosenRow === topCoords[1]) {
      chosenRow++;
    }

    for (let col = topCoords[0]; col < botCoords[0]; col++) {
      setTimeout(() => {
        setWall(nodes[col][chosenRow]);
      }, WALL_DRAW_SPEED * depth);
    }

    let nextHeight = chosenRow - topCoords[1];
    generateMazeRecursive(
      topCoords,
      [botCoords[0], chosenRow],
      chooseOrientation(width, nextHeight),
      depth + 1
    );
    generateMazeRecursive(
      [topCoords[0], chosenRow + 1],
      botCoords,
      chooseOrientation(width, nextHeight),
      depth + 1
    );
    setTimeout(() => {
      while (
        nodes[chosenCol][chosenRow - 1].isWall ||
        nodes[chosenCol][chosenRow + 1].isWall
      ) {
        chosenCol = randomGenerator(width) + topCoords[0];
      }
      resetWallNode(nodes[chosenCol][chosenRow]);
    }, WALL_DRAW_SPEED * maxDepth);
  } else if (orientation === "vertical") {
    if (chosenCol === topCoords[0]) {
      chosenCol++;
    }
    for (let row = topCoords[1]; row < botCoords[1]; row++) {
      setTimeout(() => {
        setWall(nodes[chosenCol][row]);
      }, WALL_DRAW_SPEED * depth);
    }

    let nextWidth = chosenCol - topCoords[0];
    generateMazeRecursive(
      topCoords,
      [chosenCol, botCoords[1]],
      chooseOrientation(nextWidth, height),
      depth + 1
    );
    generateMazeRecursive(
      [chosenCol + 1, topCoords[1]],
      botCoords,
      chooseOrientation(nextWidth, height),
      depth + 1
    );
    setTimeout(() => {
      while (
        nodes[chosenCol - 1][chosenRow].isWall ||
        nodes[chosenCol + 1][chosenRow].isWall
      ) {
        chosenRow = randomGenerator(height) + topCoords[1];
      }
      resetWallNode(nodes[chosenCol][chosenRow]);
    }, WALL_DRAW_SPEED * maxDepth);
  }
}

//Helper function which randomizes the direction of moving
function chooseOrientation(width, height) {
  if (width < height) {
    return "horizontal";
  } else if (height < width) {
    return "vertical";
  } else {
    return randomGenerator(2) === 0 ? "horizontal" : "vertical";
  }
}
