//MAIN.JS

//Constants
const MAX_COL = 50;
const MAX_ROW = 20;
const START_COL = 5;
const FIN_COL = 45;
const START_ROW = 10;
const FIN_ROW = 10;
const GRADIENT = 0.5; // The change rate in the gradient
const GRID = document.querySelector("#grid");
const WALL_DRAW_SPEED = 10;
const SPACING = 2;
let SPEED = 1; //the lower the faster (the wave propagation speed)
let WEIGHT = 50; //the number of steps required 1 weight block

//Very useful for navigation in the grid
const directions = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

var startNode;
var finalNode;
var intermediaryNode;
let intermediaryMode = false;
let isSecondStep = false;
let pathDrawn = false;
let sliderUsed = false;
let nodes = [];
let restartTimeouts = [];
let paintMode = "none"; //none, erase, paint, moveInitial, moveFinal, moveIntermediary, paintWeight
let sameGrid = true;
let finished = true;
let restartFinished = true;
let wave = 0;
let impossiblePath = false;
let isWithLinks = false;

let weightMode = false;

//Maze stuff
let isMazeDone = true;

let dropdowns = document.querySelectorAll(".dropdown");
let dropdownIsOpen = [];
let dropdownTimeoutDone = [];
for (let i = 0; i < dropdowns.length; i++) {
  dropdownIsOpen.push(false);
  dropdownTimeoutDone.push(true);
}

for (let i = 0; i < dropdowns.length; i++) {
  dropdowns[i].onmousedown = () => {
    if (dropdownIsOpen[i] === true) {
      if (sliderUsed === false) {
        closeDropdown(i);
      } else {
        sliderUsed = false;
      }
    } else if (dropdownTimeoutDone[i] === true) {
      closeAllDropdowns(i);
      openDropdown(i);
      sliderUsed = false;
    }
  };
}

document.querySelector("#grid").onmousedown = () => {
  for (let i = 0; i < dropdowns.length; i++) {
    closeDropdown(i);
  }
};

document.querySelector(".range-slider").onmousedown = () => {
  enterSliderMode();
};

document.querySelector(".range-slider").onmousemove = () => {
  let sliderVal = document.querySelector("#slider-value");
  sliderVal.innerHTML = document.querySelector(".range-slider").value;
  let value = document.querySelector(".range-slider").value;
  let leftValue = 3.85 + value / 10;

  sliderVal.style["left"] = `${leftValue}vw`;
  WEIGHT = parseInt(value) + 1;
};

function enterSliderMode() {
  sliderUsed = true;
}

function closeDropdown(index) {
  dropdownIsOpen[index] = false;
  dropdowns[index].querySelector(".dropdown-header").style["background-color"] =
    "rgb(55, 55, 182)";
  dropdowns[index].querySelector(".dropdown-header").style[
    "border-top-left-radius"
  ] = "0px";
  dropdowns[index].querySelector(".dropdown-header").style[
    "border-top-right-radius"
  ] = "0px";
  dropdowns[index].querySelector(".arrow-pannel").style["animation-name"] =
    "spin2";
  dropdowns[index].querySelector(".dropdown-content").style["animation-name"] =
    "dissappear";
  dropdowns[index].querySelector(".dropdown-content").style["opacity"] = 0;
  dropdownTimeoutDone[index] = false;
  setTimeout(() => {
    dropdowns[index].querySelector(".arrow-pannel").style["-ms-transform"] =
      "rotate(0deg)";
    dropdowns[index].querySelector(".arrow-pannel").style["transform"] =
      "rotate(0deg)";
    dropdowns[index].querySelector(".dropdown-content").style["display"] =
      "none";
    dropdownTimeoutDone[index] = true;
  }, 400);
}

function closeAllDropdowns(except) {
  for (let j = 0; j < dropdowns.length; j++) {
    if (dropdownIsOpen[j] && j != except) {
      closeDropdown(j);
    }
  }
}

function activateCheckBox() {
  let checked = document.querySelector(".switch input").checked;
  document.querySelector(".switch input").checked = !checked;
  toggleWeightMode();
}

function openDropdown(index) {
  dropdownIsOpen[index] = true;
  dropdowns[index].querySelector(".dropdown-header").style["background-color"] =
    "rgb(72, 72, 184)";
  dropdowns[index].querySelector(".dropdown-header").style[
    "border-top-left-radius"
  ] = "max(5vw, 5vh)";
  dropdowns[index].querySelector(".dropdown-header").style[
    "border-top-right-radius"
  ] = "max(5vw, 5vh)";
  dropdowns[index].querySelector(".arrow-pannel").style["animation-name"] =
    "spin";
  dropdowns[index].querySelector(".dropdown-content").style["animation-name"] =
    "appear";
  dropdowns[index].querySelector(".dropdown-content").style["opacity"] = 100;
  dropdowns[index].querySelector(".dropdown-content").style["display"] =
    "block";

  setTimeout(() => {
    dropdowns[index].querySelector(".arrow-pannel").style["-ms-transform"] =
      "rotate(180deg)";
    dropdowns[index].querySelector(".arrow-pannel").style["transform"] =
      "rotate(180deg)";
  }, 400);
}

//When you get out of the grid and release your mouse there you get out of paint mode
getOutOfPaintMode();
function getOutOfPaintMode() {
  document.querySelector("body").onmouseup = () => {
    if (
      paintMode === "paint" ||
      paintMode === "erase" ||
      paintMode === "paintWeight" ||
      paintMode === "eraseWeight"
    ) {
      paintMode = "none";
    }
  };

  document.querySelector("body").onmouseleave = () => {
    if (
      paintMode === "paint" ||
      paintMode === "erase" ||
      paintMode === "paintWeight" ||
      paintMode === "eraseWeight"
    ) {
      paintMode = "none";
    }
  };
}

function toggleIntermediary() {
  if (intermediaryMode) {
    removeIntermediary();
    intermediaryMode = false;
  } else {
    paintMode = "moveIntermediary";
    intermediaryMode = true;
  }
}

function removeIntermediary() {
  if (paintMode === "moveIntermediary") {
    paintMode = "none";
  }
  for (let col = 0; col < MAX_COL; col++) {
    for (let row = 0; row < MAX_ROW; row++) {
      if (nodes[col][row].isIntermediary) {
        nodes[col][row].div.firstChild.style["animation-name"] = "shrink";
        nodes[col][row].div.firstChild.style["animation-duration"] = "0.6s";
        setTimeout(() => {
          resetIntermediaryNode(nodes[col][row]);
        }, 600);
      }
    }
  }
}

//Draws the grid and creates a node array in which we have all the neccesary info about the nodes in the grid
function drawGrid() {
  for (let col = 1; col <= MAX_COL; col++) {
    var tableRow = document.createElement("div");
    var nodes_row = [];
    tableRow.classList = "row";
    for (let row = 1; row <= MAX_ROW; row++) {
      var nodeDiv = document.createElement("div");
      var additionalClass = "";
      var isFinal = false;
      var isInitial = false;
      if (col == START_COL && row == START_ROW) {
        let div = document.createElement("div");
        div.className = "node-start";
        nodeDiv.appendChild(div);
        isInitial = true;
      } else if (col == FIN_COL && row == FIN_ROW) {
        let div = document.createElement("div");
        div.className = "node-finish";
        nodeDiv.appendChild(div);
        isFinal = true;
      }

      //The node object and its elements NODE SPECIFICATIONS
      var node = {
        col,
        row,
        Value: Infinity,
        isFinal,
        isInitial,
        isIntermediary: false,
        div: nodeDiv,
        isVisited: false,
        isWall: false,
        lastIsWall: false,
        distance: Infinity,
        setNo: Infinity,
        wallPair: "none",
        isWeight: false,
        weight: 0,
        swarmNo: -1,
        lastNode: "none",
        distanceLeft: Infinity,
      };

      if (node.isInitial) {
        startNode = node;
      } else if (node.isFinal) {
        finalNode = node;
      } else if (node.isIntermediary) {
        intermediaryNode = node;
      }
      nodeDiv.classList = `node${additionalClass}`;
      nodes_row.push(node);
      tableRow.appendChild(nodeDiv);
    }
    GRID.appendChild(tableRow);
    nodes.push(nodes_row);
    for (let row = 1; row <= MAX_ROW; row++) {
      nodes[col - 1][row - 1].div.draggable = false;
      nodes[col - 1][row - 1].div.onmousedown = () => {
        if (
          nodes[col - 1][row - 1].isFinal ||
          nodes[col - 1][row - 1].isInitial ||
          nodes[col - 1][row - 1].isIntermediary
        ) {
          if (nodes[col - 1][row - 1].isInitial) {
            if (paintMode === "none") {
              paintMode = "moveInitial";
            } else if (paintMode === "moveInitial") {
              paintMode = "none";
            }
          } else if (nodes[col - 1][row - 1].isFinal) {
            if (paintMode === "none") {
              paintMode = "moveFinal";
            } else if (paintMode === "moveFinal") {
              paintMode = "none";
            }
          } else if (nodes[col - 1][row - 1].isIntermediary) {
            if (paintMode === "none") {
              paintMode = "moveIntermediary";
            } else if (paintMode === "moveIntermediary") {
              paintMode = "none";
            }
          }
        } else {
          if (
            nodes[col - 1][row - 1].isWeight ||
            nodes[col - 1][row - 1].isWall
          ) {
            paintMode = "erase";
            resetWallNode(nodes[col - 1][row - 1]);
            resetWeight(nodes[col - 1][row - 1]);
          } else if (weightMode) {
            paintMode = "paintWeight";
            setWeight(nodes[col - 1][row - 1]);
          } else {
            paintMode = "paint";
            setWall(nodes[col - 1][row - 1]);
          }
        }
      };

      nodes[col - 1][row - 1].div.onmouseleave = () => {
        if (
          paintMode === "moveInitial" &&
          !nodes[col - 1][row - 1].isFinal &&
          !nodes[col - 1][row - 1].isIntermediary
        ) {
          resetInitialNode(nodes[col - 1][row - 1]);
        } else if (
          paintMode === "moveFinal" &&
          !nodes[col - 1][row - 1].isInitial &&
          !nodes[col - 1][row - 1].isIntermediary
        ) {
          resetFinalNode(nodes[col - 1][row - 1]);
        } else if (
          paintMode === "moveIntermediary" &&
          !nodes[col - 1][row - 1].isInitial &&
          !nodes[col - 1][row - 1].isFinal
        ) {
          resetIntermediaryNode(nodes[col - 1][row - 1]);
        }
      };

      nodes[col - 1][row - 1].div.onmouseenter = () => {
        if (paintMode === "paint") {
          setWall(nodes[col - 1][row - 1]);
        } else if (paintMode === "paintWeight") {
          setWeight(nodes[col - 1][row - 1]);
        } else if (paintMode === "erase") {
          resetWallNode(nodes[col - 1][row - 1]);
          resetWeight(nodes[col - 1][row - 1]);
        } else if (
          paintMode === "moveInitial" &&
          !nodes[col - 1][row - 1].isFinal &&
          !nodes[col - 1][row - 1].isIntermediary
        ) {
          setToInitialNode(nodes[col - 1][row - 1]);
        } else if (
          paintMode === "moveFinal" &&
          !nodes[col - 1][row - 1].isInitial &&
          !nodes[col - 1][row - 1].isIntermediary
        ) {
          setToFinalNode(nodes[col - 1][row - 1]);
        } else if (
          paintMode === "moveIntermediary" &&
          !nodes[col - 1][row - 1].isInitial &&
          !nodes[col - 1][row - 1].isFinal
        ) {
          setToIntermediaryNode(nodes[col - 1][row - 1]);
        }
      };

      nodes[col - 1][row - 1].div.onmouseup = () => {
        if (
          paintMode === "paint" ||
          paintMode === "erase" ||
          paintMode === "paintWeight" ||
          paintMode === "eraseWeight"
        ) {
          paintMode = "none";
        }
      };

      nodes[col - 1][row - 1].div.onmouseup = () => {
        if (
          paintMode === "paint" ||
          paintMode === "erase" ||
          paintMode === "paintWeight" ||
          paintMode === "eraseWeight"
        ) {
          paintMode = "none";
        }
      };

      nodes[col - 1][row - 1].div.onmouseup = () => {
        if (
          paintMode === "paint" ||
          paintMode === "erase" ||
          paintMode === "paintWeight" ||
          paintMode === "eraseWeight"
        ) {
          paintMode = "none";
        }
      };
    }
  }
}

function toggleWeightMode() {
  weightMode = !weightMode;
}

function setToInitialNode(node) {
  let weight = node.weight;
  restartNodes();
  node.weight = weight;
  startNode = node;
  node.isInitial = true;
  node.lastIsWall = node.isWall;
  node.isWall = false;
  let div = document.createElement("div");
  div.className = "node-start";
  node.div.appendChild(div);
}

function setToIntermediaryNode(node) {
  let weight = node.weight;
  restartNodes();
  node.weight = weight;
  intermediaryNode = node;
  node.isIntermediary = true;
  node.lastIsWall = node.isWall;
  node.isWall = false;
  let div = document.createElement("div");
  div.className = "node-intermediary";
  node.div.appendChild(div);
}

function setToFinalNode(node) {
  let weight = node.weight;
  restartNodes();
  node.weight = weight;
  finalNode = node;
  node.isFinal = true;
  node.lastIsWall = node.isWall;
  node.isWall = false;
  let div = document.createElement("div");
  div.className = "node-finish";
  node.div.appendChild(div);
}

function resetInitialNode(node) {
  node.isInitial = false;
  node.isWall = node.lastIsWall;
  node.div.innerHTML = "";
  if (node.isWall === true) {
    let wall = document.createElement("div");
    wall.className = "node node-wall";
    node.div.appendChild(wall);
  } else if (node.isWeight === true) {
    let weight = document.createElement("div");
    let weightValue = WEIGHT;
    if (node.weight > 1) {
      weightValue = node.weight;
    }
    weight.className = "node-weight";
    let red = 218 + weightValue / 3;
    let green = 161 - weightValue / 3;
    let blue = 109 - weightValue / 3;
    weight.style["background-color"] = `rgb( ${red}, ${green}, ${blue})`;
    node.div.appendChild(weight);
    node.weight = weightValue;
  }
}

function resetIntermediaryNode(node) {
  node.isIntermediary = false;
  node.isWall = node.lastIsWall;
  node.div.innerHTML = "";
  if (node.isWall === true) {
    let wall = document.createElement("div");
    wall.className = "node node-wall";
    node.div.appendChild(wall);
  } else if (node.isWeight === true) {
    let weight = document.createElement("div");
    let weightValue = WEIGHT;
    if (node.weight > 1) {
      weightValue = node.weight;
    }
    weight.className = "node-weight";
    let red = 218 + weightValue / 3;
    let green = 161 - weightValue / 3;
    let blue = 109 - weightValue / 3;
    weight.style["background-color"] = `rgb( ${red}, ${green}, ${blue})`;
    node.div.appendChild(weight);
    node.weight = weightValue;
  }
}

function resetFinalNode(node) {
  node.isFinal = false;
  node.isWall = node.lastIsWall;
  node.div.innerHTML = "";
  if (node.isWall === true) {
    let wall = document.createElement("div");
    wall.className = "node node-wall";
    node.div.appendChild(wall);
  } else if (node.isWeight === true) {
    let weight = document.createElement("div");
    let weightValue = WEIGHT;
    if (node.weight > 1) {
      weightValue = node.weight;
    }
    weight.className = "node-weight";
    let red = 218 + weightValue / 3;
    let green = 161 - weightValue / 3;
    let blue = 109 - weightValue / 3;
    weight.style["background-color"] = `rgb( ${red}, ${green}, ${blue})`;
    node.div.appendChild(weight);
    node.weight = weightValue;
  }
}

drawGrid();

function clearGrid() {
  clearAllWalls();
  clearAllWeights();
}

function clearAllWeights() {
  if (finished === true) {
    for (let col = 0; col < MAX_COL; col++) {
      for (let row = 0; row < MAX_ROW; row++) {
        resetWeight(nodes[col][row]);
      }
    }
    restartNodes();
  }
}

function clearAllWalls() {
  if (finished === true) {
    for (let col = 0; col < MAX_COL; col++) {
      for (let row = 0; row < MAX_ROW; row++) {
        resetWallNode(nodes[col][row]);
      }
    }
    restartNodes();
  }
}

function setAllWalls() {
  if (finished === true) {
    clearGrid();
    setTimeout(() => {
      for (let col = 0; col < MAX_COL; col++) {
        for (let row = 0; row < MAX_ROW; row++) {
          setWall(nodes[col][row]);
        }
      }
    }, 1000);
  }
}

//Creates a wall
function setWall(node) {
  if (
    node.isFinal === false &&
    node.isInitial === false &&
    node.isIntermediary === false &&
    node.isWall === false &&
    node.isWeight === false
  ) {
    if (sameGrid === true && finished === true) {
      sameGrid = false;
      restartNodes();
    }
    node.isWall = true;
    let wall = document.createElement("div");
    wall.className = "node node-wall";
    node.div.appendChild(wall);
  }
  return node;
}

//Creates a weight
function setWeight(node) {
  if (
    node.isFinal === false &&
    node.isIntermediary === false &&
    node.isInitial === false &&
    node.isWall === false &&
    node.isWeight === false
  ) {
    if (sameGrid === true && finished === true) {
      sameGrid = false;
      restartNodes();
    }
    node.isWeight = true;
    let weight = document.createElement("div");
    let weightValue = WEIGHT;
    if (node.weight > 1) {
      weightValue = node.weight;
    }
    weight.className = "node-weight";
    let red = 218 + weightValue / 3;
    let green = 161 - weightValue / 3;
    let blue = 109 - weightValue / 3;
    weight.style["background-color"] = `rgb( ${red}, ${green}, ${blue})`;
    node.div.appendChild(weight);
    node.weight = weightValue;
  }
  return node;
}

//Erases a wall
function resetWallNode(node) {
  if (
    node.isFinal === false &&
    node.isIntermediary === false &&
    node.isInitial === false &&
    node.isWall
  ) {
    if (sameGrid === true && finished === true) {
      sameGrid = false;
      restartNodes();
    }
    node.isWall = false;
    let children = node.div.children;
    for (let i = 0; i < children.length; i++) {
      if (children[i].className === "node node-wall") {
        children[i].style["animation-name"] = "shrink";
        children[i].style["width"] = "0px";
        children[i].style["height"] = "0px";
      }
    }
    setTimeout(() => {
      if (node.div.firstChild != undefined) {
        node.div.firstChild.remove();
      }
    }, 1000);
  }
  return node;
}

//Erases a weight
function resetWeight(node) {
  if (
    node.isFinal === false &&
    node.isIntermediary === false &&
    node.isInitial === false &&
    node.isWeight
  ) {
    if (sameGrid === true && finished === true) {
      sameGrid = false;
      restartNodes();
    }
    node.isWeight = false;
    let children = node.div.children;
    node.weight = 0;
    for (let i = 0; i < children.length; i++) {
      if (children[i].className === "node-weight") {
        children[i].style["animation-name"] = "shrink";
        children[i].style["width"] = "0px";
        children[i].style["height"] = "0px";
      }
    }
    setTimeout(() => {
      if (node.div.firstChild != undefined) {
        node.div.firstChild.remove();
      }
    }, 1000);
  }
  return node;
}

//Shows of all visited nodes
function colorNodes(divs) {
  if (restartFinished === true) {
    finished = false;
    let currentWave = wave;
    for (let i = 0; i < divs.length; i++) {
      let speed = SPEED;
      if (isAStar) {
        speed *= nodesOfDivs[i].distance / (i * 10);
      }
      setTimeout(() => {
        if (currentWave == wave) {
          let visitedNode = document.createElement("div");
          visitedNode.classList = "node-visited";
          divs[i].appendChild(visitedNode);
        }
        if (i == divs.length - 1) {
          createPath();
        }
      }, i * speed);
    }
  }
}

function createPath() {
  let directions = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ];
  let currentNode = finalNode;
  if (intermediaryMode && !isSecondStep) {
    currentNode = intermediaryNode;
  }
  let nextNode;
  let nodePath = [];
  startNode.distance = Infinity;
  if (isSwarm) {
    let finPath = [];
    let currentNode = seedNodeFin;
    while (currentNode != "none") {
      finPath.push(currentNode);
      currentNode = currentNode.lastNode;
    }

    for (let i = finPath.length - 1; i >= 0; i--) {
      nodePath.push(finPath[i]);
    }

    currentNode = seedNodeStart;
    while (currentNode != "none") {
      nodePath.push(currentNode);
      currentNode = currentNode.lastNode;
    }
  } else if (isWithLinks) {
    isWithLinks = false;
    let currentNode = finalNode;
    while (currentNode != "none") {
      nodePath.push(currentNode);
      currentNode = currentNode.lastNode;
    }
  } else {
    do {
      for (let i = 0; i < directions.length; i++) {
        let row = currentNode.row + directions[i][0];
        let col = currentNode.col + directions[i][1];
        if (
          isValidCoord(col, row) === true &&
          ((nodes[col - 1][row - 1].distance != Infinity &&
            currentNode.distance === Infinity) ||
            (currentNode.distance != Infinity &&
              nodes[col - 1][row - 1].distance < currentNode.distance))
        ) {
          nextNode = nodes[col - 1][row - 1];
        }
      }
      currentNode = nextNode;
      if (currentNode != undefined) {
        nodePath.push(currentNode);
      }
    } while (
      currentNode != undefined &&
      !currentNode.isFinal &&
      currentNode.distance != 1
    );
  }
  drawPath(nodePath);
}

function drawPath(nodePath) {
  let redGradient = 221;
  let greenGradient = 236;
  let blueGradient = 78;
  let count = 0;
  for (let i = nodePath.length - 1; i >= 0; i--) {
    count += 1;
    setTimeout(() => {
      finished = true;
      let path = document.createElement("div");
      path.className = "node-path";
      path.style[
        "background-color"
      ] = `rgb(${redGradient}, ${greenGradient}, ${blueGradient})`;
      redGradient += GRADIENT;
      greenGradient -= GRADIENT;
      blueGradient -= GRADIENT;
      nodePath[i].div.appendChild(path);
      pathDrawn = true;
    }, count * SPEED);
  }
  if (nodePath.length === 0) {
    finished = true;
    pathDrawn = true;
  }
  isSwarm = false;
  isWithLinks = false;
}

//Restarts the visited nodes to unvisited and erases their animations
function restartNodes() {
  if (pathDrawn === true) {
    pathDrawn = false;
    let counter = 0;
    wave++;
    restartFinished = false;
    for (let col = 0; col < MAX_COL; col++) {
      for (let row = 0; row < MAX_ROW; row++) {
        let node = nodes[col][row];
        node.isVisited = false;
        node.distance = Infinity;
        node.lastNode = "none";
        node.swarmNo = -1;

        if (node.div.firstChild != null) {
          let children = node.div.children;
          for (let i = 0; i < children.length; i++) {
            if (
              children[i].className === "node-visited" ||
              children[i].className === "node-path"
            ) {
              if (children[i].className === "node-path") {
                children[i].style["animation-name"] = "shrink";
                children[i].style["width"] = "0px";
                children[i].style["height"] = "0px";
              } else {
                children[i].style["animation-name"] = "fade";
                children[i].style["background-color"] = "rgba(18, 101, 156, 0)";
              }
              children[i].style["animation-duration"] = "1s";
              counter++;
            }
          }
          restartTimeouts.push(
            setTimeout(() => {
              restartFinished = true;
              counter--;
              let children = node.div.children;
              for (let i = 0; i < children.length; i++) {
                if (
                  children[i].className === "node-path" ||
                  children[i].className === "node-visited"
                ) {
                  children[i].remove();
                }
              }
            }, 700) //.7s taken from the css animation of the visited node
          );
          restartTimeouts.push(
            setTimeout(() => {
              restartFinished = true;
              counter--;
              let children = node.div.children;
              for (let i = 0; i < children.length; i++) {
                if (
                  children[i].className === "node-path" ||
                  children[i].className === "node-visited"
                ) {
                  children[i].remove();
                }
              }
              pathDrawn = false;
            }, 1000) //1s taken from the css animation of the visited node
          );
        }
      }
    }
    if (counter === 0) {
      restartFinished = true;
    }
  }
}

function restartVisits() {
  for (let col = 0; col < MAX_COL; col++) {
    for (let row = 0; row < MAX_ROW; row++) {
      nodes[col][row].isVisited = false;
      nodes[col][row].swarmNo = -1;
    }
  }
}

//All below is functionality stuff

//Checks if the row and col are valid coordinates in the grid
function isValidCoord(col, row) {
  if (row > MAX_ROW || row < 1 || col > MAX_COL || col < 1) {
    return false;
  }
  return true;
}

function randomGenerator(count) {
  return Math.floor(Math.random() * count);
}

function shuffleArray(array) {
  var m = array.length;
  var t;
  var i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

function removeArrayElementbyIndex(array, index) {
  if (index > -1) {
    array.splice(index, 1);
  }
  return array;
}

function removeArrayElement(array, element) {
  const index = array.indexOf(element);
  array[index] = "unavailable";
  return array;
}

function swap(val1, val2) {
  let aux = val2;
  val2 = val1;
  val1 = aux;
  return [val1, val2];
}

function replaceArrayElement(array, element, index) {
  swap(array[index], element);
  return array;
}

function calcMahDist(col, row) {
  return Math.abs(col - finalNode.col) + Math.abs(row - finalNode.row);
}

//END MAIN.JS

//TUTORIAL.JS

let pageCount = 1;

function showTutorial() {
  document.querySelector("#tutorial-background").style["animation-name"] =
    "appear";
  resetTutorial();
}

function hideTutorial() {
  document.querySelector("#tutorial-background").style["animation-name"] =
    "dissappear";
  setTimeout(() => {
    document.querySelector("#tutorial-background").style["display"] = "none";
  }, 300);
}

function pageDown() {
  pageCount--;
  document.querySelector("#pannel" + pageCount.toString()).style.display =
    "flex";
  document.querySelector("#pannel" + pageCount.toString()).style[
    "animation-name"
  ] = "appear";
  updatePageCount();
}

function pageUp() {
  document.querySelector("#pannel" + pageCount.toString()).style[
    "animation-name"
  ] = "dissappear";
  setTimeout(() => {
    if (pageCount < 4) {
      document.querySelector("#pannel" + pageCount.toString()).style.display =
        "none";
      pageCount++;
      updatePageCount();
    }
  }, 300);
}

function updatePageCount() {
  for (let i = 0; i < pageCounters.length; i++) {
    pageCounters[i].innerHTML = pageCount;
  }
}

let closeButtons = document.querySelectorAll("#close-button");
let leftButtons = document.querySelectorAll("#left");
let pageCounters = document.querySelectorAll("#page-count");
let rightButtons = document.querySelectorAll("#right");

setButtonFunctions();

function setButtonFunctions() {
  for (let i = 0; i < closeButtons.length; i++) {
    closeButtons[i].addEventListener("mouseup", () => {
      hideTutorial();
    });
  }
  for (let i = 0; i < leftButtons.length; i++) {
    if (isActivated(leftButtons[i])) {
      leftButtons[i].addEventListener("mouseup", () => {
        pageDown();
      });
    }
  }
  for (let i = 0; i < rightButtons.length; i++) {
    if (isActivated(rightButtons[i])) {
      rightButtons[i].addEventListener("mouseup", () => {
        pageUp();
      });
    }
  }
}

function isActivated(button) {
  return !button.classList.contains("deactivated");
}

function resetTutorial() {
  pageCount = 1;
  updatePageCount();

  document.querySelector("#tutorial-background").style.display = "flex";

  let pannels = document.querySelectorAll(".tutorial-pannel");

  for (let i = 0; i < pannels.length; i++) {
    pannels[i].style.display = "flex";
    pannels[i].style["animation-name"] = "none";
  }
}

//END TUTORIAL.JS

//BFS.JS

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

//END BFS.JS

//DFS.JS

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

//END DFS.JS

//SWARM.JS

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

//END SWARM.JS

//DIJKSTRA.JS

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

//END DIJKSTRA.JS

//ASTAR.JS

let HEURISTIC_MULTIPLIER = 1.1;

let isAStar = false;

let nodesOfDivs = [];

function aStar() {
  if (pathDrawn === true) {
    time = 1000;
    restartNodes();
  } else {
    time = 0;
    restartVisits();
  }

  setTimeout(() => {
    isAStar = true;

    //Do a modified Dijkstra for searching the right node
    let pQueue = [];
    let visitedNodes = [];
    let visitedNodesDivs = [];
    isWithLinks = true;

    for (let col = 0; col < MAX_COL; col++) {
      for (let row = 0; row < MAX_ROW; row++) {
        nodes[col][row].distance = Infinity;
        nodes[col][row].lastNode = "none";
        nodes[col][row].isVisited = false;
        nodes[col][row].distanceLeft = calcMahDist(
          nodes[col][row].col,
          nodes[col][row].row
        );
        if (!nodes[col][row].isWeight) {
          nodes[col][row].weight = 1;
        }
      }
    }

    pQueue.push(startNode);

    startNode.distance = startNode.distanceLeft;

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
          let v = nodes[col - 1][row - 1];
          let alt = u.distance - u.distanceLeft + v.distanceLeft + v.weight;
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

    nodesOfDivs = visitedNodes;

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
      isAStar = false;
    }
  }, time);
}

//END ASTAR.JS

//RECURSIVE.JS

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

//END RECURSIVE.JS

//RECURSIVEBACKTRACKER.JS

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

//END RECURSIVEBACKTRACKER.JS

//KRUSKAL.JS

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

//END KRUSKAL.JS

//PRIM.JS

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

//END PRIM.JS
