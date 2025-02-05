import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, Paper, Avatar, Grid, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();
    // Fetch user name from localStorage

    // Sample Data
    const posts = [
        { id: 1, author: "John Doe", content: "Excited to start the new semester! 🎓", time: "2 hrs ago" },
        { id: 2, author: "Jane Smith", content: "Looking for study partners for Data Structures. DM me!", time: "5 hrs ago" },
        { id: 3, author: "Michael Johnson", content: "Campus fest coming this weekend! Don’t miss it 🎉", time: "1 day ago" }
    ];

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
                    <Typography variant="body1" sx={{ mr: 2 }}>
                        Welcome, Student!
                    </Typography>
                    <Button color="inherit" component={Link} to="/login">Login</Button>
                    <Button color="inherit" component={Link} to="/register">Register</Button>

                </Toolbar>
            </AppBar>


            {/* Main Content */}
            <Container sx={{ mt: 4 }}>
                <Grid container spacing={4}>
                    {/* News Feed Section */}
                    <Grid item xs={12} md={8}>
                        <Typography variant="h5" gutterBottom>News Feed</Typography>
                        {posts.map(post => (
                            <Paper key={post.id} sx={{ p: 2, mb: 2 }}>
                                <Box display="flex" alignItems="center">
                                    <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>{post.author[0]}</Avatar>
                                    <Box>
                                        <Typography variant="subtitle1">{post.author}</Typography>
                                        <Typography variant="body2" color="text.secondary">{post.time}</Typography>
                                    </Box>
                                </Box>
                                <Typography variant="body1" sx={{ mt: 2 }}>{post.content}</Typography>
                            </Paper>
                        ))}
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