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
        sx={{
          width: 600,
          height: 800,
          margin: '50px auto',
          backgroundColor: '#fff',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          p: 2,
          border: '2px solid #ccc'
        }}
      >
        {/* Top Section: Logout & Settings */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <IconButton onClick={handleLogout} color="secondary">
            <LogoutIcon />
          </IconButton>
          <IconButton onClick={() => setEditMode(!editMode)} color="primary">
            <SettingsIcon />
          </IconButton>
        </Box>

        <Box display="flex" flexDirection="column" alignItems="center">
          {/* Profile Image: In edit mode, wrapped in a label; in view mode, clicking opens stories.
              If there are user stories, add a glowing border */}
          {editMode ? (
            <label htmlFor="file-input">
              <Avatar
                src={formData.profileImage || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                sx={{ width: 100, height: 100, mb: 2, cursor: 'pointer' }}
              />
            </label>
          ) : (
            <IconButton onClick={handleStoriesClick} sx={{ p: 0 }}>
              <Avatar
                src={formData.profileImage || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                sx={{
                  width: 100,
                  height: 100,
                  mb: 2,
                  ...(userStories.length > 0 && {
                    border: '3px solid #ff4500',
                    boxShadow: '0 0 10px 2px #ff9800'
                  })
                }}
              />
            </IconButton>
          )}
          {editMode && (
            <>
              <input
                id="file-input"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                  onClick={handleImageUpload}
                >
                  Upload Image
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                  onClick={() => setOpenCamera(true)}
                >
                  Open Camera
                </Button>
              </Box>
            </>
          )}

          {/* Profile Info / Settings Form */}
          {editMode ? (
            <Paper
              sx={{
                p: 3,
                mt: 2,
                backgroundColor: '#e3f2fd',
                borderRadius: 2,
                boxShadow: 3,
                width: '100%'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                Edit Profile
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  name="username"
                  value={formData.username || ''}
                  onChange={handleChange}
                  label="Username"
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  label="Full Name"
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  name="bio"
                  value={formData.bio || ''}
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
                  sx={{ mt: 2, textTransform: 'none', borderRadius: 2, width: '100%' }}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </Box>
            </Paper>
          ) : (
            <>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {userDetails.username || ''}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {userDetails.name || 'Your Name'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {userDetails.bio || ''}
              </Typography>
            </>
          )}
        </Box>

        {/* User Stats */}
        <Box sx={{ display: 'flex', gap: 3, mt: 3, justifyContent: 'center' }}>
          <Typography variant="body2">Posts: {posts.length}</Typography>
          <Typography variant="body2">Followers: {userDetails.followers?.length || 0}</Typography>
          <Typography variant="body2">Following: {userDetails.following?.length || 0}</Typography>
        </Box>

        {/* Posts Grid */}
        <Box sx={{ mt: 5, pt: 3, px: 2, flex: 1, overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
          {posts.length > 0 ? (
            <Grid container spacing={3}>
              {posts.map((post, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper
                    sx={{
                      p: 3,
                      backgroundColor: 'transparent',
                      borderRadius: 2,
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setSelectedPost(post);
                      setOpenPostModal(true);
                    }}
                  >
                    {post.postimg && (
                      <Box sx={{ mb: 2 }}>
                        <img
                          src={post.postimg}
                          alt="Post"
                          style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                        />
                      </Box>
                    )}
                    <Typography variant="body2">{post.content}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'gray', fontStyle: 'italic' }}>
              No Posts Available
            </Typography>
          )}
        </Box>

        {/* Bottom Navigation - Fixed to Bottom */}
        <Box sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          p: 1,
          borderTop: '1px solid #ccc'
        }}>
          <IconButton onClick={() => handleProfile(user?._id)}>
            <Avatar src={user?.profileImage} sx={{ width: 50, height: 50, borderRadius: '50%' }} />
          </IconButton>

          <IconButton onClick={handleAddpost}
            sx={{
              bgcolor: '#ff4500',
              color: 'white',
              width: 50,
              height: 50,
              borderRadius: '50%',
              boxShadow: 3
            }}>
            <AddIcon sx={{ fontSize: 30 }} />
          </IconButton>

          <IconButton
            onClick={handleHomeClick}
            sx={{
              backgroundColor: '#ff9800',
              color: 'white',
              borderRadius: '50%',
              width: 50,
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <HomeIcon fontSize="large" />
          </IconButton>
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
