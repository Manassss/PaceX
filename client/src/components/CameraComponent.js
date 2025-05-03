import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Button, Box, IconButton, Typography, Avatar } from "@mui/material";
import { storage } from "../firebase";  // Firebase Storage
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReplayIcon from "@mui/icons-material/Replay";
import VideocamIcon from "@mui/icons-material/Videocam";
import StopIcon from "@mui/icons-material/Stop";
import { useAuth } from "../auth/AuthContext";

const CameraCapture = ({ userId, onMediaUpload }) => {
    const webcamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [recording, setRecording] = useState(false);
    const [videoBlob, setVideoBlob] = useState(null);
    const [uploading, setUploading] = useState(false);
    const { user } = useAuth();

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

        let options = { mimeType: "video/webm" };
        if (!MediaRecorder.isTypeSupported("video/webm")) {
            if (MediaRecorder.isTypeSupported("video/mp4")) {
                options = { mimeType: "video/mp4" };
            } else {
                options = {};
            }
        }

        let mediaRecorder;
        try {
            mediaRecorder = new MediaRecorder(stream, options);
        } catch (e) {
            alert("Your browser does not support video recording.");
            console.error("MediaRecorder init error:", e);
            return;
        }

        let recordedChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: options.mimeType || "video/webm" });
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
            const uid = userId || user?._id;
            if (!uid) {
                alert("User ID not found. Please login again.");
                setUploading(false);
                return;
            }
            const media_type = capturedImage ? "image" : "video";
            if (capturedImage) {
                //  Upload Photo
                file = await fetch(capturedImage).then((res) => res.blob());
                fileType = "image/jpeg";
                fileName = `media/${uid}/photo_${currentDateTime}.jpg`;

            } else if (videoBlob) {
                //  Upload Video
                file = videoBlob;
                fileType = file.type || "video/webm";  // Instead of hardcoding "video/webm"
                fileName = `media/${uid}/video_${currentDateTime}.webm`;

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
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ border: "2px solid #ccc", borderRadius: 3, width: '435px', height: '100%', backgroundColor: 'RGBA(255,255,255,1)', position: 'relative' }}>

            {/* Webcam & Media Preview */}
            {!capturedImage && !videoBlob ? (
                <Webcam
                    audio={true}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "user" }}
                    style={{
                        width: 430, height: 800, objectFit: 'cover', borderRadius: 10
                    }}
                />
            ) : capturedImage ? (
                <img src={capturedImage} alt="Captured" style={{ width: 435, height: 800, objectFit: 'cover', borderRadius: 10 }} />
            ) : (
                <Box sx={{ position: 'relative', width: 430, height: 800 }}>
                    <video
                        controls
                        src={URL.createObjectURL(videoBlob)}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 10,
                            zIndex: 10,
                        }}
                    />
                    {/* Action Buttons for videoBlob */}
                    {videoBlob && (
                        <Box
                            display="flex"
                            gap={2}
                            sx={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                zIndex: 20
                            }}
                        >
                            <Button
                                variant="contained"
                                onClick={uploadMedia}
                                disabled={uploading}
                                sx={{ textTransform: "none", borderRadius: 5, px: 4, backgroundColor: '#073574' }}
                            >
                                Post
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    setCapturedImage(null);
                                    setVideoBlob(null);
                                }}
                                sx={{ textTransform: "none", borderRadius: 10, px: 4, backgroundColor: '#073574' }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    )}
                </Box>
            )}

            <Box
                sx={{
                    position: "absolute",
                    top: "2%",
                    display: "flex",
                    gap: 1,
                    padding: "5px 10px",
                    left: "3%",
                    zIndex: 10
                }}
            >
                <Avatar
                    src={user.profileImage}
                    sx={{ width: 30, height: 30, cursor: "pointer" }}

                />
                <Typography variant="h6" sx={{ color: "white" }}>
                    {user.name}
                </Typography>
            </Box>

            {/* Action Buttons */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 30,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2,
                    zIndex: 10
                }}
            >
                {/* Capture and Record */}
                {!capturedImage && !videoBlob && !recording && (
                    <>
                        <IconButton
                            onClick={capturePhoto}
                            sx={{ backgroundColor: "#fff", border: "2px solid #000", "&:hover": { backgroundColor: "#f0f0f0" } }}
                        >
                            <span role="img" aria-label="camera" style={{ fontSize: "24px" }}>📸</span>
                        </IconButton>

                        <IconButton
                            onClick={startRecording}
                            sx={{ backgroundColor: "#fff", border: "2px solid #000", "&:hover": { backgroundColor: "#f0f0f0" } }}
                        >
                            <VideocamIcon sx={{ fontSize: 24 }} />
                        </IconButton>
                    </>
                )}

                {/* Stop Recording */}
                {recording && (
                    <IconButton
                        onClick={stopRecording}
                        sx={{ backgroundColor: "#fff", border: "2px solid red", "&:hover": { backgroundColor: "#ffe5e5" } }}
                    >
                        <StopIcon sx={{ color: "red", fontSize: 24 }} />
                    </IconButton>
                )}
            </Box>

            {/* Only show bottom Post/Cancel for capturedImage, not videoBlob */}
            {capturedImage && (
                <Box
                    display="flex"
                    justifyContent="center"
                    gap={2}
                    sx={{
                        position: 'absolute',
                        bottom: 30,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10
                    }}
                >
                    <Button
                        variant="contained"
                        onClick={uploadMedia}
                        disabled={uploading}
                        sx={{ textTransform: "none", borderRadius: 5, px: 4, backgroundColor: '#073574' }}
                    >
                        Post
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            setCapturedImage(null);
                            setVideoBlob(null);
                        }}
                        sx={{ textTransform: "none", borderRadius: 10, px: 4, backgroundColor: '#073574' }}
                    >
                        Cancel
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default CameraCapture;