import React, { useState, useEffect } from 'react';
import { Container, TextField, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, IconButton, Box, InputAdornment, useMediaQuery } from '@mui/material';
import { Search, Edit } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const Messenger = () => {
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState({});
    const navigate = useNavigate();
    const { user } = useAuth();
    const userId = user?._id;
    const [users, setUsers] = useState([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

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
        setSelectedUser(item);
        navigate('/chatbox', { state: { userId: item.id, username: item.name } })
    };

    return (
        <Container sx={{ ...styles.container, width: isMobile ? '100%' : isTablet ? '80%' : 400, height: isMobile ? '100vh' : 800 }}>
            {/* Header */}
            <Box sx={styles.header}>
                <Typography variant="h6" sx={styles.username}>{userDetails.username}</Typography>
                <IconButton>
                    <Edit />
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
                {users.map((item) => (
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
        color:"black",
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
            "&:hover": { transform: "scale(1.05)" },
              "&:active": { transform: "scale(1.95)" },
        },

        color: 'black',

    },
    searchBar: {
        margin: '10px',
        borderRadius: "20px", // Curved corners
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
    }
};