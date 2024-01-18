// Perlin noise replacement example

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
            //console.log("Incompatible / broken data, aborting ...")
            //console.log("This sketch is only compatible to BlazePose framewise scans")
            //console.log("Will not work on tensorflowJS records!")
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