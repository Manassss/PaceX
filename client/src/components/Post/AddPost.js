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
      <Modal open={isOpen} onClose={handleModalClose} closeAfterTransition BackdropProps={{ sx: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.4)' } }}>
        <Box
          sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '80%', md: '70%', lg: '50%' },
            maxHeight: { xs: '90vh', sm: '85vh', md: '100vh' },
            height:'50vh',
            bgcolor: '#f8f2ec', borderRadius: 3, boxShadow: 24, p: 3, overflowY: 'auto'
          }}
        >
          <Typography variant="h6" align="center" sx={{ fontWeight: 700, mb: 2 }}>
            Create a New Post
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              placeholder="Write a caption..."
              multiline rows={2} value={content} onChange={(e) => setContent(e.target.value)} fullWidth variant="outlined"
            />
            {!selectedFiles.length && !cameraOpen && (
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
                <Box
                  component="label"
                  sx={{
                    flex: 1, p: 2, border: '2px dashed #1976d2', borderRadius: 2, mt: 10,
                    bgcolor: '#f5f9ff', textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#e3f2fd' }
                  }}
                >
                  <FaUpload size={36} color="#1976d2" />
                  <Typography variant="subtitle1" fontWeight={600}>Click to upload image</Typography>
                  <Typography variant="caption">JPG, PNG</Typography>
                  <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                </Box>
                <Button variant="outlined" sx={{ minWidth: 40, height:60, mt: 10 }} onClick={() => setCameraOpen(true)}>
                  Use Camera
                </Button>
              </Box>
            )}
            {selectedFiles.length > 0 && !openCropModal && (
              <Box>
                <Typography variant="body2">Selected: {selectedFiles[0].name}</Typography>
                <Box
                  component="img" src={URL.createObjectURL(selectedFiles[0])} alt="Preview"
                  sx={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 2, my: 1 }}
                />
                <Button variant="text" color="error" onClick={() => setSelectedFiles([])}>Discard</Button>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button disabled={!content && selectedFiles.length === 0} variant="contained" onClick={handleSubmit}>
                Post
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      <Modal open={cameraOpen} onClose={() => setCameraOpen(false)} closeAfterTransition BackdropProps={{ sx: { backdropFilter: 'blur(8px)' } }}>
        <Box
          sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '600px' }, height: { xs: '60vh', sm: '500px' }, p: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2
          }}
        >
          <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" style={{ width: '100%', height: '100%', borderRadius: 8 }} />
          <Box sx={{ display: 'flex', gap: 2 }}> 
            <Button variant="contained" onClick={handleCapture}>Capture</Button>
            <Button variant="outlined" onClick={() => setCameraOpen(false)}>Cancel</Button>
          </Box>
        </Box>
      </Modal>

      {openCropModal && (
        <Modal open onClose={() => setOpenCropModal(false)} closeAfterTransition BackdropProps={{ sx: { backdropFilter: 'blur(8px)' } }}>
          <Box
            sx={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: { xs: '100%', sm: '90%', md: '70%' }, height: { xs: '80vh', md: '70vh' },
              bgcolor: '#fff', borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}
          >
            <Cropper
              image={imageSrc} crop={crop} zoom={zoom} aspect={4/3}
              onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}
              style={{ containerStyle: { width: '100%', height: '100%' } }}
            />
            <Slider value={zoom} min={1} max={3} step={0.1} onChange={(e,v) => setZoom(v)} sx={{ width: '80%' }} />
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button onClick={() => setOpenCropModal(false)}>Cancel</Button>
              <Button onClick={handleCropConfirm}>Crop & Upload</Button>
            </Box>
          </Box>
        </Modal>
      )}
    </>
  );
};

export default AddPost;
