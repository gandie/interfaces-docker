import os
import cv2
import mediapipe as mp
import sys
import time
import json
import subprocess
import pprint

start = time.time()

os.chdir('/mediapipe')

assert len(sys.argv) == 2, 'invalid args'

target_file = sys.argv[1]

res = subprocess.call(
    [
        'ffmpeg',
        '-i',
        target_file,
        '%04d.jpg',
    ]
)

IMAGE_FILES = [item for item in os.listdir() if item.endswith('.jpg')]

IMAGE_FILES.sort(key=lambda x: int(x.split('.')[0]))

dump_result = []

BaseOptions = mp.tasks.BaseOptions
HandLandmarker = mp.tasks.vision.HandLandmarker
HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

# Create a hand landmarker instance with the image mode:
options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path='hand_landmarker.task'),
    running_mode=VisionRunningMode.IMAGE
)

with HandLandmarker.create_from_options(options) as landmarker:
    for idx, imgfile in enumerate(IMAGE_FILES[400:401]):
        print(f'Processing {imgfile} ...')
        mp_image = mp.Image.create_from_file(imgfile)
        hand_landmarker_result = landmarker.detect(mp_image)
        res = []
        for index, landmark in enumerate(hand_landmarker_result.hand_world_landmarks[0]):
            res_d = {
                'index': index,
                'x': landmark.x,
                'y': landmark.y,
                'z': landmark.z,
            }
            res.append(res_d)
        dump_result.append(res)

for item in IMAGE_FILES:
    os.remove(item)

end = time.time() - start

pprint.pprint(dump_result)
print(f'Took {end}s')
