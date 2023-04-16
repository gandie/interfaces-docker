import os
import cv2
import mediapipe as mp
import sys
import time
import json
import subprocess
import pprint

os.chdir('/home/lars/interfaces_zope/mediapipe/')

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
    Scan given img paths using both hand- and bodypose detection
    and merge results into one dataset
    '''

    # mp shorthands
    BaseOptions = mp.tasks.BaseOptions
    HandLandmarker = mp.tasks.vision.HandLandmarker
    HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
    VisionRunningMode = mp.tasks.vision.RunningMode
    mp_pose = mp.solutions.pose

    # hack to map mp_pose names against indexes
    keys = [item for item in dir(mp_pose.PoseLandmark) if not item.startswith('__')]
    body_key_d = {}
    for key in keys:
        value = getattr(mp_pose.PoseLandmark, key)
        body_key_d[key] = value.value

    # ... and same hack for hand poses
    keys = [item for item in dir(mp.solutions.hands.HandLandmark) if not item.startswith('__')]
    hand_key_d = {}
    for key in keys:
        value = getattr(mp.solutions.hands.HandLandmark, key)
        # hand_key_d[key] = value.value
        hand_key_d[value.value] = key

    # Create a hand landmarker instance with the image mode:
    options = HandLandmarkerOptions(
        base_options=BaseOptions(model_asset_path='hand_landmarker.task'),
        running_mode=VisionRunningMode.IMAGE,
        num_hands=2,
    )

    result = []

    # DEBUG - slice / shorten img_paths
    # img_paths = img_paths[1050:1060]

    frame_count = len(img_paths)

    with HandLandmarker.create_from_options(options) as landmarker:

        with mp_pose.Pose(
            static_image_mode=False,
            model_complexity=2,
            enable_segmentation=False,
            min_detection_confidence=0.1,
            min_tracking_confidence=0.1,
        ) as pose:

            for frame_index, imgfile in enumerate(img_paths):

                print(f'Processing frame {frame_index + 1} / {frame_count}')
                frame_res = []

                # HAND POSE
                mp_image = mp.Image.create_from_file(imgfile)
                hand_landmarker_result = landmarker.detect(mp_image)

                for hand_index, categories in enumerate(hand_landmarker_result.handedness):

                    for cat_index, cat in enumerate(categories):

                        # print(cat_index, cat.index, hand_index, cat)
                        name = cat.display_name.upper()
                        for index, landmark in enumerate(hand_landmarker_result.hand_landmarks[hand_index]):

                            item_d = {
                                'name': name + '_' + hand_key_d.get(index, 'UNKNOWN!'),
                                'index': index,
                                'frame_index': frame_index,
                                'x': landmark.x,
                                'y': landmark.y,
                                'z': landmark.z,
                                'type': 'hand',
                            }
                            frame_res.append(item_d)


                # BODY POSE
                image = cv2.imread(imgfile)

                body_pose_result = pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

                if not body_pose_result.pose_landmarks:
                    print('No body landmarks, skipping ...')
                else:
                    for key, value in body_key_d.items():
                        item_d = {
                            'name': key,
                            'index': value,
                            'frame_index': frame_index,
                            'x': body_pose_result.pose_landmarks.landmark[value].x,
                            'y': body_pose_result.pose_landmarks.landmark[value].y,
                            'z': body_pose_result.pose_landmarks.landmark[value].z,
                            'type': 'body',
                        }
                        frame_res.append(item_d)

                frame_d = {
                    'frame_index': frame_index,
                    'keypoints': frame_res
                }
                result.append(frame_d)

    return result


def main():

    assert len(sys.argv) == 2, 'invalid args: one target video expected!'

    tgt_vid_path = sys.argv[1]

    img_paths = extract_frames(tgt_vid_path)

    res = scan(img_paths)

    remove_frames(img_paths)

    pprint.pprint(res)

    with open('multipose_dump.json', 'w') as json_dump:
        json_dump.write(json.dumps(res))


if __name__ == '__main__':
    main()
