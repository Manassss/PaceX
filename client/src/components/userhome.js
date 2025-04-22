// 🔹 React & Hooks
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// 🔹 Context
import { useAuth } from '../auth/AuthContext';

// 🔹 External Libraries
import axios from 'axios';
import { host } from '../components/apinfo';
// 🔹 Material UI Components & Icons
import {
  Typography, Button, Container, Paper, TextField, Avatar, Box, IconButton,
  List, ListItem, ListItemText, Modal, useMediaQuery
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from "@mui/icons-material/Event";
import GroupsIcon from "@mui/icons-material/Groups";
import StorefrontIcon from "@mui/icons-material/Storefront";

// 🔹 Custom Components
import CameraCapture from './CameraComponent';
import ShareModal from './ShareModal';
import RecommendedUsers from '../components/Homepage/RecommendedUsers';
import StoryBar from '../components/StoryPages/StoryBar'
import PostFeed from '../components/Post/PostFeed';
import LikeModal from './Post/LikeModal';

const UserHome = () => {
  // ===================== STATE VARIABLES =====================
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState([])
  const [openCamera, setOpenStoryCamera] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isMessengerOpen, setMessengerOpen] = useState(false); // Messenger Toggle State
  const [userProfile, setUserProfile] = useState(null);
  const [recommendedProfiles, setRecommendedProfiles] = useState([]);
  const isTablet = useMediaQuery("(max-width: 1000px)");
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
  const [openPostShareModal, setOpenPostShareModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [openLikeModal, setOpenLikeModal] = useState(false);
  const [likedUsers, setLikedUsers] = useState([]); // This will store the list returned from the API

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${host}/api/posts/feed/${user?._id}`);
        const postsData = res.data;
        console.log("length", postsData.length)
        // Get the list of blocked users
        const blockedUsers = user?.blockeduser || [];

        // Fetch comments and filter out blocked users
        const postsWithComments = await Promise.all(
          postsData.map(async (post) => {
            const commentsRes = await axios.get(`${host}/api/comment/${post._id}`);


            return {
              content: post.content,
              // Save a raw date for sorting as well as a formatted one.
              createdAtFormatted: new Date(post.createdAt).toLocaleString(),
              rawCreatedAt: post.createdAt,
              dislikes: post.dislikes || [],
              likes: Array.isArray(post.likes) ? post.likes : [],
              postimg: post.postimg,
              userId: post.userId,
              userName: post.userName,
              postId: post._id,
              comments: commentsRes.data,  // Attach only unblocked comments
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
        const res = await axios.get(`${host}/api/users/all`);
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

  }, []);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        if (!user?._id) {
          console.warn("⚠️ User ID is undefined, skipping fetch.");
          return;
        }

        console.log(`🔍 Fetching user stats for ID: ${user._id}`);

        const res = await axios.get(`${host}/api/users/profile/${user._id}`);

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
      const res = await axios.get(`${host}/api/comment/${postId}`);
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
      const res = await axios.post(`${host}/api/comment/add`, {
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
        const res = await axios.get(`${host}/api/users/profile/${user._id}`);

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
      const response = await axios.post(`${host}/api/users/follow`, {
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

      const res = await axios.get(`${host}/api/users/profile/${user._id}`);

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
        ? await axios.delete(`${host}/api/likes/remove`, {
          data: { userId: user._id, postId },
        })
        : await axios.post(`${host}/api/likes/add`, { userId: user._id, postId });

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


  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        if (!user?._id) {
          console.warn("⚠️ User ID is undefined, skipping fetch.");
          return;
        }

        console.log(`🔍 Fetching user stats for ID: ${user._id}`);

        const res = await axios.get(`${host}/api/users/profile/${user._id}`);

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

  const handleOpenLikeModal = async (postId) => {
    try {
      // Assuming your endpoint returns { likes: [user details...] }
      const res = await axios.get(`${host}/api/likes/post/${postId}`);
      setLikedUsers(res.data.likes);
      setOpenLikeModal(true);
    } catch (error) {
      console.error("Error fetching liked users:", error);
    }
  };



  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        background: 'linear-gradient(to bottom, #f7f4ef, #e6ddd1)',
        minHeight: "100vh",
        width: '100%',
        overflowX: "hidden",
        //transition: "margin-left 0.3s ease",
        display: "flex",
        flexDirection: "row",
        // alignItems: "center",
        left: 0,
        // backgroundColor: "#e5e5e5",
        //position: 'sticky'
      }}
    >
      <Box
        sx={{
          // position: "relative",
          width: "100%",
          maxWidth: "1000px",

          py: 2,
          mt: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center", // ✅ center the post box horizontally
          ml: { xs: "0", sm: "0", md: "5%", lg: "15%" },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "850px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflowY: "hidden",

            alignItems: "center", // ✅ center the post box horizontally

          }}
        >
          <StoryBar
            users={users}
            setOpenStoryCamera={setOpenStoryCamera}
            handleProfile={handleProfile}
          />

          {/**FEED */}
          <PostFeed
            posts={posts}
            users={users}
            user={user}
            following={following}
            expandedPosts={expandedPosts}
            showCommentBox={showCommentBox}
            newComment={newComment}
            handleProfile={handleProfile}
            handleAddComment={handleAddComment}
            toggleCommentBox={toggleCommentBox}
            toggleShowMore={toggleShowMore}
            handleLikePost={handleLikePost}
            handleOpenLikeModal={handleOpenLikeModal}
            setSelectedPost={setSelectedPost}
            setOpenPostShareModal={setOpenPostShareModal}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
          />

        </Box>
      </Box>


      {(!isMobile || !isTablet) ?
        <RecommendedUsers
          users={users}
          visibleCount={visibleCount}
          setVisibleCount={setVisibleCount}
          following={following}
          handleFollowToggle={handleFollowToggle}
        /> : <></>}



      {/* Modal for Viewed Story View */}

      <LikeModal
        open={openLikeModal}
        onClose={() => setOpenLikeModal(false)}
        likedUsers={likedUsers}
        handleProfile={handleProfile}
      />

      {/*ShareModal */}
      <ShareModal
        open={openPostShareModal}
        onClose={() => setOpenPostShareModal(false)}
        contentToShare={{
          senderId: user?._id,
          postId: selectedPost?.postId,
          content: selectedPost?.content,
          postimg: selectedPost?.postimg || "",
          images: selectedPost?.images || ""
        }}
        type="post"
      />
    </Container>
  );
};

export default UserHome;



