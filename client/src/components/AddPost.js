import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Paper, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext'

const AddPost = () => {
    const [content, setContent] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();  // Get user from context

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const postData = {
                userId: user?._id,   // Safely accessing user data
                userName: user?.name,
                content
            };

            console.log('Post Data:', postData);  // Log the data before sending

            // Send post data to backend
            await axios.post('http://localhost:5001/api/posts/add', postData);
            alert('Post created successfully!');
            navigate('/home');  // Redirect to home after posting

        } catch (err) {
            console.error('Error creating post:', err.response?.data || err.message);  // More detailed error logging
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h4" align="center" gutterBottom>Create a New Post</Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="What's on your mind?"
                        variant="outlined"
                        multiline
                        rows={4}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                    <Button variant="contained" color="primary" type="submit">Post</Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default AddPost;