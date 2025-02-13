import React, { useState, useEffect } from 'react';
import { Typography, Button, Container, Paper, TextField, Avatar, Box, IconButton, List, ListItem, ListItemText, Modal, MenuItem, Menu } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import CameraCapture from './CameraComponent';
import FavoriteIcon from '@mui/icons-material/Favorite';

const UserHome = () => {
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [openCamera, setOpenCamera] = useState(false);
    const [stories, setStories] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);

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



            console.log("✅ Story uploaded successfully:", downloadURL);
            setOpenCamera(false); // Close camera modal after upload
        } catch (err) {
            console.error('Error creating post:', err.response?.data || err.message);  // More detailed error logging
        }
    };
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
        const fetchStories = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/story/all');
                const todaystories = res.data.map(story => ({
                    userId: story.userId,
                    userName: story.userName,
                    mediaUrl: story.mediaUrl,
                    mediaType: story.mediaType
                }));
                console.log("story", todaystories); // Check the transformed structure
                setStories(todaystories);
            }
            catch (err) {
                console.error('Error fetching story:', err);
            }
        }

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
                    onClick={() => setOpenCamera(true)} />
                {stories.map((story, index) => {
                    const storyUser = users.find((user) => user.id === story.userId)
                    return (
                        <Avatar
                            key={index}
                            sx={{ width: 60, height: 60, cursor: 'pointer', border: '3px solid #ff4500' }}
                            // onClick={() => handleProfile(user.id)} // Navigate to profile on click
                            src={storyUser.profileImage}
                        />
                    )
                }
                )}
            </Box>
            <Modal open={openCamera} onClose={() => setOpenCamera(false)}>
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
                    <Avatar src={user?.profilePic} sx={{ width: 50, height: 50, borderRadius: '0%' }} />
                </IconButton>

                {/* Add Post Button */}
                <IconButton onClick={handleAddpost}
                    sx={{ width: 50, height: 50, bgcolor: '#ff4500', color: 'white', borderRadius: '0%' }}>
                    <AddIcon />
                </IconButton>
                <IconButton onClick={handleAddpost}
                    sx={{ width: 50, height: 50, bgcolor: 'black', color: 'white', borderRadius: '0%' }}>
                    S
                </IconButton>
            </Box>
            {/* Floating Action Buttons */}
            <Box sx={{ position: 'fixed', bottom: 20, right: 20, display: 'flex', gap: 2 }}>
                <IconButton onClick={() => handleProfile(user._id)}>
                    <Avatar src={user?.profilePic} sx={{ width: 50, height: 50 }} />
                </IconButton>
                <IconButton sx={{ bgcolor: '#ff4500', color: 'white', borderRadius: '50%' }}>
                    <AddIcon />
                </IconButton>
            </Box>
        </Container>
    );
};

export default UserHome;
