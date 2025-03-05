import React, { useState, useEffect } from 'react';
import { Container, Box, Avatar, Typography, Paper } from '@mui/material';
import axios from 'axios';
import { useParams } from 'react-router-dom';
<<<<<<< HEAD
import { useAuth } from '../auth/AuthContext';

const UserProfile = () => {
    const { userId } = useParams(); // Get userId from the URL params
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const { auth } = useAuth();
=======

const UserProfile = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
>>>>>>> origin/dev-manas

    useEffect(() => {
        // Fetch user profile data
        const fetchUserProfile = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/users/${userId}`);
                console.log('Fetched User Profile:', res.data);
                setUser(res.data);
            } catch (err) {
<<<<<<< HEAD
                console.error('Error fetching user profile:', err.message);
            }
        };

        // Fetch posts for the user
        const fetchUserPosts = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/posts/user/${userId}`); // Fetch posts by userId
                const transformedPosts = res.data.map(post => ({
                    content: post.content,
                    createdAt: new Date(post.createdAt).toLocaleString(),
                    dislikes: post.dislikes,
                    likes: post.likes,
                    postimg: post.postimg,
                    userId: post.userId,
                    userName: post.userName,
                    postId: post._id, // Now correctly assigned
                }));
                console.log('Fetched and Transformed User Posts:', transformedPosts);
                setPosts(transformedPosts);
            } catch (err) {
                console.error('Error fetching posts:', err.message);
=======
                console.error('Error fetching user profile:', err.message); // Log the error message
            }
        };

        // Fetch posts for the user and transform the data
        const fetchUserPosts = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/posts/${postId}`); // Endpoint for fetching posts
                const transformedPosts = res.data.map(post => ({
                    content: post.content,
                    createdAt: new Date(post.createdAt).toLocaleString(), // Format the date
                    dislikes: post.dislikes,
                    likes: post.likes,
                    postimg: post.postimg, // Assuming postimg is the URL for the post image
                    userId: post.userId,
                    userName: post.userName,
                    postId: post._id, // Storing the post ID
                }));
                console.log('Fetched and Transformed User Posts:', transformedPosts);
                setPosts(transformedPosts); // Store the transformed posts in state
            } catch (err) {
                console.error('Error fetching posts:', err.message); // Log the error message
>>>>>>> origin/dev-manas
            }
        };

        fetchUserProfile();
        fetchUserPosts();
    }, [userId]);

    return (
        <Container>
            {user && (
                <Box sx={{ textAlign: 'center', mt: 5 }}>
                    {/* Profile Information */}
<<<<<<< HEAD
                    <Avatar src={user.profileImage} sx={{ width: 100, height: 100, margin: '0 auto' }} />
=======
                    <Avatar src={user.profilePic} sx={{ width: 100, height: 100, margin: '0 auto' }} />
>>>>>>> origin/dev-manas
                    <Typography variant="h4" sx={{ mt: 2 }}>
                        {user.name}
                    </Typography>

                    {/* Stats Section */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2 }}>
                        <Box>
                            <Typography variant="h6">{posts.length}</Typography>
                            <Typography>Posts</Typography>
                        </Box>
                        <Box>
<<<<<<< HEAD
                            <Typography variant="h6">{user?.followers.length}</Typography>
=======
                            <Typography variant="h6">{user.followers.length}</Typography>
>>>>>>> origin/dev-manas
                            <Typography>Followers</Typography>
                        </Box>
                        <Box>
                            <Typography variant="h6">{user.following.length}</Typography>
                            <Typography>Following</Typography>
                        </Box>
                    </Box>

                    {/* Posts Section */}
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h5">Posts</Typography>
<<<<<<< HEAD
                        {posts.map((post) => (
                            <Paper key={post.postId} sx={{ p: 2, mb: 2 }}>
=======
                        {posts.map((post, index) => (
                            <Paper key={index} sx={{ p: 2, mb: 2 }}>
>>>>>>> origin/dev-manas
                                <Typography variant="h6">{post.userName}</Typography>
                                {/* Display Post Image */}
                                {post.postimg && <img src={post.postimg} alt="Post" style={{ width: '100%' }} />}
                                {/* Display Post Content */}
                                {post.content && <Typography>{post.content}</Typography>}
                                {/* Post Likes/Dislikes */}
                                <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
                                    <Box>
                                        <Typography variant="body2">Likes: {post.likes}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2">Dislikes: {post.dislikes}</Typography>
                                    </Box>
                                </Box>
                                {/* Post Creation Date */}
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Created at: {post.createdAt}
                                </Typography>
                            </Paper>
                        ))}
                    </Box>
                </Box>
            )}
        </Container>
    );
};

export default UserProfile;
