import React, { useEffect, useRef, useCallback } from "react";
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
  const intervalRef = useRef<NodeJS.Timer | null>(null);

  // Capture frame function wrapped in useCallback for stable reference
  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, -width, 0, width, height);
    ctx.restore();

    // ctx.drawImage(videoRef.current, 0, 0, width, height);

    const imageData = canvasRef.current.toDataURL("image/jpeg");
    dispatch(setImage(imageData));
    dispatch(setLoading(true));

    try {
      //   const res = await axios.post("http://localhost:8000/detect", {
      const res = await axios.post(
        "https://facial-recognition-backend-43990f515a45.herokuapp.com/detect",
        {
          image: imageData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      dispatch(setFaces(res.data.faces));
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Start/stop webcam and frame interval
  useEffect(() => {
    if (webcamOn && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current!.srcObject = stream;
          videoRef.current!.play();

          intervalRef.current = setInterval(captureFrame, 100);
        })
        .catch((err) => console.error("Error accessing webcam:", err));
    } else if (!webcamOn && videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;

      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [webcamOn, captureFrame]);

  // Clear face overlays when webcam is stopped
  useEffect(() => {
    if (!webcamOn) {
      dispatch(setFaces([]));
    }
  }, [webcamOn, dispatch]);

  return (
    <div className="webcam-container">
      <video ref={videoRef} className="webcam-video" />
      <canvas ref={canvasRef} className="webcam-canvas" />

      <div className="webcam-buttons">
        <div className="start-stop-buttons">
          <button onClick={() => dispatch(setWebcamOn(true))}>Start 📸</button>
          <button onClick={() => dispatch(setWebcamOn(false))}>Stop 📷</button>
        </div>
      </div>

      {faces.length > 0 &&
        faces.map((face, i) => (
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
