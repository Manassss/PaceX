import React, { useState, useEffect } from 'react';
import { Typography, Button, Container, Paper, TextField, Avatar, Box, IconButton, List, ListItem, ListItemText, Modal, MenuItem, Menu } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import CameraCapture from './CameraComponent';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";


const UserHome = () => {
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [openCamera, setOpenStoryCamera] = useState(false);
    const [stories, setStories] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);
    const [openStory, setOpenStory] = useState(false);
    const [currentStories, setCurrentStories] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [storyUser, setstoryUser] = useState([]);
    const [currentIndexStory, setCurrentIndexStory] = useState(0);
    // ✅ Function to mark a story as "viewed"
    const followUser = async (userId, targetUserId) => {
        try {
            const response = await axios.post(`http://localhost:5001/api/user/${userId}/follow/${targetUserId}`);
            return response.data;
        } catch (error) {
            console.error("Error following user:", error);
            throw error;
        }
    };

    const unfollowUser = async (userId, targetUserId) => {
        try {
            const response = await axios.delete(`http://localhost:5001/api/user/${userId}/unfollow/${targetUserId}`);
            return response.data;
        } catch (error) {
            console.error("Error unfollowing user:", error);
            throw error;
        }
    };
    const markStoryAsViewed = async (storyId, userId) => {
        try {
            const postdata = {
                storyId, userId
            }
            // Send post data to backend
            console.log("postdata", postdata)
            await axios.put("http://localhost:5001/api/story/view", postdata);
            console.log(`👀 User ${user?._id} viewed story ${storyId}`);
        } catch (error) {
            console.error("🔥 Error updating story view:", error);
        }
    };

    // ✅ Call the view API when a new story is viewed
    useEffect(() => {
        if (openStory && currentStories.length > 0) {
            console.log(currentStories[currentIndexStory]);
            markStoryAsViewed(currentStories[currentIndexStory].storyId, user?._id);
        }
    }, [currentIndexStory, openStory]);

    // ✅ Move to Next Story
    const handleNext = () => {
        if (currentIndexStory < currentStories.length - 1) {
            setCurrentIndexStory((prevIndex) => prevIndex + 1);
            //console.log(currentIndexStory)
        } else {
            handleClose(); // Close modal if it's the last story
        }
    };

    // ✅ Move to Previous Story
    const handlePrev = () => {
        if (currentIndexStory > 0) {
            setCurrentIndexStory((prevIndex) => prevIndex - 1);
            console.log(currentIndexStory)
        }
    };

    // ✅ Handle Keyboard Navigation (Arrow Keys)
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "ArrowRight") handleNext();
            if (event.key === "ArrowLeft") handlePrev();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex]);

    // Open modal and set stories
    const handleStoryClick = (storyUser, stories) => {
        console.log("storyUser", storyUser);
        setstoryUser(storyUser);
        setCurrentStories(stories);
        setCurrentIndex(0);  // Start with the first story
        setOpenStory(true);
    };

    // Close modal
    const handleClose = () => {
        setOpenStory(false);
        setCurrentStories([]);
        setCurrentIndexStory(0);
    };

    const handleImageUpload = async (downloadURL) => {

        try {
            console.log("downloadurl", downloadURL);
            const postData = {
                userId: user?._id,
                userName: user?.name,
                mediaUrl: downloadURL,
                mediaType: 'image'

            };

            console.log('Post Data:', postData);  // Log the data before sending

            // Send post data to backend
            await axios.post('http://localhost:5001/api/story/add', postData);

            fetchStories();

            console.log("✅ Story uploaded successfully:", downloadURL);
            setOpenStoryCamera(false); // Close camera modal after upload
        } catch (err) {
            console.error('Error creating post:', err.response?.data || err.message);  // More detailed error logging
        }
    };
    const groupedStories = stories.reduce((acc, story) => {
        if (!acc[story.userId]) {
            acc[story.userId] = { userId: story.userId, stories: [] };
        }
        acc[story.userId].stories.push(story); // Add all stories of the same user
        return acc;
    }, {});

    // Convert the object back to an array
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
                views: story.views
            }));
            console.log("story", todaystories); // Check the transformed structure
            setStories(todaystories);
        }
        catch (err) {
            console.error('Error fetching story:', err);
        }
    }

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/posts/all');

                // Transform the data
                const transformedPosts = res.data.map(post => ({
                    content: post.content,
                    createdAt: new Date(post.createdAt).toLocaleString(), // Optional: Format the date
                    dislikes: post.dislikes,
                    likes: post.likes,
                    postimg: post.postimg, // Assuming postimg is the URL for the post image
                    userId: post.userId,
                    userName: post.userName,
                    postId: post._id, // Storing the post ID
                }));

                setPosts(transformedPosts);
                console.log(transformedPosts); // Check the transformed structure
            } catch (err) {
                console.error('Error fetching posts:', err);
            }
        };


        const fetchUsers = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/users/all');
                // Transform the user data
                const transformedUsers = res.data.map(user => ({
                    id: user._id,
                    name: user.name,
                    bio: user.bio,
                    email: user.email,
                    role: user.role,
                    university: user.university,
                    profileImage: user.profileImage,
                    joinedAt: new Date(user.joinedAt).toLocaleDateString(), // Optional: format date
                }));
                console.log(transformedUsers); // Check the transformed structure
                setUsers(transformedUsers);
                setFilteredUsers(transformedUsers); // Initially set filteredUsers to all users
            } catch (err) {
                console.error('Error fetching users:', err);
            }
        };


        fetchPosts();
        fetchUsers();
        fetchStories();
    }, []);


    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setFilteredUsers(
            value
                ? users.filter((u) =>
                    u.name.toLowerCase().startsWith(value.toLowerCase()) ||
                    u.email.toLowerCase().startsWith(value.toLowerCase())
                )
                : users
        );
    };

    const handleProfile = (userId) => {
        navigate(`/profile/${userId}`);
    };
    const handleAddpost = () => {
        navigate(`/add-post`);
    };
    const handleMarketplace = () => {
        navigate(`/marketplace`);
    };


    const handleLikeToggle = (postId) => {
        setLikedPosts((prev) => ({
            ...prev,
            [postId]: !prev[postId],
        }));
    };

    return (
        <Container
            maxWidth="xs"
            sx={{
                width: 600,
                height: 800,
                position: 'relative',
                overflow: 'hidden',
                bgcolor: 'white',
                borderRadius: 3,
                p: 1,
                border: '2px solid #000', // Added border,
                marginTop: '50px'
            }}
        >
            {/* App Name */}
            <Typography
                variant="h5"
                sx={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: 'black',
                    mt: 1
                }}
            >
                PaceX
            </Typography>

            {/* Stories Section */}
            <Box
                sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: 1,
                    pb: 1,
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                    cursor: 'grab',
                }}
            >
                <AddIcon sx={{ backgroundColor: 'grey', color: 'white', width: 65, height: 65, borderRadius: '50%' }}
                    onClick={() => setOpenStoryCamera(true)} />
                {uniqueUserStories.map(({ userId, stories }, index) => {
                    const storyUser = users.find((user) => user.id === userId);
                    if (!storyUser) return null;

                    // Step 2: Check if the current user has viewed all their stories
                    const hasSeenAllStories = stories.every((s) => Array.isArray(s.views) && s.views.includes(user?._id));

                    return (
                        <Avatar
                            key={index}
                            sx={{
                                width: 60,
                                height: 60,
                                cursor: "pointer",
                                border: `3px solid ${hasSeenAllStories ? "gray" : "#ff4500"}`, // Gray if seen all, else red
                            }}
                            src={storyUser.profileImage}
                            onClick={() => handleStoryClick(storyUser, stories)}
                        />
                    );
                })}
            </Box>
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
                    <CameraCapture onImageUpload={handleImageUpload} />
                </Box>
            </Modal>
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
                    {/* ✅ Show Only One Story at a Time */}
                    {currentStories.length > 0 && (
                        <img
                            key={currentIndexStory}
                            src={currentStories[currentIndexStory].mediaUrl}  // Ensure story has `mediaUrl`
                            alt={`Story ${currentIndexStory + 1}`}
                            style={{
                                width: 430,
                                height: 800,
                                aspectRatio: "3/5",
                                objectFit: "cover",
                                borderRadius: 10,
                            }}
                        />
                    )}

                    {/* ❌ Close Button (Top-Right) */}
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            backgroundColor: "rgba(255, 255, 255, 0.5)",
                            color: "white",
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {/* 👤 Story User Info (Top-Left Overlay) */}
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
                            <Typography variant="h6" sx={{ fontWeight: "bold", color: "black" }}>
                                {storyUser.name}
                            </Typography>
                        </Box>
                    )}

                    {/* ◀️ Left (Previous) Button */}
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

                    {/* ▶️ Right (Next) Button */}
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
            {/* Search Users */}
            <TextField
                fullWidth
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ mt: 2, bgcolor: 'white', borderRadius: 1 }}
            />

            {/* Dropdown for filtered users */}
            {searchTerm && (
                <Box
                    sx={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        mt: 1,
                        position: 'absolute',
                        width: '100%',
                        zIndex: 100
                    }}
                >
                    <List>
                        {filteredUsers.slice(0, 5).map((user) => (
                            <ListItem button key={user.id} onClick={() => handleProfile(user.id)} sx={{ backgroundColor: 'white', color: 'black' }}>
                                <Avatar
                                    src={user.profileImage}
                                    sx={{ width: 30, height: 30, mr: 2 }}
                                />
                                <ListItemText primary={`${user.name} - ${user.email}`} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}


            {/* Feed */}
            <Box
                sx={{
                    mt: 2,
                    height: 500,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                        display: 'none',  // Hides the scrollbar
                    },
                    scrollbarWidth: 'none' // Hides scrollbar in Firefox
                }}
            >
                {posts.map((post, index) => {
                    // Find the user who made the post
                    const postUser = users.find((user) => user.id === post.userId);
                    return (
                        <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: 'transparent' }}>
                            {/* Display the username and profile pic above each post */}
                            {postUser && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar
                                        src={postUser.profileImage}
                                        sx={{ width: 40, height: 40 }}
                                        onClick={() => handleProfile(postUser.id)} // Navigate to profile on click
                                    />
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {postUser.name}
                                    </Typography>
                                </Box>
                            )}

                            {/* Display the post's image if available */}
                            {post.postimg && (
                                <Box sx={{ mt: 2, maxHeight: 400, overflow: 'hidden' }}>
                                    <img src={post.postimg} alt="Post" style={{ width: '100%', height: 'auto' }} />
                                </Box>
                            )}

                            {/* Display the text content if available */}
                            {post.content && (
                                <Typography sx={{ wordWrap: 'break-word', mt: 2 }}>
                                    {post.content}
                                </Typography>
                            )}

                            {/* Like Button */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <IconButton onClick={() => handleLikeToggle(post._id)}>
                                    <FavoriteIcon sx={{ color: likedPosts[post._id] ? 'red' : 'gray' }} />
                                </IconButton>
                                <Typography>{likedPosts[post._id] ? 'Liked' : 'Like'}</Typography>
                            </Box>
                        </Paper>
                    );
                })}
            </Box>

            {/* Container for Profile & Add Post Buttons */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                gap: 0.5,
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'RGBA(0,0,0,0.7)',
                width: '100%'
            }}>
                {/* Profile Button */}
                <IconButton onClick={() => handleProfile(user._id)}>
                    <Avatar src={user.profileImage} sx={{ width: 50, height: 50, borderRadius: '0%' }} />
                </IconButton>

                {/* Add Post Button */}
                <IconButton onClick={handleAddpost}
                    sx={{ width: 50, height: 50, bgcolor: '#ff4500', color: 'white', borderRadius: '0%' }}>
                    <AddIcon />
                </IconButton>
                <IconButton onClick={handleMarketplace}
                    sx={{ width: 50, height: 50, bgcolor: '#ff4500', color: 'white', borderRadius: '0%' }}>
                    M
                </IconButton>
            </Box>

        </Container>
    );
};

export default UserHome;
