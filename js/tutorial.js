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
