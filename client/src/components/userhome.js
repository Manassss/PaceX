import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import ChatIcon from '@mui/icons-material/Chat'; // **NEW:** Chat icon imported for bottom nav
import CameraCapture from './CameraComponent';
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
import { Link } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareModal from './ShareModal';
import TurnedInIcon from '@mui/icons-material/TurnedIn';
import { AiFillLike } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa6";
import { FaShare } from "react-icons/fa";
import { BsFillSaveFill } from "react-icons/bs";
import { SiGooglemessages } from "react-icons/si";





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
  const [visibleCount, setVisibleCount] = useState(5); // Show 3 users initially
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewers, setViewers] = useState([]);
  const [showViewers, setShowViewers] = useState(false);
  const [openPostShareModal, setOpenPostShareModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);



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
    console.log("currentstory", stories);
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
        viewsNumber: story.viewsNumber
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
    userProfile.id !== user?._id && !following.includes(userProfile.id)
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
  const fetchViewers = async (storyId) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/story/views/${storyId}`);
      setViewers(res.data);
      setShowViewers(true);
    } catch (err) {
      console.error("Error fetching story viewers:", err);
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
            disableGutters
            maxWidth={false}
              sx={{
                    background: "#f8f2ec",
                    minHeight: "100vh",
                    pr: 0,
                    overflowX: "hidden",
                    transition: "margin-left 0.3s ease",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
          >
           {/*Story */}
           <Box
              sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              px: 2,
              mt: 1,
                  }}
            >
            {/* Story Scroll Section */}
            <Box
              sx={{
              display: "flex",
              overflowX: "auto",
              gap: 2.5,
              py: 2,
              width: "100%",
              maxWidth: "700px",
              scrollbarWidth: "none",
                            "&::-webkit-scrollbar": { display: "none" },
                  }}
             >
            {/* Add Story Button */}
            <Box sx={{ position: "relative", cursor: "pointer" }} onClick={() => setOpenStoryCamera(true)}>
            <Avatar src={user?.profileImage} sx={{ width: 65, height: 65, border: "2px solid #ff4500" }} />
            <AddIcon sx={{ position: "absolute", bottom: -2, right: -2, backgroundColor: "white", borderRadius: "50%", fontSize: 18, color: "#ff4500" }} />
            </Box>

            {/* Display User Stories */}
            {uniqueUserStories.map(({ userId, stories }, index) => {
            const storyUser = users.find((user) => user.id === userId);
            if (!storyUser) return null;
            const hasSeenAll = stories.every((s) => s.views?.includes(user?._id));
              return (
                      <Avatar
                         key={index}
                         src={storyUser.profileImage}
                         sx={{ width: 65, height: 65, border: `3px solid ${hasSeenAll ? "gray" : "#ff4500"}`, cursor: "pointer" }}
                         onClick={() => handleStoryClick(storyUser, stories)}
                      />
                      );
                      })}
                      </Box>

 
            {/**FEED */}
            <Box
                sx={{
                width: "100%",
                maxWidth: "700px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                overflowY: "hidden", // Remove feed scroll
                marginTop:"5%",
                    }}
            >        
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
                          <Avatar src={postUser.profileImage} sx={{ width: 65, height: 65, cursor: "pointer" }} />
                          <Typography sx={{ fontSize: "22px", fontWeight: 600 }}>{postUser.name}</Typography>

                      {/* Follow/Disconnect Button */}
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

{post.content && (
  <Typography
    sx={{
      mt: 2,
      whiteSpace: "pre-wrap",     // Preserve line breaks and spaces
      wordWrap: "break-word",     // Allow long words to break
      overflowWrap: "break-word"  // Fallback for older browsers
    }}
  >
    {post.content}
  </Typography>
)}
                      {/* Like & Comment Icons */}
                      <Box sx={{ display: "flex", alignItems: "center", mt: 1, gap: 10 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton
                            onClick={() => handleLikePost(post.postId)}
                            sx={{ color: post.likes?.includes(user?._id) ? "#073574" : "#", }}
                          >
                            < AiFillLike  />
                          </IconButton>
                          <Typography>{post.likes ? post.likes.length : 0} Likes</Typography>
                        </Box>


                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton onClick={() => toggleCommentBox(post.postId)}>
                            <FaRegComment />
                          </IconButton>
                          <Typography>{post.comments.comments.length} Comment</Typography>

                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton onClick={() => {
                            setSelectedPost(post);
                            setOpenPostShareModal(true);
                          }}>
                            <FaShare  />
                          </IconButton>
                          <Typography>Share</Typography>
                        </Box>


                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton>
                            <BsFillSaveFill   />
                          </IconButton>
                        </Box>


                      </Box>

                      {/* Comment Bar - Visible when clicking comment icon */}
                      {showCommentBox[post.postId] && (
             <Box
             sx={{
               mt: 2,
               display: "flex",
               alignItems: "center",
               gap: 1,
               width: "100%",
             }}
           >
             <TextField
               fullWidth
               variant="outlined"
               size="small"
               placeholder="Write a comment..."
               value={newComment[post.postId] || ""}
               onChange={(e) =>
                 setNewComment({ ...newComment, [post.postId]: e.target.value })
               }
               sx={{
                 borderRadius: "20px",
                 backgroundColor: "#fff",
                 "& .MuiOutlinedInput-root": {
                   borderRadius: "20px",
                 },
               }}
             />
             <Button
               variant="contained"
               size="small"
               sx={{
                 borderRadius: "20px",
                 textTransform: "none",
                 px: 2,
                 fontSize: "13px",
               }}
               onClick={() => handleAddComment(post.postId, post.userId)}
             >
               Post
             </Button>
           </Box>
           
                      )}

                      {/* Latest Comment */}

                      {showCommentBox[post.postId]
  ? post.comments.comments.map((comment) => (
      <Box key={comment._id} sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar src={comment.userimg} sx={{ width: 30, height: 30 }} />
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
    ))
  : post.comments.comments.length > 0 && (
      // Show only latest comment when collapsed
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar
          src={post.comments.comments[post.comments.comments.length - 1].userimg}
          sx={{ width: 30, height: 30 }}
        />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {post.comments.comments[post.comments.comments.length - 1].username}
          </Typography>
          <Typography variant="body2">
            {post.comments.comments[post.comments.comments.length - 1].text}
          </Typography>
          <Typography variant="caption" color="gray">
            {new Date(post.comments.comments[post.comments.comments.length - 1].createdAt).toLocaleString()}
          </Typography>
        </Box>
      </Box>
    )}
    

                    </Paper>
                    
                  );
                })}
                
              </Box>
              </Box>

              <Box
  sx={{
    width: 400,
    position: "sticky",
    top: 250,
    alignSelf: "flex-start",
    display: { xs: "none", md: "block" }, // hide on mobile
    mr: 4,
  }}
>
  <Paper
    sx={{
      padding: 2,
      borderRadius: "15px",
      background: "#073574",
      backdropFilter: "blur(10px)",
      color: "white",
      boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
    }}
  >
    <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
      Recommended for You
    </Typography>

    <List sx={{ padding: 0 }}>
      {recommendedUsers.slice(0, visibleCount).map((profile) => {
        const isFollowing = following.includes(profile.id);

        return (
          <ListItem
            key={profile.id}
            sx={{
              borderRadius: "10px",
              padding: "8px 12px",
              mb: 1,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Link
              to={`/profile/${profile.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
                color: "inherit",
                flex: 1,
              }}
            >
              <Avatar src={profile.profileImage} sx={{ width: 40, height: 40 }} />
              <ListItemText primary={profile.name} />
            </Link>

            <Button
              variant={isFollowing ? "outlined" : "contained"}
              color="secondary"
              size="small"
              sx={{
                borderRadius: "20px",
                textTransform: "none",
                fontSize: "12px",
                minWidth: "90px",
              }}
              onClick={() => handleFollowToggle(profile.id)}
            >
              {isFollowing ? "Disconnect" : "Connect"}
            </Button>
          </ListItem>
        );
      })}
    </List>

    {/* Toggle Show More / Show Less */}
    {recommendedUsers.length > 5 && (
      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Button
          onClick={() =>
            setVisibleCount((prev) =>
              prev === 5 ? recommendedUsers.length : 5
            )
          }
          variant="text"
          color="inherit"
          sx={{ textTransform: "none" }}
        >
          {visibleCount === 5 ? "Show More" : "Show Less"}
        </Button>
      </Box>
    )}
  </Paper>
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
          {/* view Count */}
          <Box sx={{ position: "absolute", bottom: '5%', left: '45%', display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={() => fetchViewers(currentStories[currentIndexStory].storyId)}>
              <VisibilityIcon sx={{ color: "white" }} />
            </IconButton>
            <Typography sx={{ color: "white" }}>{currentStories[currentIndexStory]?.viewsNumber ?? 0} </Typography>
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
      {/* Modal for Viewed Story View */}
      <Modal open={showViewers} onClose={() => setShowViewers(false)}>
        <Box sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)", width: 400, bgcolor: "white", boxShadow: 24, borderRadius: 2, p: 2, bottom: "10%" }}>
          <Typography variant="h6">Viewers</Typography>
          <List>
            {viewers.map((viewer) => (
              <ListItem key={viewer.id}>
                <Avatar src={viewer.profileImage} sx={{ mr: 2 }} />
                <ListItemText primary={viewer.name} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Modal>

      {/*ShareModal */}
      <ShareModal
        open={openPostShareModal}
        onClose={() => setOpenPostShareModal(false)}
        contentToShare={{
          senderId: user?._id,
          postId: selectedPost?.postId,
          content: selectedPost?.content,
          postimg: selectedPost?.postimg,
        }}
        type="post"
      />
    </Container>
  );
};

export default UserHome;



      
