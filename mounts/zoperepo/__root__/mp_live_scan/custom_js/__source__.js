import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils
} from "/lib/js/vision_bundle_js";

let poseLandmarker;
let runningMode = "VIDEO";
let enableWebcamButton;
let webcamRunning = false;


const videoWidth = "640px";
const videoHeight = "480px";

let ws_uri = "ws://192.168.178.130:4242"

let websocket = new WebSocket(ws_uri);
let websocket_opened = false;
let broadcast_running = false;

const broadcast_btn = document.getElementById("broadcast_scan");

// XXX: better use jquery!?
//const broadcast_btn = $("#broadcast_scan");

broadcast_btn.addEventListener("click", start_broadcast);

function start_broadcast(event) {
    if (websocket_opened && !broadcast_running) {
        broadcast_running = true;
        console.log("Broadcast started!");
    } else {
        broadcast_running = false;
        console.log("Broadcast stopped!");
    }
}

// Connection opened
websocket.addEventListener("open", (event) => {
    websocket_opened = true;
    console.log("Websocket opened!");
});

// Before we can use PoseLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createPoseLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "/lib/wasm"
  );
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `/lib/models/pose_landmarker_full.task`,
      delegate: "GPU"
    },
    runningMode: runningMode,
    numPoses: 1
  });
  console.log("poseLandmarker initialized!");
};

createPoseLandmarker();

const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");

const canvasCtx = canvasElement.getContext("2d");
const drawingUtils = new DrawingUtils(canvasCtx);

// Check if webcam access is supported.
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("start_scan");
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

// Enable the live webcam view and start detection.
function enableCam(event) {
  if (!poseLandmarker) {
    console.log("Wait! poseLandmaker not loaded yet.");
    return;
  }

  if (webcamRunning === true) {
    webcamRunning = false;
    enableWebcamButton.innerText = "ENABLE PREDICTIONS";
  } else {
    webcamRunning = true;
    enableWebcamButton.innerText = "DISABLE PREDICTIONS";
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
