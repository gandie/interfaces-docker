// Fire Effect
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/103-fire-effect.html
// https://youtu.be/X0kjv0MozuY

// Algorithm: https://web.archive.org/web/20160418004150/http://freespace.virgin.net/hugo.elias/models/m_fire.htm


$(function() {

    var myModalEl = document.querySelector('#upload_modal')
    var modal = bootstrap.Modal.getOrCreateInstance(myModalEl)

    $("#upload_btn").click(function(event) {
        console.log(event)

        let choreo_name = $("#choreo_name").val()
        let choreo_author = $("#choreo_author").val()
        let choreo_type = $("#choreo_type").val()
        
        if (!choreo_name || !choreo_author || !choreo_type) {
            console.log("Nein brauche alle Felder")
            return
        }

        let formData = new FormData()
        formData.append('name', choreo_name)
        formData.append('author', choreo_author)
        formData.append('type_id', choreo_type)
        formData.append('rawdata', JSON.stringify(GLOBAL_RECORDING))

        GLOBAL_RECORDING = []
        
        $.ajax({
            url : 'choreo/add',
            type : 'POST',
            data : formData,
            cache: false,
            processData: false,  // tell jQuery not to process the data
            contentType: false,  // tell jQuery not to set contentType
            enctype: 'multipart/form-data',
            success : function(data) {
                modal.hide()
            },
            error: function() {
                alert("something went wrong!")
                modal.hide()
            }
        });

    })

    $("#download_btn").click(function(event) {

        let choreo_name = $("#choreo_name").val()

        if (!choreo_name) {
            console.log("Nein brauche Name")
            return
        }

        downloadObjectAsJson(GLOBAL_RECORDING, choreo_name)

        GLOBAL_RECORDING = []
        modal.hide()

    })    
    
    $("#record_start_btn").click(function(event) {
        $("#recording_state").show()
        recording = true
    })
    $("#record_stop_btn").click(function(event) {
        $("#recording_state").hide()
        recording = false;
        modal.show()

    })
    
    // p5 stuff - START
    let sketch = function(p) {

        let symmetry = 6;   

        let angle = 360 / symmetry;
        
        p.setup = function() { 
          p.createCanvas(640, 480);
          p.angleMode(p.DEGREES);
          p.background(127);
        }
                
        p.draw = function() {

          if (!GLOBAL_POSES) {
            return;
          }
          p.translate(p.width / 2, p.height / 2);

          let new_n_x = GLOBAL_POSES[0].keypoints[0].x
          let new_n_y = GLOBAL_POSES[0].keypoints[0].y

          let new_n_x2 = GLOBAL_POSES[0].keypoints[1].x
          let new_n_y2 = GLOBAL_POSES[0].keypoints[1].y


          if (new_n_x > 0 && new_n_x < p.width && new_n_y > 0 && new_n_y < p.height) {
            let mx = new_n_x - p.width / 2;
            let my = new_n_y - p.height / 2;
            let pmx = new_n_x2 - p.width / 2;
            let pmy = new_n_y2 - p.height / 2;
            
            for (let i = 0; i < symmetry; i++) {
                p.rotate(angle);
                p.strokeWeight(1);
                p.line(mx, my, pmx, pmy);
                p.push();
                p.scale(1, -1);
                p.line(mx, my, pmx, pmy);
                p.pop();
            }
          }
        }

    };
    new p5(sketch, 'p5_stage');


})

function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}