import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, List, ListItem, ListItemText, Container, Avatar } from '@mui/material';
import io from 'socket.io-client';
import { useAuth } from '../auth/AuthContext';
import axios from 'axios';
import { Send } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const socket = io("http://localhost:5001", {
    transports: ["websocket", "polling"],
    withCredentials: true
});

const Chatbox = ({ userId, username }) => {
    const { user } = useAuth();
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId || !username) return;

        console.log(`Chat with ${userId} -- ${username}`);
        getMessages();

        socket.on("connect", () => {
            console.log("Connected to server");
        });

        if (user && user._id) {
            const roomId = [user._id, userId].sort().join("_");
            socket.emit('join_room', roomId);
        }

        socket.on('receive_message', (data) => {
            console.log("Message received:", data);
            setChatHistory((prev) => [...prev, data]);
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

        postMessage();
        socket.emit('send_message', messageData);
        setMessage('');
    };

    const getMessages = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/chat/get', {
                params: { user1: userId, user2: user._id }
            });
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
            await axios.post('http://localhost:5001/api/chat/send', postData);
        } catch (err) {
            console.error('Error sending message:', err.response?.data || err.message);
        }
    };

    return (
        <Container
            maxWidth="lg"
            sx={{
                width: 1450,
                    height: "97vh",
                    background: "#f8f2ec",
                    display: "flex",
                    flexDirection: "column",
                    padding: "20px",
                    borderLeft: "1px solid #ccc",
                    overflow: 'hidden',
                    marginleft: "500",

            }}
        >
            {/* Chat History List */}
            <List
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    maxHeight: "calc(100% - 60px)", // Leaves space for input
                    "&::-webkit-scrollbar": { display: "none" }
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

                            >
                                <Typography sx={{ fontWeight: "bold" }}>Shared a Post</Typography>
                                <Box sx={{ mt: 1 }}>
                                    <img src={msg.sharedContent.postimg} alt="Post Preview" style={{ width: "100%", borderRadius: "8px" }} />
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
                                    borderRadius: "12px",
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
        </Container>
    );
};

export default Chatbox;