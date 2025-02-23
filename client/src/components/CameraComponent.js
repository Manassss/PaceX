import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Box, IconButton } from "@mui/material";
import { storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";

const CameraCapture = ({ userId, onImageUpload, onClose }) => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Capture photo from webcam
  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  };

  // Upload captured image to Firebase Storage
  const uploadPhoto = async () => {
    if (!capturedImage) return alert("Capture an image first!");
    setUploading(true);
    try {
      const currentDateTime = new Date().toLocaleString();
      const blob = await fetch(capturedImage).then((res) => res.blob());
      const fileName = `storyPictures/${userId}/captured_photo_${currentDateTime}.jpg`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        "state_changed",
        () => {},
        (error) => {
          console.error("Upload error:", error);
          alert("Upload failed. Check Firebase Storage permissions.");
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploading(false);
          onImageUpload(downloadURL);
          alert("Photo uploaded successfully!");
        }
      );
    } catch (err) {
      console.error("Error uploading photo:", err);
      setUploading(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{
        border: "2px solid #ccc",
        borderRadius: 3,
        width: "500px",  
        height: "700px", 
        backgroundColor: "rgba(255,255,255,1)",
        position: "relative",
      }}
    >
      {/* Close Icon */}
      {onClose && (
        <IconButton
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 999,  // Increased z-index to ensure it appears on top
            color: "black" // Set color explicitly for visibility
          }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      )}
      {!capturedImage ? (
        <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "user" }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />
          {/* Capture Icon at bottom center */}
          <IconButton
            onClick={capturePhoto}
            sx={{
              position: "absolute",
              bottom: 10,
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0,0,0,0.5)",
              color: "white",
              borderRadius: "50%",
              p: 1,
            }}
          >
            <PhotoCameraIcon fontSize="large" />
          </IconButton>
        </Box>
      ) : (
        <Box sx={{ position: "relative", width: "100%" }}>
          <img
            src={capturedImage}
            alt="Captured"
            style={{
              width: 500,
              height: 700,
              objectFit: "cover",
              borderRadius: 10,
            }}
          />
          {/* Confirmation Buttons */}
          <IconButton
            sx={{
              position: "absolute",
              bottom: 10,
              left: 20,
              color: "green",
              "&:hover": { backgroundColor: "darkgreen" },
            }}
            onClick={uploadPhoto}
            disabled={uploading}
          >
            <CheckCircleIcon fontSize="large" />
          </IconButton>
          <IconButton
            sx={{
              position: "absolute",
              bottom: 10,
              right: 20,
              color: "red",
              "&:hover": { backgroundColor: "darkred" },
            }}
            onClick={() => setCapturedImage(null)}
          >
            <CancelIcon fontSize="large" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default CameraCapture;
