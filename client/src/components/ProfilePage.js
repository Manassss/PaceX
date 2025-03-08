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
import CircularProgress from "@mui/material/CircularProgress";


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
  const vistinguser = id === user?._id ? false : true;
  const auth = getAuth();
  const userId = id ? id : user?._id;
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
  const [currentPostIndex, setCurrentPostIndex] = useState(null);

  

// Fetch comments for a specific post
const fetchComments = async (postId) => {
  try {
    console.log("Fetching comments for post:", postId);
    const res = await axios.get(`http://localhost:5001/api/comment/${postId}`);

    console.log("Fetched Comments:", res.data);  // Debugging log

    // ✅ Store only the array inside the comments state
    setComments(prev => ({
      ...prev,
      [postId]: res.data.comments // Extract the `comments` array
    }));
  } catch (err) {
    console.error("Error fetching comments:", err.message);
  }
};





// Add a new comment
const handleAddComment = async (postId) => {
  if (!newComment[postId]) return;  // Ensure input is not empty

  try {
    console.log(user);
    const res = await axios.post("http://localhost:5001/api/comment/add", {
      userId: user._id,
      postId: postId,
      text: newComment[postId],
      username: user?.name,
      userimg: user?.profileImage
    });

    console.log("✅ Comment Added:", res.data);
    setNewComment({ ...newComment, [postId]: "" }); // Clear input field
    fetchComments(postId); // Refresh comments for the post
  } catch (err) {
    console.error("🔥 Error adding comment:", err.response?.data || err.message);
  }
};



// Toggle comment box visibility
const toggleCommentBox = (postId) => {
  setShowCommentBox((prev) => ({ ...prev, [postId]: !prev[postId] }));
};


// Handle post like (optional)
const handleLike = async (postId) => {
  try {
    const res = await axios.put(`http://localhost:5001/api/posts/like/${postId}`);
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.postId === postId ? { ...post, likes: res.data.likes } : post
      )
    );
  } catch (err) {
    console.error("Error liking post:", err);
  }
};



  const handleConnectToggle = async () => {
    setLoading(true);
    try {
      // Simulating API call with a timeout (Replace with actual API request)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Toggle connection state
      setIsConnected((prev) => !prev);
      handleFollowToggle(userId);
    } catch (error) {
      console.error("Error updating connection:", error);
    }
    setLoading(false);
  };



  useEffect(() => {
    console.log("id", id);
    if (!userId) return;
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/users/profile/${userId}`);
        console.log("Fetched User Data:", res.data); // Debugging output
    
        // Transform the data
        const transformedData = {
          id: res.data._id,
          username: res.data.username,
          name: res.data.name,
          email: res.data.email,
          bio: res.data.bio || "No bio available",
          university: res.data.university || "Unknown University",
          role: res.data.role || "N/A",
          profileImage: res.data.profileImage || "default_profile_image_url",
          postsCount: res.data.posts || 0, // Assuming it's a number
          followersCount: res.data.followersNumber || res.data.followers?.length || 0,
          followingCount: res.data.followingsNumber || res.data.followings?.length || 0,
          joinedAt: new Date(res.data.joinedAt).toLocaleDateString(),
        };
    
        console.log("Transformed Data:", transformedData); // Debugging output
    
        setIsConnected(res.data.followers?.includes(user?._id) ? true : false);
        setUserDetails(transformedData);
        setFormData(transformedData);
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
        console.log("🔍 API Response:", res.data); // ✅ Debugging log

    
        // Filter posts by the current user
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
    
        // Fetch comments for each post and attach them
        const postsWithComments = await Promise.all(
          transformedPosts.map(async (post) => {
            try {
              const commentsRes = await axios.get(`http://localhost:5001/api/comment/${post.postId}`);
              return { ...post, comments: commentsRes.data }; // Attach fetched comments
            } catch (commentErr) {
              console.error(`Error fetching comments for post ${post.postId}:`, commentErr.message);
              return { ...post, comments: [] }; // Return empty comments if error occurs
            }
          })
        );
    
        setPosts(postsWithComments);
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
  const handlePostClick = async (post) => {
    console.log("🔍 Post Clicked:", post); // ✅ Debugging log

    setSelectedPost(post);
    await fetchComments(post.postId);  // 🔥 Fetch comments before opening modal
    setShowCommentBox((prev) => ({ ...prev, [post.postId]: true })); // 🔥 Ensure comment section is shown
    setOpenPostModal(true);
  };
  
  const handleFollowToggle = async (targetUserId) => {
    try {
      console.log(`user id ${user?._id} and targetid ${targetUserId}`);
      const response = await fetch('http://localhost:5001/api/users/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?._id, targetUserId: targetUserId }),
      });

      const data = await response.json();
      alert(data.message); // Show follow/unfollow message
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const openPostGallery = (index) => {
    setCurrentPostIndex(index);
    setSelectedPost(posts[index]);
    fetchComments(posts[index].postId);
    setShowCommentBox({ [posts[index].postId]: true });
    setOpenPostModal(true);
  };
  
  const handleNextPost = () => {
    if (currentPostIndex < posts.length - 1) {
      const nextIndex = currentPostIndex + 1;
      setCurrentPostIndex(nextIndex);
      setSelectedPost(posts[nextIndex]);
      fetchComments(posts[nextIndex].postId);
      setShowCommentBox({ [posts[nextIndex].postId]: true });
    }
  };
  
  const handlePrevPost = () => {
    if (currentPostIndex > 0) {
      const prevIndex = currentPostIndex - 1;
      setCurrentPostIndex(prevIndex);
      setSelectedPost(posts[prevIndex]);
      fetchComments(posts[prevIndex].postId);
      setShowCommentBox({ [posts[prevIndex].postId]: true });
    }
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
          backgroundColor: "#f8f2ec",
        }}
      >
        {/* Left Sidebar - User Info */}
        <Box
          sx={{
            width: { xs: "100%", sm: "30%", md: "25%" }, // Full width on very small screens
            minWidth: "250px", // Prevents sidebar from becoming too narrow
            height: "100vh",
            backgroundColor: "#073574",
            color: "#fff",
            padding: { xs: 2, sm: 3 }, // Adjust padding for small screens
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "3px 0px 10px rgba(0, 0, 0, 0.2)",
            //  position: "fixed", // Keeps sidebar fixed while scrolling
            top: 0,
            left: 0,
            overflowY: "auto", // Prevents content from overflowing,
            marginTop: '70px'

          }}
        >
          {/* Profile Image */}
          <Avatar
            src={userDetails.profileImage}
            sx={{
              width: "250px", // Fixed size for consistency
              height: "250px",
              mb: 2,
              border: "3px solid rgba(255, 255, 255, 0.5)",
              mt: 5
            }}
          />
          <Typography variant="h5" sx={{ fontWeight: "bold", textAlign: "center" }}>
            {userDetails.name || "Your Name"}
          </Typography>

          <Typography variant="body1" sx={{ opacity: 0.8, textAlign: "center" }}>
            {userDetails.bio || "No bio available"}
          </Typography>

          {/* User Stats */}
          <Box sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "center" }}>
  {[
    { label: "Posts", value: userDetails.postsCount || 0 },
    { label: "Followers", value: userDetails.followersCount || 0 },
    { label: "Following", value: userDetails.followingCount || 0 },
  ].map((item, index) => (
    <Box key={index} textAlign="center">
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        {item.value}
      </Typography>
      <Typography sx={{ fontSize: "14px", opacity: 0.8 }}>
        {item.label}
      </Typography>
    </Box>
  ))}
</Box>


          {/* follow and edit Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 1.5,
              mt: 3,
              width: "100%",
              justifyContent: "center",
            }}
          >
            {vistinguser ? <Button
              variant="contained"
              sx={{
                borderRadius: 2,
                padding: "6px 12px",
                fontSize: "14px",
                backgroundColor: isConnected ? "#f0f0f0" : "#007bff",
                color: isConnected ? "#000" : "#fff",
                "&:hover": { backgroundColor: isConnected ? "#e0e0e0" : "#0056b3" },
              }}
              onClick={handleConnectToggle}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: "inherit" }} />
              ) : isConnected ? (
                <>
                  Following <span style={{ marginLeft: "5px" }}>▼</span>
                </>
              ) : (
                "Connect"
              )}
            </Button> : <></>}

            {!vistinguser ?
              <Button
                variant="contained"
                sx={{
                  borderRadius: 2,
                  padding: "6px 12px",
                  fontSize: "14px",
                }}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? "Cancel" : "Edit Profile"}
              </Button>
              : <></>}

          </Box>
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
      backgroundColor: "#fff",
      borderRadius: 2,
      boxShadow: 3,
      height: 'auto',
    }}
  >
    <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
      Edit Profile
    </Typography>
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", gap: 2 }}>
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
      </Box>
      <TextField
        name="bio"
        value={formData.bio || ""}
        onChange={handleChange}
        label="Bio"
        variant="outlined"
        fullWidth
        />
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2, borderRadius: 2, width: 200, right:-700 }}
        onClick={handleSave}
      >
        Save Changes
      </Button>
    </Box>
  </Paper>
)}


 {/* Posts Section */}
<Box sx={{ mt: 12 }}>
  {posts.length > 0 ? (
    <Grid container spacing={1} sx={{ justifyContent: "center" }}>
      {posts.map((post, index) => (
        <Grid item xs={6} sm={4} md={3} key={index}>
          <Box
            sx={{
              width: "100%",
              aspectRatio: "1",
              overflow: "hidden",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer", // Makes it clickable
            }}
            onClick={() => handlePostClick(post)} // Open modal on click
          >
            <img
              src={post.postimg}
              alt="Post"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "4px",
              }}
            />
          </Box>
        </Grid>
      ))}
    </Grid>
  ) : (
    <Typography
      variant="body2"
      sx={{ textAlign: "center", color: "gray", fontStyle: "italic" }}
    >
      No Posts Available
    </Typography>
  )}
</Box>
       </Box>
      </Container>

{/* Post Modal */}
{selectedPost && (
  <Modal
    open={openPostModal}
    onClose={() => setOpenPostModal(false)}
    BackdropProps={{
      sx: {
        backdropFilter: "blur(10px)", // ✅ Blur background when modal is open
        backgroundColor: "rgba(0, 0, 0, 0.4)", // ✅ Semi-transparent overlay
      },
    }}
  >
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "90vw",
        maxWidth: "500px",
        bgcolor: "#f8f2ec",
        p: 3,
        borderRadius: 2,
        position: "relative",
      }}
    >
      {/* Left Arrow - Navigate to Previous Post */}
      {currentPostIndex > 0 && (
        <IconButton
          onClick={handlePrevPost}
          sx={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            color: "white",
          }}
        >
          <ArrowBackIosNewIcon />
        </IconButton>
      )}

      {/* Post Image */}
      <img
        src={selectedPost.postimg}
        alt="Post Detail"
        style={{
          width: "100%",
          height: "auto",
          borderRadius: "10px",
        }}
      />

      {/* Caption */}
      {selectedPost?.content && (
        <Typography
          sx={{
            mt: 2,
            textAlign: "center",
            fontStyle: "italic",
            color: "#333",
            wordBreak: "break-word",
          }}
        >
          {selectedPost.content}
        </Typography>
      )}

      {/* Like & Comment Icons */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 2 }}>
        <IconButton>
          <FavoriteIcon sx={{ color: "red", fontSize: "28px" }} />
        </IconButton>
        <IconButton onClick={() => toggleCommentBox(selectedPost.postId)}>
          <ChatBubbleOutlineIcon sx={{ fontSize: "28px" }} />
        </IconButton>
      </Box>

      {/* Comment Section */}
      {showCommentBox[selectedPost.postId] && (
        <Box sx={{ mt: 2 }}>
          {/* Add Comment Input */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Write a comment..."
              value={newComment[selectedPost.postId] || ""}
              onChange={(e) =>
                setNewComment({ ...newComment, [selectedPost.postId]: e.target.value })
              }
              sx={{
                borderRadius: "20px",
                backgroundColor: "#f8f8f8",
                boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
                "& .MuiOutlinedInput-root": { borderRadius: "20px" },
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleAddComment(selectedPost.postId)}
              sx={{
                borderRadius: "20px",
                boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
                padding: "6px 16px",
              }}
            >
              Post
            </Button>
          </Box>

          {/* Display Comments */}
          <Box sx={{ maxHeight: "300px", overflowY: "auto", pr: 1 }}>
            <List>
              {comments[selectedPost.postId]?.map((comment, index) => (
                <ListItem key={index} sx={{ bgcolor: "#f8f2ec", mb: 1, borderRadius: 2 }}>
                  <Avatar src={comment.userimg} sx={{ mr: 2, width: 30, height: 30 }} />
                  <ListItemText
                    primary={<Typography sx={{ fontWeight: "bold" }}>{comment.username}</Typography>}
                    secondary={<Typography>{comment.text}</Typography>}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      )}

      {/* Right Arrow - Navigate to Next Post */}
      {currentPostIndex < posts.length - 1 && (
        <IconButton
          onClick={handleNextPost}
          sx={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            color: "white",
          }}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      )}
    </Box>
  </Modal>
)}






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
