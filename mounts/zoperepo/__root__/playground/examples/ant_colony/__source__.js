// https://openprocessing.org/sketch/1678056 by Naoki Tsutae
// Inspired by Sage Jenson (https://cargocollective.com/sagejenson/physarum)

var antColor = new Uint8Array([255, 255, 255]);
var antsNum = 2750;
var sensorOffset = 25;
var clockwise = 15;
var counter = -15;
var stroke_width = 20;

sketch = function(p) {

    let index = 0;

    const ant = () => ({
        x: p.width / 2,
        y: p.height / 2,
        angle: p.random(360),
        step: p.random(2, 3),
    });

    const ants = {
        ants: [],
        
        init() {
            this.ants.length = 0;
            for (let i = antsNum; i--; ) this.ants.push(ant());
        },
        
        smell(a, d) {
            const aim = a.angle + d;
            let x = 0 | (a.x + sensorOffset * p.cos(aim));
            let y = 0 | (a.y + sensorOffset * p.sin(aim));
            x = (x + p.width) % p.width;
            y = (y + p.height) % p.height;
            
            const index = (x + y * p.width) * 4;
            return p.pixels[index]; // Only get red channel
        },
        
        updateAngle() {
            for (const a of this.ants) {
                const right = this.smell(a, clockwise),
                center = this.smell(a, 0),
                left = this.smell(a, counter);
                if (center > left && center > right) {
                /* Carry on straight */
                } else if (left < right) a.angle += clockwise;
                else if (left > right) a.angle += counter;
            }
        },
    
        updatePosition() {
            for (const a of this.ants) {
                a.x += p.cos(a.angle) * a.step;
                a.y += p.sin(a.angle) * a.step;
                a.x = (a.x + p.width) % p.width;
                a.y = (a.y + p.height) % p.height;
                
                const index = ((0 | a.x) + (0 | a.y) * p.width) * 4;
                p.pixels.set(antColor, index);
            }
        },
    };

    p.setup = function() {
        p.createCanvas(SCENE_WIDTH, SCENE_HEIGHT, p5_MODE);
        p.frameRate(FPS);
        p.angleMode(p.DEGREES);
        p.pixelDensity(1);
        p.background(0); // Initialize trail
        ants.init();
    }

    p.draw = function() {
        p.background(0, 5); // Update trail
        p.stroke(255);
        p.strokeWeight(stroke_width);

        if (!DATA) {
            return
        }

        if (!LIVEMODE) {
            let data_chunk = DATA[index];
            for (let joint of data_chunk) {
                p.line(
                    joint.x * SCENE_WIDTH,
                    joint.y * SCENE_HEIGHT,
                    joint.x * SCENE_WIDTH + 1,
                    joint.y * SCENE_HEIGHT + 1
                )
            }
            if (index < DATA.length - 1) {
                index++
            } else {
                index = 0
            }            
        } else {
            // in LIVEMODE we fetch our poses from global DATA
            for (let pose of DATA) {
                // attention! now we use "in" instead of "of"
                // to get the index instead of the element directly
                for (let joint_index in pose) {
                    let joint = pose[joint_index]
                    p.line(
                        joint.x * SCENE_WIDTH,
                        joint.y * SCENE_HEIGHT,
                        joint.x * SCENE_WIDTH + 1,
                        joint.y * SCENE_HEIGHT + 1
                    )
                }
            }
        }

        //p.mouseIsPressed && p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
        p.loadPixels();
        for (let i = 2; i--; ) {
            ants.updateAngle();
            ants.updatePosition();
        }
        p.updatePixels();
    }
}

// make sure the following line remains unchanged!
stage = new p5(sketch, 'p5_stage')