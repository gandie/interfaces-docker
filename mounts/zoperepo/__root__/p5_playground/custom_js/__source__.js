var myCodeMirror
var oScript
var oScriptText
var select_template
var DATA
var sketch
var stage

var p5_template = `// p5js template

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

$(document).on("choreo-select-load", function(event) {
    $.getJSON("choreo/fetch", function(data) {
        let select_html = select_template(data)
        $("#choreo_id").html(select_html)
    })
})

$(function() {

    $.get(
        "choreo_select_pt",
        function(data) {
            select_template = Handlebars.compile(data)
            $(document).trigger("choreo-select-load")
        }
    )

    myCodeMirror = CodeMirror(
        $("#editor")[0],
        {
            value: p5_template,
            mode:  "javascript",
            lineNumbers: true,
        }
    )

    $("#run_code").click(function(event) {

        if (stage) {
            stage.remove()
        }

        $("#p5_stage").empty()

        let choreo_id = $("#choreo_id").val()
        let jsonpath_expr = $("#jsonpath").val()

        $.getJSON(
            'choreo/fetch_jsonpath',
            {
                choreo_id: choreo_id,
                jsonpath_expr: jsonpath_expr
            },
            function( data ) {
                DATA = data.choreo_json

                let jscode = myCodeMirror.getValue()
        
                if(oScript) {
                    oScript.remove()
                }
                
                oScript = document.createElement("script")
                oScriptText = document.createTextNode(jscode)
                oScript.appendChild(oScriptText)
                document.body.appendChild(oScript)

            }
        )
    })

    $("#download_code").click(function(event) {
        saveTextAsFile(myCodeMirror.getValue(), 'p5_code.js')
    })

    $("#import_code").click(function(event) {
        let import_file = $("#import_file")[0].files[0]

        if (!import_file) {
            alert("Please select a file!")
            return
        }

        let import_code = ""
        let fileReader = new FileReader()

        fileReader.onload = function () {
            import_code = fileReader.result
            myCodeMirror.setValue(import_code)
        }

        fileReader.readAsText(import_file)

    })

    
    $("#download_svg").click(function(event) {
        downloadSVGAsText()
    })

    $("#download_png").click(function(event) {
        downloadSVGAsPNG(event)
    })
})

function saveTextAsFile(textToWrite, fileNameToSaveAs)
{
	var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'}); 
	var downloadLink = document.createElement("a");
	downloadLink.download = fileNameToSaveAs;
	downloadLink.innerHTML = "Download File";
	if (window.webkitURL !== null)
	{
		// Chrome allows the link to be clicked
		// without actually adding it to the DOM.
		downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
	}
	else
	{
		// Firefox requires the link to be added to the DOM
		// before it can be clicked.
		downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
		downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
	}

	downloadLink.click();
}

function downloadSVGAsText() {
    const svg = document.querySelector('svg');
    if (!svg) {
        alert("No image found, aborting ...")
        return
    }
    const base64doc = btoa(unescape(encodeURIComponent(svg.outerHTML)));
    const a = document.createElement('a');
    const e = new MouseEvent('click');
    a.download = 'download.svg';
    a.href = 'data:image/svg+xml;base64,' + base64doc;
    a.dispatchEvent(e);
}

function downloadSVGAsPNG(e){
    const canvas = document.createElement("canvas");
    const svg = document.querySelector('svg');
    if (!svg) {
        alert("No image found, aborting ...")
        return
    }
    const base64doc = btoa(unescape(encodeURIComponent(svg.outerHTML)));
    const w = parseInt(svg.getAttribute('width'));
    const h = parseInt(svg.getAttribute('height'));
    const img_to_download = document.createElement('img');
    img_to_download.src = 'data:image/svg+xml;base64,' + base64doc;
    console.log(w, h);
    img_to_download.onload = function () {    
        canvas.setAttribute('width', w);
        canvas.setAttribute('height', h);
        const context = canvas.getContext("2d");
        context.drawImage(img_to_download,0,0,w,h);
        const dataURL = canvas.toDataURL('image/png');
        if (window.navigator.msSaveBlob) {
          window.navigator.msSaveBlob(canvas.msToBlob(), "download.png");
          e.preventDefault();
        } else {
          const a = document.createElement('a');
          const my_evt = new MouseEvent('click');
          a.download = 'download.png';
          a.href = dataURL;
          a.dispatchEvent(my_evt);
        }
    }  
}