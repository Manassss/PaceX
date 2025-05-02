import React, { useEffect } from 'react';
import { Modal, Box, Typography, List, ListItem, Avatar, ListItemText } from '@mui/material';

const LikeModal = ({ open, onClose, likedUsers, handleProfile }) => {

    useEffect(() => {
        console.log("liked users", likedUsers);
    },)
    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                }}
            >
                <Typography variant="h6" sx={{ mb: 2 }}>Liked By</Typography>
                <List>
                    {likedUsers.map((user) => (
                        <ListItem
                            key={user._id}
                            sx={{ cursor: "pointer" }}
                            onClick={() => {
                                onClose();
                                handleProfile(user._id);
                            }}
                        >
                            <Avatar src={user.profileImage} sx={{ mr: 2 }} />
                            <ListItemText primary={user.name} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Modal>
    );
};

export default LikeModal;