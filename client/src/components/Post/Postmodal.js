import React, { useState, useEffect } from "react";
import {
    Modal, Box, Grid, Typography, IconButton, Divider, Avatar,
    TextField, Button, Menu, MenuItem
} from "@mui/material";
import { AiFillLike, AiOutlineLike } from 'react-icons/ai';
import { FaRegComment } from "react-icons/fa";
import { GiShare } from "react-icons/gi";
import { CiMenuKebab } from "react-icons/ci";
import axios from 'axios';
import { host } from "../apinfo";
import ShareModal from "../ShareModal";
const Postmodal = ({
    selectedPost,
    openPostModal,
    setOpenPostModal,
    currentImageIndex,
    user,
    setarchive,
    setdeletetemp,
    setdelete,
    setSelectedPost
}) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isLiked, setIsLiked] = useState(false)
    const [postMenuAnchorEl, setPostMenuAnchorEl] = useState(null);
    const [openPostShareModal, setOpenPostShareModal] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);
    useEffect(() => {
        if (openPostModal && selectedPost) {
            fetchComments();
            setImageIndex(0);
        }
        if (selectedPost != null &&
            Array.isArray(selectedPost.likes) &&
            selectedPost.likes.includes(user._id)) { setIsLiked(true) }
        else { setIsLiked(false) }
    }, [openPostModal, selectedPost]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`${host}/api/comment/${selectedPost.postId}`);
            setComments(response.data.comments || []);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    // const checkIfLiked = async () => {
    //     try {
    //         const response = await axios.get(`${host}/api/likes/${selectedPost.postId}/${user._id}`);
    //         setIsLiked(response.data.isLiked);
    //     } catch (error) {
    //         console.error("Error checking like status:", error);
    //     }
    // };

    // const handleLike = async () => {
    //     console.log(`${user?._id} is user id and targetid ${selectedPost.postId}`)
    //     const payload = { userId: user._id, postId: selectedPost.postId }
    //     if (isLiked) {
    //         const res = await axios.post(`${host}/api/likes/remove`, payload);
    //         setIsLiked(false)
    //         console.log("✅ Like removed:", res.data);
    //     }
    //     else {
    //         const res = await axios.post(`${host}/api/likes/add`, { userId: user._id, postId: selectedPost.postId });
    //         setIsLiked(true)
    //         console.log("✅ Like added:", res.data);
    //     }



    // };
    const handleLike = async () => {
        console.log(`${user?._id} is user id and targetid ${selectedPost.postId}`);
        const payload = { userId: user._id, postId: selectedPost.postId };

        if (isLiked) {
            const res = await axios.post(`${host}/api/likes/remove`, payload);
            setIsLiked(false);
            console.log("✅ Like removed:", res.data);

            // Remove user ID from likes
            setSelectedPost(prev => ({
                ...prev,
                likes: prev.likes.filter(id => id !== user._id),
            }));
        } else {
            const res = await axios.post(`${host}/api/likes/add`, payload);
            setIsLiked(true);
            console.log("✅ Like added:", res.data);

            // Add user ID to likes
            setSelectedPost(prev => ({
                ...prev,
                likes: [...prev.likes, user._id],
            }));
        }
    };

    const handleAddComment = async () => {
        if (!newComment) return;
        try {
            const payload = {
                userId: user._id,
                postId: selectedPost.postId,
                text: newComment,
                username: user?.name,
                userimg: user?.profileImage,
                post_userid: selectedPost.userId
            }
            console.log("payload", payload);
            const res = await axios.post(`${host}/api/comment/add`, payload);
            setNewComment("");
            fetchComments();
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handlePostMenuOpen = (event) => {
        setPostMenuAnchorEl(event.currentTarget);
    };

    const handlePostMenuClose = () => {
        setPostMenuAnchorEl(null);
    };

    const handleDeleteclick = async () => {
        try {
            await axios.post(`${host}/api/posts/tempdelete/${selectedPost.postId}`);
            setdeletetemp(true)
            setOpenPostModal(false);

        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    // 🎯 new: permanent delete
    const handlePermanentDelete = async () => {
        try {
            await axios.post(`${host}/api/posts/delete/${selectedPost.postId}`);
            setdelete(true)
            setOpenPostModal(false);
        } catch (error) {
            console.error("Error permanently deleting post:", error);
        }
    };

    const handleArchivePost = async () => {
        try {
            const payload = {
                postId: selectedPost.postId,
                userId: user?._id
            }
            const res = await axios.post(`${host}/api/posts/archive`, payload);
            setarchive(true)
            setOpenPostModal(false);
            // fetchComments();
        } catch (error) {
            console.error("Error archiving post:", error);
        }
    };

    if (!selectedPost) return null;

    return (
        <>s
            <Modal
                open={openPostModal}
                onClose={() => setOpenPostModal(false)}
                BackdropProps={{ sx: { backdropFilter: "blur(10px)", backgroundColor: "rgba(0,0,0,0.4)" } }}
            >
                <Box
                    sx={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 1000, height: 700, bgcolor: "#fff", borderRadius: 2, boxShadow: 3, p: 0, display: "flex",
                    }}
                >
                    <Grid container sx={{ height: "100%" }}>
                        <Grid item xs={6} sx={{ backgroundColor: "#000" }}>
                            <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
                                {selectedPost.images?.length > 1 && imageIndex > 0 && (
                                    <IconButton
                                        onClick={() => setImageIndex(imageIndex - 1)}
                                        sx={{
                                            position: "absolute",
                                            left: 10,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            zIndex: 1,
                                            color: "white",
                                            backgroundColor: "rgba(0, 0, 0, 0.3)"
                                        }}
                                    >
                                        {"<"}
                                    </IconButton>
                                )}
                                <Box
                                    component="img"
                                    src={selectedPost.images?.[imageIndex] || selectedPost.postimg}
                                    sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                                />
                                {selectedPost.images?.length > 1 && imageIndex < selectedPost.images.length - 1 && (
                                    <IconButton
                                        onClick={() => setImageIndex(imageIndex + 1)}
                                        sx={{
                                            position: "absolute",
                                            right: 10,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            zIndex: 1,
                                            color: "white",
                                            backgroundColor: "rgba(0, 0, 0, 0.3)"
                                        }}
                                    >
                                        {">"}
                                    </IconButton>
                                )}
                            </Box>
                        </Grid>

                        <Grid item xs={6} sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                            <Box sx={{ p: 2 }}>
                                <Typography variant="body1" fontWeight={500}>{selectedPost.content}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ px: 2, display: "flex", gap: 2 }}>
                                    <Typography>{selectedPost.likes?.length || 0}</Typography>
                                    <IconButton onClick={handleLike} sx={{ p: 0 }}>
                                        {isLiked ? <AiFillLike size={20} color="#073574" /> : <AiOutlineLike size={20} />}
                                    </IconButton>
                                </Box>
                                <Box sx={{ px: 2, display: "flex", gap: 2 }}>
                                    <Typography>{comments.length || 0}</Typography>
                                    <FaRegComment size={18} />

                                </Box>
                                <Box >
                                    <IconButton sx={{ p: 0 }} onClick={() => setOpenPostShareModal(true)} >
                                        <GiShare size={18} /></IconButton>
                                </Box>
                            </Box>


                            {selectedPost.userId === user?._id && (
                                <IconButton onClick={handlePostMenuOpen} sx={{ position: 'absolute', top: 10, right: 10 }}>
                                    <CiMenuKebab size={24} />
                                </IconButton>
                            )}
                            {/* <Menu anchorEl={postMenuAnchorEl} open={Boolean(postMenuAnchorEl)} onClose={handlePostMenuClose}>
                                <MenuItem onClick={() => { handleDeleteclick(); handlePostMenuClose(); }}>Delete Post</MenuItem>
                                <MenuItem onClick={() => { handleArchivePost(); handlePostMenuClose(); }}>
                                    {selectedPost.archived ? 'Unarchive Post' : 'Archive Post'}
                                </MenuItem>
                            </Menu> */}

                            <Menu
                                anchorEl={postMenuAnchorEl}
                                open={Boolean(postMenuAnchorEl)}
                                onClose={handlePostMenuClose}
                            >
                                {/* soft‑delete */}
                                <MenuItem
                                    onClick={() => {
                                        handleDeleteclick();
                                        handlePostMenuClose();
                                    }}
                                >
                                    {selectedPost.tempdelete ? "Recover" : "Delete Post"}
                                </MenuItem>

                                {/* hard delete only once it's soft‑deleted */}
                                {selectedPost.tempdelete && (
                                    <MenuItem
                                        onClick={() => {
                                            handlePermanentDelete();
                                            handlePostMenuClose();
                                        }}
                                        sx={{ color: 'error.main' }}
                                    >
                                        Permanently Delete
                                    </MenuItem>
                                )}

                                {/* archive toggle */}
                                <MenuItem
                                    onClick={() => {
                                        handleArchivePost();
                                        handlePostMenuClose();
                                    }}
                                >
                                    {selectedPost.archived ? "Unarchive Post" : "Archive Post"}
                                </MenuItem>
                            </Menu>

                            <Divider sx={{ my: 1 }} />

                            <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2 }}>
                                {comments.map((c, i) => (
                                    <Box key={i} sx={{ display: "flex", mb: 2 }}>
                                        <Avatar src={c.userimg} sx={{ width: 32, height: 32, mr: 1 }} />
                                        <Box>
                                            <Typography variant="subtitle2">{c.username}</Typography>
                                            <Typography variant="body2" color="text.secondary">{c.text}</Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{ p: 2, display: "flex", gap: 1 }}>
                                <TextField
                                    fullWidth size="small" placeholder="Add a comment…"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "20px" } }}
                                />
                                <Button variant="contained" onClick={handleAddComment} sx={{ borderRadius: "20px" }}>
                                    Post
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

            </Modal>
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
        </>
    );
};

export default Postmodal;