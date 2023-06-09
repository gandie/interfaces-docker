var table_template

$(document).on("choreo-table-load", function(event) {
    $.getJSON("fetch", function(data) {
        console.log("Got data!")
        console.log(data)
        let table_html = table_template(data)
        $("#table_stage").html(table_html)
    })
})

$(function() {

    var myModalEl = document.querySelector('#upload_modal')
    var modal = bootstrap.Modal.getOrCreateInstance(myModalEl)

    var video_myModalEl = document.querySelector('#video_upload_modal')
    var video_modal = bootstrap.Modal.getOrCreateInstance(video_myModalEl)

    $("#init_db").click(function(event) {
        let conf = confirm(
            "Warning! Database will be rebuilt! All existing data will be LOST!"
        )
        if (conf) {
            $.get(
                "db_init_wrapper",
                function(data) {
                    alert(data)
                    $(document).trigger("choreo-table-load")
                }
            )
        } else {
            alert("Aborted.")
        }
    })

    $("#start_upload").click(function(event) {
        modal.show()
    })
    $("#start_video_upload").click(function(event) {
        $("#video_upload_btn").prop("disabled", false)
        $("#video_abort_btn").prop("disabled", false)
        $("#video_loading").hide()
        video_modal.show()
    })

    $("#video_upload_btn").click(function(event) {

        let choreo_name = $("#video_choreo_name").val()
        let choreo_author = $("#video_choreo_author").val()
        let choreo_type = $("#video_choreo_type").val()
        let video_file = $("#video_file")[0].files[0]
        
        if (!choreo_name || !choreo_author || !choreo_type || !video_file) {
            alert("Please fill all fields")
            return
        }

        $("#video_upload_btn").prop("disabled", true)
        $("#video_abort_btn").prop("disabled", true)
        $("#video_loading").show()

        let formData = new FormData()
        formData.append('video_file', video_file)
        formData.append('name', choreo_name)
        formData.append('author', choreo_author)
        formData.append('type_id', choreo_type)

        $.ajax({
            url : 'choreo/add_video',
            type : 'POST',
            data : formData,
            cache: false,
            processData: false,  // tell jQuery not to process the data
            contentType: false,  // tell jQuery not to set contentType
            enctype: 'multipart/form-data',
            success : function(data) {
                $(document).trigger("choreo-table-load")
                video_modal.hide()
            },
            error: function(req, status, err) {
                alert("something went wrong: " + status + " " + err)
                console.log(req)
                console.log(status)
                console.log(err)
                video_modal.hide()
            }
        });

    })

    $("#upload_btn").click(function(event) {
        let choreo_name = $("#choreo_name").val()
        let choreo_author = $("#choreo_author").val()
        let choreo_type = $("#choreo_type").val()
        let json_file = $("#json_file")[0].files[0]

        if (!choreo_name || !choreo_author || !choreo_type || !json_file) {
            alert("Please fill all fields")
            return
        }

        let json = ""
        
        let fileReader = new FileReader()
        fileReader.onload = function () {
            json = fileReader.result
            console.log("NOW JSON")
            console.log(json)

            let formData = new FormData()
            formData.append('name', choreo_name)
            formData.append('author', choreo_author)
            formData.append('type_id', choreo_type)
            formData.append('rawdata', json)

            $.ajax({
                url : 'choreo/add',
                type : 'POST',
                data : formData,
                cache: false,
                processData: false,  // tell jQuery not to process the data
                contentType: false,  // tell jQuery not to set contentType
                enctype: 'multipart/form-data',
                success : function(data) {
                    $(document).trigger("choreo-table-load")
                    modal.hide()
                },
                error: function() {
                    alert("something went wrong!")
                    modal.hide()
                }
            });
        }
        fileReader.readAsText(json_file)
    })

    $.get(
        "choreo_table_pt",
        function(data) {
            console.log("Got table template")
            table_template = Handlebars.compile(data)
            $(document).trigger("choreo-table-load")
        }
    )
});

function choreo_delete(event) {
    let btn = $(event.target)
    let choreo_id = btn.data("choreoid")

    if (!confirm("Attention! Choreo will be deleted and cant't be restored!")) {
        return
    }

    $.getJSON(
        "delete",
        {
            choreo_id: choreo_id,
        },
        function(data) {
            alert(data.msg)
            $(document).trigger("choreo-table-load")
        }
    )
}

function choreo_download(event) {
    let btn = $(event.target)
    let choreo_id = btn.data("choreoid")
    let jsonPath = btn.siblings('input').val()
    console.log(jsonPath)
    
    if (jsonPath == '') {
        $.getJSON(
            "fetch",
            {
                choreo_id: choreo_id,
                include_rawdata: true
            },
            function(data) {
                let raw_json = data.choreos[0].rawdata_json
                let choreo_name = data.choreos[0].choreo_name
                let choreo_author = data.choreos[0].choreo_author
                downloadObjectAsJson(raw_json, choreo_name + "_by_" + choreo_author)
            }
        )
    } else {
        $.getJSON(
            "fetch_jsonpath",
            {
                choreo_id: choreo_id,
                jsonpath_expr: jsonPath
            },
            function(data) {
                downloadObjectAsJson(data.choreo_json, data.name + "_by_" + data.author)
            }
        )        
    }

}
