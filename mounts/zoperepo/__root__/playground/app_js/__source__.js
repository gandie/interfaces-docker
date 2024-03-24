let select_template;
let example_template;
let editor;
let oScript;
let oScriptText;
let DATA;
let sketch;
let stage;
let cur_choreo_id;


$(document).on("choreo-select-load", function(event) {
    $.getJSON("choreo/fetch", function(data) {
        let select_html = select_template(data)
        $("#choreo_id").html(select_html)
    })
})

$(document).on("example-select-load", function(event) {
    $.getJSON("get_examples", function(data) {
        console.log(data)
        let select_html = example_template(data)
        $("#example_chooser").html(select_html)
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

    $.get(
        "example_select_pt",
        function(data) {
            example_template = Handlebars.compile(data)
            $(document).trigger("example-select-load")
        }
    )

    editor = CodeMirror(
        $("#editor")[0],
        {
            value: EXAMPLES["template"],
            mode:  "javascript",
            lineNumbers: true,
        }
    )
    // https://stackoverflow.com/a/39963707
    var $sel = $('#example_chooser').on('change', function(){
        if (confirm('Unsaved changes will be lost!')) {
            // store new value        
            $sel.trigger('update')
            editor.setValue(EXAMPLES[$("#example_chooser").val()])
        } else {
             // reset
             $sel.val( $sel.data('currVal') )
        }
    }).on('update', function(){
        $(this).data('currVal', $(this).val())
    }).trigger('update');

    $("#run_code").click(function(event) {
        runCode(event)
    })
})

function runCode(event) {
    //$("#data_loading").show()

    if (stage) {
        stage.remove()
    }

    $("#p5_stage").empty()

    let choreo_id = $("#choreo_id").val()

    if (cur_choreo_id !== choreo_id) {
        $.getJSON(
            'choreo/fetch_playground',
            {
                choreo_id: choreo_id,
            },
            function( data ) {
                cur_choreo_id = choreo_id
                DATA = data.choreo_json
                run_from_cm()
            }
        )    

    } else {
        run_from_cm()
    }

}

function run_from_cm() {

    let jscode = editor.getValue()

    if(oScript) {
        oScript.remove()
    }

    oScript = document.createElement("script")
    oScriptText = document.createTextNode(jscode)
    oScript.appendChild(oScriptText)
    document.body.appendChild(oScript)    

}