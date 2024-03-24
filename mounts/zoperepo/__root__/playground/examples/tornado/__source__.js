// p5js - "tornado taz" visuals demo

// Intended to give an example on how to work with DATA similar
// to the stickman example, but with more interesting curves between
// somehow arbitrary joints

// Settings
var SCENE_WIDTH = 640
var SCENE_HEIGHT = 480
var FPS = 100

// edginess, green color value and alpha are calculated via z-coordinate
// differences of lines defined below
// use these values for scaling and tinkering on the effect of z-axis
// differences
var edginess_scale = 40 // high value: bezier slowly becomes a line
var green_scale = 300 // color intensity z-axis differences "sensibility"
var alpha_scale = 400 // lower value: only draw/highlight high z-axis differences 

var start_frame = 0

// time-based red color scaling
var step_red_scale = 150

// we don't need each frame? use this to control frame step size
var step_size = 5  // higher value = use less frames for complete image

// precalcultate number of steps to be drawn
var steps = (DATA.length - start_frame) / step_size

// derived from
// https://github.com/google/mediapipe/blob/master/docs/solutions/pose.md
// ... but connected in "nonhuman" way ( e.g. nose and ankles aka 0: [27, 28] )
var curve_map = {
  0 : [27, 28],
  11: [12, 25, 27],
  12: [26, 28],
  13: [14, 27],
  14: [28],
  27: [28],
  15: [16, 27],
  16: [28],
  25: [26],
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

  // index to access DATA in draw() method 
  let index = start_frame

  // draw step counter
  let cur_step = 0

  p.setup = function() { 
    // for development considers removing SVG flag from next line
    p.createCanvas(SCENE_WIDTH, SCENE_HEIGHT, p.SVG)
    p.background('black')
    p.frameRate(FPS)
  }

  p.draw = function() {

    // background
    p.noStroke()
    p.fill(0, 1)
  	p.rect(0, 0, SCENE_WIDTH, SCENE_HEIGHT)

    // fetch current data_chunk aka frame
    let data_chunk = DATA[index]

    // early exit data check
    if (!data_chunk || data_chunk.keypoints) {
      //console.log("Incompatible / broken data, aborting ...")
      //console.log("This sketch is only compatible to BlazePose framewise scans")
      //console.log("Will not work on tensorflowJS records!")
      p.noLoop()
      return
    }

    // loop to create taz body from curve_map
    for (let first_bpindex in curve_map) {
      let point_list = curve_map[first_bpindex]
      for (let pindex in point_list) {
        let second_bpindex = point_list[pindex]
        let first_point = find_by_bpindex(data_chunk, first_bpindex, "body")
        let second_point = find_by_bpindex(data_chunk, second_bpindex, "body")
  
        // make sure we've found useful data, skip if not found
        if (!first_point || !second_point) {
          continue
        }
  
        // make sure to multiply normalized coordinates to get correct coordinates
        let x1 = first_point.x * SCENE_WIDTH
        let x2 = second_point.x * SCENE_WIDTH
        let y1 = first_point.y * SCENE_HEIGHT
        let y2 = second_point.y * SCENE_HEIGHT
  
        // z-axis difference calculations
        let z_dist = first_point.z - second_point.z
        let z_abs = p.abs(z_dist)
        let green = z_abs * green_scale
        let alpha = z_abs * alpha_scale
        let edginess = z_dist * edginess_scale

        // decrease red color by time passed
        let red = step_red_scale - (cur_step / steps) * step_red_scale

        p.stroke(red, green, 0, alpha)

        p.bezier(
          x1, y1,
          x1 + (SCENE_WIDTH / edginess), y1 + (SCENE_HEIGHT / edginess),
          x2 - (SCENE_WIDTH / edginess), y2 + (SCENE_HEIGHT / edginess),
          x2, y2
        )
      }
    }

    // loop over DATA via index variable
    if (index > DATA.length) {
      // no more DATA left, stop draw()-Loop
      p.noLoop()
    } else {
      // increment index for next run of draw() to create next frame
      index = index + step_size
      // ... also memorize real step count
      cur_step++
    }

  }

};

// make sure the following line remains unchanged!
stage = new p5(sketch, 'p5_stage')
