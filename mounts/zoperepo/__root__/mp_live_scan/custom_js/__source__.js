import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils
} from "/lib/js/vision_bundle_js";

let poseLandmarker;
let runningMode = "VIDEO";
let webcamRunning = false;

let videoWidth = "640px";
let videoHeight = "480px";

let ws_addr;
let num_poses = 1;

let websocket;
let websocket_opened = false;
let broadcast_running = false;

function start_broadcast(event) {
    if (websocket_opened && !broadcast_running) {
        broadcast_running = true;
        console.log("Broadcast started!");
        $("#bc_not_running").hide();
        $("#bc_running").show();
    } else {
        broadcast_running = false;
        console.log("Broadcast stopped!");
        $("#bc_not_running").show();
        $("#bc_running").hide();
    }
}

$("#broadcast_scan").click(start_broadcast)

function connect_ws(event) {
    ws_addr = $("#ws_addr").val();
    websocket = new WebSocket(ws_addr);

    websocket.addEventListener("open", (event) => {
        websocket_opened = true;
        $("#ws_not_connected").hide();
        $("#ws_connected").show();
        if (webcamRunning) {
            $("#broadcast_scan").prop("disabled", false);
        }
    });
}

$("#connect_ws_btn").click(connect_ws)

// Before we can use PoseLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createPoseLandmarker = async () => {

    if ($("#numposes").val()) {
        num_poses = $("#numposes").val()
    }

  const vision = await FilesetResolver.forVisionTasks(
    "/lib/wasm"
  );

  let model_path = "/lib/models/pose_landmarker_" + $("#model_chooser").val() + ".task"

  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: model_path, //`/lib/models/pose_landmarker_full.task`,
      delegate: "GPU"
    },
    runningMode: runningMode,
    numPoses: num_poses,
    minPoseDetectionConfidence: $("#minPoseDetectionConfidence").val(),
    minPosePresenceConfidence: $("#minPosePresenceConfidence").val(),
    minTrackingConfidence: $("#minTrackingConfidence").val(),
  });
  console.log("poseLandmarker initialized!");
  $("#start_scan").prop("disabled", false);
};

$("#load_model").click(function(event) {
    createPoseLandmarker();
})

const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");

const canvasCtx = canvasElement.getContext("2d");
const drawingUtils = new DrawingUtils(canvasCtx);

// Check if webcam access is supported.
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
    $("#start_scan").click(enableCam);
} else {
    console.warn("getUserMedia() is not supported by your browser");
    $("#start_scan").prop("disabled", true);
}

// Enable the live webcam view and start detection.
function enableCam(event) {
  if (!poseLandmarker) {
    console.log("Wait! poseLandmaker not loaded yet.");
    return;
  }

    if ($("#resx").val() && $("#resy").val()) {
        videoWidth = $("#resx").val() + "px"
        videoHeight = $("#resy").val() + "px"
    }

  if (webcamRunning === true) {
      webcamRunning = false;
      broadcast_running = false;
      $("#broadcast_scan").prop("disabled", true);
      $("#bc_not_running").show();
      $("#bc_running").hide();

  } else {
      webcamRunning = true;
      if (websocket_opened) {
          $("#broadcast_scan").prop("disabled", false);
      }
  }

  // getUsermedia parameters.
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}

let lastVideoTime = -1;
async function predictWebcam() {
  canvasElement.style.height = videoHeight;
  video.style.height = videoHeight;
  canvasElement.style.width = videoWidth;
  video.style.width = videoWidth;
  // Now let's start detecting the stream.
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await poseLandmarker.setOptions({ runningMode: "VIDEO" });
  }

  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      for (const landmark of result.landmarks) {
        drawingUtils.drawLandmarks(landmark, {
          radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1)
        });
        drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
      }
      canvasCtx.restore();
      if (broadcast_running) {
        /// XXX: Make landmarks pickable!
        let to_send = JSON.stringify(result.landmarks);
        websocket.send(to_send);
      }
    });
  }

  // Call this function again to keep predicting when the browser is ready.
  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}
