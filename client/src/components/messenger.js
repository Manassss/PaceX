import React, { useState, useEffect } from 'react';
import {
    Container, TextField, List, ListItem, ListItemAvatar, Avatar,
    ListItemText, Typography, IconButton, Box, InputAdornment, useMediaQuery, Paper, Button
} from '@mui/material';
import { Search, Edit, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import Chatbox from './Chatbox'; // Import Chatbox inside Messenger

const Messenger = () => {
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState({});
    const { user } = useAuth();
    const userId = user?._id;
    const [users, setUsers] = useState([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (!userId) return;

        const fetchUserProfile = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/users/profile/${userId}`);
                setUserDetails(res.data);
            } catch (err) {
                console.error("Error fetching profile:", err.message);
            }
        };

        const fetchChatUsers = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/chat/getusers/${user?._id}`);
                setUsers(res.data.map(user => ({
                    id: user._id,
                    name: user.name,
                    profileImage: user.profileImage,
                })));
            } catch (err) {
                console.error('Error fetching chat users:', err);
            }
        };

        fetchUserProfile();
        fetchChatUsers();
    }, [userId]);

    const handleSelect = (item) => {
        setSelectedUser(item); // Set selected user to open chat inside Messenger
    };

    const handleBack = () => {
        setSelectedUser(null); // Go back to user list
    };

    return (
        <Container sx={{ ...styles.container, width: isMobile ? '100%' : 400, height: isMobile ? '100vh' : 800 }}>
            {selectedUser ? (
                <Paper sx={styles.chatContainer}>
                    {/* Back button to return to user list */}
                    <Box sx={styles.chatHeader}>
                        <IconButton onClick={handleBack}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h6">{selectedUser.name}</Typography>
                    </Box>

                    {/* Chatbox component (embedded in Messenger) */}
                    <Chatbox userId={selectedUser.id} username={selectedUser.name} />
                </Paper>
            ) : (
                <>
                    {/* Header */}
                    <Box sx={styles.header}>
                        <Typography variant="h6" sx={styles.username}>{userDetails.username}</Typography>
                        <IconButton>
                        </IconButton>
                    </Box>

                    {/* Search Bar */}
                    <Box sx={styles.search}>
                        <TextField
                            variant="outlined"
                            placeholder="Search"
                            fullWidth
                            size="small"
                            sx={styles.searchBar}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    {/* Messages List */}
                    <List sx={styles.messageList}>
                        {users.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).map((item) => (
                            <ListItem button key={item.id} onClick={() => handleSelect(item)} sx={styles.listItem}>
                                <ListItemAvatar>
                                    <Avatar src={item.profileImage} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={<Typography sx={styles.username}>{item.name}</Typography>}
                                />
                            </ListItem>
                        ))}
                    </List>
                </>
            )}
        </Container>
    );
};

export default Messenger;

const styles = {
    container: {
        margin: 'auto',
        border: '1px solid #ddd',
        borderRadius: 3,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: "white",
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        transition: "0.3s",
        color: "black",
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px',
        color: 'black',
    },
    username: {
        fontWeight: 'bold',
        fontSize: '18px',
        '&:hover': {
            transform: "scale(1.05)",
        },
        color: 'black',
    },
    searchBar: {
        margin: '10px',
        borderRadius: "20px",
    },
    messageList: {
        overflowY: 'auto',
        flexGrow: 1,
    },
    listItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
        '&:hover': {
            background: "#B0C4DE",
        },
    },
    search: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px'
    },
    chatContainer: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        background: "white",
    },
    chatHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
        borderBottom: '1px solid #ddd',
    },
};
