import subprocess

with open(
    '/mediapipe/inputvideo.mp4',
    'wb'
) as myfile:
    myfile.write(video_file.read())

subprocess.run(
    [
        'python3',
        '/mediapipe/main.py',
        '/mediapipe/inputvideo.mp4',
    ]
)

res = subprocess.run(
    [
        'cat',
        '/mediapipe/dump.json',
    ],
    capture_output=True
)

return context.add(
    name=name,
    type_id=type_id,
    author=author,
    rawdata=res.stdout,
)
