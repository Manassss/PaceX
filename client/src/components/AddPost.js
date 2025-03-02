import React, { useState } from 'react';
import axios from 'axios';
import { 
<<<<<<< HEAD
=======
  Container, 
>>>>>>> origin/dev-manas
  Typography, 
  Box, 
  Button, 
  TextField, 
  Paper, 
  Input, 
  IconButton, 
<<<<<<< HEAD
  Modal,
  Tooltip
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import UploadIcon from '@mui/icons-material/Upload';
import SendIcon from '@mui/icons-material/Send';
=======
  Avatar, 
  Modal 
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
>>>>>>> origin/dev-manas
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import CameraCapture from './CameraComponent';

const AddPost = () => {
  const [content, setContent] = useState('');
  const [postimg, setPostimg] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [openCamera, setOpenCamera] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

<<<<<<< HEAD
=======
  // Restrict file input to images and videos only
>>>>>>> origin/dev-manas
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image or video first!");
      return;
    }
    const storageRef = ref(storage, `postPictures/${user?._id}/${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        console.log(`Upload progress: ${(snapshot.bytesTransferred / snapshot.totalBytes) * 100}%`);
      },
      (error) => {
        console.error("Upload error:", error);
        alert("Upload failed. Check Firebase Storage permissions.");
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log("Downloaded URL:", downloadURL);
        setPostimg(downloadURL);
        alert("File uploaded successfully!");
      }
    );
  };

  const handleSubmit = async () => {
    try {
      const postData = {
        userId: user?._id,
        userName: user?.name,
        content,
        postimg
      };
      console.log('Post Data:', postData);
      await axios.post('http://localhost:5001/api/posts/add', postData);
      alert('Post created successfully!');
      navigate('/userhome');
    } catch (err) {
      console.error('Error creating post:', err.response?.data || err.message);
    }
  };

<<<<<<< HEAD
=======
  // Callback for when an image is captured via camera
>>>>>>> origin/dev-manas
  const handleCameraImageUpload = (downloadURL) => {
    setPostimg(downloadURL);
    setOpenCamera(false);
  };

<<<<<<< HEAD
  return (
    <Box
      sx={{
        width: { xs: "90%", sm: "80%", md: 600 }, // Reduced card size
        maxWidth: 650,
        padding: 2,
        borderRadius: 3,
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        background: "#fff",
        margin: "auto",
        mt: 3,
      }}
    >
      <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
        Create a New Post
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Text Input */}
        <TextField
          label="What's on your mind?"
          variant="outlined"
          multiline
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          required
        />

        {/* File Upload, Camera, Upload & Post Buttons - Next to Each Other */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", alignItems: "center", mt: 1 }}>
          
          {/* Choose a File Button */}
          <Input
            type="file"
            onChange={handleFileChange}
            sx={{ display: 'none' }}
            id="upload-file"
            inputProps={{ accept: "image/*,video/*" }}
          />
          <label htmlFor="upload-file">
            <Tooltip title="Choose a File">
              <IconButton component="span" color="primary">
                <ImageIcon />
              </IconButton>
            </Tooltip>
          </label>

          {/* Open Camera Button */}
          <Tooltip title="Open Camera">
            <IconButton color="secondary" onClick={() => setOpenCamera(true)}>
              <PhotoCameraIcon />
            </IconButton>
          </Tooltip>

          {/* Upload File Button */}
          <Button
            variant="contained"
            color="success"
            startIcon={<UploadIcon />}
            onClick={handleImageUpload}
          >
            Upload
          </Button>

          {/* Post Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            sx={{ fontSize: 12, padding: "12px 24px" }}
            onClick={handleSubmit}
          >
            Post
          </Button>

        </Box>

        {/* Preview Selected Image with Close Button */}
        {postimg && (
          <Box mt={2} sx={{ width: "100%", textAlign: "center", position: "relative", display: "inline-block" }}>
            <img
              src={postimg}
              alt="Preview"
              style={{ width: "100%", maxWidth: 250, borderRadius: 8 }}
            />
            {/* Close Button on Image */}
            <IconButton
              sx={{
                position: "absolute",
                top: 5,
                right: 5,
                backgroundColor: "rgba(255,255,255,0.8)",
                color: "red",
                borderRadius: "50%",
                boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
              }}
              onClick={() => setPostimg("")} // Clears the image when clicked
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        
      </Box>
=======
  const handleHomeClick = () => {
    navigate('/userhome');
  };

  const handleProfileClick = () => {
    navigate(`/profile/${user?._id}`);
  };

  return (
    <>
      <Container
        sx={{
          width: 600,
          height: 800,
          margin: '50px auto',
          backgroundColor: '#fff',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          p: 3,
          border: '2px solid #ccc'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Create a New Post
          </Typography>

          {/* Using a Box for inputs and buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="What's on your mind?"
              variant="outlined"
              multiline
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />

            {/* File Upload Section with Camera Option */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                backgroundColor: '#f9f9f9',
                '&:hover': { backgroundColor: '#f0f0f0' }
              }}
            >
              <Input
                type="file"
                onChange={handleFileChange}
                sx={{ display: 'none' }}
                id="upload-file"
                inputProps={{ accept: "image/*,video/*" }}
              />
              <label htmlFor="upload-file">
                <Button
                  variant="contained"
                  component="span"
                  sx={{
                    backgroundColor: '#1976d2',
                    color: '#fff',
                    '&:hover': { backgroundColor: '#1565c0' }
                  }}
                >
                  Choose a File
                </Button>
              </label>

              {postimg && (
                <Box mt={2}>
                  <img
                    src={postimg}
                    alt="Preview"
                    style={{ width: '100%', maxWidth: 250, borderRadius: 8, marginTop: 10 }}
                  />
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleImageUpload}
                >
                  Upload File
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setOpenCamera(true)}
                >
                  Open Camera
                </Button>
              </Box>
            </Box>

            {/* Post Submission Button */}
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Post
            </Button>
          </Box>
        </Paper>

        {/* Bottom Navigation: Home and Profile */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 20,
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <IconButton 
            onClick={handleHomeClick} 
            sx={{ 
              backgroundColor: '#ff9800', 
              color: 'white', 
              borderRadius: '50%', 
              p: 1.5 
            }}
          >
            <HomeIcon fontSize="large" />
          </IconButton>
          <IconButton 
            onClick={handleProfileClick} 
            sx={{ 
              backgroundColor: 'transparent', 
              borderRadius: '50%', 
              p: 0 
            }}
          >
            <Avatar 
              src={user?.profileImage || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"} 
              sx={{ width: 40, height: 40, cursor: "pointer", border: 'none' }} 
            />
          </IconButton>
        </Box>
      </Container>
>>>>>>> origin/dev-manas

      {/* Camera Modal */}
      <Modal open={openCamera} onClose={() => setOpenCamera(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
<<<<<<< HEAD
            width: { xs: "90%", sm: "70%", md: 500 },
            height: { xs: "80vh", sm: "auto" },
=======
            width: 500,
            height: 700,
            bgcolor: 'white',
>>>>>>> origin/dev-manas
            p: 2,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
<<<<<<< HEAD
          {/* Close Button */}
          <IconButton
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              color: "red",
            }}
            onClick={() => setOpenCamera(false)}
          >
            <CloseIcon fontSize="large" />
          </IconButton>

          {/* Camera Component */}
=======
>>>>>>> origin/dev-manas
          <CameraCapture 
            userId={user?._id} 
            onImageUpload={handleCameraImageUpload} 
            onClose={() => setOpenCamera(false)}
          />
        </Box>
      </Modal>
<<<<<<< HEAD
    </Box>
=======
    </>
>>>>>>> origin/dev-manas
  );
};

export default AddPost;
