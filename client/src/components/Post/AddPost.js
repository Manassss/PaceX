import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  Typography,
  Box,
  Button,
  TextField,
  IconButton,
  Modal,
  Tooltip,
  Slider
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { FaUpload } from 'react-icons/fa';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext'
import { storage } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Cropper from 'react-easy-crop';
import { transform } from 'framer-motion';
import { host } from '../apinfo';
const AddPost = ({ open: isOpen, onClose }) => {
  const [cameraOpen, setCameraOpen] = useState(false);
  const webcamRef = useRef(null);
  
  const resetForm = () => {
    setContent('');
    setPostImages([]);
    setSelectedFiles([]);
    setOpenCropModal(false);
    setCurrentImageIndex(0);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };
  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  const [content, setContent] = useState('');
  const [postImages, setPostImages] = useState([]); // Store multiple images
  const [selectedFiles, setSelectedFiles] = useState([]); // Store selected files before upload
  const [openCropModal, setOpenCropModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Track image index for cropping
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Handle multiple file selection
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      const readers = files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then((images) => {
        setSelectedFiles(files);
        setImageSrc(images[0]); // Start with first image
        setOpenCropModal(true);
      });
    }
  };

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedFiles([file]);
        setImageSrc(URL.createObjectURL(file));
        setOpenCropModal(true);
        setCameraOpen(false);
      });
  };

  // Crop completion
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Process cropped image
  const getCroppedImg = async () => {
    const image = new Image();
    image.src = imageSrc;

    return new Promise((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx.drawImage(
          image,
          croppedAreaPixels.x, croppedAreaPixels.y,
          croppedAreaPixels.width, croppedAreaPixels.height,
          0, 0, croppedAreaPixels.width, croppedAreaPixels.height
        );

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" });
          resolve(file);
        }, "image/jpeg");
      };
      image.onerror = (error) => reject(error);
    });
  };

  // Handle crop confirmation
  const handleCropConfirm = async () => {
    try {
      const croppedImageFile = await getCroppedImg();
      uploadImageToFirebase(croppedImageFile);

      if (currentImageIndex < selectedFiles.length - 1) {
        // Move to next image
        setCurrentImageIndex(currentImageIndex + 1);
        setImageSrc(URL.createObjectURL(selectedFiles[currentImageIndex + 1]));
      } else {
        // Close modal when all images are cropped
        setOpenCropModal(false);
      }
    } catch (error) {
      console.error("Cropping error:", error);
    }
  };

  // Upload images to Firebase
  const uploadImageToFirebase = (file) => {
    if (!file) return;

    const storageRef = ref(storage, `postPictures/${user?._id}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        console.log(`Upload progress: ${(snapshot.bytesTransferred / snapshot.totalBytes) * 100}%`);
      },
      (error) => {
        console.error("Upload error:", error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setPostImages((prev) => [...prev, downloadURL]); // Store multiple image URLs
      }
    );
  };

  // Submit post with multiple images
  const handleSubmit = async () => {
    try {
      const postData = {
        userId: user?._id,
        userName: user?.name,
        content: content || " ",
        images: postImages, // Send multiple images
      };
      await axios.post(`${host}/api/posts/add`, postData);
      alert('Post created successfully!');
      setContent('');
      setPostImages([]);
      resetForm();
      onClose();
    } catch (err) {
      console.error('Error creating post:', err.response?.data || err.message);
    }
  };

  return (
    <>
      <Modal
        open={isOpen}
        onClose={handleModalClose}
        closeAfterTransition
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0,0,0,0.4)',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '80%', md: '70%', lg: '60%' }, // wider across screens
            height: { xs: '90vh', sm: '85vh', md: '50vh' }, // taller form
            bgcolor: '#f8f2ec',
            borderRadius: 3,
            boxShadow: 24,
            p: 3,
            overflowY: 'auto', // scroll inside the form if content grows
          }}
        >

          <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', color: 'black', mb: 2 }}>
            Create a New Post
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              placeholder="Write a caption..."
              multiline
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
              variant="outlined"
            />
            {/* Wrap Upload + Camera in a flex row */}
            {!selectedFiles.length && !cameraOpen && (
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                {/* Upload dropzone */}
                <Box
                  sx={{
                    flex: 1,
                    width: 200,
                    p: 3,
                    border: "2px dashed #1976d2",
                    borderRadius: 3,
                    backgroundColor: "#f5f9ff",
                    textAlign: "center",
                    color: "#444",
                    transition: "0.3s",
                    "&:hover": { backgroundColor: "#e3f2fd" },
                    cursor: "pointer",
                  }}
                  component="label"
                >
                  <Box sx={{ fontSize: 40, color: "#1976d2", mb: 1 }}>
                    <FaUpload />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Click to upload item image
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supported formats: JPG, PNG
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                </Box>

                {/* Camera button */}
                <Button
                  variant="outlined"
                  sx={{ alignSelf: "center", minWidth: 140 }}
                  onClick={() => setCameraOpen(true)}
                >
                  Use Camera
                </Button>
              </Box>
            )}

            {/* Preview + Discard */}
            {selectedFiles.length > 0 && !openCropModal && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Selected file: {selectedFiles[0].name}
                </Typography>
                <Box
                  component="img"
                  src={URL.createObjectURL(selectedFiles[0])}
                  alt="Preview"
                  sx={{
                    width: '100%',
                    maxHeight: 400,
                    objectFit: 'contain',
                    mt: 1,
                    borderRadius: 2,
                    overflow: 'auto'
                  }}
                />
                <Button
                  variant="text"
                  color="error"
                  sx={{ mt: 1 }}
                  onClick={() => setSelectedFiles([])}
                >
                  Discard
                </Button>
              </Box>
            )}

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!content && selectedFiles.length === 0}
              >
                Post
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      {/* Camera Modal */}
      <Modal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        closeAfterTransition
        BackdropProps={{ sx: { backdropFilter: 'blur(8px)'} }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            height: 600,
            width: 800,
          }}
        >
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={{ width: '100%', height: 'auto', borderRadius: 4 }}
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleCapture}>
              Capture Photo
            </Button>
            <Button variant="outlined" onClick={() => setCameraOpen(false)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
      {/* Cropping Modal */}
      {openCropModal && (
        <Modal
          open={openCropModal}
          onClose={() => setOpenCropModal(false)}
          closeAfterTransition
          BackdropProps={{
            sx: {
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0,0,0,0.4)',
            },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '80%', md: '60%' },
              bgcolor: '#fff',
              borderRadius: 2,
              boxShadow: 24,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              height: { xs: '70vh', sm: '75vh', md: '80vh' }
            }}
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              cropSize={{ width: 600, height: 450 }}
              objectFit="contain"
              minZoom={0.5}
              style={{
                containerStyle: {
                  display: 'flex',
                },
                mediaStyle: {
                  objectFit: 'contain',
                  width: '70%',
                  height: '70%',
                }
              }}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e, value) => setZoom(value)}
              sx={{ width: '80%' }}
            />
            <Box sx={{ display: 'flex', gap: 1, bottom: 10, position: 'fixed', alignItems: 'center' }}>
              <Button variant="contained" onClick={() => setOpenCropModal(false)}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleCropConfirm}>
                Crop & Upload
              </Button>
            </Box>
          </Box>
        </Modal>
      )}
    </>
  );
};

export default AddPost;