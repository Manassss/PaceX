import React, { useState, useEffect } from 'react';
import { Typography, Button, Container, Paper, TextField, Avatar, Box, IconButton, List, ListItem, ListItemText, MenuItem, Menu } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';

const UserHome = () => {
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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
                p: 2, 
                border: '2px solid #000' // Added border
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
                {users.slice(0, 10).map((user) => (
                    <Avatar 
                        key={user.id} 
                        sx={{ width: 60, height: 60, cursor: 'pointer', border: '3px solid #ff4500' }} 
                        onClick={() => handleProfile(user.id)} // Navigate to profile on click
                        src={user.profileImage}
                    />
                ))}
            </Box>

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

                            {/* Display Likes and Dislikes */}
                            <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center' }}>
                                <Typography sx={{ fontWeight: 'bold' }}>
                                    Likes: {post.likes}
                                </Typography>
                                <Typography sx={{ fontWeight: 'bold' }}>
                                    Dislikes: {post.dislikes}
                                </Typography>
                            </Box>
                        </Paper>
                    );
                })}
            </Box>

            {/* Container for Profile & Add Post Buttons */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: 2, 
                position: 'absolute', 
                bottom: 10, 
                left: '50%', 
                transform: 'translateX(-50%)' 
            }}>
                {/* Profile Button */}
                <IconButton onClick={() => handleProfile(user._id)}>
                    <Avatar src={user?.profilePic} sx={{ width: 50, height: 50 }} />
                </IconButton>

                {/* Add Post Button */}
                <IconButton sx={{ width: 50, height: 50, bgcolor: '#ff4500', color: 'white', borderRadius: '50%' }}>
                    <AddIcon />
                </IconButton>
            </Box>

        </Container>
    );
};

export default UserHome;
