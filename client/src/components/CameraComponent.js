import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Button, Box, Typography, IconButton } from "@mui/material";
import { storage } from "../firebase";  // ✅ Import Firebase Storage
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";  // ✅ Upload Icon
import ReplayIcon from "@mui/icons-material/Replay";


const CameraCapture = ({ userId, onImageUpload }) => {
    const webcamRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    // 📸 Capture Photo from Webcam
    const capturePhoto = () => {
        const imageSrc = webcamRef.current.getScreenshot(); // Get image from webcam
        setCapturedImage(imageSrc); // Store it in state
    };

    // 🖼️ Upload Captured Image to Firebase Storage
    const uploadPhoto = async () => {
        if (!capturedImage) return alert("Capture an image first!");

        setUploading(true);
        try {
            // Convert base64 to Blob
            const currentDateTime = new Date().toLocaleString();
            const blob = await fetch(capturedImage).then((res) => res.blob());
            const fileName = `storyPictures/${userId}/captured_photo_${currentDateTime}.jpg`;

            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, blob);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    console.log(`Upload Progress: ${(snapshot.bytesTransferred / snapshot.totalBytes) * 100}%`);
                },
                (error) => {
                    console.error("Upload error:", error);
                    alert("Upload failed. Check Firebase Storage permissions.");
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setUploading(false);
                    onImageUpload(downloadURL);  // ✅ Pass image URL to parent component
                    alert("Photo uploaded successfully!");
                }
            );
        } catch (err) {
            console.error("Error uploading photo:", err);
            setUploading(false);
        }
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ border: "2px solid #ccc", borderRadius: 3, width: '435px', height: '790px', backgroundColor: 'RGBA(255,255,255,1)' }}>


            {/* Camera Preview */}
            {!capturedImage ? (
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"

                    videoConstraints={{ facingMode: "user" }}
                    style={{
                        width: "100%",          // Make it responsive
                        height: "auto",         // Auto-adjust height
                        aspectRatio: '3/5',    // Adjust the aspect ratio (4/3, 16/9, etc.)
                        borderRadius: "10px",

                        objectFit: "cover",
                        // Prevent distortion
                    }}

                />
            ) : (
                <img src={capturedImage} alt="Captured" style={{ width: 430, height: 800, aspectRatio: '3/5', objectFit: 'cover', borderRadius: 10 }} />
            )}

            {/* Buttons */}
            <Box display="flex" justifyContent="center" gap={2} marginTop={1} >
                {!capturedImage ? (
                    <Button variant="contained" color="primary" onClick={capturePhoto}>Capture</Button>
                ) : (
                    <>
                        {/* Upload (✔ Tick Mark) - Bottom Left */}
                        <IconButton
                            sx={{
                                position: "absolute",
                                bottom: 10,
                                left: 10,
                                backgroundColor: "green",
                                color: "white",
                                "&:hover": { backgroundColor: "darkgreen" }
                            }}
                            onClick={uploadPhoto}
                            disabled={uploading}
                        >
                            <CheckCircleIcon fontSize="large" />
                        </IconButton>

                        {/* Retake (🔄 Retry Icon) - Bottom Right */}
                        <IconButton
                            sx={{
                                position: "absolute",
                                bottom: 10,
                                right: 10,
                                backgroundColor: "red",
                                color: "white",
                                "&:hover": { backgroundColor: "darkred" }
                            }}
                            onClick={() => setCapturedImage(null)}
                        >
                            <ReplayIcon fontSize="large" />
                        </IconButton>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default CameraCapture;