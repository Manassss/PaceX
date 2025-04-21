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
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  ListItemButton,
  ListItemAvatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LockIcon from '@mui/icons-material/Lock';
import { getAuth } from "firebase/auth";
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useAuth } from '../auth/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { signOut } from "firebase/auth";
import axios from 'axios';
import CameraCapture from './CameraComponent';
import CircularProgress from "@mui/material/CircularProgress";
import ShareModal from './ShareModal';
import { CiMenuKebab } from "react-icons/ci";
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { AiFillLike, AiOutlineLike } from 'react-icons/ai';
import { FaUpload } from 'react-icons/fa';
import { FaRegComment, FaShare } from "react-icons/fa6";
import { Divider } from "@mui/material";
import PersonOffIcon from '@mui/icons-material/PersonOff';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import { GiShare } from "react-icons/gi";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import FollowRequest from '../components/Profile/FollowRequest';
import { host } from '../components/apinfo';
import { updateProfile as firebaseUpdateProfile } from "firebase/auth";
import Postmodal from './Post/Postmodal';
import Chatbox from './Chatbox';



const ProfilePage = () => {
  const auth = getAuth();
  const firebaseUid = auth.currentUser.uid;
  const [userDetails, setUserDetails] = useState({});
  const [blockedUsers, setblockedUsers] = useState({});
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
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuOpen = (event) => { setAnchorEl(event.currentTarget); };
  const handleMenuClose = () => { setAnchorEl(null); };
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: userId } = useParams();
  const authUserId = user?._id;
  const vistinguser = userId !== authUserId;
  const [isConnected, setIsConnected] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
  const [currentPostIndex, setCurrentPostIndex] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState("all"); // "all" | "archived"
  const [deletetype, setDeletetype] = useState("")
  const [openBlockedContacts, setOpenBlockedContacts] = useState(false);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);
  const [postMenuAnchorEl, setPostMenuAnchorEl] = useState(null);
  const [openFollowersModal, setOpenFollowersModal] = useState(false);
  const [openFollowingModal, setOpenFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const theme = useTheme();
  // iPad Pro is ≥ 1024px wide
  const isIpad = useMediaQuery(theme.breakpoints.up('md'));
  // iPhone 14 Pro Max is ≤ 430px wide
  const isPhone = useMediaQuery('(max-width:430px)');
  const [openChat, setOpenChat] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [openFollowRequestModal, setOpenFollowRequestModal] = useState(false);
  const [requestProfiles, setRequestProfiles] = useState([]);
  const [openChatbox, setOpenChatbox] = useState(false);
  //User Profile Details
  const [openDeleteAccountModal, setOpenDeleteAccountModal] = useState(false);
  const fetchUserProfile = async () => {
    try {

      const res = await axios.get(`${host}/api/users/profile/${userId}`);
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
        private: res.data.private,
        followers: res.data.followers,
        followings: res.data.followings,
        requests: res.data.requests
      };

      console.log("Transformed Data:", transformedData); // Debugging output

      setIsConnected(res.data.followers?.includes(user?._id) ? true : false);
      setIsRequested(res.data.requests?.includes(user?._id));
      setUserDetails(transformedData);
      setFormData(transformedData);

      // 🔥 Fetch profiles for each request user
      if (Array.isArray(res.data.requests) && res.data.requests.length > 0) {
        const profiles = await Promise.all(
          res.data.requests.map(async (reqUserId) => {
            try {
              const userRes = await axios.get(`${host}/api/users/profile/${reqUserId}`);

              return {
                _id: userRes.data._id,
                name: userRes.data.name,
                username: userRes.data.username,
                profileImage: userRes.data.profileImage,
              };

            } catch (err) {
              console.error(`Error fetching profile for request user ${reqUserId}:`, err.message);
              return null; // Skip user on error
            }
          })
        );

        // Remove any failed/null results
        const validProfiles = profiles.filter(p => p !== null);
        console.log("vvalid", validProfiles)
        setRequestProfiles(validProfiles);
      } else {
        setRequestProfiles([]); // Clear if no requests
      }


    } catch (err) {
      console.error("Error fetching profile:", err.message);
    }
  };
  useEffect(() => {
    console.log("userId", userId);
    if (!userId) return;

    fetchUserProfile();
    fetchblockedusers();

  }, [userId, user]);



  // Handle delete button click
  const handleDeleteclick = () => {
    setDeletetype("permanent");
    setPostToDelete(selectedPost?.postId);
    setDeleteConfirmation(true);
    handleMenuClose();
  };

  // user followers
  const openFollowers = async () => {
    try {
      const ids = userDetails.followers || [];
      const list = await Promise.all(
        ids.map(fid =>
          axios.get(`${host}/api/users/profile/${fid}`)   // ← no “profile” here
            .then(res => ({
              _id: res.data._id,
              name: res.data.name,
              username: res.data.username,
              profileImage: res.data.profileImage,
            }))
        )
      );
      setFollowersList(list);
      setOpenFollowersModal(true);
    } catch (err) {
      console.error("Error loading followers list:", err);
      alert("Failed to load followers.");
    }
  };



  // user following
  const openFollowing = async () => {
    try {
      const ids = userDetails.followings || []
      const list = await Promise.all(
        ids.map(async (fid) => {
          const res = await axios.get(`${host}/api/users/profile/${fid}`)
          const u = res.data
          return {
            _id: u._id,
            name: u.name,
            username: u.username,
            profileImage: u.profileImage,
          }
        })
      )
      setFollowingList(list)
      setOpenFollowingModal(true)
    } catch (err) {
      console.error("Error loading following list:", err)
      alert("Failed to load following.")
    }
  }


  // Delete the post
  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      console.log("🗑️  Permanently deleting post:", postToDelete);
      const res = await axios.post(
        `${host}/api/posts/delete/${postToDelete}`
      );
      console.log("🗑️  delete response:", res.data);

      setPosts(prevPosts => {
        const newPosts = prevPosts.filter(p => p.postId !== postToDelete);
        console.log("🗑️  Posts after permanent delete:", newPosts);
        return newPosts;
      });

      setDeleteConfirmation(false);
      setOpenPostModal(false);
      setDeletetype("");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleDeletePosttemp = async () => {
    if (!postToDelete) return;

    try {
      console.log("⏱️  Toggling temp-delete for post:", postToDelete);
      const res = await axios.post(
        `${host}/api/posts/tempdelete/${postToDelete}`
      );
      console.log("⏱️  temp-delete response:", res.data);

      const updatedPost = res.data.post;
      console.log("⏱️  Updated post:", updatedPost);

      setPosts(prev =>
        prev.map(p => {
          if (p.postId === updatedPost._id) {
            const patched = { ...p, tempdelete: updatedPost.tempdelete };
            console.log(
              `⏱️  Marking post ${p.postId} as tempdelete=${patched.tempdelete}`
            );
            return patched;
          }
          return p;
        })
      );

      setDeleteConfirmation(false);
      setOpenPostModal(false);
      setDeletetype("");
    } catch (err) {
      console.error("Error toggling temp-delete:", err);
    }
  };

  const handleRequestToggle = async () => {
    try {

      const response = await axios.put(`${host}/api/users/followrequest`, {
        requesterId: user?._id,
        targetUserId: userDetails.id,
      });

      console.log("rrrr", response.data);

      // Update local state to reflect request status
      setIsRequested(!isRequested);
    } catch (err) {
      console.error("Error sending/canceling follow request:", err);
    }
  };

  const handleRespondRequest = async (requesterId, action) => {
    try {
      const res = await axios.put(`${host}/api/users/approvereject`, {
        targetUserId: user?._id,
        requesterId,
        action
      });

      console.log("tdfhfbf", res.data.message);
      setRequestProfiles(prev => prev.filter(r => r._id !== requesterId));
      fetchUserProfile(); // Refresh profile info
      setOpenFollowRequestModal(false)
    } catch (err) {
      console.error("Error approving/rejecting request:", err);
    }
  };


  // Function to fetch comments on posts
  const fetchComments = async (postId) => {
    try {
      console.log("Fetching comments for post:", postId);
      const res = await axios.get(`${host}/api/comment/${postId}`);

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
      const payload = {
        userId: user._id,
        postId: postId,
        text: newComment[postId],
        username: user?.name,
        userimg: user?.profileImage,
        post_userid: userDetails.id
      }
      console.log(user);
      console.log("payload", payload);
      const res = await axios.post(`${host}/api/comment/add`, payload);

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
    if (!user || !user._id) {
      console.error("🚨 Not logged in!");
      return;
    }

    // find the post in your feed
    const post = posts.find((p) => p.postId === postId);
    if (!post || !Array.isArray(post.likes)) {
      console.warn("⚠️ Post not found or likes not initialized");
      return;
    }

    const alreadyLiked = post.likes.includes(user._id);

    try {
      // call the correct endpoint
      const res = alreadyLiked
        ? await axios.delete(`${host}/api/likes/remove`, {
          data: { userId: user._id, postId },
        })
        : await axios.post(`${host}/api/likes/add`, { userId: user._id, postId });

      console.log("✅ Like toggled:", res.data);

      // update your local “feed” state
      setPosts((prev) =>
        prev.map((p) =>
          p.postId === postId
            ? {
              ...p,
              likes: alreadyLiked
                ? p.likes.filter((id) => id !== user._id)
                : [...p.likes, user._id],
            }
            : p
        )
      );

      // update the single‐post modal if it’s open
      setSelectedPost((prev) =>
        prev && prev.postId === postId
          ? {
            ...prev,
            likes: alreadyLiked
              ? prev.likes.filter((id) => id !== user._id)
              : [...prev.likes, user._id],
          }
          : prev
      );

      // optional: track which posts this user has liked
      setLikedPosts((lp) =>
        alreadyLiked ? lp.filter((id) => id !== postId) : [...lp, postId]
      );
    } catch (err) {
      console.error("🔥 Error toggling like:", err.response?.data || err.message);
    }
  };

  // Handle follow/unfollow (optional)
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



  // Fetch posts for this user
  useEffect(() => {
    if (!userId && !user?._id) return;
    const fetchPosts = async () => {
      const profileUserId = userId || user?._id;
      try {
        const res = await axios.get(`${host}/api/posts/${profileUserId}`);
        console.log("🔍 API Response:", res.data); // ✅ Debugging log


        // Filter posts by the current user
        const transformedPosts = res.data
          .map(post => ({
            content: post.content,
            createdAt: new Date(post.createdAt).toLocaleString(),
            dislikes: post.dislikes,
            likes: post.likes,
            postimg: post.postimg,
            userId: post.userId,
            userName: post.userName,
            postId: post._id,
            images: post.images,
            archived: post.archived,
            tempdelete: post.tempdelete
          }));

        // Fetch comments for each post and attach them
        const postsWithComments = await Promise.all(
          transformedPosts.map(async (post) => {
            try {
              const commentsRes = await axios.get(`${host}/api/comment/${post.postId}`);
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
  }, [userId, user]);

  // Fetch all stories then filter those belonging to this user
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await axios.get(`${host}/api/story/all`);
        setStories(res.data);
        const filtered = res.data.filter(story => story.userId.toString() === userId.toString());
        setUserStories(filtered);
      } catch (err) {
        console.error('Error fetching stories:', err);
      }
    };
    fetchStories();
  }, [userId]);

  // Story modal navigation
  const handleNextStory = () => {
    if (currentIndexStory < userStories.length - 1) {
      setCurrentIndexStory(prev => prev + 1);
    } else {
      setOpenStory(false);
    }
  };

  //Handle Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // returns the downloadURL when it's done
  const handleImageUpload = () => {
    if (!selectedFile) return Promise.reject("No file");

    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `profilePictures/${userId}/${selectedFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      uploadTask.on(
        "state_changed",
        null,
        reject,
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              // update formData for preview
              setFormData((prev) => ({ ...prev, profileImage: downloadURL }));
              resolve(downloadURL);
            })
            .catch(reject);
        }
      );
    });
  };

  function dataURLtoBlob(dataURL) {
    const parts = dataURL.split(',');
    if (parts.length !== 2) {
      throw new Error('Invalid dataURL format');
    }
    const header = parts[0];
    const base64 = parts[1];
    const mimeMatch = header.match(/data:(.+);base64/);
    if (!mimeMatch) {
      throw new Error('Invalid dataURL header');
    }
    const mime = mimeMatch[1];
    const binary = atob(base64);
    const len = binary.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      u8[i] = binary.charCodeAt(i);
    }
    return new Blob([u8], { type: mime });
  }
  //handleCameraImageUpload
  const handleCameraImageUpload = async (media) => {
    let fileForUpload;
    let previewUrl;

    if (typeof media === 'string') {
      if (media.startsWith('data:')) {
        previewUrl = media;
        fileForUpload = dataURLtoBlob(media);
      } else if (media.startsWith('blob:')) {
        previewUrl = media;
        fileForUpload = await fetch(media).then(res => res.blob());
      } else if (media.startsWith('https://firebasestorage.googleapis.com')) {
        setFormData(prev => ({ ...prev, profileImage: media }));
        setOpenCamera(false);
        return;
      } else {
        try {
          const response = await fetch(media);
          const blob = await response.blob();
          previewUrl = URL.createObjectURL(blob);
          setFormData(prev => ({ ...prev, profileImage: previewUrl }));
          setSelectedFile(blob);
          setOpenCamera(false);
          return;
        } catch (err) {
          console.error("Error fetching image for upload:", err);
          alert("Failed to process the camera image.");
          return;
        }
      }
    } else {
      previewUrl = URL.createObjectURL(media);
      fileForUpload = media;
    }

    setFormData(prev => ({ ...prev, profileImage: previewUrl }));
    setSelectedFile(fileForUpload);
    setOpenCamera(false);
  };

  // Handle file selection from device
  const handleFileSelect = (file) => {
    const previewUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setFormData(prev => ({ ...prev, profileImage: previewUrl }));
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


  // When a post is clicked, open a modal to show its details
  const handlePostClick = async (post) => {
    console.log("🔍 Post Clicked:", post); // ✅ Debugging log

    setSelectedPost(post);
    await fetchComments(post.postId);  // 🔥 Fetch comments before opening modal
    setShowCommentBox((prev) => ({ ...prev, [post.postId]: true })); // 🔥 Ensure comment section is shown
    // Find index of clicked post
    const postIndex = posts.findIndex(p => p.postId === post.postId);
    setCurrentPostIndex(postIndex);
    setOpenPostModal(true);
  };

  // Follow Unfollow other users
  const handleFollowToggle = async (targetUserId) => {
    try {
      console.log(`user id ${user?._id} and targetid ${targetUserId}`);
      const response = await fetch(`${host}/api/users/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?._id, targetUserId: targetUserId }),
      });

      const data = await response.json();
      fetchUserProfile();
      alert(data.message); // Show follow/unfollow message
    } catch (error) {
      console.error("Error:", error);
    }
  };


  // Fetch blocked users
  const fetchblockedusers = async () => {
    try {

      const blockedUserIds = user?.blockeduser || [];

      const blockedUsersDetails = await Promise.all(
        blockedUserIds.map(async (blockedUserId) => {
          const userRes = await axios.get(`${host}/api/users/profile/${blockedUserId}`);
          return {
            id: userRes.data._id,
            name: userRes.data.name,
            username: userRes.data.username,
            profileImage: userRes.data.profileImage,
          };
        })
      );
      console.log("blockeds", blockedUsersDetails)
      setblockedUsers(blockedUsersDetails)
    } catch (err) {
      console.error("Error fetching blocked users:", err);
    }
  }
  const handleUnblock = async (blockedUserId) => {
    try {
      const payload = {
        userId: user?._id,
        blocked_userId: blockedUserId
      }
      const res = await axios.post(`${host}/api/users/unblock`, payload);
      console.log("Response:", res.data.message);
      setblockedUsers((prevBlockedUsers) =>
        prevBlockedUsers.filter(user => user.id !== blockedUserId)
      );
      setOpenBlockedContacts(false);
      fetchUserProfile();
      console.log(`User ${blockedUserId} unblocked successfully`);
    } catch (err) {
      console.error("Error unblocking user:", err);
    }
  };


  const handleUpdateProfile = async () => {
    console.log("handleUpdateProfile called with formData", formData);
    try {
      // 1. Update Firebase Auth profile
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn("handleUpdateProfile: no currentUser");
        setOpenEditProfile(false);
        return;
      }
      console.log("handleUpdateProfile: updating Firebase Auth profile");
      await firebaseUpdateProfile(currentUser, {
        displayName: formData.name,
        photoURL: formData.profileImage
      });
      console.log("handleUpdateProfile: firebaseUpdateProfile succeeded");

      // 2. Persist to backend
      console.log("handleUpdateProfile: updating backend database");
      const response = await axios.put(
        `${host}/api/users/profile/${formData.id}`,
        {
          name: formData.name,
          username: formData.username,
          bio: formData.bio,
          profileImage: formData.profileImage
        }
      );
      console.log("handleUpdateProfile: backend updated", response.data);
      console.log("handleUpdateProfile: applying new values locally");
      // Update local state immediately
      const updatedDetails = {
        ...userDetails,
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
        profileImage: formData.profileImage
      };
      setUserDetails(updatedDetails);
      setFormData(updatedDetails);
      console.log("handleUpdateProfile: local state updated", updatedDetails);

      // 4. Close dialog
      setOpenEditProfile(false);
      console.log("handleUpdateProfile: dialog closed");
    } catch (err) {
      console.error("handleUpdateProfile error:", err);
      alert("Failed to update profile.");
    }
  };

  const handleBlock = async () => {
    try {
      const payload = {
        userId: user?._id,
        blocked_userId: userDetails.id
      }
      const res = await axios.post(`${host}/api/users/block`, payload);
      console.log("Response:", res.message);
      fetchUserProfile();
      navigate('/userhome')

    } catch (error) {
      console.error("Error archiving post:", error);
    }

  }

  // Archieve Post
  const handleArchivePost = async () => {
    console.log("Archive Post Clicked:", selectedPost?.postId);
    try {
      const payload = {
        postId: selectedPost?.postId,
        userId: userDetails.id, // Ensure correct user ID is sent
      };

      const res = await axios.post(`${host}/api/posts/archive`, payload);

      console.log("Archive Response:", res.data);

      // Update the post state to reflect the change
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.postId === selectedPost?.postId ? { ...post, archived: !post.archived } : post
        )
      );

      handleMenuClose();
      setOpenPostModal(false)
    } catch (error) {
      console.error("Error archiving post:", error);
    }
  };

  // Delete Post
  const handletempDeletePost = () => {
    console.log("Delete Post Clicked:", selectedPost?.postId);
    setDeletetype("temp");
    setPostToDelete(selectedPost?.postId);
    setDeleteConfirmation(true);
    handleMenuClose();
  };
  const handledeleteAccount = async () => {
    try {
      const payload = {
        data: {
          userId: user?._id,
          firebaseUid: firebaseUid
        }
      }
      console.log("🧨 Deleting Firebase user with UID:", firebaseUid);
      console.log("Type of firebaseUid:", typeof firebaseUid);
      console.log("Length of UID:", firebaseUid?.length);
      console.log("payload", payload)
      const res = await axios.delete(`${host}/api/users/delete`, payload)
      setOpenDeleteAccountModal(false)
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  }


  // At the top of your render (or just above your return)
  const filteredPosts =
    selectedTab === "recentlyDeleted"
      ? posts.filter(post => post.tempdelete)                              // deleted
      : selectedTab === "archived"
        ? posts.filter(post => post.archived && !post.tempdelete)         // archived but not deleted
        : posts.filter(post => !post.archived && !post.tempdelete);       // normal posts



  const handlePostMenuOpen = (event) => {
    setPostMenuAnchorEl(event.currentTarget);
  };

  const handlePostMenuClose = () => {
    setPostMenuAnchorEl(null);
  };


  const isLiked =
    selectedPost != null &&
    Array.isArray(selectedPost.likes) &&
    selectedPost.likes.includes(user._id);

  const handlechatopen = () => {
    setOpenChat(true);
  }

  return (
    <>
      <Container
        maxWidth={false}
        sx={{
          // bring back a bit of horizontal breathing room
          px: { xs: 2, md: 4 }
        }}
      >

        <Grid container spacing={4}>
          {/* =========================== Main Layout Container Left Side ============================ */}
          <Grid item xs={12} md={3}>

            {/* 1. Username + menu */}
            <Box
              sx={{
                mt: 5,
                ml: -2,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 2,
                boxShadow: 1,
                flexWrap: 'nowrap',
                whiteSpace: 'nowrap',
              }}
            >
              <Typography variant="h6" fontWeight={600} sx={{ mr: 1 }}>
                @{userDetails.username}
              </Typography>
              <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                <CiMenuKebab />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {userDetails.id === user?._id
                  ? [
                    <MenuItem key="blocked" onClick={() => { setOpenBlockedContacts(true); handleMenuClose(); }}>
                      Blocked Contacts
                    </MenuItem>,
                    // <MenuItem key="edit" onClick={() => { setEditMode(v => !v); handleMenuClose(); }}>
                    //   {editMode ? "Cancel Edit Profile" : "Edit Profile"}
                    // </MenuItem>,
                    <MenuItem key="requests" onClick={() => { setOpenFollowRequestModal(true); handleMenuClose(); }}>
                      Follow Requests
                    </MenuItem>,
                    <MenuItem key="edit" onClick={() => { setOpenEditProfile(true); handleMenuClose(); }}>
                      Edit Profile
                    </MenuItem>,
                    <MenuItem key="delete" onClick={() => { setOpenDeleteAccountModal(true); handleMenuClose(); }}>
                      Delete Account
                    </MenuItem>
                  ]
                  : [
                    <MenuItem key="block" onClick={() => { handleBlock(); handleMenuClose(); }}>
                      Block
                    </MenuItem>
                  ]
                }
                <MenuItem key="share" onClick={() => { setOpenShareModal(true); handleMenuClose(); }}>
                  Share Profile
                </MenuItem>

              </Menu>
            </Box>

            {/* 2. Avatar */}
            <Box sx={{ width: 250, height: 250, ml: 'auto', mt: 2, }}>
              <Avatar
                src={userDetails.profileImage}
                sx={{
                  width: isPhone ? 120 : isIpad ? 200 : 250,
                  height: isPhone ? 120 : isIpad ? 200 : 250,
                  border: "3px solid rgba(255,255,255,0.5)"
                }}
              />
            </Box>

            {/* 3. Name */}
            <Typography
              variant="h5"
              sx={{ fontWeight: 'bold', mt: 5, textAlign: 'center', fontSize: '1.8rem' }}
            >
              {userDetails.name || "Your Name"}
            </Typography>

            {/* 4. Bio */}
            <Typography
              variant="body1"
              sx={{ opacity: 0.8, textAlign: 'center', mt: 1 }}
            >
              {userDetails.bio || "No bio available"}
            </Typography>

            {/* 5. Stats */}
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                mt: 5,
                flexDirection: isPhone ? 'column' : 'row',
                justifyContent: 'center'
              }}
            >
              {[
                { label: "Posts", value: userDetails.postsCount },
                { label: "Followers", value: userDetails.followersCount },
                { label: "Following", value: userDetails.followingCount },
              ].map(({ label, value }) => (
                <Box key={label} textAlign="center" sx={{ cursor: label !== 'Posts' ? 'pointer' : 'default' }} onClick={() => {
                  if (label === 'Followers') openFollowers()
                  if (label === 'Following') openFollowing()
                }}>
                  <Typography variant="h6" fontWeight={600}>{value}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>{label}</Typography>
                </Box>
              ))}
            </Box>

            {/* 6. Connect / Follow button */}
            {vistinguser && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
                {/* Connect / Follow */}
                <Button
                  variant="contained"
                  onClick={handleRequestToggle}
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    textTransform: 'none',
                    backgroundColor: isConnected || isRequested ? '#f0f0f0' : '#007bff',
                    color: isConnected || isRequested ? '#000' : '#fff',
                    '&:hover': {
                      backgroundColor: isConnected || isRequested ? '#e0e0e0' : '#0056b3',
                    },
                  }}
                >
                  {loading
                    ? <CircularProgress size={20} sx={{ color: 'inherit' }} />
                    : isConnected
                      ? <>Following ▼</>
                      : isRequested
                        ? "Requested"
                        : 'Connect'
                  }
                </Button>

                {/* Message */}
                <Button
                  variant="outlined"
                  onClick={handlechatopen}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    textTransform: 'none',
                    borderColor: '#007bff',
                    color: '#007bff',
                    '&:hover': {
                      backgroundColor: 'rgba(0,123,255,0.1)',
                      borderColor: '#0056b3',
                      color: '#0056b3',
                    },
                  }}
                >
                  Message
                </Button>
              </Box>

            )}
          </Grid>




          {/* RIGHT COLUMN */}
          <Grid item xs={12} md={9}>
            <Box sx={{ mt: 1 }}>
              {/* Tab Bar */}
              <Box mt={4} display="flex" justifyContent="center" gap={6}>
                <Typography
                  variant="body1"
                  onClick={() => setSelectedTab('all')}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: selectedTab === 'all' ? 'bold' : 'normal',
                    pb: 1,
                    fontSize: '16px',
                    color: '#000',
                    borderBottom: selectedTab === 'all' ? '2px solid black' : '2px solid transparent',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { borderBottom: '2px solid #aaa', opacity: 0.8 },
                  }}
                >
                  All Posts
                </Typography>

                {!vistinguser && (
                  <>  {/* Only show for owner */}
                    <Typography
                      variant="body1"
                      onClick={() => setSelectedTab('archived')}
                      sx={{
                        cursor: 'pointer',
                        fontWeight: selectedTab === 'archived' ? 'bold' : 'normal',
                        pb: 1,
                        fontSize: '16px',
                        color: '#000',
                        borderBottom: selectedTab === 'archived' ? '2px solid black' : '2px solid transparent',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': { borderBottom: '2px solid #aaa', opacity: 0.8 },
                      }}
                    >
                      Archived
                    </Typography>
                    <Typography
                      variant="body1"
                      onClick={() => setSelectedTab('recentlyDeleted')}
                      sx={{
                        cursor: 'pointer',
                        fontWeight: selectedTab === 'recentlyDeleted' ? 'bold' : 'normal',
                        pb: 1,
                        fontSize: '16px',
                        color: '#000',
                        borderBottom: selectedTab === 'recentlyDeleted' ? '2px solid black' : '2px solid transparent',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': { borderBottom: '2px solid #aaa', opacity: 0.8 },
                      }}
                    >
                      Recently Deleted
                    </Typography>
                  </>
                )}
              </Box>

              {/* Posts Grid or Private Message */}
              {((selectedTab === 'all') ||
                (!vistinguser && selectedTab === 'archived') ||
                (!vistinguser && selectedTab === 'recentlyDeleted')) ? (
                filteredPosts.length > 0 ? (
                  <Grid container spacing={1} mt={2}>
                    {filteredPosts.map((post, idx) => (
                      <Grid item xs={4} key={idx}>
                        <Box
                          onClick={() => handlePostClick(post)}
                          sx={{
                            width: '100%',
                            aspectRatio: '1/1',
                            cursor: 'pointer',
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={post.images?.[0] || post.postimg}
                            alt="post"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ textAlign: 'center', color: 'gray', fontStyle: 'italic', marginTop: '20%' }}
                  >
                    No Posts Available
                  </Typography>
                )
              ) : (
                <Box sx={{ textAlign: 'center', mt: 5 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <LockIcon sx={{ fontSize: 50, color: 'gray' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      This account is private
                    </Typography>
                    <Typography sx={{ color: 'gray' }}>
                      Follow to see their photos and videos.
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{ borderRadius: 2, padding: '6px 12px', fontSize: '14px', backgroundColor: isConnected ? '#f0f0f0' : '#007bff', color: isConnected ? '#000' : '#fff', '&:hover': { backgroundColor: isConnected ? '#e0e0e0' : '#0056b3' } }}
                      onClick={handleConnectToggle}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : isConnected ? <>Following ▼</> : 'Connect'}
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
        { /** */}




        {/* Followers Modal */}
        <Modal open={openFollowersModal} onClose={() => setOpenFollowersModal(false)}>
          <Box sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            p: 4,
          }}>
            <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
              Followers
            </Typography>
            <List>
              {followersList.length > 0 ? (
                followersList.map((f) => (
                  <ListItem key={f._id} button onClick={() => { setOpenFollowersModal(false); handleProfile(f._id) }}>
                    <Avatar src={f.profileImage} sx={{ mr: 2 }} />
                    <ListItemText primary={f.name} />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" sx={{ textAlign: "center" }}>
                  No followers yet.
                </Typography>
              )}
            </List>
          </Box>
        </Modal>


        {/* Following Modal */}
        <Modal
          open={openFollowingModal}
          onClose={() => setOpenFollowingModal(false)}
          BackdropProps={{ sx: { backdropFilter: "blur(5px)" } }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              borderRadius: 2,
              p: 4,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
              Following
            </Typography>
            <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {followingList.length > 0 ? (
                followingList.map((u) => (
                  <ListItem key={u._id} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        setOpenFollowingModal(false);
                        handleProfile(u._id);
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={u.profileImage} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={u.name}
                        secondary={`@${u.username}`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" sx={{ textAlign: "center" }}>
                  Not following anyone.
                </Typography>
              )}
            </List>
          </Box>
        </Modal>

        <Postmodal
          selectedPost={selectedPost}
          openPostModal={openPostModal}
          setOpenPostModal={setOpenPostModal}
          currentImageIndex={currentImageIndex}
          user={user}
        />


        {/* Delete Confirmation Modal */}
        <Modal open={deleteConfirmation} onClose={() => setDeleteConfirmation(false)} >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "white",
              p: 3,
              borderRadius: 2,
              textAlign: "center"
            }}
          >
            <Typography variant="h6">Are you sure you want to delete this post?</Typography>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}>
              <Button variant="contained" color="error" onClick={deletetype === "temp" ? handleDeletePosttemp : handleDeletePost}>
                {deletetype === "temp" && selectedPost?.tempdelete ? "Recover" : "Yes, Delete"}
              </Button>
              <Button variant="outlined" onClick={() => setDeleteConfirmation(false)}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Modal>

        <Dialog
          open={openBlockedContacts}
          onClose={() => setOpenBlockedContacts(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle sx={{ fontWeight: 'bold', position: 'relative', textAlign: 'center', pb: 1 }}>
            Blocked Contacts
            <IconButton
              aria-label="close"
              onClick={() => setOpenBlockedContacts(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {blockedUsers && blockedUsers.length > 0 ? (
              <List disablePadding>
                {blockedUsers.map((b) => (
                  <ListItem
                    key={b.id}
                    sx={{
                      mb: 1,
                      borderRadius: 1,
                      '&:hover': { backgroundColor: 'action.hover' },
                      alignItems: 'center'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={b.profileImage} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={b.name}
                      secondary={`@${b.username}`}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleUnblock(b.id)}
                      sx={{ textTransform: 'none' }}
                    >
                      Unblock
                    </Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                You have no blocked contacts.
              </Typography>
            )}
          </DialogContent>
        </Dialog>
        <Dialog
          open={openEditProfile}
          onClose={() => setOpenEditProfile(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>Edit Profile</DialogTitle>
          <DialogContent dividers>
            {!selectedFile && (
              <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  onClick={() => setOpenCamera(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Use Camera
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  component="label"
                  sx={{ textTransform: 'none' }}
                >
                  Upload from Device
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                </Button>
              </Box>
            )}

            {/* Preview + Discard + Accept */}
            {selectedFile && (
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Typography variant="body2">Selected file: {selectedFile.name}</Typography>
                <Box
                  component="img"
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  sx={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    mt: 1,
                    borderRadius: 2,
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                  <Button
                    variant="text"
                    color="error"
                    onClick={() => setSelectedFile(null)}
                  >
                    Discard
                  </Button>
                  <Button
                    variant="contained"
                    onClick={async () => {
                      await handleImageUpload();
                    }}
                  >
                    Accept
                  </Button>
                </Box>
              </Box>
            )}
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Name"
                name="name"
                fullWidth
                value={formData.name || ''}
                onChange={handleChange}
              />
              <TextField
                label="Username"
                name="username"
                fullWidth
                value={formData.username || ''}
                onChange={handleChange}
              />
              <TextField
                label="Bio"
                name="bio"
                fullWidth
                multiline
                rows={3}
                value={formData.bio || ''}
                onChange={handleChange}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditProfile(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdateProfile}>
              Save
            </Button>
          </DialogActions>
        </Dialog>



        {/* sharemodal*/}
        <ShareModal
          open={openShareModal}
          onClose={() => setOpenShareModal(false)}
          contentToShare={{
            senderId: user?._id,
            id: userDetails.id,
            name: userDetails.name,
            username: userDetails.username,
            profileImage: userDetails.profileImage,
          }}
          type="profile"
        />

        {/* Modal for Camera Capture */}
        <Modal open={openCamera} onClose={() => setOpenCamera(false)}>
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80vw',    // 80% of the viewport width
              maxWidth: 400,    // but never exceed 400px
              height: '50vh',   // 60% of the viewport height
              maxHeight: 300,   // but never exceed 400px
              boxShadow: 24,
              borderRadius: 2,
            }}
          >

            {/* tell CameraCapture to hand you back a blob */}
            <CameraCapture onMediaUpload={handleCameraImageUpload} />
          </Box>
        </Modal>
        <FollowRequest
          open={openFollowRequestModal}
          onClose={() => setOpenFollowRequestModal(false)}
          requestProfiles={requestProfiles}
          handleRespondRequest={handleRespondRequest}
        />
        {/* ChatBox Model */}
        <Modal open={openChat} onClose={() => setOpenChat(false)}>
          <Box width="50%" height="50%" position="absolute" left='28%' top='25%' >

            {userDetails && (
              <>
                <Chatbox userId={userDetails.id} username={userDetails.username} />
              </>
            )}

          </Box>
        </Modal>

        {/*delete confirmation modal */}
        <Modal open={openDeleteAccountModal} onClose={() => setOpenDeleteAccountModal(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "white",
              p: 3,
              borderRadius: 2,
              textAlign: "center"
            }}
          >
            <Typography variant="h6">Are you sure you want to delete your account?</Typography>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                variant="contained"
                color="error"
                onClick={handledeleteAccount}
              >
                Yes, Delete My Account
              </Button>
              <Button variant="outlined" onClick={() => setOpenDeleteAccountModal(false)}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Modal>
      </Container>
    </>
  );
};

export default ProfilePage;