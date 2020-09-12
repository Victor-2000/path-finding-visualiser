//let nodes;
let availableNodes = [];
let depth = 0;

const PRIM_SPEED = 100;

//Function which sets everything up before calling the maze generator
function createMazePrim() {
  if (isMazeDone === true) {
    isMazeDone = false;
    depth = 0;
    maxDepth = 0;
    setAllWalls();
    // Not a natural flow because it erases all the nodes which requires 2s in total
    setTimeout(() => {
      maxDepth = 0;
      generateMazePrim();
      setTimeout(() => {
        isMazeDone = true;
      }, (WALL_DRAW_SPEED / PRIM_SPEED) * maxDepth); //You need to figure this one out
    }, 1000);
  }
}

function generateMazePrim() {
  let firstNodeRow = randomGenerator(MAX_ROW);
  let firstNodeCol = randomGenerator(MAX_COL);

  while (!isValidCoord(firstNodeCol, firstNodeRow)) {
    firstNodeRow = randomGenerator(MAX_ROW);
    firstNodeCol = randomGenerator(MAX_COL);
  }

  availableNodes.push(nodes[firstNodeCol - 1][firstNodeRow - 1]);

  while (availableNodes.length != 0) {
    let randomIndex = randomGenerator(availableNodes.length);
    let currentNode = availableNodes[randomIndex];

    availableNodes.splice(randomIndex, 1);

    activateNode(currentNode);
  }
  for (let col = 0; col < MAX_COL; col++) {
    for (let row = 0; row < MAX_ROW; row++) {
      nodes[col][row].isVisited = false;
    }
  }
}

function activateNode(node) {
  depth += 2;
  if (maxDepth < depth) {
    maxDepth = depth;
  }
  setTimeout(() => {
    resetWallNode(node);
  }, (WALL_DRAW_SPEED / PRIM_SPEED) * depth);
  if (node.wallPair != "none") {
    setTimeout(() => {
      resetWallNode(node.wallPair);
      node.wallPair = "none";
    }, (WALL_DRAW_SPEED / PRIM_SPEED) * (depth - 1));
  }
  for (let i = 0; i < 4; i++) {
    let newRow = node.row + directions[i][1] * 2;
    let newCol = node.col + directions[i][0] * 2;
    if (
      isValidCoord(newCol, newRow) &&
      !nodes[newCol - 1][newRow - 1].isVisited
    ) {
      nodes[newCol - 1][newRow - 1].wallPair =
        nodes[node.col + directions[i][0] - 1][node.row + directions[i][1] - 1];
      nodes[newCol - 1][newRow - 1].isVisited = true;
      availableNodes.push(nodes[newCol - 1][newRow - 1]);
    }
  }
}
