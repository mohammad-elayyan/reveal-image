var stages = [];
var isDrawing = [];
var drawingCanvases = [];
var oldPts = [];
var oldMidPts = [];
var topImages = [];
var bottomImages = [];
var bitmaps = [];
var maskFilters = [];
var cursors = [];
var texts = [];
var cursorPaths = [
  "./assets/images/ca.png",
  "./assets/images/wa.png",
  "./assets/images/wo.png",
];
var imagePaths = [
  { top: "./assets/images/ca1.png", bottom: "./assets/images/ca0.png" },
  { top: "./assets/images/wa1.png", bottom: "./assets/images/wa0.png" },
  { top: "./assets/images/wo1.png", bottom: "./assets/images/wo0.png" },
];

function init() {
  for (let i = 0; i < 3; i++) {
    stages[i] = new createjs.Stage(`canvas${i + 1}`);
    isDrawing[i] = false;
    drawingCanvases[i] = new createjs.Shape();
    oldPts[i] = null;
    oldMidPts[i] = null;
    topImages[i] = new Image();
    bottomImages[i] = new Image();

    topImages[i].onload = handleComplete(i);
    bottomImages[i].onload = handleComplete(i);

    topImages[i].src = imagePaths[i].top; // Replace with the path to your top images
    bottomImages[i].src = imagePaths[i].bottom; // Replace with the path to your bottom images
  }
}

var imagesLoaded = [0, 0, 0];
function handleComplete(index) {
  return function () {
    imagesLoaded[index]++;
    if (imagesLoaded[index] === 2) {
      setupStage(index);
    }
  };
}

function setupStage(index) {
  createjs.Touch.enable(stages[index]);
  stages[index].enableMouseOver();

  const canvasWidth = stages[index].canvas.width;
  const canvasHeight = stages[index].canvas.height;
  const imageWidth = topImages[index].width;
  const imageHeight = topImages[index].height;

  stages[index].addEventListener("stagemousedown", handleMouseDown(index));
  stages[index].addEventListener("stagemouseup", handleMouseUp(index));
  stages[index].addEventListener("stagemousemove", handleMouseMove(index));
  stages[index].addEventListener("mouseleave", handleMouseLeave(index));
  stages[index].addEventListener("mouseenter", handleMouseEnter(index));

  drawingCanvases[index].cache(
    0,
    0,
    topImages[index].width,
    topImages[index].height
  );

  bitmaps[index] = new createjs.Bitmap(topImages[index]);
  maskFilters[index] = new createjs.AlphaMaskFilter(
    drawingCanvases[index].cacheCanvas
  );

  const scaleWidth = canvasWidth / imageWidth;
  const scaleHeight = canvasHeight / imageHeight;
  let scale = Math.min(scaleWidth, scaleHeight);

  bitmaps[index].scaleX = scale - 0.28;
  bitmaps[index].scaleY = scale - 0.28;

  bitmaps[index].x = (canvasWidth - imageWidth * (scale - 0.14)) / 2;
  bitmaps[index].y = (canvasHeight - imageHeight * (scale - 0.1)) / 2;

  bitmaps[index].filters = [maskFilters[index]];
  bitmaps[index].cache(0, 0, topImages[index].width, topImages[index].height);

  var bottomBitmap = new createjs.Bitmap(bottomImages[index]);

  bottomBitmap.cache(
    0,
    0,
    bottomImages[index].width,
    bottomImages[index].height
  );
  bottomBitmap.scaleX = scale - 0.28;
  bottomBitmap.scaleY = scale - 0.28;

  bottomBitmap.x = (canvasWidth - imageWidth * (scale - 0.14)) / 2;
  bottomBitmap.y = (canvasHeight - imageHeight * (scale - 0.108)) / 2;

  //   texts[index] = new createjs.Text(
  //     "Click and Drag to Reveal the Hidden Image.",
  //     "14px Arial",
  //     "#000"
  //   );
  //   texts[index].set({
  //     x: stages[index].canvas.width / 2,
  //     y: stages[index].canvas.height - 20,
  //   });
  //   texts[index].textAlign = "center";
  stages[index].addChild(bottomBitmap, bitmaps[index]);

  cursors[index] = new createjs.Bitmap(cursorPaths[index]);

  cursors[index].cursor = "pointer";
  stages[index].addChild(cursors[index]);

  stages[index].update();
}

function handleMouseDown(index) {
  return function (event) {
    oldPts[index] = new createjs.Point(
      stages[index].mouseX,
      stages[index].mouseY
    );
    oldMidPts[index] = oldPts[index];
    isDrawing[index] = true;
  };
}

function handleMouseMove(index) {
  return function (event) {
    cursors[index].x = stages[index].mouseX;
    cursors[index].y = stages[index].mouseY;

    if (!isDrawing[index]) {
      stages[index].update();
      return;
    }

    var midPoint = new createjs.Point(
      (oldPts[index].x + stages[index].mouseX) >> 1,
      (oldPts[index].y + stages[index].mouseY) >> 1
    );

    drawingCanvases[index].graphics
      .clear()
      .setStrokeStyle(70, "round", "round")
      .beginStroke("rgba(0,0,0,0.2)")
      .moveTo(midPoint.x, midPoint.y)
      .curveTo(
        oldPts[index].x,
        oldPts[index].y,
        oldMidPts[index].x,
        oldMidPts[index].y
      );

    oldPts[index].x = stages[index].mouseX;
    oldPts[index].y = stages[index].mouseY;

    oldMidPts[index].x = midPoint.x;
    oldMidPts[index].y = midPoint.y;

    drawingCanvases[index].updateCache("source-over");
    bitmaps[index].updateCache();

    stages[index].update();
  };
}

function handleMouseUp(index) {
  return function (event) {
    isDrawing[index] = false;
  };
}
function handleMouseLeave(index) {
  return function (event) {
    document.body.style.cursor = "initial";
    stages[index].removeChild(cursors[index]);

    stages[index].update();
  };
}
function handleMouseEnter(index) {
  return function (event) {
    document.body.style.cursor = "none";
    stages[index].addChild(cursors[index]);

    stages[index].update();
  };
}
