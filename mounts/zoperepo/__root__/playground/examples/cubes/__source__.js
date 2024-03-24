// p5js 3d cube example

// rework of stickman example into 3d cubes, created on Interfaces workshop
// on 2023-06-24 at Kunstverein Hannover

// Settings
var FPS = 100
var SCENE_WIDTH = 500
var SCENE_HEIGHT = 500

// derived from
// https://github.com/google/mediapipe/blob/master/docs/solutions/pose.md
// we map our joints against connected joints via indexes to draw lines from it
// feel free to mess around with this mapping to create interesting results,
// this basically represents the stickman, maybe u want something else?
var line_map = {
  0 : [1, 4],
  1 : [2],
  2 : [3],
  3 : [7],
  4 : [5],
  5 : [6],
  6 : [8],
  9 : [10],
  11: [12, 13, 23],
  12: [14, 24],
  13: [15],
  14: [16],
  15: [17, 19, 21],
  16: [18, 20, 22],
  17: [19],
  18: [20],
  23: [24, 25],
  24: [26],
  25: [27],
  26: [28],
  27: [29, 31],
  28: [30, 32],
}

// basic function to find a joint by index from given frame
// use this as a template to create a function to return joints u desire to use
function find_by_bpindex(frame, bpindex, joint_type) {
  for (let joint_index in frame) {
    let joint = frame[joint_index]
    if ((joint.index == bpindex) && (joint.type == joint_type)) {
      return joint
    }
  }
  //console.log("Warning! No matching joint found!")
}

// make sure the following line remains unchanged!
sketch = function(p) {

  // basic loop index to loop over DATA in draw() method
  var index = 0;

  p.setup = function() {
    p.createCanvas(SCENE_WIDTH, SCENE_HEIGHT, p.WEBGL)
    p.background('white')
    p.frameRate(FPS)
  }

  p.draw = function() {

    let myscale = 4

    // fetch current data_chunk aka frame
    let data_chunk = DATA[index]

    let nose = find_by_bpindex(data_chunk, 0, "body")

    if (nose) {
        p.camera(SCENE_WIDTH * myscale, SCENE_HEIGHT * myscale, 1000, nose.x, nose.y, nose.z);
    }
    //p.orbitControl();

    // early exit data check
    if (!data_chunk || data_chunk.keypoints) {
      //console.log("Incompatible / broken data, aborting ...")
      //console.log("This sketch is only compatible to BlazePose framewise scans")
      //console.log("Will not work on tensorflowJS records!")
      p.noLoop()
      return
    }

    // loop to create stickman body from line_map
    for (let first_bpindex in line_map) {
      let point_list = line_map[first_bpindex]
      for (let pindex in point_list) {
        let second_bpindex = point_list[pindex]
        let first_point = find_by_bpindex(data_chunk, first_bpindex, "body")
        let second_point = find_by_bpindex(data_chunk, second_bpindex, "body")

        // make sure we've found useful data, skip if not found
        if (!first_point || !second_point) {
          continue
        }

        // make sure to multiply normalized coordinates to get correct coordinates
        let x1 = first_point.x * SCENE_WIDTH * myscale
        let x2 = second_point.x * SCENE_WIDTH * myscale
        let y1 = first_point.y * SCENE_HEIGHT * myscale
        let y2 = second_point.y * SCENE_HEIGHT* myscale

        let z1 = first_point.z * SCENE_WIDTH * myscale
        let z2 = second_point.z * SCENE_WIDTH * myscale

        p.push()
        p.translate(x1, y1, z1)
        p.rotateX(((x2 - x1) / SCENE_WIDTH) * 90)
        p.rotateY(((y2 - y1) / SCENE_HEIGHT) * 90)
        p.box()
        p.pop()

        p.push()
        p.translate(x2, y2, z2)
        p.rotateX(((x2 - x1) / SCENE_WIDTH) * -90)
        p.rotateY(((y2 - y1) / SCENE_HEIGHT) * 90)
        p.box()
        p.pop()

      }
    }

    // loop over DATA via index variable
    if (index > DATA.length) {
      // no more DATA left, stop draw()-Loop
      p.noLoop()
    } else {
      // increment index for next run of draw() to create next frame
      index++
    }

  }

};

// make sure the following line remains unchanged!
stage = new p5(sketch, 'p5_stage')
