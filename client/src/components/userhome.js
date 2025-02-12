import React, { useState, useEffect } from 'react';
import { Typography, Button, Container, Paper, TextField, Avatar, Box, IconButton } from '@mui/material';
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
                setPosts(res.data);
            } catch (err) {
                console.error('Error fetching posts:', err);
            }
        };

        const fetchUsers = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/users/all');
                setUsers(res.data);
                setFilteredUsers(res.data);  // Initially set filteredUsers to all users
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
            value ? users.filter((u) => u.name.toLowerCase().includes(value.toLowerCase())) : users
        );
    };

    const handleProfile = () => {
        navigate(`/profile/${user._id}`);
    };

    return (
        <Container maxWidth="xs" sx={{ width: 600, height: 800, position: 'relative', overflow: 'hidden', bgcolor: 'white', borderRadius: 3, p: 2 }}>
            {/* Stories Section */}
            <Box 
    sx={{ 
        display: 'flex', 
        overflowX: 'auto', 
        gap: 1, 
        pb: 1, 
        scrollbarWidth: 'none', // Hides scrollbar in Firefox
        '&::-webkit-scrollbar': {
            display: 'none',  // Hides the scrollbar in Webkit browsers (Chrome, Safari)
        }, 
        cursor: 'grab', // Optional: gives a visual cue that the user can click and drag
    }}
>
    {users.slice(0, 10).map((user) => (
        <Avatar key={user._id} sx={{ width: 60, height: 60, cursor: 'pointer', border: '3px solid #ff4500' }} />
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
    {posts.map((post, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: 'transparent' }}>
            {/* Display the username above each post */}
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {post.userName}
            </Typography>
            <Typography sx={{ wordWrap: 'break-word' }}>{post.content}</Typography>
        </Paper>
    ))}
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
                <IconButton onClick={handleProfile}>
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
