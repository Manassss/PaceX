import React, { useState, useCallback } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Cropper from 'react-easy-crop';

const AddPost = () => {
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
      await axios.post('http://localhost:5001/api/posts/add', postData);
      alert('Post created successfully!');
      setContent('');
      setPostImages([]);
      navigate('/userhome');
    } catch (err) {
      console.error('Error creating post:', err.response?.data || err.message);
    }
  };

  return (
    <Box sx={{ width: { xs: "90%", sm: "80%", md: 600 }, maxWidth: 650, padding: 2, borderRadius: 3, background: "#eddecf", margin: "auto", mt: 3 }}>
      <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', color: 'black' }}>
        Create a New Post
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, background: 'white', borderRadius: 1, padding: '8px' }}>
          <TextField
            label="What's on your mind?"
            variant="outlined"
            multiline
            rows={1}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
          />

          <input type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} id="upload-file" accept="image/*" />
          <label htmlFor="upload-file">
            <Tooltip title="Choose Images">
              <IconButton component="span" color="primary">
                <ImageIcon />
              </IconButton>
            </Tooltip>
          </label>

          <Tooltip title="Post">
            <IconButton color="primary" onClick={handleSubmit}>
              <SendIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {postImages.length > 0 && (
          <Box mt={2} sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {postImages.map((img, index) => (
              <Box key={index} sx={{ position: "relative", width: 100, height: 100 }}>
                <img src={img} alt="Uploaded" style={{ width: "100%", height: "100%", borderRadius: 8, objectFit: "cover" }} />
                <IconButton sx={{ position: "absolute", top: 5, right: 5, backgroundColor: "rgba(255,255,255,0.8)", color: "red" }} onClick={() => {
                  setPostImages(postImages.filter((_, i) => i !== index));
                }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Modal open={openCropModal} onClose={() => setOpenCropModal(false)}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', bgcolor: 'white', p: 2, borderRadius: 2,
          width: 350, height: 500, display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <Typography variant="h6">Crop Image ({currentImageIndex + 1}/{selectedFiles.length})</Typography>

          <Box sx={{ width: 300, height: 400, overflow: "hidden" }}>
            <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={4 / 5} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} restrictPosition={true} showGrid={false} />
          </Box>
          <Slider
            value={zoom}
            min={0.5}
            max={2}  // Restrict zoom level to prevent overscaling
            step={0.05}
            onChange={(e, zoom) => setZoom(zoom)}
          />

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button variant="contained" color="error" onClick={() => setOpenCropModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCropConfirm}>Next Image</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default AddPost;