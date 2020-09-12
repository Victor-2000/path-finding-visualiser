let sets = [];
let availableWalls = [];
const BREADTH = 4;
const KRUSKAL_SPEED = 1;

//Function which sets everything up before calling the maze generator
function createMazeKruskal() {
  if (isMazeDone === true) {
    isMazeDone = false;
    setAllWalls();
    // Not a natural flow because it erases all the nodes which requires 2s in total
    setTimeout(() => {
      let speed = (WALL_DRAW_SPEED / KRUSKAL_SPEED) * maxDepth;
      maxDepth = 0;
      addAllAvailableWalls();
      generateMazeKruskal();
      setTimeout(() => {
        isMazeDone = true;
      }, speed); //You need to figure this one out
    }, 1000);
  }
}

//Generates the maze using Kruskal's algorithm
function generateMazeKruskal() {
  let depth = 0;
  while (availableWalls.length != 0) {
    depth++;
    if (depth > maxDepth) {
      maxDepth = depth;
    }

    let randIndex;
    for (let i = 0; i < BREADTH; i++) {
      if (availableWalls.length === 0) {
        break;
      }

      randIndex = randomGenerator(availableWalls.length);
      decideWallAction(availableWalls[randIndex]);
      availableWalls = removeArrayElementbyIndex(availableWalls, randIndex);
    }
  }
}

// Adds all walls in the availableWallsList
function addAllAvailableWalls() {
  for (let row = 0; row < MAX_ROW; row++) {
    for (let col = 0; col < MAX_COL; col++) {
      if (nodes[col][row].isWall) {
        if (row % 2 === 0 || col % 2 === 0) {
          availableWalls.push(nodes[col][row]);
        } else {
          nodes[col][row].setNo = sets.length;
          sets.push([nodes[col][row]]);
        }
      }
    }
  }
  startNode.setNo = sets.length;
  sets.push([startNode]);
  finalNode.setNo = sets.length;
  sets.push([finalNode]);
}

//Joins 2 disjoint sets
function joinSets(set1, set2) {
  if (set1.length === 1) {
    setTimeout(() => {
      resetWallNode(set1[0]);
    }, (maxDepth * WALL_DRAW_SPEED) / KRUSKAL_SPEED);
  }

  if (set2.length === 1) {
    setTimeout(() => {
      resetWallNode(set2[0]);
    }, (maxDepth * WALL_DRAW_SPEED) / KRUSKAL_SPEED);
  }

  for (let i = 0; i < set1.length; i++) {
    set2.push(set1[i]);
    set1[i].setNo = set2[0].setNo;
  }

  sets = removeArrayElement(sets, set1);
  sets = replaceArrayElement(sets, set2, set2[0].setNo);
}

//Decides if the wall is allowed to join 2 sets and joins them using the above function
function decideWallAction(wall) {
  let node1;
  let node2;

  if (wall.col % 2 === 0) {
    if (
      isValidCoord(wall.col, wall.row + 1) &&
      isValidCoord(wall.col, wall.row - 1)
    ) {
      node1 = nodes[wall.col - 1][wall.row];
      node2 = nodes[wall.col - 1][wall.row - 2];
    } else {
      return;
    }
  } else {
    if (
      isValidCoord(wall.col + 1, wall.row) &&
      isValidCoord(wall.col - 1, wall.row)
    ) {
      node1 = nodes[wall.col][wall.row - 1];
      node2 = nodes[wall.col - 2][wall.row - 1];
    } else {
      return;
    }
  }

  if (
    node1.setNo != node2.setNo &&
    node1.setNo != Infinity &&
    node2.setNo != Infinity
  ) {
    setTimeout(() => {
      resetWallNode(wall);
    }, (WALL_DRAW_SPEED / KRUSKAL_SPEED) * maxDepth);
    joinSets(sets[node1.setNo], sets[node2.setNo]);
  }
}
