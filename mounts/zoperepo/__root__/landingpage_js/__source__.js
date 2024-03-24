const background_color = '#212529';
const FPS = 30;
const line_map = {
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
}

function create_sketch(data) {
    let sketch = function(p) {
        var index = 0;
        let canvas;

        p.windowResized = function() {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        }

        p.setup = function() { 
            // Feel free to alter setup method HERE!
            canvas = p.createCanvas(p.windowWidth, p.windowHeight);
            canvas.position(0, 0);
            canvas.style('z-index', '-1')
            p.background(background_color);
            p.frameRate(FPS);
        }
        
        p.draw = function() {
            p.clear();
            p.background(background_color);
            // fetch current data_chunk aka frame
            let data_chunk = data[index];
        
            // early exit data check
            if (!data_chunk || data_chunk.keypoints) {
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

                // make sure to multiply normalized coordinates to get correct coordinates p.windowWidth, p.windowHeight
                let x1 = first_point.x * p.windowWidth
                let x2 = second_point.x * p.windowWidth
                let y1 = first_point.y * p.windowHeight
                let y2 = second_point.y * p.windowHeight
                p.stroke('white')
                p.line(x1, y1, x2, y2)

              }
            }

            if (index >= data.length - 1) {
                index = 0;
            } else {
                index++
            }

        }
    }
    let stage = new p5(sketch, 'body');
}

$(function() {
    $.getJSON(
        'lib/assets/demo/kpop_short',
        create_sketch
    )
});
