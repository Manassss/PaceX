import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, Paper, Avatar, Grid, Autocomplete, List, ListItem, ListItemAvatar, ListItemText, InputAdornment, TextField } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';  // Import Axios for API requests
import { useAuth } from '../auth/AuthContext';

const Home = () => {
    const [posts, setPosts] = useState([]);  // Initialize posts state
    const [userName, setUserName] = useState('');
    const [users, setUsers] = useState([]);  // List of all users
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);  // Filtered users based on search
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    // Fetch posts from backend on component mount
    useEffect(() => {
        if (user && user.name) {  // ✅ Check if user exists before accessing name
            setUserName(user.name);
        }

        const fetchPosts = async () => {
            try {
                console.log('Fetching posts from API...');
                const res = await axios.get('http://localhost:5001/api/posts/all');  // API call to fetch posts
                // console.log('Fetched posts:', res.data);  // Log fetched posts
                setPosts(res.data);

            } catch (err) {
                console.error('Error fetching posts:', err.response?.data || err.message);  // Detailed error logging
            }
        };

        fetchPosts();
    }, [user]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/users/all');
                setUsers(res.data);
                // console.log(res.data);
            } catch (err) {
                console.error("Error fetching users:", err.response?.data?.message || err.message);
            }
        };

        fetchUsers();
    }, []);

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Filter users based on search term
        if (value) {
            const filtered = users.filter(u => u.name.toLowerCase().includes(value.toLowerCase()));
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers([]);
        }
    };

    // Navigate to selected user's profile
    const handleUserSelect = (event, selectedUser) => {
        if (selectedUser && selectedUser._id) {
            navigate(`/profile/${selectedUser._id}`);  // Navigate to the selected user's profile
        }
    };
    // Handle Logout
    const handleLogout = () => {
        logout();  // Clear user from AuthContext
        navigate('/login');  // Redirect to login page after logout
    };
    const handleProfile = () => {

        navigate(`/profile/${user._id}`);  // Redirect to login page after logout
    };

    // Sample Data


    const events = [
        { id: 1, name: "Career Fair 2025", date: "Feb 10, 2025" },
        { id: 2, name: "Coding Hackathon", date: "Feb 15, 2025" },
        { id: 3, name: "Spring Break Starts", date: "Mar 1, 2025" }
    ];

    const groups = [
        { id: 1, name: "Computer Science Club" },
        { id: 2, name: "Photography Enthusiasts" },
        { id: 3, name: "Basketball Team" }
    ];

    return (
        <div>
            {/* AppBar for Navigation */}
            <AppBar position="static">
                <Toolbar>
                    <SchoolIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        UniConnect - Your Campus Social Hub
                    </Typography>
                    {/* Search Bar */}
                    <Autocomplete
                        options={users}  // All user data
                        getOptionLabel={(option) => option.name || ''}  // Display user's name
                        onChange={handleUserSelect}  // Trigger navigation on selection
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                placeholder="Search students..."
                                size="small"
                                sx={{ bgcolor: 'white', borderRadius: 1, mr: 2, width: 250 }}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}
                    />
                    <Button
                        color="inherit"
                        component={Link}
                        to="/marketplace"
                        sx={{ mr: 2, backgroundColor: '#333', color: '#fff', borderRadius: 1 }}
                    >
                        Marketplace
                    </Button>
                    <Button color="inherit" component={Link} to="/add-post" sx={{
                        mr: 2, backgroundColor: '#333',  // Dark gray
                        color: '#fff',
                    }}>Add Post</Button>  {/* Add Post Button */}
                    {/* Conditionally Render Buttons Based on Login Status */}

                    <Typography variant="body1" sx={{ mr: 2 }}>
                        Welcome, {userName || 'Student!'}
                    </Typography>
                    {user ? (
                        <>
                            <Button color="inherit" onClick={handleLogout}>Logout</Button>
                            <Button color="inherit" onClick={handleProfile}>Profile</Button>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" component={Link} to="/login">Login</Button>
                            <Button color="inherit" component={Link} to="/register">Register</Button>
                        </>
                    )}

                </Toolbar>
            </AppBar>


            {/* Main Content */}
            <Container sx={{ mt: 4 }}>
                <Grid container spacing={4}>
                    {/* News Feed Section */}
                    <Grid item xs={12} md={8}>

                        <Typography variant="h5" gutterBottom>News Feed</Typography>

                        {posts.length > 0 ? (
                            posts.map(post => (
                                <Paper
                                    key={post._id}
                                    sx={{
                                        p: 2,
                                        mb: 2,
                                        wordWrap: 'break-word',  // Ensure long words break
                                        overflow: 'hidden',      // Prevent content from spilling out
                                        maxWidth: '100%'         // Ensure paper doesn't exceed container width
                                    }}
                                >
                                    <Box display="flex" alignItems="center">
                                        {(() => {
                                            const user = users.find((u) => u._id === post.userId);
                                            console.log("user", user);
                                            return (
                                                <Avatar
                                                    src={user?.profileImage || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                                                    sx={{ width: 40, height: 40, mr: 2 }}
                                                />
                                            );
                                        })()}
                                        <Box>
                                            <Typography variant="subtitle1">{post.userName}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(post.createdAt).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Content Styling to Handle Overflow */}
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            mt: 2,
                                            wordWrap: 'break-word',  // Break long words
                                            overflowWrap: 'break-word',  // Ensure wrapping in all browsers
                                            maxHeight: '200px',  // Optional: Limit height for long posts
                                            overflowY: 'auto'    // Scroll if content exceeds maxHeight
                                        }}
                                    >
                                        {post.content}
                                    </Typography>
                                </Paper>
                            ))
                        ) : (
                            <Typography variant="body1">No posts available yet. Be the first to add one!</Typography>
                        )}
                    </Grid>

                    {/* Sidebar with Events & Groups */}
                    <Grid item xs={12} md={4}>
                        {/* Upcoming Events */}
                        <Paper sx={{ p: 2, mb: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                <EventIcon sx={{ mr: 1 }} /> Upcoming Events
                            </Typography>
                            <List>
                                {events.map(event => (
                                    <ListItem key={event.id}>
                                        <ListItemText primary={event.name} secondary={event.date} />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>

                        {/* Groups to Join */}
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                <GroupIcon sx={{ mr: 1 }} /> Groups to Join
                            </Typography>
                            <List>
                                {groups.map(group => (
                                    <ListItem key={group.id} button>   {/* ✅ Correct usage */}
                                        <ListItemAvatar>
                                            <Avatar><GroupIcon /></Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={group.name} />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
};

export default Home;