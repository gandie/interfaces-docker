import * as THREE from 'three';

import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let container, clock, controls;
let camera, scene, renderer;

let loaded = false;
let choreo_data;
let data_index = 0;
let cube;
let cubes = [];
let FPS = 1 / 30;
let fcount = 0;
let scale = 1000;
let num_nodes = 0;

let scalex, scaley, scalez;

let select_template;

let choreo_id;
let jsonpath_expr;

var json_pp_el = document.querySelector('#json_pp_modal')
var json_pp_modal = bootstrap.Modal.getOrCreateInstance(json_pp_el)

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
    
    $("#run_btn").click(function(event) {
        choreo_id = $("#choreo_id").val()
        jsonpath_expr = $("#jsonpath").val()
        scalex = $("#scalex").val()
        scaley = $("#scaley").val()
        scalez = $("#scalez").val()
        //FPS = 1 / parseInt( $("#run_fps").val() )
        FPS = 1 / $("#run_fps").val()
        
        //console.log(scalex, scaley, scalez, FPS)
        
        if (!jsonpath_expr) {
            jsonpath_expr = "$[*]"
        }
        
        console.log(choreo_id, jsonpath_expr)
        
        init();
        animate();
    })

    $("#view_btn").click(function(event) {
        choreo_id = $("#choreo_id").val()
        jsonpath_expr = $("#jsonpath").val()

        if (!jsonpath_expr) {
            jsonpath_expr = "$[*]"
        }
        
        $.getJSON(
            'choreo/fetch_jsonpath',
            {
                choreo_id: choreo_id,
                jsonpath_expr: jsonpath_expr
            },
            function( data ) {
                $("#json_pp_stage").html(JSON.stringify(data.choreo_json, null, 4))
                json_pp_modal.show()
            }
        )

    })
    
})



function init() {

	container = document.getElementById( 'container' );

	camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 15, 10, - 15 );

	scene = new THREE.Scene();

	clock = new THREE.Clock();

    $.getJSON(
        'choreo/fetch_jsonpath',
        {
            //choreo_id: 12,
            choreo_id: choreo_id,
            //jsonpath_expr: "$[*][?(name=LEFT_WRIST)]",
            jsonpath_expr: jsonpath_expr
        },
        function( data ) {
            choreo_data = data.choreo_json
            loaded = true

            for (let i = 0; i < data.choreo_json.length; i++) {
                let val = data.choreo_json[i]
                if (val) {
                    if (num_nodes < val.length) {
                        num_nodes = val.length
                    }
                    //break
                }
            }
            
            console.log(num_nodes)

            for (let i = 0; i < num_nodes; i++) {
                cube = new THREE.Mesh( geometry, material );
                cubes.push(cube);
                scene.add( cube );
            }
        }
    )

	const geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
	const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );



	const gridHelper = new THREE.GridHelper( 10, 20, 0x888888, 0x444444 );
	scene.add( gridHelper );

	const ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
	scene.add( ambientLight );

	const pointLight = new THREE.PointLight( 0xffffff, 0.8 );
	scene.add( camera );
	camera.add( pointLight );

	//

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	//

	controls = new OrbitControls( camera, renderer.domElement );
	controls.screenSpacePanning = true;
	controls.minDistance = 5;
	controls.maxDistance = 4000;
	controls.target.set( 0, 0, 0 );
	controls.update();

	window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );

	render();

}

function render() {

	const delta = clock.getDelta();

    /*	
	if ( head ) {
	    head.position.x += 0.1
	}
	*/
	fcount += delta
	let tick = fcount > FPS

	//console.log(fcount)

	if ( loaded && tick ) {
	    
	    fcount = 0

        let data_chunk = choreo_data[data_index]

        if ( data_chunk ) {
            //console.log(data_chunk)
            data_chunk.forEach(function(val, index) {
                cubes[index].position.x = val.x * scalex
                cubes[index].position.y = val.y * scaley
                if (!val.z) {
                    val.z = 0
                }
                cubes[index].position.z = val.z * scalez
            })
        }

	    //console.log(cubes, data_index, choreo_data.length)
	    
	    if ( data_index < choreo_data.length - 10 ) {
	        data_index++
	    } else {
	        data_index = 0
	    }
	    
	}

	renderer.render( scene, camera );

}