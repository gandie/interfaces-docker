// p5js r1b2 example

// SETTINGS/ VARIABLES START

var LIVEMODE = false;
var EPHEMERAL = false;
var EPHEMERAL_ALPHA = 10; // 0-255. lower = longer lasting persistence
var FPS = 50;
var SCENE_SCALE = 1;
var SCENE_WIDTH = 800 * SCENE_SCALE;
var SCENE_HEIGHT = 600 * SCENE_SCALE;

var PALETTES = [
  ["Autumn Rhythm", '#d3b893', ['#e3ded640', '#100d0340', '#99846040', '#99846040', '#4a4b5440', '#85756640', '#21211d40']],
  ["Number 1", '#e4caa8', ['#d2aa3440', '#30393d40', '#fff1d540', '#428e9440', '#f7ccc840', '#5c1a1440', '#10624440']],
  ["Number 18", '#a0a18f', ['#08090440', '#a7161b40', '#b0914140', '#eadbdc40', '#27494b40', '#c88e7a40', '#0a0a0840']],
  ["Dune", '#0c0606', ['#ab252640', '#e4712040', '#f8b21c40', '#e5761f40', '#d8513b40', '#fcea7340', '#35131440']],
  ["Reversion", '#cdd2d6', ['#00149140', '#efbb0d40', '#03010240', '#5e8aaf40', '#9c53bf20', '#b1262340', '#098d5e40']],
  ["The Abyss", '#06060c', ['#006d7740', '#83c5be40', '#edf6f940', '#05052040', '#05052040', '#00000040', '#f0f0f040']],
  ["Luncheon On The Grass", '#f0f0f0', ["#150F1840", "#44301A40", "#6F451C40", "#B0211340", "#E58D2A40", "#E2A53240", "#ADABC240"]],
  ["Kandinsky", '#f0f0f0', ["#80948640", "#194B6D40", "#D7100E40", "#11121940", "#D9771C40", "#59231940", "#EDE5DA40"]]
];

var JOINTS = [
  "LEFT_INDEX",
  "RIGHT_INDEX",
  "LEFT_ELBOW",
  "RIGHT_ELBOW",
  "LEFT_HIP",
  "LEFT_WRIST",
  "RIGHT_WRIST"
];

var PALETTE;
var DATA;
var SUBDATA;
var PAINTLINES;
var DRIPS = [];

// basic loop index to loop over DATA in draw() method
var index = 0;

// SETTINGS/ VARIABLES END

// HELPER FUNCTIONS START

// helper functions which may live outside of the sketch scope
// as they don't rely on p5 components ( call stuff from p namespace )

// https://github.com/google/mediapipe/blob/master/docs/solutions/pose.md
function findJoinByName(frameidx, name)
{
  let frame = DATA[frameidx];
  for (let joint_index in frame)
  {
    let joint = frame[joint_index];
    if (joint.name == name)
    {
      return joint;
    }
  }
  //console.log("index not found", frameidx, name);
  return false;
}

// https://www.desmos.com/calculator/1930qsv4kw
function parabolaInterpolator(y0, y1, y2)
{
  var a = (y2 - 2 * y1 + y0) / 2;
  var b = (y1 - y0 - a);
  return (x) => a * x * x + b * x + y0;
}

function getJointPosition(frame, jointnr)
{
  if (LIVEMODE)
  {
    let idx = findJoinByName(frame, JOINTS[jointnr]);
    return [idx.x, idx.y];
  }
  else
  {
    return [SUBDATA[frame][2 * jointnr], SUBDATA[frame][2 * jointnr + 1]];
  }
}

// HELPER FUNCTIONS END

// MAIN PART START

// create our sketch environment and wrap all p5-related stuff in it
// this is done to encapsulate the p5 namespace ( behind "p." ) and
// to plug it into the p5 stage at the p5 playground

sketch = function(p) {

  function randomizeColor(c)
  {
    var c0 = p.color(c);
    var r = p.random(-30, 30);
    return p.color(p.red(c0) + r, p.green(c0) + r, p.blue(c0) + r, p.alpha(c0));
  }

  class Drip
  {

    constructor(color, x, y, dx, dy, weight)
    {
      this.color = color;
      this.x = x;
      this.y = y;
      this.dx = dx;
      this.dy = dy;
      this.weight = weight;
      this.k = 2.0;
    }

    update()
    {
      var k = p.random(0.5, 1);
      this.x += p.random(-4, 4) / SCENE_WIDTH + k * this.dx;
      this.y += p.random(-4, 4) / SCENE_HEIGHT + k * this.dy;
      p.fill(randomizeColor(this.color));
      p.noStroke();
      p.circle(this.x * SCENE_WIDTH, this.y * SCENE_HEIGHT, this.weight * this.k);
      this.k *= 0.95;
      ////console.log(this.k);
      return (this.k >= 0.5);
    }

  }

  class PaintLine
  {

    constructor(color, x, y)
    {
      this.color = color;
      this.x = x;
      this.y = y;
      this.x2 = x;
      this.y2 = y;
      this.weight = SCENE_SCALE;
      this.speed2 = 0;
    }

    directionChangedX(x)
    {
      return (this.x - x) * (this.x - this.x2) > 0;
    }

    directionChangedY(y)
    {
      return (this.y - y) * (this.y - this.y2) > 0;
    }

    move(x, y)
    {

      // compute parabola interpolation
      var px = parabolaInterpolator(this.x2, this.x, x);
      var py = parabolaInterpolator(this.y2, this.y, y);

      var dx = x - this.x;
      var dy = y - this.y;
      var speed2 = dx * dx + dy * dy;
      if (speed2 < 0.00000001)
      {
        var ndrops = p.random(1, 3);
        for (var i = 0; i < ndrops; ++i)
        {
          DRIPS.push(
            new Drip(
              this.color,
              x + p.random(-1, 1) / SCENE_WIDTH,
              y + p.random(-1, 1) / SCENE_HEIGHT,
              0.0,
              p.random(1.0, 2.0) / SCENE_HEIGHT,
              p.random(4, 10.0) * SCENE_SCALE
            )
          );
        }
      }
      else if (speed2 > 400 / (SCENE_WIDTH * SCENE_WIDTH))
      {
        if (this.directionChangedX(x) || this.directionChangedY(y))
        {
          var ndrops = p.random(4, 18);
          for (var i = 0; i < ndrops; ++i)
          {
            var r = p.random(1.0, 2.0);
            DRIPS.push(
              new Drip(
                this.color,
                px(1.1 + 0.25 * r),
                py(1.1 + 0.25 * r),
                0.1 * dx, 0.1 * dy,
                r * SCENE_SCALE
              )
            );
          }
        }
      }
      else if (speed2 < 0.0125 * this.speed2)
      {
        if (p.random() < 0.5)
        {
          for (var i = 0; i < 8; ++i)
          {
            DRIPS.push(
              new Drip(
                this.color,
                x + p.random(-20, 20) / SCENE_WIDTH,
                y + p.random(-20, 20) / SCENE_WIDTH,
                p.random(3.0, 4.0)
              )
            );
          }
        }
      }

      this.speed2 = speed2;

      var weight = (10 - 0.2 * 800 * (p.pow(speed2, 0.3)));
      if (weight < 1.5) weight = 1.5;
      weight *= p.random(0.5, 1.5);
      this.weight = 0.5 * this.weight + 0.5 * weight;
      p.strokeWeight(this.weight * SCENE_SCALE);
      p.stroke(randomizeColor(this.color));
      p.noFill();

      var prevx = this.x;
      var prevy = this.y;
      for (var i = 1; i <= 10; ++i)
      {
        var newx = px(1.0 + i * 0.1);
        var newy = py(1.0 + i * 0.1);
        p.line(
          prevx * SCENE_WIDTH,
          prevy * SCENE_HEIGHT,
          newx * SCENE_WIDTH,
          newy * SCENE_HEIGHT
        );
        prevx = newx; prevy = newy;
      }

      this.x2 = this.x;
      this.y2 = this.y;
      this.x = x;
      this.y = y;
    }
  }



  p.setup = function()
  {
    PALETTE = PALETTES[(0.5 + p.random() * (PALETTES.length - 1)) | 0];
    p.createCanvas(SCENE_WIDTH, SCENE_HEIGHT, p.P2D);

    p.clear();
    p.background(PALETTE[1]);
    p.frameRate(FPS);

    // compute the x/y range to center the artwork
    if (!LIVEMODE)
    {
      SUBDATA = [];
      var xrange = [1.0, 0.0];
      var yrange = [1.0, 0.0];

      var rangeCheck = (x, y) => {
        if (x < xrange[0]) xrange[0] = x;
        if (x > xrange[1]) xrange[1] = x;
        if (y < yrange[0]) yrange[0] = y;
        if (y > yrange[1]) yrange[1] = y;
      };

      //console.log("parsing");
      for (var i = 0; i < DATA.length; ++i)
      {
        let data_chunk = DATA[i];

        // early exit data check
        if (!data_chunk || data_chunk.keypoints)
        {
          //console.log("Incompatible / broken data, aborting ...");
          //console.log("This sketch is only compatible to BlazePose framewise scans");
          //console.log("Will not work on tensorflowJS records!");
          break;
        }


        var nextFrame = [];
        for (var j = 0; j < JOINTS.length; ++j)
        {
          let idx = findJoinByName(i, JOINTS[j]);
          if (idx)
          {
            nextFrame.push(idx.x);
            nextFrame.push(idx.y);
            rangeCheck(idx.x, idx.y);
          }
          else
          {
            nextFrame = [];
            break;
          }
        }
        if (nextFrame.length) SUBDATA.push(nextFrame);
      }

      // recenter SUBDATA
      // 0.3....0.6 => 0.35...0.65, dx=0.5-0.9/2 = 0.05
      var kx = 0.8 / (xrange[1] - xrange[0]);
      var ky = 0.8 / (yrange[1] - yrange[0]);

      var dx = 0.5 - kx * (xrange[1] + xrange[0]) / 2;
      var dy = 0.5 - ky * (yrange[1] + yrange[0]) / 2;
      for (var i = 0; i < SUBDATA.length; ++i)
      {
        SUBDATA[i][0] = SUBDATA[i][0] * kx + dx;
        SUBDATA[i][2] = SUBDATA[i][2] * kx + dx;
        SUBDATA[i][4] = SUBDATA[i][4] * kx + dx;
        SUBDATA[i][1] = SUBDATA[i][1] * ky + dy;
        SUBDATA[i][3] = SUBDATA[i][3] * ky + dy;
        SUBDATA[i][5] = SUBDATA[i][5] * ky + dy;
      }
    }
    PAINTLINES = [];
    var colors = PALETTE[2];
    for (var i = 0; i < colors.length; ++i)
    {
      var [x, y] = getJointPosition(0, i);
      PAINTLINES.push(new PaintLine(colors[i], x, y));
    }
    index = 0;
  }

  p.draw = function() {

    if (EPHEMERAL)
    {
      var bg = p.color(PALETTE[1]);
      bg.setAlpha(EPHEMERAL_ALPHA);
      p.fill(bg);
      rect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
    }

    const nframes = LIVEMODE ? DATA.length : SUBDATA.length;

    index++;

    if (index >= nframes)
    {
      if (!EPHEMERAL || index >= nframes + 200) p.noLoop();
      return;
    }

    for (var i = 0; i < PAINTLINES.length; ++i)
    {
      let [x, y] = getJointPosition(index, i);
      PAINTLINES[i].move(x, y);
    }

    var i = 0;
    while (i < DRIPS.length)
    {
      if (DRIPS[i].update()) i++;
      else DRIPS.splice(i, 1);
    }

  }

}

// make sure the following line remains unchanged!
stage = new p5(sketch, 'p5_stage')
