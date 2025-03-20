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
import { Link } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';




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
  const [following, setFollowing] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3); // Show 3 users initially
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ✅ Function to mark a story as "viewed"
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
    console.log("currentstory", currentStories);
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
        views: story.views,
      }));
      console.log("story", todaystories);
      console.log("userid", user?._id)
      setStories(todaystories);
    }
    catch (err) {
      console.error('Error fetching story:', err);
    }
  }

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/posts/feed/${user?._id}`);
        const postsData = res.data;

        // Get the list of blocked users
        const blockedUsers = user?.blockeduser || [];

        // Fetch comments and filter out blocked users
        const postsWithComments = await Promise.all(
          postsData.map(async (post) => {
            const commentsRes = await axios.get(`http://localhost:5001/api/comment/${post._id}`);



            return {
              content: post.content,
              createdAt: new Date(post.createdAt).toLocaleString(),
              dislikes: post.dislikes || [],
              likes: Array.isArray(post.likes) ? post.likes : [],
              postimg: post.postimg,
              userId: post.userId,
              userName: post.userName,
              postId: post._id,
              comments: commentsRes.data,  // ✅ Attach only unblocked comments
              images: post.images
            };
          })
        );

        setPosts(postsWithComments);
        console.log("postsWithComments", postsWithComments);
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

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        if (!user?._id) {
          console.warn("⚠️ User ID is undefined, skipping fetch.");
          return;
        }

        console.log(`🔍 Fetching user stats for ID: ${user._id}`);

        const res = await axios.get(`http://localhost:5001/api/users/profile/${user._id}`);

        console.log("✅ User stats response:", res.data); // Debugging: Check API response

        // Extract and transform user data
        const transformedData = {
          userId: res.data._id,
          name: res.data.name,
          username: res.data.username,
          email: res.data.email,
          bio: res.data.bio || "No bio available",
          role: res.data.role,
          university: res.data.university || "Not specified",
          profileImage: res.data.profileImage || "No image available",
          postsCount: res.data.posts || 0,
          followersCount: res.data.followers?.length || 0,
          followingCount: res.data.followings?.length || 0,
          joinedAt: new Date(res.data.joinedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        };

        console.log("📝 Transformed User Data:", transformedData);

        setUserProfile(transformedData); // Store transformed user profile

      } catch (err) {
        console.error("❌ Error fetching user stats:", err);
      }
    };

    // Execute function if user ID exists
    if (user?._id) {
      console.log("🔄 User ID exists, fetching stats...");
      fetchUserStats();
    } else {
      console.warn("🚨 User ID is undefined, skipping fetch.");
    }


  }, [user]);


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

  const toggleMessenger = () => {
    setMessengerOpen((prev) => !prev);
  };

  useEffect(() => {
    // Dummy data for recommended profiles
    setRecommendedProfiles([
      { id: 1, name: "John Doe", profileImage: "https://via.placeholder.com/50" },
      { id: 2, name: "Jane Smith", profileImage: "https://via.placeholder.com/50" },
      { id: 3, name: "Emily Johnson", profileImage: "https://via.placeholder.com/50" },
    ]);
  }, []);

  const buttons = [
    { label: "Friends", icon: <PeopleIcon />, url: "/userhome" },
    { label: "Events", icon: <EventIcon />, url: "/userhome" },
    { label: "Community", icon: <GroupsIcon />, url: "/community" },
    { label: "Marketplace", icon: <StorefrontIcon />, url: "/marketplace" },
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
      console.log("Fetching comments for post", postId);
      const res = await axios.get(`http://localhost:5001/api/comment/${postId}`);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.postId === postId ? { ...post, comments: res.data } : post
        )
      );
    } catch (err) {
      console.error("Error fetching comments:", err.response?.data || err.message);
    }
  };


  // Handle adding a new comment
  const handleAddComment = async (postId, postuserId) => {
    console.log("ps", posts)
    if (!newComment[postId]) return;

    try {
      console.log(user);
      const res = await axios.post("http://localhost:5001/api/comment/add", {
        userId: user._id,
        postId: postId,
        text: newComment[postId],
        username: user?.name,
        userimg: user?.profileImage,
        post_userid: postuserId
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

  //follow unfollow 
  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        if (!user?._id) return;
        const res = await axios.get(`http://localhost:5001/api/users/profile/${user._id}`);

        console.log("🔄 Fetching Following List:", res.data.followings);
        setFollowing(res.data.followings || []); // ✅ Ensure array format
      } catch (err) {
        console.error("Error fetching following list:", err);
      }
    };

    fetchFollowing();
  }, [user]); // ✅ Runs when user updates

  const handleFollowToggle = async (targetUserId) => {
    try {
      const isFollowing = following.includes(targetUserId);
      console.log(`🔄 Toggling follow status for ${targetUserId} | Currently following: ${isFollowing}`);

      // Make the follow/unfollow API call
      const response = await axios.post('http://localhost:5001/api/users/follow', {
        userId: user?._id,
        targetUserId,
      });

      console.log("✅ Follow API Response:", response.data);

      // Immediately update the following state for a responsive UI
      setFollowing((prevFollowing) =>
        isFollowing ? prevFollowing.filter((id) => id !== targetUserId) : [...prevFollowing, targetUserId]
      );

      // Re-fetch user stats to update the follower count
      fetchUserStats(); // Re-fetch user stats after follow/unfollow to update counts in stat section
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      if (!user?._id) {
        console.warn("⚠️ User ID is undefined, skipping fetch.");
        return;
      }

      console.log(`🔍 Fetching user stats for ID: ${user._id}`);

      const res = await axios.get(`http://localhost:5001/api/users/profile/${user._id}`);

      console.log("✅ User stats response:", res.data); // Debugging: Check API response

      // Extract and transform user data
      const transformedData = {
        userId: res.data._id,
        name: res.data.name,
        username: res.data.username,
        email: res.data.email,
        bio: res.data.bio || "No bio available",
        role: res.data.role,
        university: res.data.university || "Not specified",
        profileImage: res.data.profileImage || "No image available",
        postsCount: res.data.posts || 0,
        followersCount: res.data.followers?.length || 0,  // Make sure this is being updated correctly
        followingCount: res.data.followings?.length || 0,
        joinedAt: new Date(res.data.joinedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };

      console.log("📝 Transformed User Data:", transformedData);

      setUserProfile(transformedData); // Store transformed user profile
    } catch (err) {
      console.error("❌ Error fetching user stats:", err);
    }
  };

  const recommendedUsers = users.filter((userProfile) =>
    !following.includes(userProfile.id)
  );

  const handleShowMore = () => {
    setVisibleCount(recommendedUsers.length);  // Set the visible count to display all profiles
  };


  // Like functionality
  const handleLikePost = async (postId) => {
    if (!user || !user._id) {
      console.error("🚨 User is not logged in or undefined!");
      return;
    }

    try {
      const post = posts.find((p) => p.postId === postId);
      if (!post || !post.likes) {
        console.warn("⚠️ Post not found or likes array is undefined!");
        return;
      }

      const alreadyLiked = post.likes.includes(user._id);

      const response = alreadyLiked
        ? await axios.delete("http://localhost:5001/api/likes/remove", {
          data: { userId: user._id, postId },
        })
        : await axios.post("http://localhost:5001/api/likes/add", { userId: user._id, postId });

      console.log("✅ Like toggled:", response.data);

      setLikedPosts((prevLikedPosts) =>
        alreadyLiked
          ? prevLikedPosts.filter((id) => id !== postId)
          : [...prevLikedPosts, postId]
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.postId === postId
            ? {
              ...post,
              likes: alreadyLiked
                ? post.likes.filter((id) => id !== user._id)
                : [...post.likes, user._id],
            }
            : post
        )
      );
    } catch (error) {
      console.error("🔥 Error toggling like:", error.response?.data || error.message);
    }
  };
  const handleDeleteStory = async (storyId) => {
    try {
      await axios.delete(`http://localhost:5001/api/story/delete/${storyId}`);
      console.log("✅ Story deleted successfully");

      // Remove the deleted story from the state
      setCurrentStories((prevStories) => prevStories.filter((story) => story.storyId !== storyId));
      setStories((prevStories) => prevStories.filter((story) => story.storyId !== storyId))
      // If no more stories remain, close the modal
      if (currentStories.length === 1) {
        handleClose();
      } else {
        setCurrentIndexStory((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
      }
    } catch (err) {
      console.error("❌ Error deleting story:", err.response?.data || err.message);
    }
  };




  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        if (!user?._id) {
          console.warn("⚠️ User ID is undefined, skipping fetch.");
          return;
        }

        console.log(`🔍 Fetching user stats for ID: ${user._id}`);

        const res = await axios.get(`http://localhost:5001/api/users/profile/${user._id}`);

        if (!res.data) {
          console.warn("🚨 No user data received!");
          return;
        }

        console.log("✅ User stats response:", res.data);

        setUserProfile({
          userId: res.data._id,
          name: res.data.name,
          username: res.data.username,
          email: res.data.email,
          bio: res.data.bio || "No bio available",
          role: res.data.role,
          university: res.data.university || "Not specified",
          profileImage: res.data.profileImage || "No image available",
          postsCount: res.data.posts || 0,
          followersCount: res.data.followers?.length || 0,
          followingCount: res.data.followings?.length || 0,
          joinedAt: new Date(res.data.joinedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        });
      } catch (err) {
        console.error("❌ Error fetching user stats:", err);
      }
    };

    if (user?._id) {
      fetchUserStats();
    }
  }, [user]);




  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#f8f2ec",
        position: "relative",
      }}
    >
      {/* Navbar */}
      {/* <Box
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
      </Box> */}

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

      {/*Add Post*/}

      <AddPost />


      {/*Sidenav*/}
      <Box
        sx={{
          width: { xs: "80%", sm: "60%", md: "20%" },
          height: "100vh",
          padding: 2,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          gap: 3,
          position: "fixed",
          left: 0,
          top: "100px",
          background: "#073574",
          color: "#fff",
          overflowY: "auto",
          boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.3)",
          "&::-webkit-scrollbar": { display: "none" },  // Hide scrollbar for webkit browsers
          scrollbarWidth: "none",  // Hide scrollbar for Firefox
        }}
      >
        {/* Card 1: User Profile */}
        {user && (
          <Paper
            sx={{
              borderRadius: "15px",
              background: "#f8f2ec",
              color: "black",
              boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
              transition: "0.3s",
              padding: '20px',
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Link to={`/profile/${user?._id}`} style={{ textDecoration: 'none' }}>
                <Avatar
                  src={user.profileImage}
                  sx={{
                    width: 80,
                    height: 80,
                    margin: "0 auto",
                    border: "3px solid rgba(255, 255, 255, 0.5)",
                  }}
                />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {user?.name}
                </Typography>
              </Link>
            </Box>

            {/* Stats Section */}
            <Box sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}>
              {userProfile &&
                [
                  { label: "Posts", value: userProfile.postsCount || 0 },
                  { label: "Followers", value: userProfile.followersCount || 0 },
                  { label: "Following", value: userProfile.followingCount || 0 },
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
          </Paper>
        )}

        {/* Card 2: Navigation Buttons */}
        <Paper
          sx={{
            borderRadius: "15px",
            background: "#f8f2ec",
            backdropFilter: "blur(10px)",
            color: "black",
            textAlign: "center",
            boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
            padding: "10px",
          }}
        >
          {buttons.map(({ label, icon, url }, index) => (
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
              onClick={() => navigate(`${url}`)}
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
          <List sx={{ padding: 0 }}>
            {/* Display the first 3 profiles initially */}
            {recommendedUsers.slice(0, visibleCount).map((profile) => (
              <ListItem
                key={profile.id}
                button
                sx={{
                  borderRadius: "10px",
                  transition: "0.3s",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                  padding: "8px 16px", // Ensures padding for each list item
                }}
              >
                {/* Wrap Avatar and ListItemText in Link for profile navigation */}
                <Link to={`/profile/${profile.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Avatar src={profile.profileImage} sx={{ width: 40, height: 40, mr: 2 }} />
                  <ListItemText primary={profile.name} />
                </Link>
              </ListItem>
            ))}
          </List>

          {/* Show More Button */}
          {recommendedUsers.length > visibleCount && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button onClick={handleShowMore} variant="contained" color="primary">
                Show More
              </Button>
            </Box>
          )}
        </Paper>
      </Box>


      {/* Messenger Button */}
      {!open && (
        <IconButton
          sx={{
            position: "fixed",
            right: "20px",
            bottom: "2%",
            transform: "translateY(-50%)",
            backgroundColor: "#073574",
            color: "#fff",
            transition: "all 0.3s ease-in-out",
            "&:hover": { backgroundColor: "#0a4a8c" },
          }}
          onClick={() => setOpen(true)} // Open Messenger
        >
          <ChatIcon fontSize="large" />
        </IconButton>
      )}

      {/* Messenger Sidebar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          position: "fixed",
          right: open ? "0%" : "-80%",
          top: "12%",
          overflowY: "auto",
          transition: "all 0.2s ease-in-out",

        }}
      >
        {/* Close Button */}
        <IconButton
          sx={{
            position: "absolute",
            alignSelf: "flex-end",
            width: "35px",
            height: "35px",
            top: "-20px",
            color: "#555",
            transition: "0.3s",
            marginTop: "10%",
          }}
          onClick={() => setOpen(false)} // Close Messenger
        >
          <CloseIcon fontSize="medium" />
        </IconButton>

        {/* ✅ Fix: Pass resetChatbox as a prop */}
        <Messenger resetChatbox={!open} />
      </Box>

      {/* FEED */}
      <Box sx={{ flex: 1, overflowY: "auto", maxHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", width: "100%", marginTop: "1%" }}>
        {posts.map((post, index) => {
          const postUser = users.find((user) => user.id === post.userId);
          const isFollowing = following.includes(postUser?.id); // ✅ Check updated following state

          return (
            <Paper
              key={index}
              sx={{
                mb: { xs: 2, sm: 3 },
                width: "100%",
                maxWidth: { xs: "100%", sm: "600px" },
                backgroundColor: "transparent",
                boxShadow: "none",
              }}
            >
              {postUser && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar src={postUser.profileImage} sx={{ width: 50, height: 50, cursor: "pointer" }} />
                  <Typography variant="h6">{postUser.name}</Typography>

                  {/* ✅ Corrected Follow/Disconnect Button */}
                  {postUser.id !== user?._id && (
                    <Button
                      variant={isFollowing ? "outlined" : "contained"}
                      size="small"
                      sx={{
                        borderRadius: "20px",
                        fontSize: "12px",
                        marginLeft: "auto",
                      }}
                      onClick={() => handleFollowToggle(postUser.id)}
                    >
                      {isFollowing ? "Disconnect" : "Connect"}
                    </Button>
                  )}
                </Box>
              )}

              {(post.postimg || post.images?.length > 0) && (
                <Box sx={{ mt: 2, borderRadius: "10px", overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {post.images?.length > 0 ? (
                    <>
                      {currentImageIndex > 0 && (
                        <IconButton
                          onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
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

                      <img
                        src={post.images[currentImageIndex]}
                        alt="Post"
                        style={{ width: "100%", borderRadius: "10px" }}
                      />

                      {currentImageIndex < post.images.length - 1 && (
                        <IconButton
                          onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
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
                    </>
                  ) : (
                    <img src={post.postimg} alt="Post" style={{ width: "100%", borderRadius: "10px" }} />
                  )}
                </Box>
              )}

              {post.content && <Typography sx={{ mt: 2 }}>{post.content}</Typography>}

              {/* Like & Comment Icons */}
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <IconButton
                  onClick={() => handleLikePost(post.postId)}
                  sx={{
                    color: post.likes?.includes(user?._id) ? "#073574" : "#fff",
                  }}
                >
                  <FavoriteIcon />
                </IconButton>
                <Typography>{post.likes ? post.likes.length : 0} Likes</Typography>






                <IconButton onClick={() => toggleCommentBox(post.postId)}>
                  <CommentIcon />
                </IconButton>
                <Typography>{post.comments.comments.length} Comments</Typography>
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
                    onClick={() => handleAddComment(post.postId, post.userId)}
                  >
                    Post
                  </Button>
                </Box>
              )}

              {/* Latest Comment */}

              {post.comments.comments.map((comment) => (
                <Box
                  key={comment._id}
                  sx={{
                    mt: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Avatar
                    src={comment.userimg}
                    sx={{ width: 30, height: 30 }}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {comment.username}
                    </Typography>
                    <Typography variant="body2">{comment.text}</Typography>
                    <Typography variant="caption" color="gray">
                      {new Date(comment.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              ))}

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

          {/* Close and Delete Buttons */}
          <Box sx={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 1 }}>
            {/* Close Button */}
            <IconButton
              onClick={handleClose}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                color: "white",
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Delete Button - Only show if the user owns the story */}

            {storyUser?.id === user?._id && (
              <IconButton
                onClick={() => handleDeleteStory(currentStories[currentIndexStory].storyId)}
                sx={{
                  backgroundColor: "rgba(255, 0, 0, 0.7)",
                  color: "white",
                  "&:hover": { backgroundColor: "red" },
                }}
              >
                <DeleteIcon />
              </IconButton>
            )}

          </Box>

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
