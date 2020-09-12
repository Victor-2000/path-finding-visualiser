let isSwarm = false;
let seedNodeFin;
let seedNodeStart;

function callSwarm() {
  isSwarm = true;
  SBFS();
}

function SBFS() {
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
      let queueFin = [];
      let found = false;

      queue.push(startNode);
      queueFin.push(finalNode);

      let visitedNodesDivs = [];
      let initial = true;
      while (!found && queue.length != 0 && queueFin.length != 0) {
        let top = peek(queue);
        let topFin = peek(queueFin);
        if (topFin.swarmNo === 0) {
          queueFin.shift();
        }
        top.swarmNo = 0;
        topFin.swarmNo = 1;
        if (initial == true) {
          top.distance = 0;
          top.isVisited = true;
          topFin.distance = 1000;
          topFin.isVisited = true;
          initial = false;
        }
        for (let i = 0; i < directions.length; i++) {
          let row = top.row + directions[i][0];
          let col = top.col + directions[i][1];

          //Initial queue scan
          if (isValidCoord(col, row) === true) {
            let nextNode = nodes[col - 1][row - 1];
            if (nextNode.isVisited === true) {
              if (nextNode.swarmNo === 1) {
                found = true;
                seedNodeFin = nextNode;
                seedNodeStart = top;
              }
            } else if (
              nextNode.isVisited === false &&
              nextNode.isWall === false
            ) {
              queue.push(nextNode);
              nextNode.isVisited = true;
              if (top != startNode) {
                nextNode.lastNode = top;
              }
              visitedNodesDivs.push(nextNode.div);
              nextNode.distance = top.distance + 1;
            }
          }

          if (found != true) {
            let rowFin = topFin.row + directions[i][0];
            let colFin = topFin.col + directions[i][1];

            //Final queue scan
            if (isValidCoord(colFin, rowFin) === true) {
              let nextNode = nodes[colFin - 1][rowFin - 1];
              if (nextNode.isVisited === true) {
                if (nextNode.swarmNo === 0) {
                  found = true;
                  seedNodeStart = nextNode;
                  seedNodeFin = topFin;
                }
              } else if (
                nextNode.isVisited === false &&
                nextNode.isWall === false
              ) {
                queueFin.push(nextNode);
                nextNode.isVisited = true;
                if (topFin != finalNode) {
                  nextNode.lastNode = topFin;
                }
                visitedNodesDivs.push(nextNode.div);
                nextNode.distance = topFin.distance - 1;
              }
            }
          }
        }
        queue.shift();
        queueFin.shift();
      }
      if (queue.length === 0 || queueFin.length === 0) {
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
