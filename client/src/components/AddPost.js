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

const AddPost = ({ open: isOpen, onClose }) => {
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
<Modal
  open={isOpen}
  onClose={onClose}
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderRadius: 1,
          padding: '8px',
        }}
      >
        <TextField
          placeholder="What's on your mind?"
          multiline
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
              },
              backgroundColor: '#fff',
              padding: '4px 8px',
            },
          }}
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
        <Box mt={2} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {postImages.map((img, index) => (
            <Box key={index} sx={{ position: 'relative', width: 100, height: 100 }}>
              <img
                src={img}
                alt="Uploaded"
                style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover' }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  color: 'red',
                }}
                onClick={() => {
                  setPostImages(postImages.filter((_, i) => i !== index));
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  </Box>
</Modal>

  );
};

export default AddPost;