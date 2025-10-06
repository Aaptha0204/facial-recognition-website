import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  RootState,
  setWebcamOn,
  setImage,
  setFaces,
  setLoading,
} from "../store/store";
import axios from "axios";
import "./webcam.css";

export default function WebcamStream() {
  const dispatch = useDispatch();
  const webcamOn = useSelector((state: RootState) => state.app.webcamOn);
  const faces = useSelector((state: RootState) => state.app.faces);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (webcamOn && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current!.srcObject = stream;
          videoRef.current!.play();
        })
        .catch((err) => console.error("Error accessing webcam:", err));
    } else if (!webcamOn && videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }, [webcamOn]);

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, width, height);

    const imageData = canvasRef.current.toDataURL("image/jpeg");
    dispatch(setImage(imageData));
    dispatch(setLoading(true));

    try {
      const res = await axios.post("http://localhost:5000/detect", {
        image: imageData,
      });
      dispatch(setFaces(res.data.faces));
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="webcam-container">
      <video ref={videoRef} className="webcam-video" />

      <canvas ref={canvasRef} className="webcam-canvas" />

      <div className="webcam-buttons">
        <div className="start-stop-buttons">
          <button onClick={() => dispatch(setWebcamOn(true))}>Start 📸</button>

          <button onClick={() => dispatch(setWebcamOn(false))}>Stop 📷</button>
        </div>

        <div className="capture-button">
          <button onClick={captureFrame}>Capture Frame</button>
        </div>
      </div>

      {faces.map((face, i) => (
        <div
          key={i}
          className="face-overlay"
          style={{
            top: face.y,
            left: face.x,
            width: face.w,
            height: face.h,
          }}
        ></div>
      ))}
    </div>
  );
}
