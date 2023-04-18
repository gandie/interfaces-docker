$(function() {
    var myModalEl = document.querySelector('#upload_modal')
    var modal = bootstrap.Modal.getOrCreateInstance(myModalEl)

    $(document).on("tsflw-finish", function() {
        console.log(GLOBAL_POSES)
        console.log("Haha got event!")
        modal.show()
    })


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
        formData.append('rawdata', JSON.stringify(GLOBAL_POSES))

        GLOBAL_POSES = []

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

        /*
        $.post(
            "choreo/add",
            {
                name: choreo_name,
                type_id: choreo_type,
                author: choreo_author,
                rawdata: JSON.stringify(GLOBAL_POSES)
            },
            function( data ) {
                GLOBAL_POSES = []
                modal.hide()
            },
        );
        */
    })

    $("#download_btn").click(function(event) {

        let choreo_name = $("#choreo_name").val()

        if (!choreo_name) {
            console.log("Nein brauche Name")
            return
        }

        downloadObjectAsJson(GLOBAL_POSES, choreo_name)

        GLOBAL_POSES = []
        modal.hide()

    })

    
})

