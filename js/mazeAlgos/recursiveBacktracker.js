const BACKTRACKER_SPEED = 2;

function decideDirection(node) {
  let availableDirections = [];

  for (let i = 0; i < 4; i++) {
    let nextRow = node.row + directions[i][0] * 2;
    let nextCol = node.col + directions[i][1] * 2;
    if (isValidCoord(nextCol, nextRow)) {
      if (nodes[nextCol - 1][nextRow - 1].isVisited === false) {
        availableDirections.push(directions[i]);
      }
    }
  }

  if (availableDirections.length === 0) {
    return "none";
  }

  return availableDirections[randomGenerator(availableDirections.length)];
}

function backtrack(col, row, depth) {
  let direction = decideDirection(nodes[col - 1][row - 1]);
  nodes[col - 1][row - 1].isVisited = true;
  let directionSaver = [];
  //Stopping case
  if (direction === "none") {
    return;
  }
  while (direction != "none") {
    if (depth > maxDepth) {
      maxDepth = depth;
    }

    directionSaver.push(direction);

    //Call
    backtrack(col + direction[1] * 2, row + direction[0] * 2, depth + 1);

    direction = decideDirection(nodes[col - 1][row - 1]);
  }

  //Action
  setTimeout(() => {
    for (let counter = 0; counter < directionSaver.length; counter++) {
      resetWallNode(
        nodes[col + directionSaver[counter][1] - 1][
          row + directionSaver[counter][0] - 1
        ]
      );
      resetWallNode(
        nodes[col + directionSaver[counter][1] * 2 - 1][
          row + directionSaver[counter][0] * 2 - 1
        ]
      );
    }
  }, (WALL_DRAW_SPEED / BACKTRACKER_SPEED) * depth);
}

function createMazeBacktrack() {
  if (isMazeDone === true) {
    isMazeDone = false;
    setAllWalls();
    setTimeout(() => {
      maxDepth = 0;
      let randRow = randomGenerator(MAX_ROW);
      let randCol = randomGenerator(MAX_COL);
      while (!isValidCoord(randCol, randRow)) {
        randRow = randomGenerator(MAX_ROW);
        randCol = randomGenerator(MAX_COL);
      }
      resetWallNode(nodes[randCol - 1][randRow - 1]);
      nodes[randCol - 1][randRow - 1].isVisited = true;
      backtrack(randCol, randRow, 1);
      setTimeout(() => {
        isMazeDone = true;
      }, (WALL_DRAW_SPEED / BACKTRACKER_SPEED) * maxDepth); //1s timeout to get the walls erased

      for (let col = 0; col < MAX_COL; col++) {
        for (let row = 0; row < MAX_ROW; row++) {
          nodes[col][row].isVisited = false;
        }
      }
    }, 1000);
  }
}
