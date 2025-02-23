import React, { useState, useEffect } from 'react';
import { Container, TextField, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, IconButton, Box, InputAdornment } from '@mui/material';
import { Search, Edit } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const sampleUsers = [
    { id: 1, name: 'Ayesha', lastMessage: 'Ayesha sent an attachment.', time: '1h', img: 'https://via.placeholder.com/50' },
    { id: 2, name: 'Macho', lastMessage: 'Saurabh sent an attachment.', time: '3h', img: 'https://via.placeholder.com/50', muted: true },
    { id: 3, name: 'Pushkar Nagarad', lastMessage: 'Pushkar sent an attachment.', time: '12h', img: 'https://via.placeholder.com/50' },
    { id: 4, name: 'Jemin Patel', lastMessage: 'Liked a message', time: '1d', img: 'https://via.placeholder.com/50' },
    { id: 5, name: 'Sharon Dsouza', lastMessage: 'Reacted 😂 to your message', time: '1d', img: 'https://via.placeholder.com/50' }
];

const Messenger = () => {
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState({});
    const navigate = useNavigate();
    const { user } = useAuth();
    const userId = user?._id;
    const [users, setUsers] = useState([]);
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase())
    );

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
        const fetchUsers = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/users/all');
                const transformedUsers = res.data.map(user => ({
                    id: user._id,
                    name: user.name,
                    bio: user.bio,
                    email: user.email,
                    role: user.role,
                    university: user.university,
                    profileImage: user.profileImage,
                    joinedAt: new Date(user.joinedAt).toLocaleDateString(),
                }));
                console.log(transformedUsers);
                setUsers(transformedUsers);
                //setFilteredUsers(transformedUsers);
            } catch (err) {
                console.error('Error fetching users:', err);
            }
        };
        fetchUsers();
        fetchUserProfile();
    }, [userId]);
    const handleSelect = (item) => {
        console.log(item);
        setSelectedUser(item);
        navigate('/chatbox', { state: { userId: item.id, username: item.name } })
    }
    return (
        <Container sx={styles.container}>
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
                {filteredUsers.map((item) => (
                    <ListItem button key={item.id} onClick={() => handleSelect(item)} style={styles.listItem}>

                        <ListItemAvatar>
                            <Avatar src={item.profileImage} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={<Typography sx={styles.username}>{item.name}</Typography>}
                        // secondary={
                        //     // <Typography sx={styles.lastMessage}>
                        //     //     {user.lastMessage} • {user.time}
                        //     // </Typography>
                        // }
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
        width: 500,
        height: 800,
        margin: '20px auto',
        border: '1px solid #ddd',
        borderRadius: 3,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px',
        borderBottom: '1px solid #ddd'
    },
    username: {
        fontWeight: 'bold',
        fontSize: '18px'
    },
    searchBar: {
        margin: '10px',
        borderRadius: '10px',
        backgroundColor: '#f5f5f5',
    },
    messageList: {
        overflowY: 'auto',
        flexGrow: 1,
        backgroundColor: '#9AB',
        borderRadius: 5
    },
    listItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
        '&:hover': {
            backgroundColor: '#f5f5f5',
        },

    },

    userName: {
        fontWeight: 'bold',
        fontSize: '16px',
    },
    lastMessage: {
        fontSize: '12px',
        color: 'gray'
    },
    unreadDot: {
        fontSize: '12px',
        marginLeft: 'auto'
    },
    mutedIcon: {
        fontSize: '12px',
        marginLeft: 'auto',
        color: 'gray'
    },
    search: {
        display: 'flex',

        alignItems: 'center'
    }

};