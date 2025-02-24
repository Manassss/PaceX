import React from 'react';
import { Box, IconButton, Avatar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChatIcon from '@mui/icons-material/Chat';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const BottomNav = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleProfile = () => {
        if (user?._id) {
            navigate(`/profile/${user._id}`);
        }
    };

    const handleAddPost = () => {
        navigate('/add-post');
    };

    const handleMessenger = () => {
        navigate('/messenger');
    };
    const handlehome = () => {
        navigate('/userhome');
    };

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '63%', // ✅ Set the navigation width to 50%
            backgroundColor: 'RGBA(0,0,0,1)',
            p: 1,
            borderTop: '1px solid #ccc',
            boxShadow: 3,
            position: 'fixed',
            bottom: 30,
            left: '50%', // ✅ Start positioning from center
            transform: 'translateX(-50%)', // ✅ Center the box perfectly
            borderRadius: '5px' // Optional: Adds rounded edges,

        }}>
            <IconButton onClick={handleProfile}>
                <Avatar src={user?.profileImage} sx={{ width: 50, height: 50, borderRadius: '50%' }} />
            </IconButton>

            <IconButton onClick={handlehome}
                sx={{
                    bgcolor: '#3f51b5',
                    color: 'white',
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    boxShadow: 3
                }}>
                H
            </IconButton>

            <IconButton onClick={handleAddPost}
                sx={{
                    bgcolor: '#ff4500',
                    color: 'white',
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    boxShadow: 3
                }}>
                <AddIcon sx={{ fontSize: 30 }} />
            </IconButton>

            <IconButton onClick={handleMessenger}
                sx={{
                    bgcolor: '#3f51b5',
                    color: 'white',
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    boxShadow: 3
                }}>
                <ChatIcon />
            </IconButton>


        </Box>
    );
};

export default BottomNav;