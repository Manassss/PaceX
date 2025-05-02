import { React, useState, useEffect } from "react";
import {
    Box,
    Typography,
    Avatar,
    Paper,
    IconButton,
    TextField,
    Button,
    useMediaQuery
} from "@mui/material";
import { format, isToday, isYesterday, parse } from 'date-fns';
import { FaRegComment, FaShare } from "react-icons/fa6";
import { BsFillSaveFill } from "react-icons/bs";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import axios from "axios";
import { host } from '../apinfo';
import { useAuth } from "../../auth/AuthContext";
import { useLocation } from 'react-router-dom';
import { AiFillLike, AiOutlineLike } from 'react-icons/ai';
const PostFeed = ({
    posts,
    users,
    user,
    following,
    expandedPosts,
    showCommentBox,
    newComment,
    setNewComment,
    handleProfile,
    handleAddComment,
    toggleCommentBox,
    toggleShowMore,
    handleLikePost,
    handleOpenLikeModal,
    setSelectedPost,
    setOpenPostShareModal,
}) => {
    const isMobile = useMediaQuery('(max-width: 480px)');
    const isTablet = useMediaQuery('(max-width: 960px)');
    console.log("length of posts", posts[0]);
    const [imageIndex, setImageIndex] = useState(0);
    //const { user } = useAuth()
    const [randomPosts, setRandomPosts] = useState([]);
    //const [selectedTab, setSelectedTab] = useState(posts?.length === 0 ? 'explore' : 'posts');
    const initialTab = new URLSearchParams(window.location.search).get('tab') || (posts?.length === 0 ? 'explore' : 'posts');
    const [selectedTab, setSelectedTab] = useState(initialTab);

    const displayPosts = selectedTab === 'explore' ? randomPosts : posts;
    const fetchrandomPosts = async () => {
        try {
            const payload = { userId: user?._id };
            const res = await axios.post(`${host}/api/posts/random`, payload);
            const data = res.data;

            const postsWithComments = await Promise.all(
                data.map(async (post) => {
                    const commentsRes = await axios.get(`${host}/api/comment/${post._id}`);
                    return {
                        content: post.content,
                        createdAtFormatted: new Date(post.createdAt).toLocaleString(),
                        rawCreatedAt: post.createdAt,
                        dislikes: post.dislikes || [],
                        likes: Array.isArray(post.likes) ? post.likes : [],
                        postimg: post.postimg,
                        userId: post.userId,
                        userName: post.userName,
                        postId: post._id,
                        comments: commentsRes.data,
                        images: post.images
                    };
                })
            );

            setRandomPosts(postsWithComments);
            console.log("random posts", postsWithComments);
        } catch (error) {
            console.error("❌ Error fetching random posts:", error);
        }
    }
    useEffect(() => {
        fetchrandomPosts();
    }, [])
    const location = useLocation();

    useEffect(() => {
        const tabFromUrl = new URLSearchParams(location.search).get('tab');
        if (tabFromUrl && tabFromUrl !== selectedTab) {
            setSelectedTab(tabFromUrl);
        }
    }, [location.search]);

    // Handle adding a new comment
    const handleExploreAddComment = async (postId, postuserId) => {
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
    const fetchComments = async (postId) => {
        try {
            console.log("Fetching comments for post", postId);
            const res = await axios.get(`${host}/api/comment/${postId}`);
            setRandomPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.postId === postId ? { ...post, comments: res.data } : post
                )
            );

        } catch (err) {
            console.error("Error fetching comments:", err.response?.data || err.message);
        }
    };
    const handleExploreLikePost = async (postId) => {
        if (!user || !user._id) {
            console.error("🚨 User is not logged in or undefined!");
            return;
        }
        console.log("id", postId);
        try {
            const post = randomPosts.find((p) => p.postId === postId);
            if (!post) {
                console.warn("⚠️ Post not found or likes array is undefined!");
                return;
            }
            console.log("postlike", post.likes)
            console.log("userid", user._id)
            const alreadyLiked = post.likes.includes(user._id);
            console.log("alreadyliked", alreadyLiked);
            const response = alreadyLiked
                ? await axios.post(`${host}/api/likes/remove`,
                    { userId: user._id, postId },
                )
                : await axios.post(`${host}/api/likes/add`, { userId: user._id, postId });

            console.log("✅ Like toggled:", response.data);


            setRandomPosts((prevPosts) =>
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
    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: { xs: "70%", sm: "75%", md: "80%", lg: "95%" },
                display: "flex",
                flexDirection: "column",
                gap: 2,
                overflowY: "hidden",

                alignItems: 'center',
                mt: selectedTab === "posts" ? "20%" : 0,
            }}
        >
            {/* <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    maxWidth: { xs: "70%", sm: "75%", md: "80%", lg: "95%" },
                    mx: "auto",
                    mb: 2,
                    borderRadius: "10px",
                    overflow: "hidden",
                    boxShadow: 2,
                }}
            >
                <Button
                    onClick={() => setSelectedTab('posts')}
                    disabled={posts?.length === 0}
                    sx={{
                        flex: 1,
                        borderRadius: 0,
                        backgroundColor: selectedTab === 'posts' ? '#073574' : '#e0e0e0',
                        color: selectedTab === 'posts' ? '#fff' : '#000',
                        fontWeight: 600,
                        '&:hover': {
                            backgroundColor: selectedTab === 'posts' ? '#062d5c' : '#d5d5d5',
                        },
                    }}
                >
                    Posts
                </Button>
                <Button
                    onClick={() => setSelectedTab('explore')}
                    sx={{
                        flex: 1,
                        borderRadius: 0,
                        backgroundColor: selectedTab === 'explore' ? '#073574' : '#e0e0e0',
                        color: selectedTab === 'explore' ? '#fff' : '#000',
                        fontWeight: 600,
                        '&:hover': {
                            backgroundColor: selectedTab === 'explore' ? '#062d5c' : '#d5d5d5',
                        },
                    }}
                >
                    Explore
                </Button>
            </Box> */}

            {[...displayPosts]
                .sort((a, b) =>
                    new Date(b.rawCreatedAt).getTime() - new Date(a.rawCreatedAt).getTime()
                ).map((post, index) => {
                    const postUser = users.find((user) => user.id === post.userId);
                    if (!postUser) return null;



                    return (

                        <Paper
                            key={index}
                            sx={{
                                mb: 2,
                                width: "100%",
                                backgroundColor: "transparent",
                                boxShadow: "none",
                                py: 2,
                                borderRadius: "12px",
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                            }}
                        >
                            <Box
                                sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", px: 2 }}
                                onClick={() => handleProfile(postUser.id)}
                            >
                                <Avatar src={postUser.profileImage} sx={{ width: 50, height: 50 }} />

                                <Box>
                                    <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>
                                        {postUser.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        <Typography variant="caption" color="text.secondary">
                                            {(() => {
                                                const date = parse(post.createdAtFormatted, 'dd/MM/yyyy, HH:mm:ss', new Date());
                                                return isToday(date)
                                                    ? `Today at ${format(date, 'p')}`
                                                    : isYesterday(date)
                                                        ? `Yesterday at ${format(date, 'p')}`
                                                        : format(date, 'dd/MM/yyyy, p');
                                            })()}
                                        </Typography>
                                    </Typography>
                                </Box>

                            </Box>

                            {(post.postimg || post.images?.length > 0) && (
                                <Box
                                    sx={{
                                        mt: 2,
                                        borderRadius: "10px",
                                        overflow: "hidden",
                                        position: "relative",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        px: 4
                                    }}
                                >
                                    {post.images?.length > 1 ? (
                                        <>
                                            {imageIndex > 0 && (
                                                <IconButton
                                                    onClick={() => setImageIndex(imageIndex - 1)}
                                                    sx={arrowButtonStyle}
                                                >
                                                    <ArrowBackIosNewIcon />
                                                </IconButton>
                                            )}
                                            <img
                                                src={post.images[imageIndex]}
                                                alt="Post"
                                                style={{ width: "100%", borderRadius: "10px" }}
                                            />
                                            {imageIndex < post.images.length - 1 && (
                                                <IconButton
                                                    onClick={() => setImageIndex(imageIndex + 1)}
                                                    sx={arrowButtonStyleRight}
                                                >
                                                    <ArrowForwardIosIcon />
                                                </IconButton>
                                            )}
                                        </>
                                    ) : (
                                        <img
                                            src={post.images[0]}
                                            alt="Post"
                                            style={{ width: "100%", borderRadius: "10px" }}
                                        />
                                    )}
                                </Box>
                            )}

                            {post.content && (
                                <Typography sx={{
                                    mt: 2, whiteSpace: "pre-wrap",
                                    px: 2
                                }}>
                                    {post.content.length > 20 && !expandedPosts[post.postId]
                                        ? `${post.content.substring(0, 20)}...`
                                        : post.content}
                                    {post.content.length > 20 && (
                                        <Button
                                            variant="text"
                                            size="small"
                                            sx={{ textTransform: "none", ml: 1 }}
                                            onClick={() => toggleShowMore(post.postId)}
                                        >
                                            {expandedPosts[post.postId] ? "Show Less" : "Show More"}
                                        </Button>
                                    )}
                                </Typography>
                            )}

                            {/* Like + Comment + Share */}
                            <Box sx={{ display: "flex", alignItems: "center", mt: 1, gap: 5, px: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <IconButton
                                        onClick={() => selectedTab === 'explore' ? handleExploreLikePost(post.postId) : handleLikePost(post.postId)}>
                                        {post.likes?.map(id => id.toString()).includes(user?._id?.toString()) ? (
                                            <AiFillLike color="#073574" />
                                        ) : (
                                            <AiOutlineLike />
                                        )}

                                    </IconButton>
                                    <Typography
                                        sx={{ cursor: "pointer" }}
                                        onClick={() => handleOpenLikeModal(post.postId)}
                                    >
                                        {post.likes?.length || 0} Likes
                                    </Typography>
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <IconButton onClick={() => toggleCommentBox(post.postId)}>
                                        <FaRegComment />
                                    </IconButton>
                                    <Typography>
                                        {(Array.isArray(post.comments?.comments)
                                            ? post.comments.comments.length
                                            : Array.isArray(post.comments)
                                                ? post.comments.length
                                                : 0)} Comment
                                    </Typography>
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <IconButton
                                        onClick={() => {
                                            console.log("selectedpost", post)
                                            setSelectedPost(post);
                                            setOpenPostShareModal(true);
                                        }}
                                    >
                                        <FaShare />
                                    </IconButton>
                                    <Typography>Share</Typography>
                                </Box>

                            </Box>

                            {/* Comment Box */}
                            {showCommentBox[post.postId] && (
                                <>
                                    {/* Scrollable comment list */}
                                    <Box sx={{
                                        maxHeight: "150px",
                                        overflowY: "auto",
                                        px: 2,
                                        mt: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1
                                    }}>
                                        {post.comments?.comments?.length > 0 ? (
                                            post.comments.comments.map((c, i) => (
                                                <Box key={i} sx={{ display: "flex", alignItems: "flex-start" }}>
                                                    <Avatar src={c.userimg} sx={{ width: 30, height: 30, mr: 1 }} />
                                                    <Box>
                                                        <Typography variant="subtitle2">{c.username}</Typography>
                                                        <Typography variant="body2" color="text.secondary">{c.text}</Typography>
                                                    </Box>
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 1 }}>
                                                No comments yet.
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Add comment input */}
                                    <Box
                                        sx={{
                                            mt: 1,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            width: "95%",
                                            px: 2,
                                        }}
                                    >
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            placeholder="Write a comment..."
                                            value={newComment[post.postId] || ""}
                                            onChange={(e) =>
                                                setNewComment((prev) => ({ ...prev, [post.postId]: e.target.value }))
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
                                                px: 1,
                                                fontSize: "13px",
                                            }}
                                            onClick={() => selectedTab === 'explore' ? handleExploreAddComment(post.postId, post.userId) : handleAddComment(post.postId, post.userId)}
                                        >
                                            Post
                                        </Button>
                                    </Box>
                                </>
                            )}
                        </Paper>
                    );
                })}
        </Box>
    );
};

const arrowButtonStyle = {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    color: "white",
};

const arrowButtonStyleRight = {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    color: "white",
};

export default PostFeed;