import os
import cv2
import mediapipe as mp
import sys
import time
import json
import subprocess

start = time.time()

assert len(sys.argv) == 2, 'invalid args'

os.chdir('/mediapipe')

target_file = sys.argv[1]

res = subprocess.call(
    [
        'ffmpeg',
        '-i',
        target_file,
        '%04d.jpg',
    ]
)

mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles
mp_pose = mp.solutions.pose

# For static images:
IMAGE_FILES = [item for item in os.listdir() if item.endswith('.jpg')]
BG_COLOR = (192, 192, 192) # gray

# sort by number
IMAGE_FILES.sort(key=lambda x: int(x.split('.')[0]))

keys = [item for item in dir(mp_pose.PoseLandmark) if not item.startswith('__')]

key_d = {}
for key in keys:
    value = getattr(mp_pose.PoseLandmark, key)
    key_d[key] = value.value


dump_result = []

with mp_pose.Pose(
        static_image_mode=False,
        model_complexity=2,
        enable_segmentation=False,
        min_detection_confidence=0.1,
        min_tracking_confidence=0.1,
) as pose:
    for idx, file in enumerate(IMAGE_FILES):
        print(f'Processing {file} ...')
        image = cv2.imread(file)
        image_height, image_width, _ = image.shape
        # Convert the BGR image to RGB before processing.
        results = pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

        if not results.pose_world_landmarks:
            print('Warning! No landmarks! Adding empty frame ...')
            dump_result.append([])
            continue
        frame = []

        for key, value in key_d.items():
            item_d = {
                'name': key,
                'index': value,
                'x':results.pose_world_landmarks.landmark[value].x,
                'y':results.pose_world_landmarks.landmark[value].y,
                'z':results.pose_world_landmarks.landmark[value].z,
            }
            frame.append(item_d)

        dump_result.append(frame)


with open('dump.json', 'w') as json_dump:
    json_dump.write(json.dumps(dump_result))

for item in IMAGE_FILES:
    os.remove(item)

end = time.time() - start

print(f'Took {end}s')
