import React, { useState, useEffect } from "react";
import axios from "axios";
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
    Stack
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";
import ForumIcon from "@mui/icons-material/Forum";
import AddIcon from "@mui/icons-material/Add";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useAuth } from "../auth/AuthContext";
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import GroupsIcon from "@mui/icons-material/Groups";
import ArticleIcon from "@mui/icons-material/Article";
import VisibilityIcon from '@mui/icons-material/Visibility';




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

    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState("");
    const [isMember, setIsMember] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    


    // Fetch all communities
    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const response = await axios.get("http://localhost:5001/api/community");
                console.log("fetchCommunities response:", response);       // ← logs full response
                console.log("fetchCommunities data:", response.data); 
                setCommunities(response.data);
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
                    axios.get(`http://localhost:5001/api/community/${selectedCommunity._id}`),
                    axios.get(`http://localhost:5001/api/community/post/${selectedCommunity._id}`)
                ]);
                console.log("fetchDetails communityRes:", communityRes);
                console.log("fetchDetails community data:", communityRes.data);
                console.log("fetchDetails postsRes:", postsRes);
                console.log("fetchDetails posts data:", postsRes.data);
                // Update additional data, but avoid resetting selectedCommunity
                const updatedCommunity = communityRes.data;
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
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
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

            const res = await axios.post("http://localhost:5001/api/community", payload);
            setCommunities([res.data, ...communities]);
            setOpenModal(false);
            setName(""); setDescription(""); setCoverImage(null); setRules("");
        } catch (error) {
            console.error("Error creating community:", error);
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.trim()) return;
        try {
            const res = await axios.post(`http://localhost:5001/api/community/post`, {
                communityId: selectedCommunity._id,
                userId: user._id,
                content: newPost,
                username: user.name,
                userimg: user?.profileImage
            });
            setPosts([res.data, ...posts]);
            setNewPost("");
        } catch (error) {
            console.error("Error posting:", error);
        }
    };

    const handleLikePost = async (postId) => {
        try {
            await axios.post(`http://localhost:5001/api/posts/${postId}/like`, { userId: user._id });
            setPosts(posts.map(p =>
                p._id === postId ? { ...p, likes: [...p.likes, user._id] } : p
            ));
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    const handleMembership = async () => {
        try {
            await axios.post(`http://localhost:5001/api/community/togglemember`, {
                communityId: selectedCommunity._id, userId: user._id
            });
            setIsMember(prev => !prev);
        } catch (error) {
            console.error("Membership error:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5001/api/community/${selectedCommunity._id}`);
            alert("Deleted successfully");
            setView("home");
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "#f8f2ec",
                py: 6,
                px: { xs: 2, sm: 4, md: 6 }, // Optional padding to avoid hugging edges on small screens
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
    <Grid container spacing={4}>
      {filteredCommunities.map((community) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={community._id}>
          <Card
            onClick={() => {
              setSelectedCommunity(community);
              setView("detail");
            }}
            sx={{
              borderRadius: 4,
              width: "100%",
              overflow: "hidden",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              backdropFilter: "blur(10px)",
              background: "#2052a0",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
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
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ mb: 1, color: "#f8f2ec", fontSize: "1.2rem" }}
              >
                {community.name}
              </Typography>
              <Typography
  variant="body2"
  color="#f8f2ec"
  sx={{ mb: 2, minHeight: 50 }}
>
  {community.description.length > 100
    ? `${community.description.substring(0, 100)}…`
    : community.description}
</Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 2,
                  px: 1,
                }}
              >
                {/* Members */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    background: "#e3f2fd",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 999,
                  }}
                >
                  <GroupsIcon fontSize="small" sx={{ mr: 1 }} color="primary" />
                  <Typography fontSize="0.9rem" fontWeight="500">
                    {community.members.length} Members
                  </Typography>
                </Box>
                {/* Posts */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    background: "#f3e5f5",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 999,
                  }}
                >
                  <ArticleIcon fontSize="small" sx={{ mr: 1 }} color="secondary" />
                  <Typography fontSize="0.9rem" fontWeight="500">
                    {community.posts} Posts
                  </Typography>
                </Box>
              </Box>
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
    {loading ? (
      <CircularProgress sx={{ mt: 5 }} />
    ) : (
      <Grid
        container
        spacing={4}
        sx={{
          px: { xs: 2, md: 6 },
          py: 4,
        }}
      >
        {/* ── LEFT COLUMN: Hero Image & Community Info ── */}
        <Grid item xs={12} md={4}>
          {/* Hero Banner */}
          <Box
            sx={{
              width: "100%",
              height: 0,
              pt: "56%",           // 16:9
              backgroundImage: `url(${selectedCommunity.coverImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: 2,
              mb: 3,
            }}
          />

          {/* Name & Description */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h3" gutterBottom>
              {selectedCommunity.name}
            </Typography>
            <Typography variant="body3">
              {selectedCommunity.description}
            </Typography>
          </Box>

          {/* Join / Delete Button */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            {isAdmin ? (
              <Button
                variant="contained"
                color="error"
                fullWidth
                onClick={handleDelete}
              >
                Delete Community
              </Button>
            ) : (
              <Button
                variant="contained"
                color={isMember ? "primary" : "primary"}
                fullWidth
                onClick={handleMembership}
              >
                {isMember ? "Leave" : "Join"}
              </Button>
            )}
          </Box>

          {/* New Post Form */}
          {isMember && (
            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Write a post..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                fullWidth
                onClick={handleCreatePost}
              >
                Post
              </Button>
            </Box>
          )}

          {/* Community Stats */}
          <Paper
  sx={{
    p: 3,
    borderRadius: 2,
    boxShadow: 2,
    maxWidth: 400,
    mx: "auto",        // center on narrow screens
  }}
>
  <Typography variant="h6" gutterBottom>
    Community Stats
  </Typography>

  <Stack
    direction="row"
    justifyContent="space-around"
    alignItems="center"
    spacing={2}
  >
    {/* Members */}
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
        {selectedCommunity.members.length}
      </Typography>
      <Typography color="text.secondary" variant="body2">
        Members
      </Typography>
    </Box>

    {/* Posts */}
    <Box textAlign="center">
      <Avatar
        sx={{
          bgcolor: "secondary.main",
          width: 56,
          height: 56,
          mb: 1,
        }}
      >
        <ArticleIcon fontSize="large" />
      </Avatar>
      <Typography variant="h5">
        {posts.length}
      </Typography>
      <Typography color="text.secondary" variant="body2">
        Posts
      </Typography>
    </Box>
  </Stack>
</Paper>

        </Grid>

        {/* ── RIGHT COLUMN: Posts Feed ── */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom>
            Community Posts
          </Typography>
          {posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post._id} sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
                <CardContent sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar src={post.userimg} sx={{ mr: 2 }} />
                  <Typography fontWeight="bold">
                    {post.username}
                  </Typography>
                </CardContent>

                {post.image && (
                  <Box
                    component="img"
                    src={post.image}
                    alt=""
                    sx={{ width: "100%", borderRadius: 2, mb: 2 }}
                  />
                )}

                <CardContent>
                  <Typography sx={{ mb: 1 }}>
                    {post.content}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={() => handleLikePost(post._id)}>
                      <FavoriteIcon
                        color={
                          post.likes.includes(user._id)
                            ? "error"
                            : "inherit"
                        }
                      />
                    </IconButton>
                    <Typography>{post.likes.length} Likes</Typography>
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography>No posts yet.</Typography>
          )}

          <Box textAlign="center" mt={4}>
            <Button
              onClick={() => {
                setView("home");
                setSelectedCommunity(null);
              }}
            >
              Back to Communities
            </Button>
          </Box>
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
      width: { xs: "90%", sm: 1000 },
      maxHeight: "90vh",
      overflowY: "auto",
      bgcolor: "#f8f2ec",
      boxShadow: 12,
      borderRadius: 4,
      p: 4,
      position: "relative" // To position close icon
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

    {/* 📸 Image Upload with Preview */}
<Box
  sx={{
    mb: 2,
    p: 1.5,
    border: "1px dashed #ccc",
    borderRadius: 2,
    textAlign: "center",
    backgroundColor: "#fff",
    fontSize: "0.9rem",
    color: "#666",
    position: "relative"
  }}
>
  {!previewUrl && (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files[0];
        setCoverImage(file);
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewUrl(reader.result);
          };
          reader.readAsDataURL(file);
        }
      }}
      style={{ border: "none", outline: "none" }}
    />
  )}

  {/* 3️⃣ Preview with fixed dimensions and objectFit: cover */}
  {previewUrl && (
    <Box sx={{ mt: 2, position: "relative", display: "inline-block" }}>
      <img
        src={previewUrl}
        alt="Preview"
        style={{
          width: "900px",
          height: "500px",
          objectFit: "cover", // 3️⃣ Crop to fixed size
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}
      />

      {/* 4️⃣ Cancel Icon to remove uploaded image */}
      <IconButton
        onClick={() => {
          setCoverImage(null);
          setPreviewUrl("");
        }}
        sx={{
          position: "absolute",
          top: 4,
          right: -35,
          color: "red",
          boxShadow: 1,
          "&:hover": {
            backgroundColor: "#eee"
          }
        }}
      >
        ✕
      </IconButton>
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
        py: 1.2,
        fontWeight: "bold",
        fontSize: "1rem",
        borderRadius: "50px",
        background: "linear-gradient(135deg, #6a1b9a, #8e24aa)",
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


        </Box>
    );
    
};

export default CommunityPage;
