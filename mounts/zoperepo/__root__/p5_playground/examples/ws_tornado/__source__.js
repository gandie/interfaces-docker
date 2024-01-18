// p5js - "tornado taz" visuals demo, weboscket

// Intended to give an example on how to work with websocket data similar
// to the stickman ws example, but with more interesting curves between
// somehow arbitrary joints

// Settings
var SCENE_WIDTH = 800
var SCENE_HEIGHT = 600
var FPS = 100

// edginess, green color value and alpha are calculated via z-coordinate
// differences of lines defined below
// use these values for scaling and tinkering on the effect of z-axis
// differences
var edginess_scale = 10 // high value: bezier slowly becomes a line
var green_scale = 300 // color intensity z-axis differences "sensibility"
var alpha_scale = 1000 // lower value: only draw/highlight high z-axis differences 

// time-based red color scaling
var step_red_scale = 250

// derived from
// https://github.com/google/mediapipe/blob/master/docs/solutions/pose.md
// ... but connected in "nonhuman" way ( e.g. nose and ankles aka 0: [27, 28] )
var curve_map = {
  0 : [27, 28],
  9 : [10],
  11: [12, 25, 27],
  12: [26, 28],
  13: [14, 27],
  14: [28],
  27: [28],
  15: [16, 27],
  16: [28],
  25: [26],
}

var raw_data
var cur_data

// Adjust IP to your local network IP of interfaces server
let my_ws_uri = "ws://192.168.178.130:4242"
let my_websocket = new WebSocket(my_ws_uri);

my_websocket.addEventListener("message", (event) => {
    raw_data = JSON.parse(event.data);
    cur_data = raw_data.payload
});

// make sure the following line remains unchanged!
sketch = function(p) {

  p.setup = function() { 
    p.createCanvas(SCENE_WIDTH, SCENE_HEIGHT)
    p.background('black')
    p.frameRate(FPS)
  }

  p.draw = function() {

    // background
    p.noStroke()
    p.fill(0, 1)
  	p.rect(0, 0, SCENE_WIDTH, SCENE_HEIGHT)


    // fetch current data_chunk aka frame
    let data_chunk = cur_data //DATA[index]

    // early exit data check
    if (!data_chunk || data_chunk.keypoints) {
      //p.noLoop()
      return
    }

    // loop to create taz body from curve_map
    for (let first_bpindex in curve_map) {
      let point_list = curve_map[first_bpindex]
      for (let pindex in point_list) {
        let second_bpindex = point_list[pindex]

        let first_point = data_chunk[0][first_bpindex]
        let second_point = data_chunk[0][second_bpindex]
  
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
        let red = step_red_scale - z_abs * step_red_scale

        p.stroke(red, green, 0, alpha)

        p.bezier(
          x1, y1,
          x1 + (SCENE_WIDTH / edginess), y1 + (SCENE_HEIGHT / edginess),
          x2 - (SCENE_WIDTH / edginess), y2 + (SCENE_HEIGHT / edginess),
          x2, y2
        )
      }
    }

  }

};

// make sure the following line remains unchanged!
stage = new p5(sketch, 'p5_stage')
