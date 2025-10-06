from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import numpy as np
import base64
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

app.mount("/", StaticFiles(directory="frontend_build", html=True), name="frontend")

@app.get("/")
async def serve_frontend():
    return FileResponse(os.path.join("facial-recognition-backend/frontend", "index.html"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://facial-recognition-web-app-0e67102b26e3.herokuapp.com/"],  # change to frontend URL if changed later
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImagePayload(BaseModel):
    image: str

@app.post("/detect")
def detect(payload: ImagePayload):
    img_data = base64.b64decode(payload.image.split(",")[1])
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    results = []
    for (x, y, w, h) in faces:
        results.append({
            "x": int(x),
            "y": int(y),
            "w": int(w),
            "h": int(h),
            "name": "Unknown",  # later integrate DeepFace for name/age/gender
        })

    return {"faces": results}
