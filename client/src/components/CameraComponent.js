import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Button, Box, IconButton } from "@mui/material";
import { storage } from "../firebase";  // Firebase Storage
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReplayIcon from "@mui/icons-material/Replay";
import VideocamIcon from "@mui/icons-material/Videocam";
import StopIcon from "@mui/icons-material/Stop";

const CameraCapture = ({ userId, onMediaUpload }) => {
    const webcamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [recording, setRecording] = useState(false);
    const [videoBlob, setVideoBlob] = useState(null);
    const [uploading, setUploading] = useState(false);


    //  Capture Photo
    const capturePhoto = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedImage(imageSrc);
    };

    //  Start Video Recording
    const startRecording = () => {
        setCapturedImage(null);
        setVideoBlob(null);

        const stream = webcamRef.current.video.srcObject;
        const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
        let recordedChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: "video/webm" });
            setVideoBlob(blob);
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setRecording(true);
    };

    //  Stop Video Recording
    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    // 🚀 Upload Media (Photo or Video) to Firebase
    const uploadMedia = async () => {
        if (!capturedImage && !videoBlob) return alert("Capture a photo or record a video first!");

        setUploading(true);
        try {
            let file, fileType, fileName;
            const currentDateTime = new Date().toISOString().replace(/:/g, "-");
            const media_type = capturedImage ? "image" : "video";
            if (capturedImage) {
                //  Upload Photo
                file = await fetch(capturedImage).then((res) => res.blob());
                fileType = "image/jpeg";
                fileName = `media/${userId}/photo_${currentDateTime}.jpg`;

            } else if (videoBlob) {
                //  Upload Video
                file = videoBlob;
                fileType = "video/webm";
                fileName = `media/${userId}/video_${currentDateTime}.webm`;

            }

            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file, { contentType: fileType });

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
                    onMediaUpload(downloadURL, media_type);  // ✅ Pass image/video URL to parent component
                    alert("Media uploaded successfully!");
                }
            );
        } catch (err) {
            console.error("Error uploading media:", err);
            setUploading(false);
        }
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ border: "2px solid #ccc", borderRadius: 3, width: '435px', height: '790px', backgroundColor: 'RGBA(255,255,255,1)' }}>

            {/* Webcam & Media Preview */}
            {!capturedImage && !videoBlob ? (
                <Webcam
                    audio={true}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "user" }}
                    style={{
                        width: "100%", height: "auto", aspectRatio: '3/5', borderRadius: "10px", objectFit: "cover",
                    }}
                />
            ) : capturedImage ? (
                <img src={capturedImage} alt="Captured" style={{ width: 430, height: 800, objectFit: 'cover', borderRadius: 10 }} />
            ) : (
                <video controls src={URL.createObjectURL(videoBlob)} style={{ width: 430, height: 800, objectFit: 'cover', borderRadius: 10 }} />
            )}

            {/* Action Buttons */}
            <Box display="flex" justifyContent="center" gap={2} marginTop={1}>

                {/* Photo & Video Buttons */}
                {!capturedImage && !videoBlob && !recording && (
                    <>
                        <Button variant="contained" color="primary" onClick={capturePhoto}>📸 Capture</Button>
                        <IconButton color="secondary" onClick={startRecording}><VideocamIcon fontSize="large" /></IconButton>
                    </>
                )}

                {/* Stop Recording */}
                {recording && (
                    <IconButton color="error" onClick={stopRecording}><StopIcon fontSize="large" /></IconButton>
                )}

                {/* Upload & Retake Buttons */}
                {(capturedImage || videoBlob) && (
                    <>
                        <IconButton
                            sx={{ position: "absolute", bottom: 10, left: 10, backgroundColor: "green", color: "white", "&:hover": { backgroundColor: "darkgreen" } }}
                            onClick={uploadMedia}
                            disabled={uploading}
                        >
                            <CheckCircleIcon fontSize="large" />
                        </IconButton>

                        <IconButton
                            sx={{ position: "absolute", bottom: 10, right: 10, backgroundColor: "red", color: "white", "&:hover": { backgroundColor: "darkred" } }}
                            onClick={() => { setCapturedImage(null); setVideoBlob(null); }}
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