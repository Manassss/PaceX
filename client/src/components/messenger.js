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

const Messenger = ({ resetChatbox = false }) => { // Ensure default value
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

    useEffect(() => {
        if (resetChatbox) {
            setSelectedUser(null);
        }
    }, [resetChatbox]); 

    const handleSelect = (item) => {
        setSelectedUser(item); // Set selected user to open chat inside Messenger
    };

    const handleBack = () => {
        setSelectedUser(null); // Go back to user list
    };

    return (
<Container
  sx={{
    ...styles.container,
    width: isMobile ? "100%" : 400,
    height: isMobile ? "80vh" : 800,
    background: "#eddecf",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // ✅ Added soft shadow
    borderRadius: "20px", // ✅ Optional: Rounded corners for a sleek look
    padding: "20px", // ✅ Optional: Adds spacing inside the container
  }}
>
            {selectedUser ? (
                <Paper sx={styles.chatContainer}>
                    {/* Back button to return to user list */}
                    <Box sx={styles.chatHeader}>
    {/* Back button */}
    <IconButton onClick={handleBack}>
        <ArrowBack />
    </IconButton>

    {/* Profile Image & Name (With Only Image Shadow) */}
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 1, // Keeps name close to image
        }}
    >
        <Avatar
            src={selectedUser.profileImage}
            sx={{
                width: 50,
                height: 50,
                borderRadius: "8px", // ✅ Square shape with slightly rounded edges
                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)", // ✅ Subtle shadow effect
            }}
        />
        <Typography
            variant="h6"
            sx={{
                fontWeight: "bold",
                color: "black",
            }}
        >
            {selectedUser.name}
        </Typography>
    </Box>
</Box>


                    {/* Chatbox component (embedded in Messenger) */}
                    <Chatbox userId={selectedUser.id} username={selectedUser.name} />
                </Paper>
            ) : (
                <>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar src={userDetails.profileImage} sx={{ width: 60, height: 60, mx: 'auto' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black', cursor: 'pointer', '&:hover': { opacity: 0.7 } }}>
                    {userDetails.name}
                </Typography>
            </Box>

            {/* Search Bar */}
            <Box sx={{ p: 2 }}>
                <TextField
                    fullWidth
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: <Search sx={{ mr: 1 }} />,
                        sx: { borderRadius: '20px', boxShadow: '0px 4px 6px rgba(0,0,0,0.1)', bgcolor: "white" }
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
        cursor:'pointer',

    },
    username: {
        fontWeight: 'bold',
        fontSize: '18px',
        '&:hover': {
            transform: "scale(1.05)",
        },
        color: 'black',
        cursor:'pointer',

        
    },
    searchBar: {
        margin: '10px',
        borderRadius: "20px",
    },
    messageList: {
        overflowY: 'auto',
        flexGrow: 1,
        cursor:'pointer',
    },
    listItem: {
        display: 'flex',
        alignItems: 'center',
        cursor:'pointer',

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
        cursor:'pointer',
        bgcolor:'#f3f8ff',

    },
};