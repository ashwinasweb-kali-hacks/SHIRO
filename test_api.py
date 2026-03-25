import requests
import json

response = requests.post("http://127.0.0.1:8000/api/generate-image", json={"prompt": "test image"})
print("Image Status:", response.status_code)

try:
    response2 = requests.post("http://127.0.0.1:8000/api/generate-video", json={"prompt": "test video"})
    print("Video Status:", response2.status_code)
except Exception as e:
    print("Video error", e)
