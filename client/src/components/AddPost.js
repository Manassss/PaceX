import React, { useState } from 'react';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  TextField, 
  Paper, 
  Input, 
  IconButton, 
  Avatar, 
  Modal 
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
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

  // Restrict file input to images and videos only
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

  // Callback for when an image is captured via camera
  const handleCameraImageUpload = (downloadURL) => {
    setPostimg(downloadURL);
    setOpenCamera(false);
  };

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
      width: 50,             // Modified: Set width to 50px
      height: 50,            // Modified: Set height to 50px
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <HomeIcon fontSize="large" />
  </IconButton>
  <IconButton 
    onClick={handleProfileClick} 
    sx={{ 
      backgroundColor: 'transparent', 
      borderRadius: '50%', 
      p: 0,
      width: 50,             // Modified: Set width to 50px
      height: 50             // Modified: Set height to 50px
    }}
  >
    <Avatar 
      src={user?.profileImage || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"} 
      sx={{ width: 50, height: 50, cursor: "pointer", border: 'none' }} // Modified: Updated size to 50×50
    />
  </IconButton>
</Box>
</Container>

      {/* Camera Modal */}
      <Modal open={openCamera} onClose={() => setOpenCamera(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            height: 700,
            bgcolor: 'white',
            p: 2,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <CameraCapture 
            userId={user?._id} 
            onImageUpload={handleCameraImageUpload} 
            onClose={() => setOpenCamera(false)}
          />
        </Box>
      </Modal>
    </>
  );
};

export default AddPost;
