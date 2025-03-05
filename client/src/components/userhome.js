import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import ChatIcon from '@mui/icons-material/Chat'; // **NEW:** Chat icon imported for bottom nav
import CameraCapture from './CameraComponent';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Typography, Button, Container, Paper, Popover, Drawer, Dialog, DialogTitle, DialogContent, useMediaQuery, InputAdornment, TextField, Avatar, Box, IconButton, List, ListItem, ListItemText, Modal, MenuItem, Menu } from '@mui/material';
import Messenger from './messenger';
import PeopleIcon from '@mui/icons-material/People';
import Navbar from "../components/navbar"; // Import Navbar
import FeedIcon from "@mui/icons-material/DynamicFeed";
import EventIcon from "@mui/icons-material/Event";
import GroupsIcon from "@mui/icons-material/Groups";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AddPost from './AddPost';
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"; // Close button
import { ChatBubbleOutline as CommentIcon } from '@mui/icons-material';



const UserHome = () => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openCamera, setOpenStoryCamera] = useState(false);
  const [stories, setStories] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [openStory, setOpenStory] = useState(false);
  const [currentStories, setCurrentStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [storyUser, setstoryUser] = useState(null);
  const [currentIndexStory, setCurrentIndexStory] = useState(0);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isMessengerOpen, setMessengerOpen] = useState(false); // Messenger Toggle State
  const [userProfile, setUserProfile] = useState(null);
  const [recommendedProfiles, setRecommendedProfiles] = useState([]);
  const isTablet = useMediaQuery("(max-width: 960px)");
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});






  // ✅ Function to mark a story as "viewed"
  const followUser = async (userId, targetUserId) => {
    try {
      const response = await axios.post(`http://localhost:5001/api/user/${userId}/follow/${targetUserId}`);
      return response.data;
    } catch (error) {
      console.error("Error following user:", error);
      throw error;
    }
  };

  const unfollowUser = async (userId, targetUserId) => {
    try {
      const response = await axios.delete(`http://localhost:5001/api/user/${userId}/unfollow/${targetUserId}`);
      return response.data;
    } catch (error) {
      console.error("Error unfollowing user:", error);
      throw error;
    }
  };
  const markStoryAsViewed = async (storyId, userId) => {
    try {
      const postdata = { storyId, userId };
      console.log("postdata", postdata);
      await axios.put("http://localhost:5001/api/story/view", postdata);
      console.log(`👀 User ${user?._id} viewed story ${storyId}`);
    } catch (error) {
      console.error("🔥 Error updating story view:", error);
    }
  };

  useEffect(() => {
    if (openStory && currentStories.length > 0) {
      console.log(currentStories[currentIndexStory]);
      markStoryAsViewed(currentStories[currentIndexStory].storyId, user?._id);
    }
  }, [currentIndexStory, openStory]);

  const handleNext = () => {
    if (currentIndexStory < currentStories.length - 1) {
      setCurrentIndexStory((prevIndex) => prevIndex + 1);
    } else {
      handleClose(); // Close modal if it's the last story
    }
  };

  const handlePrev = () => {
    if (currentIndexStory > 0) {
      setCurrentIndexStory((prevIndex) => prevIndex - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") handleNext();
      if (event.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  const handleStoryClick = (storyUser, stories) => {
    console.log("storyUser", storyUser);
    setstoryUser(storyUser);
    setCurrentStories(stories);
    setCurrentIndex(0);
    setOpenStory(true);
  };

  const handleClose = () => {
    setOpenStory(false);
    setCurrentStories([]);
    setCurrentIndexStory(0);
  };

  const handleImageUpload = async (downloadURL, mediatype) => {
    try {
      console.log("downloadurl", downloadURL);
      console.log("downloadurl", mediatype);
      const postData = {
        userId: user?._id,
        userName: user?.name,
        mediaUrl: downloadURL,
        mediaType: mediatype
      };
      console.log('Post Data:', postData);
      await axios.post('http://localhost:5001/api/story/add', postData);
      fetchStories();
      console.log("✅ Story uploaded successfully:", downloadURL);
      setOpenStoryCamera(false);
    } catch (err) {
      console.error('Error creating post:', err.response?.data || err.message);
    }
  };

  const groupedStories = stories.reduce((acc, story) => {
    if (!acc[story.userId]) {
      acc[story.userId] = { userId: story.userId, stories: [] };
    }
    acc[story.userId].stories.push(story);
    return acc;
  }, {});
  const uniqueUserStories = Object.values(groupedStories);

  const fetchStories = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/story/all');
      const todaystories = res.data.map(story => ({
        storyId: story._id,
        userId: story.userId,
        userName: story.userName,
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType,
        views: story.views
      }));
      console.log("story", todaystories);
      setStories(todaystories);
    }
    catch (err) {
      console.error('Error fetching story:', err);
    }
  }

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/posts/all');
        const transformedPosts = res.data.map(post => ({
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
        console.log(transformedPosts);
      } catch (err) {
        console.error('Error fetching posts:', err);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/users/all');
        const transformedUsers = res.data.map(user => ({
          id: user._id,
          name: user.name,
          bio: user.bio,
          email: user.email,
          role: user.role,
          university: user.university,
          profileImage: user.profileImage,
          joinedAt: new Date(user.joinedAt).toLocaleDateString(),
        }));
        console.log(transformedUsers);
        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchPosts();
    fetchUsers();
    fetchStories();
  }, []);




  const handleProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };
  const handleAddpost = () => {
    navigate(`/add-post`);
  };
  const handleMarketplace = () => {
    navigate(`/marketplace`);
  };
  const handlemessenger = () => {
    navigate(`/messenger`);
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.put(`http://localhost:5001/api/posts/like/${postId}`);
      // Update your state to reflect the new like count from the response
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.postId === postId ? { ...post, likes: res.data.likes } : post
        )
      );
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const toggleMessenger = () => {
    setMessengerOpen((prev) => !prev);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log(user?._id)
        const res = await axios.get(`http://localhost:5001/api/users/${user?._id}`);
        console.log("Fetched User Profile:", res.data);
        setUserProfile(res.data);
      } catch (err) {
        console.error("Error fetching user profile:", err.message);
      }
    };

    fetchUserProfile();

    // Dummy data for recommended profiles
    setRecommendedProfiles([
      { id: 1, name: "John Doe", profileImage: "https://via.placeholder.com/50" },
      { id: 2, name: "Jane Smith", profileImage: "https://via.placeholder.com/50" },
      { id: 3, name: "Emily Johnson", profileImage: "https://via.placeholder.com/50" },
    ]);
  }, []);

  const buttons = [
    { label: "Feed", icon: <FeedIcon /> },
    { label: "Friends", icon: <PeopleIcon /> },
    { label: "Events", icon: <EventIcon /> },
    { label: "Community", icon: <GroupsIcon /> },
    { label: "Marketplace", icon: <StorefrontIcon /> },
  ];

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY > lastScrollY) {
            // Scrolling down → Hide Section
            setIsVisible(false);
          } else {
            // Scrolling up → Show Section
            setIsVisible(true);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);


  // Fetch comments for a specific post
  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/comments/${postId}`);
      setComments((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error("🔥 Error fetching comments:", err.response?.data || err.message);
    }
  };


  // Handle adding a new comment
  const handleAddComment = async (postId) => {
    if (!newComment[postId]) return;

    try {
      const res = await axios.post("http://localhost:5001/api/comments/add", {
        userId: user._id,
        postId: postId,
        text: newComment[postId],
      });

      console.log("✅ Comment Added:", res.data);
      setNewComment({ ...newComment, [postId]: "" });
      fetchComments(postId);
    } catch (err) {
      console.error("🔥 Error adding comment:", err.response?.data || err.message);
    }
  };
  const toggleCommentBox = (postId) => {
    setShowCommentBox((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };


  // Toggle showing all comments
  const toggleShowMore = (postId) => {
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };



  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        alignItems: "center",
      }}
    >
      {/* Navbar */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          backgroundColor: "#fff",
          boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
          zIndex: 1200,
          paddingY: 1,
        }}
      >
        <Navbar toggleMessenger={toggleMessenger} />
      </Box>

      {/* Story Section  */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: { xs: "center", md: "flex-start" },
          ml: { md: "64%", xs: 0 },
          mt: { xs: "18%", sm: "15%", md: "7%" },
        }}
      >

        <Box
          sx={{
            display: "flex",
            overflowX: "auto",
            gap: 2,
            pb: 2,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            cursor: "grab",
            alignContent: "center",
            maxWidth: { xs: "90vw", md: "100%" },
          }}
        >
          {/*  Add Story Element */}
          <Box sx={{ position: "relative", cursor: "pointer" }} onClick={() => setOpenStoryCamera(true)}>
            <Avatar
              src={user?.profileImage}
              sx={{
                width: 65,
                height: 65,
                border: "2px solid #ff4500",
              }}
            />
            <AddIcon
              sx={{
                position: "absolute",
                bottom: -2,
                right: -2,
                backgroundColor: "white",
                borderRadius: "50%",
                fontSize: 18,
                color: "#ff4500",
              }}
            />
          </Box>

          {uniqueUserStories.map(({ userId, stories }, index) => {
            const storyUser = users.find((user) => user.id === userId);
            if (!storyUser) return null;
            const hasSeenAllStories = stories.every(
              (s) => Array.isArray(s.views) && s.views.includes(user?._id)
            );
            return (
              <Avatar
                key={index}
                sx={{
                  width: 65,
                  height: 65,
                  cursor: "pointer",
                  border: `3px solid ${hasSeenAllStories ? "gray" : "#ff4500"}`,
                }}
                src={storyUser.profileImage}
                onClick={() => handleStoryClick(storyUser, stories)}
              />
            );
          })}
        </Box>
      </Box>
      <AddPost />


      {/*Sidenav*/}
      <Box
        sx={{
          width: { xs: "80%", sm: "60%", md: "20%" }, // Responsive width
          height: "100vh",
          padding: 2,
          display: { xs: "none", md: "flex" }, // Always visible on md and above
          flexDirection: "column",
          gap: 3,
          position: "fixed",
          left: 0, // Ensures it's always visible
          top: "100px",
          background: "#073574",
          color: "#fff",
          overflowY: "auto",
          boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Card 1: User Profile */}
        {user && (
          <Paper
            sx={{
              padding: 3,
              borderRadius: "15px",
              background: "#f8f2ec",
              backdropFilter: "blur(10px)",
              color: "black",
              boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
              transition: "0.3s",
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Avatar
                src={user.profileImage}
                sx={{
                  width: 100,
                  height: 100,
                  margin: "0 auto",
                  border: "3px solid rgba(255, 255, 255, 0.5)",
                }}
              />
              <Typography variant="h6" sx={{ mt: 2 }}>
                {user?.name}
              </Typography>
            </Box>

            {/* Stats Section */}
            <Box sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}>
              {[
                { label: "Posts", value: user?.posts || 0 },
                { label: "Followers", value: user?.followersNumber || 0 },
                { label: "Following", value: user?.followingsNumber || 0 },
              ].map((item, index) => (
                <Box key={index} textAlign="center">
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {item.value}
                  </Typography>
                  <Typography sx={{ fontSize: "14px", opacity: 0.8 }}>{item.label}</Typography>
                </Box>
              ))}
            </Box>

          </Paper>
        )}

        {/* Card 2: Navigation Buttons */}
        <Paper
          sx={{
            padding: 2,
            borderRadius: "15px",
            background: "#f8f2ec",
            backdropFilter: "blur(10px)",
            color: "black",
            textAlign: "center",
            boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
          }}
        >
          {buttons.map(({ label, icon }, index) => (
            <Button
              key={index}
              fullWidth
              variant="contained"
              startIcon={icon}
              sx={{
                mb: 1,
                background: "#B0C4DE",
                color: "black",
                transition: "0.3s",
                borderRadius: "10px",
                width: "200px",
                "&:hover": { background: "#d9d9d9" },
                "&:active": { transform: "scale(0.95)" },
              }}
              onClick={() => navigate(`/${label.toLowerCase()}`)}
            >
              {label}
            </Button>
          ))}
        </Paper>

        {/* Card 3: Recommended Profiles */}
        <Paper
          sx={{
            padding: 2,
            borderRadius: "15px",
            background: "#f8f2ec",
            backdropFilter: "blur(10px)",
            color: "black",
            boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
            Recommended for You
          </Typography>
          <List>
            {recommendedProfiles.map((profile) => (
              <ListItem
                key={profile.id}
                button
                sx={{
                  borderRadius: "10px",
                  transition: "0.3s",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                }}
              >
                <Avatar src={profile.profileImage} sx={{ width: 40, height: 40, mr: 2 }} />
                <ListItemText primary={profile.name} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>


      {/* Messenger*/}
      {!open && (
        <IconButton
          sx={{
            position: "fixed",
            right: "20px",
            top: "40%",
            transform: "translateY(-50%)",
            backgroundColor: "#073574",
            color: "#fff",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              backgroundColor: "#0a4a8c",
            },
          }}
          onClick={() => setOpen(true)}
        >
          <ChatIcon fontSize="large" />
        </IconButton>
      )}

      {/* Messenger Sidebar  */}
      <Box
        sx={{
          width: { xs: "80%", md: "25%" },
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          position: "fixed",
          right: open ? "0%" : "-80%",
          top: "10px",
          color: "#fff",
          overflowY: "auto",
          transition: "all 0.3s ease-in-out",
          padding: "16px",
        }}
      >
        {/* Close Button (Hides Panel) */}
        <IconButton
          sx={{
            alignSelf: "flex-end",
            width: "35px",
            height: "35px",
            top: "80px",
            color: "red",
            bgcolor: "black",
            transition: "0.3s",
            marginTop: "10%",
            "&:hover": {
              backgroundColor: "#777",
            },
          }}
          onClick={() => setOpen(false)}
        >
          <CloseIcon fontSize="large" />
        </IconButton>

        <Messenger />
      </Box>

      {/* FEED */}
      <Box sx={{ flex: 1, overflowY: "auto", maxHeight: "80vh", padding: { xs: 1, sm: 2 }, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", marginTop: "2%" }}>
        {posts.map((post, index) => {
          const postUser = users.find((user) => user.id === post.userId);
          const postComments = comments[post.postId] || [];
          const latestComment = postComments.length > 0 ? postComments[0] : null;
          const showAll = expandedPosts[post.postId];

          return (
            <Paper
              key={index}
              sx={{
                p: { xs: 2, sm: 3 },
                mb: { xs: 2, sm: 3 },
                width: "100%",
                maxWidth: { xs: "100%", sm: "600px" },
                borderRadius: "15px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                transition: "0.3s",
                "&:hover": { boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.2)" },
              }}
            >
              {postUser && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar src={postUser.profileImage} sx={{ width: 50, height: 50, cursor: "pointer" }} />
                  <Typography variant="h6">{postUser.name}</Typography>
                </Box>
              )}

              {post.postimg && (
                <Box sx={{ mt: 2, borderRadius: "10px", overflow: "hidden" }}>
                  <img src={post.postimg} alt="Post" style={{ width: "100%", borderRadius: "10px" }} />
                </Box>
              )}

              {post.content && <Typography sx={{ mt: 2 }}>{post.content}</Typography>}

              {/* Like & Comment Icons */}
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <IconButton>
                  <FavoriteIcon />
                </IconButton>
                <Typography>{post.likes} Likes</Typography>

                <IconButton onClick={() => toggleCommentBox(post.postId)}>
                  <CommentIcon />
                </IconButton>
                <Typography>{postComments.length} Comments</Typography>
              </Box>

              {/* Comment Bar - Visible when clicking comment icon */}
              {showCommentBox[post.postId] && (
                <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Write a comment..."
                    value={newComment[post.postId] || ""}
                    onChange={(e) => setNewComment({ ...newComment, [post.postId]: e.target.value })}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleAddComment(post.postId)}
                  >
                    Post
                  </Button>
                </Box>
              )}

              {/* Latest Comment */}
              {latestComment && !showAll && (
                <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar src={latestComment.userId?.profileImage} sx={{ width: 30, height: 30 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {latestComment.userId?.name}
                    </Typography>
                    <Typography variant="body2">{latestComment.text}</Typography>
                    <Typography variant="caption" color="gray">
                      {new Date(latestComment.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          );
        })}
      </Box>


      {/* Modal for Camera Capture */}
      <Modal open={openCamera} onClose={() => setOpenStoryCamera(false)}>
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
          <CameraCapture onMediaUpload={handleImageUpload} />
        </Box>
      </Modal>

      {/* Modal for Story View */}
      <Modal open={openStory} onClose={handleClose}>
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
          {currentStories.length > 0 && (
            <>
              {currentStories[currentIndexStory].mediaType === "video" ? (
                <video
                  key={currentIndexStory}
                  src={currentStories[currentIndexStory].mediaUrl}
                  autoPlay
                  controls
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 10,
                  }}
                />
              ) : (
                <img
                  key={currentIndexStory}
                  src={currentStories[currentIndexStory].mediaUrl}
                  alt={`Story ${currentIndexStory + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 10,
                  }}
                />
              )}
            </>
          )}

          {/* Close Button */}
          <IconButton
            onClick={handleClose}
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

          {/* Story User Info */}
          {storyUser && (
            <Box
              sx={{
                position: "absolute",
                top: 10,
                left: 10,
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderRadius: "20px",
                padding: "5px 10px",
              }}
            >
              <Avatar
                src={storyUser.profileImage}
                sx={{ width: 40, height: 40, cursor: "pointer" }}
                onClick={() => handleProfile(storyUser.userId)}
              />
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "white" }}>
                {storyUser.name}
              </Typography>
            </Box>
          )}

          {/* Navigation Buttons */}
          {currentIndexStory > 0 && (
            <IconButton
              onClick={handlePrev}
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
          {currentIndexStory < currentStories.length - 1 && (
            <IconButton
              onClick={handleNext}
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
    </Container>
  );
};

export default UserHome;
