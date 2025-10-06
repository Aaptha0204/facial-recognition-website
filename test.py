import requests, base64, numpy as np, cv2

with open("test_face.png", "rb") as f:
    img_bytes = f.read()

img_base64 = "data:image/png;base64," + base64.b64encode(img_bytes).decode()
res = requests.post("http://127.0.0.1:8000/detect", json={"image": img_base64})
faces = res.json().get("faces", [])
print("Detected faces:", faces)

# image overlay process
img_data = base64.b64decode(img_base64.split(",")[1])
nparr = np.frombuffer(img_data, np.uint8)
img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

for face in faces:
    x, y, w, h = face["x"], face["y"], face["w"], face["h"]
    cv2.rectangle(img, (x, y), (x + w, y + h), (0, 0, 255), 2)
    cv2.putText(img, face.get("name", "Unknown"), (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)

# --- Show the image ---
cv2.imshow("Face Detection Overlay", img)
cv2.waitKey(0)
cv2.destroyAllWindows()