import React, { useEffect, useState, useRef } from 'react';
import { Box, TextField, Button, Typography, List, ListItem, ListItemText, Container, Avatar, IconButton, useMediaQuery, useTheme } from '@mui/material';
import io from 'socket.io-client';
import { useAuth } from '../auth/AuthContext';
import axios from 'axios';
import { Send, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { host } from '../components/apinfo';
import Postmodal from './Post/Postmodal';

const socket = io(`${host}`, {
    transports: ["websocket", "polling"],
    withCredentials: true
});

const Chatbox = ({ userId, username, isMobile, onBack }) => {
    const { user } = useAuth();
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const listRef = useRef(null);
    const bottomRef = useRef(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [openPostModal, setOpenPostModal] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        console.log(`Chat with ${userId} -- ${username}`);
        if (!userId || !username) return;

        console.log(`Chat with ${userId} -- ${username}`);
        getMessages();
        const fetchUserStats = async () => {
            try {
                if (!userId) {
                    console.warn("⚠️ userId is undefined, skipping fetchStats.");
                    return;
                }
                console.log(`🔍 Fetching profile for chat header user ID: ${userId}`);
                const res = await axios.get(`${host}/api/users/profile/${userId}`);
                console.log("✅ Profile API response:", res.data);
                setAvatarUrl(res.data.profileImage || '');
            } catch (err) {
                console.error("❌ Error fetching chat header user profile:", err);
            }
        };
        fetchUserStats();

        socket.on("connect", () => {
            console.log("Connected to server");
        });

        if (user && user._id) {
            const roomId = [user._id, userId].sort().join("_");
            socket.emit('join_room', roomId);
        }

        const roomId = [user._id, userId].sort().join("_");

        socket.on('receive_message', (data) => {
            if (data.roomId === roomId) {
                setChatHistory(prev => [...prev, data]);
            }
        });

        return () => {
            socket.off('receive_message');
        };
    }, [userId, username]);

    const sendMessage = () => {
        if (!message || typeof message !== "string" || message.trim() === "") return;

        const roomId = [user._id, userId].sort().join("_");

        const messageData = {
            senderId: user._id,
            senderName: user.name,
            receiverId: userId,
            text: message.trim(),
            roomId
        };

        setChatHistory(prev => [...prev, messageData]); // Add locally for real-time feel
        socket.emit('send_message', messageData);
        postMessage();
        setMessage('');
    };

    const getMessages = async () => {
        try {

            console.log("user whom connecting", userId);
            const response = await axios.get(`${host}/api/chat/get`, {
                params: { user1: userId, user2: user._id }
            }); console.log("manasi", userId)
            console.log("resssss", response.data)
            setChatHistory(response.data);
        } catch (err) {
            console.error('Error getting messages:', err.response?.data || err.message);
        }
    };

    const postMessage = async () => {
        try {
            const postData = {
                senderId: user._id,
                receiverId: userId,
                text: message.trim(),
            };
            const res = await axios.post(`${host}/api/chat/send`, postData);
            console.log("res", res.data.chat)


        } catch (err) {
            console.error('Error sending message:', err.response?.data || err.message);
        }
    };

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [chatHistory]);

    return (
        <Box
            sx={{
                flex: 1,
                width: { xs: "99%", sm: "85%", md: "85%", lg: '92%' },
                height: '100%',
                background: "#f8f2ec",
                display: "flex",
                flexDirection: "column",
                padding: { xs: "10px", sm: "20px" },
                overflow: 'hidden',
                boxSizing: 'border-box',
                minWidth: 0,
                mt: 0,
            }}
        >
            {/* Chat Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                    paddingBottom: "10px",
                    borderBottom: "1px solid #ccc",

                }}
            >
                <IconButton onClick={onBack} sx={{ mr: 1 }}>
                    <ArrowBack />
                </IconButton>
                <Avatar src={avatarUrl} sx={{ width: 50, height: 50 }} />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {username}
                </Typography>
            </Box>
            {/* Chat History List */}
            <List
                ref={listRef}
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    maxHeight: "calc(100% - 60px)", // Leaves space for input
                    "&::-webkit-scrollbar": { display: "none" },
                    width: '100%'
                }}
            >
                {chatHistory.map((msg, index) => (
                    <ListItem
                        key={index}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: msg.senderId === user._id ? "flex-end" : "flex-start",
                            width: "100%",
                            mb: 1,

                        }}
                    >
                        {/* If the message contains shared profile */}
                        {msg.sharedContent && msg.sharedContent.type === "profile" ? (
                            <Box
                                sx={{
                                    backgroundColor: "#f1f1f1",
                                    borderRadius: "12px",
                                    padding: "10px",
                                    maxWidth: "65%",
                                    boxShadow: 1,
                                    textAlign: "left",
                                    cursor: "pointer",
                                }}
                                onClick={() => navigate(`/profile/${msg.sharedContent.id}`)}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Avatar src={msg.sharedContent.profileImage} sx={{ width: 40, height: 40 }} />
                                    <Box>
                                        <Typography sx={{ fontWeight: "bold" }}>{msg.sharedContent.name}</Typography>
                                        <Typography sx={{ fontSize: "14px", color: "gray" }}>@{msg.sharedContent.username}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        ) : msg.sharedContent && msg.sharedContent.type === "post" ? (
                            /* If the message contains shared post */
                            <Box
                                sx={{
                                    backgroundColor: "#f9f9f9",
                                    borderRadius: "12px",
                                    padding: "10px",
                                    maxWidth: "65%",
                                    boxShadow: 1,
                                    textAlign: "left",
                                    cursor: "pointer",

                                }}
                                onClick={() => {
                                    setSelectedPost(msg.sharedContent);
                                    setOpenPostModal(true);
                                }}
                            >
                                <Typography sx={{ fontWeight: "bold" }}>Shared a Post</Typography>
                                <Box sx={{ mt: 1 }}>
                                    <img src={msg.sharedContent.postimg ? msg.sharedContent.postimg : msg.sharedContent.images} alt="Post Preview" style={{ width: "100%", borderRadius: "8px" }} />
                                    <Typography sx={{ fontSize: "14px", color: "gray", mt: 1 }}>
                                        {msg.sharedContent.content.substring(0, 50)}...
                                    </Typography>
                                </Box>
                            </Box>
                        ) : (
                            /* Regular message */
                            <Box
                                sx={{
                                    backgroundColor: msg.senderId === user._id ? "#fff" : "#073574",
                                    color: msg.senderId === user._id ? "black" : "white",
                                    borderRadius: 3,
                                    padding: "10px 15px",
                                    maxWidth: "65%",
                                    boxShadow: 1,
                                    textAlign: "left",
                                }}
                            >
                                <Typography>{msg.text}</Typography>
                            </Box>
                        )}
                    </ListItem>
                ))}
                <div ref={bottomRef} />
            </List>

            {/* ✅ SINGLE FIXED MESSAGE INPUT AT BOTTOM */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    paddingTop: "10px",
                }}
            >
                <TextField
                    fullWidth
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    size="small"
                    variant="outlined" // ✅ Changed from "standard" to "outlined"
                    sx={{
                        backgroundColor: 'white',
                        borderRadius: 50,
                        '& fieldset': { border: 'none' }, // ✅ Removes the thin line
                        '& .MuiInputBase-input': { padding: '12px 15px' },
                    }}
                />

                <Button
                    onClick={sendMessage}
                    sx={{
                        minWidth: 0,
                        p: 1.5,
                        borderRadius: '50%',
                        bgcolor: "#073574",
                        color: "white",
                        ml: 1,
                        ':hover': { bgcolor: "#1976D2" },
                    }}
                >
                    <Send />
                </Button>
            </Box>
            <Postmodal
                selectedPost={selectedPost}
                openPostModal={openPostModal}
                setOpenPostModal={setOpenPostModal}
                currentImageIndex={0}
                user={user}
            />
        </Box>
    );
};

export default Chatbox;