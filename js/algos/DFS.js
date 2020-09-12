// Bear in mind that we import nodes[][], MAX_ROW, MAX_COL from main.js
let found = false;
let visitedNodesDivs = [];
let nodeLog = [];
function startDFS() {
  if (pathDrawn === true) {
    time = 1000;
    restartNodes();
  } else {
    time = 0;
    restartVisits();
  }
  setTimeout(() => {
    visitedNodesDivs = [];
    finalNode.isVisited = false;
    found = false;
    if (!DFS(startNode.col, startNode.row, 0)) {
      if (sameGrid === false) {
        restartNodes();
        alert("You can't get to the final node!");
        impossiblePath = true;
      }
      if (impossiblePath) {
        restartNodes();
        impossiblePath = false;
      }
    } else {
      sameGrid = true;
      colorNodes(visitedNodesDivs);
      restartFinished = false;
    }
  }, time); // 1s from restart nodes
}

//Transform it in the fully heuristic one
function DFS(col, row, distance) {
  if (found) {
    return true;
  }
  let currentNode = nodes[col - 1][row - 1];
  if (
    currentNode.div.firstChild != null &&
    currentNode.div.firstChild.className == "node-visited"
  ) {
    return false;
  }

  currentNode.distance = distance;
  currentNode.isVisited = true;

  if (currentNode.isInitial === false) {
    currentNode.isVisited = true;
    visitedNodesDivs.push(currentNode.div);
  }
  let existPath = true;
  while (existPath) {
    let smallest = Infinity;
    let smallestIndex = -1;
    let used = [false, false, false, false];
    for (let i = 0; i < directions.length; i++) {
      if (isValidCoord(col + directions[i][0], row + directions[i][1])) {
        let nextNode =
          nodes[col + directions[i][0] - 1][row + directions[i][1] - 1];
        if (
          nextNode.isVisited === false &&
          nextNode.isWall === false &&
          used[i] === false
        ) {
          let current = calcMahDist(
            col + directions[i][0],
            row + directions[i][1]
          );
          if (current < smallest) {
            smallest = current;
            smallestIndex = i;
          }
        }
      }
    }

    if (smallestIndex === -1) {
      return false;
    }
    used[smallestIndex] = true;

    let newRow = row + directions[smallestIndex][1];
    let newCol = col + directions[smallestIndex][0];
    let nextNode = nodes[newCol - 1][newRow - 1];
    if (isValidCoord(newCol, newRow)) {
      if (nextNode.isVisited === false && nextNode.isWall === false) {
        if (nextNode.isFinal === true) {
          found = true;
          break;
        }
        nextNode.isVisited = true;
        DFS(newCol, newRow, distance + 1);
        if (found) {
          return true;
        }
      }
    }
    existPath = false;
    for (let i = 0; i < 4; i++) {
      if (
        isValidCoord(col + directions[i][0], row + directions[i][1]) &&
        nodes[col + directions[i][0] - 1][row + directions[i][1] - 1]
          .isVisited === false &&
        nodes[col + directions[i][0] - 1][row + directions[i][1] - 1].isWall ===
          false &&
        used[i] === false
      ) {
        existPath = true;
      }
    }
  }
}
