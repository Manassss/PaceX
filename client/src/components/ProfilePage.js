import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Avatar,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  IconButton,
  Modal,
  Input,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import { getAuth } from "firebase/auth";
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useAuth } from '../auth/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { signOut } from "firebase/auth";
import axios from 'axios';
import CameraCapture from './CameraComponent';
import Navbar from "../components/navbar"; // Import Navbar


const ProfilePage = () => {
  const [userDetails, setUserDetails] = useState({});
  const [posts, setPosts] = useState([]); // Posts uploaded by this user
  const [stories, setStories] = useState([]); // All stories fetched
  const [userStories, setUserStories] = useState([]); // Stories belonging to this user
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [openCamera, setOpenCamera] = useState(false);
  const [openStory, setOpenStory] = useState(false);
  const [currentIndexStory, setCurrentIndexStory] = useState(0);
  const [openPostModal, setOpenPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = getAuth();
  const userId = id ? id : user?._id;

  useEffect(() => {
    if (!userId) return;
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/users/profile/${userId}`);
        setUserDetails(res.data);
        setFormData(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err.message);
      }
    };
    fetchUserProfile();
  }, [userId]);

  // Fetch posts for this user
  useEffect(() => {
    if (!userId) return;
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/posts/all');
        // Compare as strings
        const transformedPosts = res.data
          .filter(post => post.userId.toString() === userId.toString())
          .map(post => ({
            content: post.content,
            createdAt: new Date(post.createdAt).toLocaleString(),
            dislikes: post.dislikes,
            likes: post.likes,
            postimg: post.postimg,
            userId: post.userId,
            userName: post.userName,
            postId: post._id,
          }));
        setPosts(transformedPosts);
      } catch (err) {
        console.error('Error fetching posts:', err.message);
      }
    };
    fetchPosts();
  }, [userId]);

  // Fetch all stories then filter those belonging to this user
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/story/all');
        setStories(res.data);
        const filtered = res.data.filter(story => story.userId.toString() === userId.toString());
        setUserStories(filtered);
      } catch (err) {
        console.error('Error fetching stories:', err);
      }
    };
    fetchStories();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(`http://localhost:5001/api/users/profile/${userId}`, formData);
      if (res.data && res.data.user) {
        setUserDetails(res.data.user);
      }
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error("Error updating profile:", err.message);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return alert("Please select an image first!");
    const storageRef = ref(storage, `profilePictures/${userId}/${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);
    uploadTask.on(
      "state_changed",
      null,
      (error) => alert("Upload failed! Check Firebase permissions."),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setFormData({ ...formData, profileImage: downloadURL });
      }
    );
  };

  // Callback for camera capture upload
  const handleCameraImageUpload = (downloadURL) => {
    setFormData({ ...formData, profileImage: downloadURL });
    setOpenCamera(false);
  };

  // Story modal navigation
  const handleNextStory = () => {
    if (currentIndexStory < userStories.length - 1) {
      setCurrentIndexStory(prev => prev + 1);
    } else {
      setOpenStory(false);
    }
  };

  const handlePrevStory = () => {
    if (currentIndexStory > 0) {
      setCurrentIndexStory(prev => prev - 1);
    }
  };

  // Open story modal when profile image is clicked (if there are stories)
  const handleStoriesClick = () => {
    if (userStories.length > 0) {
      setCurrentIndexStory(0);
      setOpenStory(true);
    } else {
      alert("You have no stories to show.");
    }
  };

  // Navigate to profile page (for bottom nav)
  const handleProfile = (profileUserId) => {
    navigate(`/profile/${profileUserId}`);
  };

  // Navigate to add post page (for bottom nav)
  const handleAddpost = () => {
    navigate('/add-post');
  };

  const handleHomeClick = () => {
    navigate('/userhome');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/home');
    } catch (err) {
      console.error("Error signing out:", err.message);
    }
  };

  // When a post is clicked, open a modal to show its details
  const handlePostClick = (post) => {
    setSelectedPost(post);
    setOpenPostModal(true);
  };

  return (
    <>
   <Container
      maxWidth={false}
      disableGutters
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#f9f9f9",
      }}
    >
      {/* Left Sidebar - User Info */}
      <Box
        sx={{
          width: { xs: "30%", sm: "25%", md: "20%" },
          height: "100vh",
          backgroundColor: "#073574",
          color: "#fff",
          padding: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "3px 0px 10px rgba(0, 0, 0, 0.2)",
          marginTop: "100px",
        }}
      >
        {/* Profile Image */}
        <Avatar
          src={userDetails.profileImage}
          sx={{
            width: 300,
            height: 300,
            mb: 2,
            border: "3px solid rgba(255, 255, 255, 0.5)",
          }}
        />
 <Typography
  variant="h5" // Increased font size
  sx={{ fontWeight: "bold" }} // Makes it bold
>
  {userDetails.name || "Your Name"}
</Typography>

<Typography
  variant="body1" // Slightly bigger than "body2"
  sx={{ opacity: 0.8 }}
>
  {userDetails.bio || "No bio available"}
</Typography>


        {/* User Stats */}
        <Box sx={{ display: "flex", gap: 4, mt: 3, alignItems: "center" }}>
  {[
    { label: "Posts", value: posts.length },
    { label: "Followers", value: userDetails.followers?.length || 0 },
    { label: "Following", value: userDetails.following?.length || 0 },
  ].map((item, index) => (
    <Box key={index} textAlign="center">
      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
        {item.value}
      </Typography>
      <Typography variant="body1" sx={{ fontSize: "16px", opacity: 0.8 }}>
        {item.label}
      </Typography>
    </Box>
  ))}
</Box>

        {/* Edit Profile Button */}
        <Button
          variant="contained"
          color="secondary"
          sx={{ mt: 8, borderRadius: 2 }}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? "Cancel" : "Edit Profile"}
        </Button>

      </Box>

      {/* Right Side - Main Content */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 3 }}>
        {/* Navbar at the Top */}
        <Navbar />

        {/* Profile Edit Section */}
        {editMode && (
          <Paper
            sx={{
              p: 3,
              mt: 15,
              backgroundColor: "#e3f2fd",
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
              Edit Profile
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                name="username"
                value={formData.username || ""}
                onChange={handleChange}
                label="Username"
                variant="outlined"
                fullWidth
              />
              <TextField
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                label="Full Name"
                variant="outlined"
                fullWidth
              />
              <TextField
                name="bio"
                value={formData.bio || ""}
                onChange={handleChange}
                label="Bio"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
              />
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2, borderRadius: 2 }}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </Box>
          </Paper>
        )}

        {/* Posts Section */}
        <Box sx={{ mt: 15 }}>
  {posts.length > 0 ? (
    <Grid container spacing={2}>
      {posts.map((post, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Box sx={{ width: "100%", height: 250, overflow: "hidden", borderRadius: 2 }}>
            <img
              src={post.postimg}
              alt="Post"
              style={{
                width: "100%",
                height: "100%",
                gap: "16px",
                objectFit: "contain", // Ensures the entire image is visible without being cut
                borderRadius: "10px",
                backgroundColor: "#f9f9f9", // Ensures a neutral background
              }}
            />
          </Box>
        </Grid>
      ))}
    </Grid>
  ) : (
    <Typography variant="body2" sx={{ textAlign: "center", color: "gray", fontStyle: "italic" }}>
      No Posts Available
    </Typography>
  )}
</Box>
</Box>
    </Container>

      {/* Modal for Post Details */}
      <Modal open={openPostModal} onClose={() => setOpenPostModal(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          maxHeight: 800,
          bgcolor: 'white',
          p: 3,
          borderRadius: 2,
          overflowY: 'auto'
        }}>
          {selectedPost && (
            <>
              {selectedPost.postimg && (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={selectedPost.postimg}
                    alt="Post Detail"
                    style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                  />
                </Box>
              )}
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedPost.content}
              </Typography>
              {/* Options: Like, Comment, Share as icons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <IconButton>
                  <FavoriteIcon />
                </IconButton>
                <IconButton>
                  <ChatBubbleOutlineIcon />
                </IconButton>
                <IconButton>
                  <ShareIcon />
                </IconButton>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Modal for Camera Capture */}
      <Modal open={openCamera} onClose={() => setOpenCamera(false)}>
        <Box
          sx={{
            position: "absolute",
            marginTop: '50px',
            left: "50%",
            transform: "translateX(-50%)",
            width: 430,
            bgcolor: "white",
            boxShadow: 24,
            borderRadius: 2,
          }}
        >
          <CameraCapture onImageUpload={handleImageUpload} />
        </Box>
      </Modal>

      {/* Modal for Story View */}
      <Modal open={openStory} onClose={() => setOpenStory(false)}>
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            width: 430,
            height: 800,
            bgcolor: "black",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 2,
            overflow: "hidden",
            mt: 6,
            position: "relative",
          }}
        >
          {userStories.length > 0 && (
            <img
              src={userStories[currentIndexStory].mediaUrl}
              alt={`Story ${currentIndexStory + 1}`}
              style={{
                width: 430,
                height: 800,
                objectFit: "cover",
                borderRadius: 10,
              }}
            />
          )}
          <IconButton
            onClick={() => setOpenStory(false)}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              color: "white",
            }}
          >
            <CloseIcon />
          </IconButton>
          {currentIndexStory > 0 && (
            <IconButton
              onClick={handlePrevStory}
              sx={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                color: "white",
              }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>
          )}
          {currentIndexStory < userStories.length - 1 && (
            <IconButton
              onClick={handleNextStory}
              sx={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                color: "white",
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default ProfilePage;
