// p5js websocket data stickman example

// Example on how to fetch frame data via websocket from live broadcast

// Settings
var FPS = 30
var SCENE_WIDTH = 1280
var SCENE_HEIGHT = 720

var raw_data
var cur_data

// remember to change following line to match your local interfaces server IP
let my_ws_uri = "ws://127.0.0.1:4242"
let my_websocket = new WebSocket(my_ws_uri);

my_websocket.addEventListener("message", (event) => {
    raw_data = JSON.parse(event.data);
    cur_data = raw_data.payload
});

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

// make sure the following line remains unchanged!
sketch = function(p) {

  // basic loop index to loop over DATA in draw() method 
  var index = 0;

  p.setup = function() { 
    p.createCanvas(SCENE_WIDTH, SCENE_HEIGHT, p.SVG)
    p.background('white')
    p.frameRate(FPS)
  }

  p.draw = function() {

    // reset canvas each frame - feel free to remove these two lines
    // for interesting results
    p.clear()
    p.background('white')

    // fetch current data_chunk aka frame
    let data_chunk = cur_data

    // early exit data check
    if (!data_chunk || data_chunk.keypoints) {
      //console.log("Incompatible / broken data, aborting ...")
      return
    }

    // loop to create stickman body from line_map
    for (let first_bpindex in line_map) {
      let point_list = line_map[first_bpindex]
      for (let pindex in point_list) {
        let second_bpindex = point_list[pindex]
        let first_point = data_chunk[0][first_bpindex]
        let second_point = data_chunk[0][second_bpindex]
        //console.log([first_bpindex, second_bpindex])
        //console.log([first_point, second_point])
  
        // make sure we've found useful data, skip if not found
        if (!first_point || !second_point) {
          continue
        }
  
        // make sure to multiply normalized coordinates to get correct coordinates
        let x1 = first_point.x * SCENE_WIDTH
        let x2 = second_point.x * SCENE_WIDTH
        let y1 = first_point.y * SCENE_HEIGHT
        let y2 = second_point.y * SCENE_HEIGHT

        //console.log([x1, y1, x2, y2])
        p.line(x1, y1, x2, y2)
  
      }
    }

  }

};

// make sure the following line remains unchanged!
stage = new p5(sketch, 'p5_stage')
