import React from "react";
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
import { AiFillLike } from "react-icons/ai";
import { FaRegComment, FaShare } from "react-icons/fa6";
import { BsFillSaveFill } from "react-icons/bs";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const PostFeed = ({
    posts,
    users,
    user,
    following,
    expandedPosts,
    showCommentBox,
    newComment,
    handleProfile,
    handleAddComment,
    toggleCommentBox,
    toggleShowMore,
    handleLikePost,
    handleOpenLikeModal,
    setSelectedPost,
    setOpenPostShareModal,
    currentImageIndex,
    setCurrentImageIndex
}) => {
    const isMobile = useMediaQuery('(max-width: 480px)');
    const isTablet = useMediaQuery('(max-width: 960px)');
    console.log("length of posts", posts.length);
    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: isMobile ? "100%" : isTablet ? "90%" : "750px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                overflowY: "hidden",
                mx: "auto",
                alignItems: 'center',
                mt: '20%'
            }}
        >
            {[...posts]
                // 1) copy the array so we don’t mutate state
                .sort((a, b) =>
                    // 2) sort descending by rawCreatedAt
                    new Date(b.rawCreatedAt).getTime() - new Date(a.rawCreatedAt).getTime()
                ).map((post, index) => {
                    const postUser = users.find((user) => user.id === post.userId);
                    //console.log("i want to ckec th e poscv date", post)
                    if (!postUser) return null;

                    return (
                        <Paper
                            key={index}
                            sx={{
                                mb: 2,
                                width: "100%",
                                backgroundColor: "#cccccc",
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
                                        {post.createdAtFormatted}
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
                                    {post.images?.length > 0 ? (
                                        <>
                                            {currentImageIndex > 0 && (
                                                <IconButton
                                                    onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                                                    sx={arrowButtonStyle}
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
                                                    sx={arrowButtonStyleRight}
                                                >
                                                    <ArrowForwardIosIcon />
                                                </IconButton>
                                            )}
                                        </>
                                    ) : (
                                        <img
                                            src={post.postimg}
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
                                        onClick={() => handleLikePost(post.postId)}
                                        sx={{ color: post.likes?.includes(user?._id) ? "#073574" : "inherit" }}
                                    >
                                        <AiFillLike />
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
                                    <Typography>{post.comments.comments.length} Comment</Typography>
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <IconButton
                                        onClick={() => {
                                            setSelectedPost(post);
                                            setOpenPostShareModal(true);
                                        }}
                                    >
                                        <FaShare />
                                    </IconButton>
                                    <Typography>Share</Typography>
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <IconButton>
                                        <BsFillSaveFill />
                                    </IconButton>
                                </Box>
                            </Box>

                            {/* Comment Bar */}
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
                                            newComment[post.postId] = e.target.value
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