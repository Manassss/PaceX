import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Container,
    Typography,
    Box,
    Button,
    CircularProgress,
    TextField,
    Card,
    CardContent,
    CardMedia,
    IconButton,
    Avatar
} from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import FavoriteIcon from "@mui/icons-material/Favorite";

const CommunityDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get community ID from URL
    const { user } = useAuth();
    const [community, setCommunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false); // Admin status
    const [posts, setPosts] = useState([]); // State to store posts
    const [newPost, setNewPost] = useState(""); // State for new post content

    useEffect(() => {
        const fetchCommunity = async () => {
            try {
                const response = await axios.get(`http://localhost:5001/api/community/${id}`);
                setCommunity(response.data);
                const memberData = response.data.members.find(member => member.userId === user._id);
                setIsMember(!!memberData);
                setIsAdmin(response.data.createdBy === user._id);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching community details:", error);
                setLoading(false);
            }
        };

        const fetchPosts = async () => {
            try {
                const response = await axios.get(`http://localhost:5001/api/community/post/${id}`);
                console.log(response.data) // ✅ Pass ID in URL
                setPosts(response.data);
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        fetchCommunity();
        fetchPosts();
    }, [id, user]);

    const handleMembership = async () => {
        try {
            await axios.post(`http://localhost:5001/api/community/togglemember`, { communityId: id, userId: user._id });
            setIsMember(prevState => !prevState); // Toggle membership state in UI
        } catch (error) {
            console.error("Error updating membership:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5001/api/community/${id}`);
            alert("Community deleted successfully!");
            navigate("/community"); // Redirect to home or another page
        } catch (error) {
            console.error("Error deleting community:", error);
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.trim()) return;
        try {
            const response = await axios.post(`http://localhost:5001/api/community/post`, {
                communityId: id,
                userId: user._id,
                content: newPost,
                username: user.name,
                userimg: user?.profileImage
            });
            setPosts([response.data, ...posts]);
            setNewPost("");
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    const handleLikePost = async (postId) => {
        try {
            await axios.post(`http://localhost:5001/api/posts/${postId}/like`, { userId: user._id });
            setPosts(posts.map(post =>
                post._id === postId
                    ? { ...post, likes: [...post.likes, user._id] }
                    : post
            ));
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    if (loading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 5 }} />;

    return (
        <Container maxWidth="md">
            {/* Cover Image */}
            <Box
                sx={{
                    width: "100%",
                    height: 250,
                    backgroundImage: `url(${community.coverImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: 2
                }}
            />

            {/* Community Info */}
            <Box sx={{ mt: 2, textAlign: "center" }}>
                <Typography variant="h4">{community.name}</Typography>
                <Typography variant="body1" color="text.secondary">{community.description}</Typography>
            </Box>

            {/* Admin Delete Button or Join/Leave Button */}
            <Box sx={{ mt: 3, textAlign: "center" }}>
                {isAdmin ? (
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                    >
                        Delete Community
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color={isMember ? "secondary" : "primary"}
                        onClick={handleMembership}
                    >
                        {isMember ? "Leave Community" : "Join Community"}
                    </Button>
                )}
            </Box>

            {/* Post Creation Section */}
            {isMember && (
                <Box sx={{ mt: 4, textAlign: "center" }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        placeholder="Write a post..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                    />
                    <Button variant="contained" sx={{ mt: 2 }} onClick={handleCreatePost}>
                        Post
                    </Button>
                </Box>
            )}

            {/* Community Posts */}
            <Box sx={{ mt: 5 }}>
                <Typography variant="h5">Community Posts</Typography>
                {posts?.length > 0 ? (
                    posts.map(post => (
                        <Card key={post._id} sx={{ mt: 2 }}>
                            <CardContent sx={{ display: "flex", alignItems: "center" }}>
                                <Avatar src={post.userimg} alt={post.username} sx={{ mr: 2 }} />
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {post.username}
                                </Typography>
                            </CardContent>
                            {post.image && (
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={post.image}
                                    alt="Post Image"
                                />
                            )}
                            <CardContent>
                                <Typography variant="body1">{post.content}</Typography>
                                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                                    <IconButton onClick={() => handleLikePost(post._id)}>
                                        <FavoriteIcon color={Array.isArray(post.likes) && post.likes.includes(user._id) ? "error" : "inherit"} />
                                    </IconButton>
                                    <Typography variant="body2">{post.likes.length} Likes</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        No posts yet. Be the first to share something!
                    </Typography>
                )}
            </Box>
        </Container>
    );
};

export default CommunityDetail;