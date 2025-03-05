import React, { useState, useEffect } from 'react';
import { Typography, Button, Container, Paper, TextField, Avatar, Box, IconButton, List, ListItem, ListItemIcon, ListItemText, Modal, MenuItem, Menu } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import ChatIcon from '@mui/icons-material/Chat'; // **NEW:** Chat icon imported for bottom nav
import CameraCapture from './CameraComponent';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import HomeIcon from '@mui/icons-material/Home';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import io from "socket.io-client";

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
    // **CHANGED:** Initialize storyUser as null instead of an empty array.
    const [storyUser, setstoryUser] = useState(null);
    const [currentIndexStory, setCurrentIndexStory] = useState(0);
    const [notifications, setNotifications] = useState([]);


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
                views: story.views
            }));
            console.log("story", todaystories);
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
                const transformedPosts = res.data.map(post => ({
                    content: post.content,
                    createdAt: new Date(post.createdAt).toLocaleString(),
                    dislikes: post.dislikes,
                    likes: post.likes,
                    postimg: post.postimg,
                    userId: post.userId,
                    userName: post.userName,
                    postId: post._id,
                }));
                setPosts(transformedPosts);
                console.log(transformedPosts);
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
    const handlemessenger = () => {
        navigate(`/messenger`);
    };

    const handleLike = async (postId) => {
        try {
            const res = await axios.put(`http://localhost:5001/api/posts/like/${postId}`);
            // Update your state to reflect the new like count from the response
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post.postId === postId ? { ...post, likes: res.data.likes } : post
                )
            );
        } catch (err) {
            console.error("Error liking post:", err);
        }
    };


    return (
        // **CHANGED:** Fixed container size of 600x800, centered on the page
        <Container
            sx={{
                width: 600,
                height: 800,
                margin: '50px auto',
                border: '2px solid #000',
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex',
                p: 0,
                backgroundColor: 'white',

            }}
        >
            {/* Left Sidebar for Community */}
            <Box
                sx={{
                    width: 50, // **CHANGED:** Fixed width to 150px

                    borderRight: '1px solid #ccc',
                    display: 'flex',
                    alignItems: 'flex-start',
                    p: 2,
                    paddingTop: 10,
                    paddingRight: 5,
                    marginTop: 11


                }}
            >

                <List>
                    <ListItem button>
                        <ListItemIcon>
                            <HomeIcon sx={{ fontSize: 40 }} /> {/* Increased icon size */}
                        </ListItemIcon>
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon>
                            <GroupsIcon sx={{ fontSize: 40 }} /> {/* Increased icon size */}
                        </ListItemIcon>
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon>
                            <PeopleIcon sx={{ fontSize: 40 }} /> {/* Increased icon size */}
                        </ListItemIcon>
                    </ListItem>
                </List>
            </Box>

            {/* Main Content */}
            <Box sx={{ width: '82%', position: 'relative', display: 'flex', flexDirection: 'column', p: 2 }}>
                {/* Top Bar with App Name */}
                <Typography
                    variant="h5"
                    sx={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: 'black',
                        mb: 2
                    }}
                >
                    PaceX
                </Typography>

                {/* Improved Search Bar */}
                <TextField
                    fullWidth
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '30px',
                            backgroundColor: '#f5f5f5'
                        }
                    }}
                />
                {searchTerm && (
                    <Box
                        sx={{
                            maxHeight: '200px',
                            overflowY: 'auto',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            mb: 2,
                            position: 'absolute',
                            width: 'calc(75% - 32px)',
                            zIndex: 100,
                            backgroundColor: 'white'
                        }}
                    >
                        <List>
                            {filteredUsers.slice(0, 5).map((user) => (
                                <ListItem button key={user.id} onClick={() => handleProfile(user.id)}>
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

                {/* Story Section */}
                <Box
                    sx={{
                        display: 'flex',
                        overflowX: 'auto',
                        gap: 2,
                        pb: 2,
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                        cursor: 'grab',
                        mb: 2
                    }}
                >
                    {/* Updated Add Story Element */}
                    <Box
                        sx={{ position: 'relative', cursor: 'pointer' }}
                        onClick={() => setOpenStoryCamera(true)}
                    >
                        <Avatar
                            src={user?.profileImage}
                            sx={{
                                width: 40,
                                height: 40,
                                border: '3px solid #ff4500'
                            }}
                        />
                        <AddIcon
                            sx={{
                                position: 'absolute',
                                bottom: -2,
                                right: -2,
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                fontSize: 18,
                                color: '#ff4500'
                            }}
                        />
                    </Box>
                    {uniqueUserStories.map(({ userId, stories }, index) => {
                        const storyUser = users.find(user => user.id === userId);
                        if (!storyUser) return null;
                        const hasSeenAllStories = stories.every(
                            s => Array.isArray(s.views) && s.views.includes(user?._id)
                        );
                        return (
                            <Avatar
                                key={index}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    cursor: 'pointer',
                                    border: `3px solid ${hasSeenAllStories ? 'gray' : '#ff4500'}`
                                }}
                                src={storyUser.profileImage}
                                onClick={() => handleStoryClick(storyUser, stories)}
                            />
                        );
                    })}
                </Box>


                {/* Posts Section */}
                <Box
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': { display: 'none' },
                        scrollbarWidth: 'none'
                    }}
                >
                    {posts.map((post, index) => {
                        const postUser = users.find((user) => user.id === post.userId);
                        return (
                            <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: 'transparent' }}>
                                {postUser && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar
                                            src={postUser.profileImage}
                                            sx={{ width: 40, height: 40 }}
                                            onClick={() => handleProfile(postUser.id)}
                                        />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {postUser.name}
                                        </Typography>
                                    </Box>
                                )}
                                {post.postimg && (
                                    <Box sx={{ mt: 2, maxHeight: 500, overflow: 'hidden' }}>
                                        <img src={post.postimg} alt="Post" style={{ width: '100%', height: 'auto' }} />
                                    </Box>
                                )}
                                {post.content && (
                                    <Typography sx={{ wordWrap: 'break-word', mt: 2 }}>
                                        {post.content}
                                    </Typography>
                                )}
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    <IconButton onClick={() => handleLike(post._id)}>
                                        <FavoriteIcon sx={{ color: likedPosts[post._id] ? 'red' : 'gray' }} />
                                    </IconButton>
                                    <Typography>{likedPosts[post._id] ? 'Liked' : 'Like'}</Typography>
                                </Box>
                            </Paper>
                        );
                    })}
                </Box>

                {/* Bottom Navigation */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    gap: 2,
                    position: 'sticky',
                    bottom: 0,
                    backgroundColor: '#fff',
                    p: 1,
                    borderTop: '1px solid #ccc',
                    mt: 2
                }}>
                    {/* **CHANGED:** Use optional chaining for user to prevent accessing properties on null */}
                    {/* <IconButton onClick={() => handleProfile(user?._id)}>
                        <Avatar src={user?.profileImage} sx={{ width: 50, height: 50, borderRadius: '50%' }} />
                    </IconButton>

                    <IconButton onClick={handleAddpost}
                        sx={{
                            bgcolor: '#ff4500',
                            color: 'white',
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            boxShadow: 3
                        }}>
                        <AddIcon sx={{ fontSize: 30 }} />
                    </IconButton>

                    <IconButton onClick={handlemessenger}
                        sx={{
                            bgcolor: '#3f51b5',
                            color: 'white',
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            boxShadow: 3
                        }} >
                        <ChatIcon />
                    </IconButton> */}
                </Box>

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

                    {/* Close Button */}
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
            {/* Search Users */}




        </Container >
    );
};

export default UserHome;
