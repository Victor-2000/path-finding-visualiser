// Bear in mind that we import nodes[][], MAX_ROW, MAX_COL from main.js

function peek(queue) {
  return queue[0];
}

function BFS() {
  if (isMazeDone === true) {
    if (pathDrawn === true) {
      time = 1000;
      restartNodes();
    } else {
      time = 0;
      restartVisits();
    }

    setTimeout(() => {
      //For stack is 'pop' for queue is 'shift'
      let queue = [];
      let found = false;
      queue.push(startNode);

      let visitedNodesDivs = [];
      let initial = true;
      while (!found && queue.length != 0) {
        let top = peek(queue);
        if (initial == true) {
          top.distance = 0;
          initial = false;
        }
        for (let i = 0; i < directions.length; i++) {
          let row = top.row + directions[i][0];
          let col = top.col + directions[i][1];
          if (isValidCoord(col, row) === true) {
            let nextNode = nodes[col - 1][row - 1];
            if (nextNode.isVisited === false && nextNode.isWall === false) {
              if (nextNode.isFinal === true) {
                found = true;
              }
              queue.push(nextNode);
              nextNode.isVisited = true;
              visitedNodesDivs.push(nextNode.div);
              nextNode.distance = top.distance + 1;
            }
          }
        }
        queue.shift();
      }
      if (queue.length === 0) {
        if (sameGrid === false) {
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
      }
    }, time); // 1s from restart nodes
  }
}
