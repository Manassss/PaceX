import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import {
  Container,
  TextField,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Avatar,
  IconButton,
  InputAdornment,
  Button,
  Modal,
  CircularProgress,
  CardMedia,
  Paper,
  Stack,
  CardActions,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useAuth } from "../auth/AuthContext";
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import GroupsIcon from "@mui/icons-material/Groups";
import ArticleIcon from "@mui/icons-material/Article";
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,           // ← add this
  ListItem,       // ← and this
  ListItemIcon,   // ← and this
  ListItemText    // ← and this
} from '@mui/material';
import { host } from '../components/apinfo';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RuleIcon from '@mui/icons-material/Rule';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { AiFillLike } from "react-icons/ai";
import { FaComment } from "react-icons/fa";
import SendIcon from '@mui/icons-material/Send';
import Webcam from "react-webcam";
import CloseIcon from '@mui/icons-material/Close';
import { FaUpload } from "react-icons/fa";
import { FaCamera } from "react-icons/fa6";










const CommunityPage = () => {
  const { user } = useAuth();
  const [view, setView] = useState("home"); // home | detail
  const [selectedCommunity, setSelectedCommunity] = useState(null);


  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [rules, setRules] = useState("");
  const [openPostModal, setOpenPostModal] = useState(false);
  const [modalPostText, setModalPostText] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  // state to handle hover
  const [uploadHover, setUploadHover] = useState(false);
  const [cameraHover, setCameraHover] = useState(false);



  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [rulesOpen, setRulesOpen] = useState(false);
  const [selectedRules, setSelectedRules] = useState([]);
  const [commentVisible, setCommentVisible] = useState({});
  const [commentText, setCommentText] = useState({});
  // track which posts are expanded
  const [expandedPosts, setExpandedPosts] = useState({});
  const webcamRef = useRef(null);
  const [openCamera, setOpenCamera] = useState(false);

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImagePreview(imageSrc);
    // convert base64 to Blob if needed before upload
    setOpenCamera(false);
  };

  const toggleExpand = postId => {
    setExpandedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleOpenRules = (rules) => {
    setSelectedRules(rules);
    setRulesOpen(true);
  };
  const handleCloseRules = () => {
    setRulesOpen(false);
    setSelectedRules([]);
  };

  const transform = raw => ({
    id: raw._id,
    name: raw.name.replace(/^\.\s*/, ""),
    cover: raw.coverImage,
    desc: raw.description,
    created: new Date(raw.createdAt).toLocaleDateString(),
    createdBy: raw.createdBy,
    memberCount: raw.members.length,
    members: raw.members.map(m => ({
      id: m._id,
      userId: m.userId,
      role: m.role,
      joinedAt: new Date(m.joinedAt).toLocaleDateString()
    })),
    postsCount: raw.posts,
    rules: raw.rules.map(r => r.replace(/^\d+\.\s*/, ""))
  });



  // Fetch all communities
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await axios.get(`${host}/api/community`);
        console.log("✅ communities fetched:", response.data);
        setCommunities(response.data.filter(c => !!c.name)); // filter invalid ones
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    };

    fetchCommunities();
  }, [openModal]);


  // When a community is selected
  useEffect(() => {
    if (!selectedCommunity?._id) return;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const [communityRes, postsRes] = await Promise.all([
          axios.get(`${host}/api/community/${selectedCommunity._id}`),
          axios.get(`${host}/api/community/post/${selectedCommunity._id}`)
        ]);
        console.log("fetchDetails communityRes:", communityRes);
        console.log("fetchDetails community data:", communityRes.data);
        console.log("fetchDetails postsRes:", postsRes);
        console.log("fetchDetails posts data:", postsRes.data);
        // Update additional data, but avoid resetting selectedCommunity
        const updatedCommunity = communityRes.data;
        if (!updatedCommunity.createdBy) {
          updatedCommunity.createdBy = { name: "Unknown" };
        }

        setIsMember(!!updatedCommunity.members.find(m => m.userId === user._id));
        setIsAdmin(updatedCommunity.createdBy === user._id);
        setPosts(postsRes.data);
      } catch (error) {
        console.error("Error loading community detail:", error);
      }
      setLoading(false);
    };
    fetchDetails();
  }, [selectedCommunity?._id, user._id]); // only re-fetch if ID changes


  const filteredCommunities = communities.filter((c) =>
    c?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleCreateCommunity = async () => {
    try {
      let imageUrl = coverImageUrl;
      if (coverImage && !coverImageUrl) {
        const storageRef = ref(storage, `communityCovers/${user._id}/${coverImage.name}`);
        const uploadTask = uploadBytesResumable(storageRef, coverImage);
        imageUrl = await new Promise((resolve, reject) => {
          uploadTask.on("state_changed", null, reject, async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          });
        });
      }

      const payload = {
        name,
        description,
        createdBy: user._id,
        coverImage: imageUrl,
        rules: rules.split("\n").filter(r => r.trim()),
        members: [{ userId: user._id, role: "admin" }],
      };

      const res = await axios.post(`${host}/api/community`, payload);
      setCommunities([res.data, ...communities]);
      setOpenModal(false);
      setName(""); setDescription(""); setCoverImage(null); setRules("");
    } catch (error) {
      console.error("Error creating community:", error);
    }
  };

  const handleCreatePost = async (content, file) => {
    if (!content.trim()) {
      alert("Post content cannot be empty.");
      return;
    }

    try {
      let imageUrl = "";

      if (file) {
        const storageRef = ref(storage, `posts/${user._id}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        imageUrl = await new Promise((resolve, reject) => {
          uploadTask.on("state_changed", null, reject, async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          });
        });
      }

      const postPayload = {
        communityId: selectedCommunity?._id,
        userId: user._id,
        content,
        username: user.name || "Unknown",
        userimg: user?.profileImage || "",
        image: imageUrl || "",
      };

      console.log("📤 Sending post payload:", postPayload);

      const res = await axios.post(`${host}/api/community/post`, postPayload);
      setPosts((prev) => [res.data.post, ...prev]);
    } catch (error) {
      console.error("🔥 Error creating post:", error?.response?.data || error.message);
    }
  };




  const handleMembership = async () => {
    try {
      await axios.post(`${host}/api/community/togglemember`, {
        communityId: selectedCommunity._id, userId: user._id
      });
      setIsMember(prev => !prev);
    } catch (error) {
      console.error("Membership error:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${host}/api/community/${selectedCommunity._id}`);
      alert("Deleted successfully");
      setView("home");
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // show/hide the comment box under a given post
  const toggleCommentInput = postId => {
    setCommentVisible(v => ({ ...v, [postId]: !v[postId] }));
  };

  // call your “commentOnPost” controller
  // Like/Unlike Post
  const handleLikePost = async (postId) => {
    try {
      await axios.post(
        `${host}/api/community/${postId}/like`,
        { userId: user._id }
      );
      // Optimistic UI Update
      setPosts(ps =>
        ps.map(p =>
          p._id === postId
            ? {
              ...p,
              likes: p.likes.includes(user._id)
                ? p.likes.filter(id => id !== user._id)
                : [...p.likes, user._id],
            }
            : p
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  // Submit Comment
  const submitComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) return;

    try {
      const res = await axios.post(
        `${host}/api/community/${postId}/comment`,
        { userId: user._id, text }
      );

      setPosts(ps =>
        ps.map(p =>
          p._id === postId
            ? { ...p, comments: [...p.comments, { userId: user._id, text }] }
            : p
        )
      );

      setCommentText(t => ({ ...t, [postId]: "" }));
    } catch (error) {
      console.error("Error commenting on post:", error);
    }
  };


  const cropToResolution = (file, targetWidth, targetHeight) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        // Cover crop (center crop)
        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
        const x = (targetWidth / 2) - (img.width / 2) * scale;
        const y = (targetHeight / 2) - (img.height / 2) * scale;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error("Image crop failed"));
        }, 'image/jpeg', 0.9);
      };
      img.src = URL.createObjectURL(file);
    });
  };




  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f8f2ec",
        py: { xs: 4, sm: 6 },
        px: { xs: 2, sm: 3, md: 6 },
      }}
    >
      {/* -------------------------------- HOME VIEW -------------------------------- */}
      {view === "home" && (
        <>
          {/* 🔍 Search Bar + ➕ Create Button */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              mt: 4,
              mb: 3,
              gap: 2,
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Search for communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: "#fff",
                borderRadius: "30px",
                width: { xs: "100%", sm: "70%", md: "50%" },
                boxShadow: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "30px",
                },
              }}
            />

            <Button
              onClick={() => setOpenModal(true)}
              startIcon={<AddIcon />}
              fullWidth={{ xs: true, sm: false }}
              sx={{
                background: "linear-gradient(to right, #073574, #4a90e2)",
                color: "white",
                px: 4,
                py: 1.5,
                borderRadius: "999px",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: 5,
                  transform: "translateY(-2px)",
                },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Create
            </Button>
          </Box>

          {/* Community Cards Grid */}
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {filteredCommunities.map((community) => (
              <Grid item xs={12} sm={6} md={4} lg={4} key={community._id}>
                <Card
                  sx={{
                    height: "100%",              // ← fill the Grid item’s height
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 10,
                    overflow: "hidden",
                    cursor: "pointer",
                    border: "2px solid #073574",
                    boxShadow: "0 8px 24px rgba(7,53,116,0.2)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    backdropFilter: "blur(10px)",
                    background: "white",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 12px 32px rgba(7,53,116,0.3)",
                    },
                  }}
                >
                  {/* Banner */}
                  <Box
                    sx={{
                      height: 0,
                      pt: "56%", // 16:9 aspect ratio
                      backgroundImage: `url(${community.coverImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />

                  {/* Content */}
                  <CardContent>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 1 }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        fontSize={{ xs: "1rem", sm: "1.2rem", md: "1.4rem" }}

                        sx={{ color: "#073574", fontSize: "1.2rem" }}
                      >
                        {community.name.length > 15
                          ? `${community.name.substring(0, 15)}…`
                          : community.name}
                      </Typography>

                      <Button
                        onClick={() => {
                          setSelectedCommunity(community);
                          setView("detail");
                        }}
                        startIcon={<VisibilityIcon />}
                        variant="outlined"
                        sx={{
                          borderRadius: "999px",
                          textTransform: "none",
                          color: "#073574",
                          borderColor: "#073574",
                          px: 2,
                          py: 0.5,
                          "&:hover": {
                            backgroundColor: "rgba(7,53,116,0.1)",
                            borderColor: "#073574",
                          },
                        }}
                      >
                        View
                      </Button>
                    </Box>


                    <Typography
                      variant="body2"
                      color="black"
                      sx={{ mb: 2, minHeight: 50 }}
                    >
                      {community.description.length > 75
                        ? `${community.description.substring(0, 75)}…`
                        : community.description}
                    </Typography>

                    {/* …inside your CardContent, after description… */}
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: "auto", px: 1, flexWrap: "wrap", gap: 1 }}
                    >
                      {["rules", "members", "posts"].map((key) => {
                        let icon, label, onClick, bg, hoverBg, color;
                        switch (key) {
                          case "rules":
                            icon = <ListAltIcon fontSize="small" />;
                            label = "Rules";
                            onClick = () => handleOpenRules(community.rules);
                            bg = "#fce4ec";
                            hoverBg = "#f8bbd0";
                            color = "secondary";
                            break;
                          case "members":
                            icon = <GroupsIcon fontSize="small" />;
                            label = `${community.members.length} Members`;
                            onClick = undefined;
                            bg = "#e3f2fd";
                            hoverBg = bg;
                            color = "primary";
                            break;
                          case "posts":
                            icon = <ArticleIcon fontSize="small" />;
                            label = `${community.posts} Posts`;
                            onClick = undefined;
                            bg = "#f3e5f5";
                            hoverBg = bg;
                            color = "secondary";
                            break;
                        }

                        return (
                          <Box
                            key={key}
                            onClick={onClick}
                            sx={{
                              display: "inline-flex",        // size to content
                              alignItems: "center",
                              whiteSpace: "nowrap",          // never wrap icon/text
                              px: 1.5,
                              py: 0.75,
                              background: bg,
                              borderRadius: "999px",
                              cursor: onClick ? "pointer" : "default",
                              transition: "background 0.2s",
                              "&:hover": onClick ? { background: hoverBg } : {},
                            }}
                          >
                            {React.cloneElement(icon, { sx: { mr: 0.5 } })}
                            <Typography
                              component="span"              // renders inline
                              fontSize="0.9rem"
                              fontWeight={500}
                              color={color}
                            >
                              {label}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>


                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}


      {/* -------------------------------- DETAIL VIEW -------------------------------- */}
      {view === "detail" && selectedCommunity && (
        <>
          {/* Show spinner while loading */}
          {loading ? (
            <CircularProgress sx={{ mt: 5 }} />
          ) : (
            // Main two‑column layout
            <Grid
              container
              spacing={4}
              sx={{
                px: { xs: 2, md: 6 }, // horizontal padding on small vs. medium+
                py: 4,               // vertical padding
              }}
            >

              {/* ── LEFT COLUMN: Hero Image & Community Info ── */}

              <Grid
                item
                xs={12}
                md={4}
                sx={{
                  position: { md: "sticky" },
                  top: { md: 20 },
                  alignSelf: "flex-start",
                  zIndex: 1,
                }}
              >


                <Box sx={{ textAlign: "left", mb: 2, ml: 1 }}>
                  <Button
                    onClick={() => {
                      setView("home");
                      setSelectedCommunity(null);
                    }}
                    variant="outlined"
                    size="small"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: '#073574',
                      color: '#073574',
                      '&:hover': {
                        backgroundColor: '#f0f4fa',
                        borderColor: '#073574',
                      },
                    }}
                  >
                    ← Back to Communities
                  </Button>
                </Box>


                {/* Hero Banner: 16:9 aspect ratio box with coverImage */}
                <Box
                  sx={{
                    width: "100%",
                    height: 0,
                    pt: "56%",           // padding‑top for 16:9
                    backgroundImage: `url(${selectedCommunity.coverImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: 2,
                    mb: 3,               // margin bottom
                  }}
                />

                {/* Community Name & Description */}
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    noWrap
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: "bold",
                    }}
                  >
                    {selectedCommunity.name}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ mb: 1, fontWeight: "bold" }}
                  >
                    Created By: {selectedCommunity.createdBy?.name || "Unknown"}
                  </Typography>

                  <Typography variant="body2" sx={{

                  }}>
                    <Typography variant="body1" sx={{
                      fontWeight: "bold",
                      mt: 4,
                      mb: 1,
                    }}> About</Typography>
                    {selectedCommunity.description}  {/* display description */}
                  </Typography>
                </Box>

                {/* Action Button: Join/Leave or Delete */}
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  {isAdmin ? (
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={handleDelete}
                      sx={{
                        px: 2,
                        py: 0.5,
                        fontSize: "0.875rem",
                        minWidth: 100,
                      }}
                    >
                      Delete
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color={isMember ? "primary" : "primary"}
                      size="small"
                      onClick={handleMembership}
                      sx={{
                        px: 2,
                        py: 0.5,
                        fontSize: "0.875rem",
                        minWidth: 100,
                      }}
                    >
                      {isMember ? "Leave" : "Join"}
                    </Button>
                  )}
                </Box>


                {/* New Post Form (only if the user is a member) */}
                {isMember && (
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Button
                      variant="contained"
                      onClick={() => setOpenPostModal(true)}
                      sx={{ borderRadius: 999, textTransform: "none", px: 4 }}
                    >
                      + Create Post
                    </Button>
                  </Box>
                )}


                {/* Community Stats Card */}
                <Paper
                  sx={{
                    p: 3,           // padding
                    maxWidth: 400,
                    mx: "auto",
                    backgroundColor: "#f8f2ec",    // center on mobile
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Community Stats
                  </Typography>



                  {/* Stats icons and numbers side‑by‑side */}
                  <Stack
                    direction="row"
                    justifyContent="space-around"
                    alignItems="center"
                    spacing={2}
                  >
                    {/* Members stat */}
                    <Box textAlign="center">
                      <Avatar
                        sx={{
                          bgcolor: "primary.main",
                          width: 56,
                          height: 56,
                          mb: 1,
                        }}
                      >
                        <GroupsIcon fontSize="large" />
                      </Avatar>
                      <Typography variant="h5">
                        {selectedCommunity.members.length}  {/* number of members */}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        Members
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              {/* ── RIGHT COLUMN: Posts Feed ── */}
              <Grid item xs={12} md={8}>
                {/* List of posts or fallback text */}
                {posts.length > 0 ? (
                  [...posts] // clone to avoid mutating state
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((post, index) => (
                      <React.Fragment key={post._id}>
                        <Card
                          sx={{
                            mb: 3,
                            borderRadius: 2,
                            backgroundColor: "transparent",
                            boxShadow: "none",
                            ml: 5,
                          }}
                        >
                          {/* Post header with avatar and username */}
                          <CardContent sx={{ display: "flex", alignItems: "center" }}>
                            <Link to={`/profile/${post.userId}`} style={{ textDecoration: 'none' }}>
                              <Avatar
                                src={post.userimg}
                                sx={{ mr: 2, cursor: 'pointer' }}
                              />
                            </Link>
                            <Link
                              to={`/profile/${post.userId}`}
                              style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                            >
                              <Typography fontWeight="bold">
                                {post.username}
                              </Typography>
                            </Link>
                          </CardContent>

                          {/* Optional post image */}
                          {post.image && (
                            <Box
                              component="img"
                              src={post.image}
                              alt=""
                              sx={{
                                width: "100%",
                                maxWidth: "100%",
                                height: "auto",
                                borderRadius: 2,
                                mb: 2,
                              }}
                            />

                          )}

                          {/* Post text and like button */}
                          <CardContent>
                            {/* Post Content with Expand */}
                            <Typography
                              sx={{ mb: 1, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                            >
                              {expandedPosts[post._id] || post.content.length <= 75
                                ? post.content
                                : `${post.content.slice(0, 75)}…`}
                            </Typography>

                            {post.content.length > 75 && (
                              <Button
                                size="small"
                                onClick={() => toggleExpand(post._id)}
                                sx={{ textTransform: "none", p: 0, mb: 1 }}
                              >
                                {expandedPosts[post._id] ? "Show less" : "Show more"}
                              </Button>
                            )}

                            {/* ── LIKE & COMMENT BUTTONS ── */}
                            <CardActions disableSpacing sx={{ px: 0 }}>
                              <IconButton onClick={() => handleLikePost(post._id)}>
                                <AiFillLike
                                  style={{
                                    color: post.likes.includes(user._id) ? '#073574' : '#888',
                                    fontSize: '24px'
                                  }}
                                />
                              </IconButton>
                              <Typography variant="body2" sx={{ mr: 2 }}>
                                {post.likes.length}
                              </Typography>



                              <IconButton onClick={() => toggleCommentInput(post._id)}>
                                <FaComment />
                              </IconButton>
                              <Typography variant="body2">
                                {post.comments?.length || 0}
                              </Typography>
                            </CardActions>

                            {/* ── COMMENT INPUT ▼ ── */}
                            {commentVisible[post._id] && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  variant="outlined"
                                  placeholder="Write a comment…"
                                  value={commentText[post._id] || ""}
                                  onChange={(e) =>
                                    setCommentText((prev) => ({ ...prev, [post._id]: e.target.value }))
                                  }
                                  sx={{
                                    bgcolor: '#fff',
                                    borderRadius: '999px', // 👈 Makes it pill-shaped
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: '999px', // 👈 Ensures inner input is also rounded
                                    },
                                  }}
                                />
                                <IconButton
                                  color="primary"
                                  onClick={() => submitComment(post._id)}
                                  sx={{ ml: 1 }}
                                >
                                  <SendIcon />
                                </IconButton>
                              </Box>
                            )}


                            {/* ── DISPLAY EXISTING COMMENTS ── */}
                            {post.comments?.map((c, idx) => (
                              <Box key={c._id || idx} sx={{ my: 1, py: 0.5 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Avatar src={c.userId.profileImage || ""} sx={{ width: 28, height: 28 }} />
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    {c.userId.name || "User"}
                                  </Typography>
                                </Stack>
                                <Typography variant="body2" sx={{ ml: 4, mt: 0.25 }}>
                                  {c.text}
                                </Typography>
                              </Box>
                            ))}

                          </CardContent>

                        </Card>
                        {index !== posts.length - 1 && (
                          <Divider sx={{ mx: 5, borderColor: '#e0e0e0' }} />
                        )}
                      </React.Fragment>
                    ))
                ) : (
                  <Typography>No posts yet.</Typography>
                )}

                {/* Back button to return to home */}
              </Grid>
            </Grid>
          )}
        </>
      )}



      {/* 🧱 Modal for Community Creation */}
      <Modal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setCoverImage(null);
          setPreviewUrl("");
        }}
        sx={{
          backdropFilter: "blur(5px)", // 1️⃣ Blur background when modal opens
          backgroundColor: "rgba(0,0,0,0.2)", // Optional darker blur effect
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "95vw",
              sm: "80vw",
              md: "65vw",
              lg: "45vw",
              xl: "35vw",
            },
            maxHeight: "90vh",
            overflowY: "auto",
            bgcolor: "#f8f2ec",
            p: 3,
            borderRadius: 3,
          }}
        >



          {/* 2️⃣ Close Button */}
          <IconButton
            onClick={() => {
              setOpenModal(false);
              setCoverImage(null);
              setPreviewUrl("");
            }}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "red",
              "&:hover": {
                backgroundColor: "#eee"
              }
            }}
          >
            ✕
          </IconButton>

          {/* 📝 Modal Title */}
          <Typography
            variant="h5"
            fontWeight="bold"
            fontSize={{ xs: "1rem", sm: "1.2rem", md: "1.4rem" }}
            textAlign="center"
            gutterBottom
            sx={{ color: "#073574" }}
          >
            Create a New Community
          </Typography>

          {/* 🔡 Community Name */}
          <TextField
            fullWidth
            label="Community Name"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: "#ffffff",
              },
            }}
          />

          {/* 🖊️ Description */}
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: "#ffffff",
              },
            }}
          />

          {/* 📸 Image Upload with Preview (800x600 Crop) */}
          <Box
            sx={{
              mb: 3,
              p: 3,
              border: "2px dashed #1976d2",
              borderRadius: 3,
              backgroundColor: "#f5f9ff",
              textAlign: "center",
              color: "#444",
              transition: "0.3s",
              "&:hover": {
                backgroundColor: "#e3f2fd",
              },
            }}
          >
            {!previewUrl && (
              <Box component="label" sx={{ cursor: "pointer" }}>
                <Box sx={{ fontSize: 40, color: "#1976d2", mb: 1 }}>
                  <FaUpload />
                </Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Drag & drop or click to upload
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Required size: 800px × 600px | Supported: JPG, PNG
                </Typography>

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const croppedBlob = await cropToResolution(file, 800, 600);
                      const processedFile = new File([croppedBlob], file.name, { type: "image/jpeg" });
                      setCoverImage(processedFile);
                      setPreviewUrl(URL.createObjectURL(croppedBlob));
                    }
                  }}
                />
              </Box>
            )}

            {/* 🔍 Preview after selection */}
            {previewUrl && (
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Preview"
                  sx={{
                    width: "100%",
                    maxWidth: 800,
                    height: 400,
                    objectFit: "cover",
                    borderRadius: 3,
                    boxShadow: 2,
                    mx: "auto", // center image horizontally
                  }}
                />

                <Button
                  onClick={() => {
                    setCoverImage(null);
                    setPreviewUrl("");
                  }}
                  sx={{
                    mt: 2,
                    textTransform: "none",
                    backgroundColor: "#fff",
                    border: "1px solid #d32f2f",
                    color: "#d32f2f",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    "&:hover": {
                      backgroundColor: "#fddede",
                    },
                  }}
                >
                  Discard Upload
                </Button>
              </Box>
            )}


          </Box>


          {/* 📃 Rules */}
          <TextField
            fullWidth
            label="Community Rules (one per line)"
            multiline
            rows={4}
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: "#ffffff",
              },
            }}
          />

          {/* 🚀 Create Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleCreateCommunity}
            sx={{
              ml: 35,
              py: 1.2,
              fontWeight: "bold",
              fontSize: "1rem",
              borderRadius: "50px",
              width: "20%",
              background: "#073574",
              boxShadow: 4,
              textTransform: "none",
              "&:hover": {
                background: "linear-gradient(135deg, #7b1fa2, #9c27b0)",
                boxShadow: 6,
              },
            }}
          >
            Create
          </Button>
        </Box>
      </Modal>
      <Dialog
        open={rulesOpen}
        onClose={handleCloseRules}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
          }
        }}
      >
        {/* Colored Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#073574',
            color: 'primary.contrastText',
            px: 2,
            py: 1.5,
          }}
        >
          <RuleIcon />
          <DialogTitle sx={{ ml: 1, fontWeight: 600, color: 'inherit' }}>
            Community Rules
          </DialogTitle>
        </Box>

        {/* Scrollable Content */}
        <DialogContent
          dividers
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            maxHeight: 360,
          }}
        >
          <List disablePadding>
            {selectedRules.map((rule, i) => (
              <ListItem key={i} disableGutters sx={{ alignItems: 'flex-start', mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                  <FiberManualRecordIcon sx={{ fontSize: 8, color: 'text.secondary' }} />
                </ListItemIcon>
                <ListItemText
                  primary={rule.replace(/^\d+\.\s*/, "")}
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: 'text.primary',
                    lineHeight: .5,
                  }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>

        {/* Action Buttons */}
        <DialogActions sx={{ px: 2, py: 1 }}>

          <Button
            onClick={handleCloseRules}
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>



      <Modal open={openPostModal} onClose={() => setOpenPostModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: "90%", sm: 500 },
            bgcolor: '#fff',
            borderRadius: 3,
            boxShadow: 24,
            p: 3,
            position: 'relative',
          }}
        >
          {/* Modal Close Button */}
          <IconButton
            sx={{ position: 'absolute', top: 10, right: 10 }}
            onClick={() => setOpenPostModal(false)}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" mb={2}>Create a Post</Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="What's on your mind?"
            value={modalPostText}
            onChange={(e) => setModalPostText(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Upload or Take Photo */}
          <Stack direction="row" spacing={2} sx={{ mb: 5 }}>
            {!imagePreview && (
              <>
                {/* Upload Box */}
                <Box
                  sx={{
                    border: '2px dashed #1976d2',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: '#f5f9ff',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease-in-out',
                    flex: 1,
                    '&:hover': {
                      backgroundColor: '#e3f2fd',
                    }
                  }}
                  component="label"
                >
                  <Box sx={{ fontSize: 40, color: '#1976d2', mb: 1 }}>
                    <FaUpload />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Drag and drop an image or click to upload
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Required size: 800px × 600px | Supported: .jpg, .png
                  </Typography>

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const croppedBlob = await cropToResolution(file, 800, 600);
                        setImageFile(new File([croppedBlob], file.name, { type: 'image/jpeg' }));
                        setImagePreview(URL.createObjectURL(croppedBlob));
                      }
                    }}
                  />
                </Box>

                {/* Take Photo Button */}
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setOpenCamera(true)}
                  onMouseEnter={() => setCameraHover(true)}
                  onMouseLeave={() => setCameraHover(false)}
                  startIcon={cameraHover ? <FaCamera /> : null}
                  sx={{
                    textTransform: "none",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 1,
                    flex: 1
                  }}
                >
                  {cameraHover ? "" : <FaCamera />}
                </Button>
              </>
            )}
          </Stack>


          {/* Image Preview + Cancel */}
          {imagePreview && (
            <Box sx={{ mb: 2, position: 'relative' }}>
              <Box
                component="img"
                src={imagePreview}
                alt="Preview"
                sx={{ width: '100%', borderRadius: 2 }}
              />
              <Button
                size="small"
                onClick={() => {
                  setImagePreview('');
                  setImageFile(null);
                }}
                sx={{
                  mt: 1,
                  textTransform: 'none',
                  color: 'red'
                }}
              >
                Remove Image
              </Button>
            </Box>
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={async () => {
              if (!modalPostText.trim()) {
                alert("Post cannot be empty");
                return;
              }

              await handleCreatePost(modalPostText, imageFile);
              setOpenPostModal(false);
              setModalPostText("");
              setImagePreview("");
              setImageFile(null);
            }}
          >
            Post
          </Button>

        </Box>
      </Modal>

      <Modal open={openCamera} onClose={() => setOpenCamera(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: "90%", sm: 500 },
          bgcolor: '#fff',
          borderRadius: 3,
          boxShadow: 24,
          p: 3,
        }}
        >
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={{ width: '100%', borderRadius: 10 }}
          />
          <Button fullWidth variant="contained" onClick={capturePhoto}>
            Capture
          </Button>
        </Box>
      </Modal>



    </Box>
  );

};

export default CommunityPage;
