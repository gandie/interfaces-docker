import os
import cv2
import mediapipe as mp
import sys
import time
import json
import subprocess
import pprint

# os.chdir('/mediapipe')

def extract_frames(video_path):
    '''
    Call ffmpeg to extract frames from given video by path

    Returns sorted list of paths to JPG files extracted
    '''

    res = subprocess.call(
        [
            'ffmpeg',
            '-i',
            video_path,
            '%04d.jpg',
        ]
    )

    img_paths = [item for item in os.listdir() if item.endswith('.jpg')]

    img_paths.sort(key=lambda x: int(x.split('.')[0]))

    return img_paths


def remove_frames(img_paths):
    '''
    Clean up extracted JPG frames
    '''

    for path in img_paths:
        os.remove(path)


def scan(img_paths):
    '''
    Run holistic scan solution against images
    '''

    mp_holistic = mp.solutions.holistic

    # Attention! Hack ahead ...
    # prepare dictionaries to wrap mp enums to save results by name
    keys = [item for item in dir(mp_holistic.HandLandmark) if not item.startswith('__')]
    hand_key_d = {}
    for key in keys:
        value = getattr(mp_holistic.HandLandmark, key)
        hand_key_d[value.value] = key

    keys = [item for item in dir(mp_holistic.PoseLandmark) if not item.startswith('__')]
    body_key_d = {}
    for key in keys:
        value = getattr(mp_holistic.PoseLandmark, key)
        body_key_d[value.value] = key

    # ... hack end

    # will be a list of frames containing landmarks per frame
    result = []

    # DEBUG - just process a slice of frames
    # img_paths = img_paths[1000:1050]

    frame_count = len(img_paths)

    with mp_holistic.Holistic(
        static_image_mode=False,
        model_complexity=2,
        enable_segmentation=True,
        refine_face_landmarks=True) as holistic:

        for frame_index, imgfile in enumerate(img_paths):

            print(f'Processing frame {frame_index + 1} / {frame_count}')
            frame_res = []

            image = cv2.imread(imgfile)
            image_height, image_width, _ = image.shape

            # Convert the BGR image to RGB before processing.
            results = holistic.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

            left_wrist_z = 0
            right_wrist_z = 0

            if results.pose_landmarks:
                for key, value in body_key_d.items():
                    item_d = {
                        'name': value,
                        'index': key,
                        'frame_index': frame_index,
                        'x': results.pose_landmarks.landmark[key].x,
                        'y': results.pose_landmarks.landmark[key].y,
                        'z': results.pose_landmarks.landmark[key].z,
                        'type': 'body',
                    }
                    if value == 'LEFT_WRIST':
                        left_wrist_z = results.pose_landmarks.landmark[key].z
                    if value == 'RIGHT_WRIST':
                        right_wrist_z = results.pose_landmarks.landmark[key].z
                    frame_res.append(item_d)

            if results.left_hand_landmarks:
                for key, value in hand_key_d.items():
                    item_d = {
                        'name': value,
                        'index': key,
                        'frame_index': frame_index,
                        'x': results.left_hand_landmarks.landmark[key].x,
                        'y': results.left_hand_landmarks.landmark[key].y,
                        'z': results.left_hand_landmarks.landmark[key].z + left_wrist_z,
                        'type': 'left_hand',
                    }
                    frame_res.append(item_d)

            if results.right_hand_landmarks:
                for key, value in hand_key_d.items():
                    item_d = {
                        'name': value,
                        'index': key,
                        'frame_index': frame_index,
                        'x': results.right_hand_landmarks.landmark[key].x,
                        'y': results.right_hand_landmarks.landmark[key].y,
                        'z': results.right_hand_landmarks.landmark[key].z + right_wrist_z,
                        'type': 'right_hand',
                    }
                    frame_res.append(item_d)

            print(f'Found {len(frame_res)} landmarks')
            result.append(frame_res)

    return result


def main():

    assert len(sys.argv) == 2, 'invalid args: one target video expected!'

    tgt_vid_path = sys.argv[1]

    img_paths = extract_frames(tgt_vid_path)

    res = scan(img_paths)

    remove_frames(img_paths)

    with open('holistic_dump.json', 'w') as json_dump:
        json_dump.write(json.dumps(res))


if __name__ == '__main__':
    main()













img_paths = [item for item in os.listdir() if item.endswith('.jpg')]
img_paths.sort(key=lambda x: int(x.split('.')[0]))



print('OK')
