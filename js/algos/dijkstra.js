function dijkstra() {
  if (pathDrawn === true) {
    time = 1000;
    restartNodes();
  } else {
    time = 0;
    restartVisits();
  }

  setTimeout(() => {
    let pQueue = [];
    let visitedNodes = [];
    let visitedNodesDivs = [];
    isWithLinks = true;

    for (let col = 0; col < MAX_COL; col++) {
      for (let row = 0; row < MAX_ROW; row++) {
        nodes[col][row].distance = Infinity;
        nodes[col][row].lastNode = "none";
        if (!nodes[col][row].isWeight) {
          nodes[col][row].weight = 1;
        }
      }
    }

    pQueue.push(startNode);

    startNode.distance = 0;

    found = false;

    while (pQueue.length != 0 && !found) {
      pQueue.sort((a, b) => {
        return a.distance - b.distance;
      });

      let u = pQueue[0];

      if (u === finalNode) {
        found = true;
        break;
      }

      for (let i = 0; i < 4; i++) {
        let col = u.col + directions[i][0];
        let row = u.row + directions[i][1];

        if (isValidCoord(col, row) && !nodes[col - 1][row - 1].isWall) {
          let alt = u.weight + u.distance;
          let v = nodes[col - 1][row - 1];
          if (alt < v.distance) {
            v.distance = alt;
            v.lastNode = u;
            if (pQueue.indexOf(v) === -1) {
              pQueue.push(v);
              visitedNodes.push(v);
            }
          }
        }
      }
      pQueue.shift();
    }

    visitedNodes.sort((a, b) => {
      return a.distance - b.distance;
    });

    for (let i = 0; i < visitedNodes.length; i++) {
      visitedNodesDivs.push(visitedNodes[i].div);
    }

    if (finalNode.distance === Infinity) {
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
  }, time);
}
