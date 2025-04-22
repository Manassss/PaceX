import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, List, ListItem, Avatar, ListItemText, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { host } from '../components/apinfo';
import io from "socket.io-client";


const socket = io(`${host}`, {
    transports: ["websocket", "polling"],
    withCredentials: true
});
const ShareModal = ({ open, onClose, contentToShare, type }) => {
    const [users, setUsers] = useState([]);
    const { user } = useAuth();
    useEffect(() => {
        console.log("contenttoshare", contentToShare);
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${host}/api/chat/getusers/${user?._id}`);
                setUsers(res.data);
            } catch (err) {
                console.error("Error fetching users:", err);
            }
        };

        if (open) fetchUsers();
    }, [open]);

    const handleShare = async (receiverId) => {
        if (!receiverId) {
            console.error("Error: receiever ids is missing required fields", contentToShare);
            return;
        }
        if (!contentToShare || !contentToShare.senderId) {
            console.error("Error: contentToShare is missing required fields", contentToShare);
            return;
        }
        const roomId = [contentToShare.senderId, receiverId].sort().join("_");
        const messageData = {
            senderId: contentToShare.senderId,
            receiverId: receiverId,
            text: type === "profile" ? `Check out ${contentToShare.name}'s profile!` : `Check out this post!`,
            roomId,
            sharedContent: {
                type,
                ...contentToShare, // ✅ Ensure necessary fields are included
            },
        };

        console.log("Sending messageData:", messageData); // ✅ Debugging log

        try {
            socket.emit('send_message', messageData);

            await axios.post(`${host}/api/chat/send`, messageData);
            onClose(); // Close modal after sharing
        } catch (err) {
            console.error("Error sharing:", err.response?.data || err);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "white",
                    p: 3,
                    borderRadius: 2,
                    textAlign: "center",
                    width: "400px",
                    maxHeight: "500px",
                    overflowY: "auto",
                }}
            >
                <IconButton onClick={onClose} sx={{ position: "absolute", top: 8, right: 8 }}>
                    <CloseIcon />
                </IconButton>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {type === "profile" ? "Share Profile" : "Share Post"}
                </Typography>
                <List>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <ListItem
                                key={user._id || user.id} // ✅ Ensures a unique key
                                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Avatar src={user.profileImage} />
                                    <ListItemText primary={user.name} secondary={user.username} />
                                </Box>
                                <Button variant="contained" onClick={() => handleShare(user?._id)}>
                                    Share
                                </Button>
                            </ListItem>
                        ))
                    ) : (
                        <Typography sx={{ color: "gray", fontStyle: "italic" }}>No contacts available</Typography>
                    )}
                </List>
            </Box>
        </Modal>
    );
};

export default ShareModal;