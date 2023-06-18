var perlin_replacement = `// Perlin noise replacement example

// Slightly changed version of:
// https://github.com/kgolid/hedgehog/blob/master/sketch2.js

// Intended to sketch how to replace perlin noise values
// with choreo data

// simple function to fetch points from choreo record by name
// use this as a template to create a function to return joints u desire to use
function find_by_name(frame, name) {
    for (let joint_index in frame) {
        let joint = frame[joint_index]
        if (joint.name == name) {
            return joint
        }
    }
}

sketch = function(p) {

    // basic loop index to loop over DATA in draw() method 
    let index = 0;

    let width = 1000;
    let height = 1000;
    let offset = -100;
    let circular_shape = true;
  
    let flow_cell_size = 3;
    let number_of_layers = 1;
  
    let vertical_partitions = 1;
    let horizontal_partitions = 1;
  
    let vertical_shift = 200;
    let horizontal_shift = 400;
  
    let noise_size = 0.0008;
    let noise_radius = 0.01;
  
    let flow_width = (width + offset * 2) / flow_cell_size;
    let flow_height = (height + offset * 2) / flow_cell_size;
  
    let flow_grid = [];
  
    let data_chunk;

    p.setup = function() {
        p.createCanvas(width, height, p.SVG);
        p.smooth();
        p.noLoop();

        p.stroke(255, 40);
        p.strokeWeight(1);
    };

    p.draw = function() {

        p.background('#222');
        p.translate(-offset, -offset);
  
        data_chunk = DATA[index]

        // early exit data check
        if (!data_chunk || data_chunk.keypoints) {
            console.log("Incompatible / broken data, aborting ...")
            console.log("This sketch is only compatible to BlazePose framewise scans")
            console.log("Will not work on tensorflowJS records!")
            p.noLoop()
            return
        }

        for (var i = 0; i < number_of_layers; i++) {
            init_flow();
            display_flow(i);
        }

        // loop over DATA via index variable
        if (index > DATA.length) {
            p.noLoop()
        } else {
            index++
        }

    };
  
    function init_flow() {
      flow_grid = [];
      for (let i = 0; i < flow_height; i++) {
        let row = [];
        for (let j = 0; j < flow_width; j++) {
          row.push(
            calculate_flow(
              (j + vertical_shift * p.floor((vertical_partitions * j) / flow_height)) *
                noise_size,
              (i + horizontal_shift * p.floor((horizontal_partitions * i) / flow_width)) *
                noise_size,
              noise_radius
            )
          );
        }
        flow_grid.push(row);
      }
    }
  
    function calculate_flow(x, y, r) {
      let mean_arrow = p.createVector(0, 0);
      let radial_samples = 3;
      for (var i = 0; i < radial_samples; i++) {
        let angle = p.random(p.PI);
        let pos1 = p.createVector(x + p.cos(angle) * r, y + p.sin(angle) * r);
        let pos2 = p.createVector(x + p.cos(angle + p.PI) * r, y + p.sin(angle + p.PI) * r);

        // HACK START

        // Main difference to original:
        // Instead of picking values from perlin noise we use the x-position
        // of LEFT_SHOULDER and LEFT_ELBOW from our choreo record

        //let val1 = p.noise(noise_offset_x + pos1.x, noise_offset_y + pos1.y);
        //let val2 = p.noise(noise_offset_x + pos2.x, noise_offset_y + pos2.y);

        let elem1 = find_by_name(data_chunk, "LEFT_SHOULDER")
        let elem2 = find_by_name(data_chunk, "LEFT_ELBOW")

        let val1 = elem1.x
        let val2 = elem2.x;

        // HACK END

        let hilo = p5.Vector.sub(pos1, pos2)
          .normalize()
          .mult(val1 - val2);
  
        mean_arrow.add(hilo);
      }
      mean_arrow.div(radial_samples);
      mean_arrow.rotate(p.PI / 2);
      return mean_arrow;
    }
  
    function display_flow(col) {
      for (let i = 0; i < flow_grid.length; i++) {
        for (let j = 0; j < flow_grid[i].length; j++) {
          if (
            !circular_shape ||
            inside_radius(
              i - flow_grid.length / 2,
              j - flow_grid[i].length / 2,
              400 / flow_cell_size
            )
          ) {
            p.line(
              j * flow_cell_size,
              i * flow_cell_size,
              j * flow_cell_size + flow_grid[i][j].x * flow_cell_size * 2500,
              i * flow_cell_size + flow_grid[i][j].y * flow_cell_size * 2500
            );
          }
        }
      }
    }
  
    function inside_radius(x, y, r) {
      return p.sqrt(p.pow(x, 2) + p.pow(y, 2)) < r;
    }
  
};

// make sure the following line remains unchanged!
stage = new p5(sketch, 'p5_stage')
`

var stickman = `// p5js stickman example

// Intended to give an example on how to work with DATA and loop over each
// frame implicitly via draw()

// Settings
var FPS = 30
var SCENE_WIDTH = 1280
var SCENE_HEIGHT = 720

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

// derived from
// https://developers.google.com/mediapipe/solutions/vision/hand_landmarker#models
// same as line_map, but for hands instead of body
var hand_map = {
    0 : [1, 5, 17],
    1 : [2],
    2 : [3],
    3 : [4],
    5 : [6, 9],
    6 : [7],
    7 : [8],
    9 : [10, 13],
    10: [11],
    11: [12],
    13: [14, 17],
    14: [15],
    15: [16],
    17: [18],
    18: [19],
    19: [20],
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
  console.log("Warning! No matching joint found!")
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
    let data_chunk = DATA[index]

    // early exit data check
    if (!data_chunk || data_chunk.keypoints) {
      console.log("Incompatible / broken data, aborting ...")
      console.log("This sketch is only compatible to BlazePose framewise scans")
      console.log("Will not work on tensorflowJS records!")
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
        let x1 = first_point.x * SCENE_WIDTH
        let x2 = second_point.x * SCENE_WIDTH
        let y1 = first_point.y * SCENE_HEIGHT
        let y2 = second_point.y * SCENE_HEIGHT
  
        p.line(x1, y1, x2, y2)
  
      }
    }

    // loop to create stickman left hand from hand_map
    for (let first_bpindex in hand_map) {
      let point_list = hand_map[first_bpindex]
      for (let pindex in point_list) {
        let second_bpindex = point_list[pindex]
        let first_point = find_by_bpindex(data_chunk, first_bpindex, "left_hand")
        let second_point = find_by_bpindex(data_chunk, second_bpindex, "left_hand")
  
        // make sure we've found useful data, skip if not found
        if (!first_point || !second_point) {
          continue
        }
  
        // make sure to multiply normalized coordinates to get correct coordinates
        let x1 = first_point.x * SCENE_WIDTH
        let x2 = second_point.x * SCENE_WIDTH
        let y1 = first_point.y * SCENE_HEIGHT
        let y2 = second_point.y * SCENE_HEIGHT
  
        p.line(x1, y1, x2, y2)
  
      }
    }

    // loop to create stickman right hand from hand_map
    for (let first_bpindex in hand_map) {
      let point_list = hand_map[first_bpindex]
      for (let pindex in point_list) {
        let second_bpindex = point_list[pindex]
        let first_point = find_by_bpindex(data_chunk, first_bpindex, "right_hand")
        let second_point = find_by_bpindex(data_chunk, second_bpindex, "right_hand")
  
        // make sure we've found useful data, skip if not found
        if (!first_point || !second_point) {
          continue
        }
  
        // make sure to multiply normalized coordinates to get correct coordinates
        let x1 = first_point.x * SCENE_WIDTH
        let x2 = second_point.x * SCENE_WIDTH
        let y1 = first_point.y * SCENE_HEIGHT
        let y2 = second_point.y * SCENE_HEIGHT
  
        p.line(x1, y1, x2, y2)
  
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

`

var template = `// p5js template

// make sure the following line remains unchanged!
sketch = function(p) {

  // add more variables HERE if needed
  // access p5js library via "p." namespace!

  // basic loop index to loop over DATA in draw() method 
  var index = 0;

  p.setup = function() { 
    // Feel free to alter setup method HERE!
    p.createCanvas(640, 480, p.SVG);
    p.background(127);
  }

  p.draw = function() {

    // Add your drawing code HERE!

    // example to log one record from DATA in console
    console.log(DATA[index]);

    // example to loop over DATA via index variable
    if (index > DATA.length) {
      p.noLoop();  // stop when end of DATA is reached
    } else {
      index++;
    }

  }

};

// make sure the following line remains unchanged!
stage = new p5(sketch, 'p5_stage');
`

var ws_stickman = `// p5js websocket data stickman example

// Example on how to fetch frame data via websocket from live broadcast

// Settings
var FPS = 30
var SCENE_WIDTH = 1280
var SCENE_HEIGHT = 720

var raw_data
var cur_data

// remember to change following line to match your local interfaces server IP
let my_ws_uri = "ws://192.168.178.130:4242"
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
      console.log("Incompatible / broken data, aborting ...")
      return
    }

    // loop to create stickman body from line_map
    for (let first_bpindex in line_map) {
      let point_list = line_map[first_bpindex]
      for (let pindex in point_list) {
        let second_bpindex = point_list[pindex]
        let first_point = data_chunk[0][first_bpindex]
        let second_point = data_chunk[0][second_bpindex]
        console.log([first_bpindex, second_bpindex])
        console.log([first_point, second_point])
  
        // make sure we've found useful data, skip if not found
        if (!first_point || !second_point) {
          continue
        }
  
        // make sure to multiply normalized coordinates to get correct coordinates
        let x1 = first_point.x * SCENE_WIDTH
        let x2 = second_point.x * SCENE_WIDTH
        let y1 = first_point.y * SCENE_HEIGHT
        let y2 = second_point.y * SCENE_HEIGHT

        console.log([x1, y1, x2, y2])
        p.line(x1, y1, x2, y2)
  
      }
    }

  }

};

// make sure the following line remains unchanged!
stage = new p5(sketch, 'p5_stage')

`

var tornado = `// p5js - "tornado taz" visuals demo

// Intended to give an example on how to work with DATA similar
// to the stickman example, but with more interesting curves between
// somehow arbitrary joints

// Settings
var SCENE_WIDTH = 1000
var SCENE_HEIGHT = 600
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
  console.log("Warning! No matching joint found!")
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
      console.log("Incompatible / broken data, aborting ...")
      console.log("This sketch is only compatible to BlazePose framewise scans")
      console.log("Will not work on tensorflowJS records!")
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

`

var ws_tornado = `// p5js - "tornado taz" visuals demo, weboscket

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

`

var EXAMPLES = {
    template: template,
    stickman: stickman,
    perlin_replacement: perlin_replacement,
    ws_stickman: ws_stickman,
    tornado: tornado,
    ws_tornado: ws_tornado,
}