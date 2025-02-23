import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Paper, List, ListItem, ListItemText, Container } from '@mui/material';
import io from 'socket.io-client';
import { useAuth } from '../auth/AuthContext';
import { useParams } from 'react-router-dom';
import { useLocation } from "react-router-dom";

const socket = io("http://localhost:5001", {
    transports: ["websocket", "polling"],
    withCredentials: true
});


const Chatbox = () => {
    const location = useLocation();
    const { userId, username } = location.state || {};
    const { user } = useAuth();  // Get the logged-in user
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    // Join the user's personal room when the component mounts
    useEffect(() => {
        console.log(`rec ${userId} -- ${username}`);

        socket.on("connect", () => {
            console.log("Connected to server");
        });

        if (user && user._id) {
            const roomId = [user._id, userId].sort().join("_");  // Unique Room ID for 1-on-1 chat
            socket.emit('join_room', roomId);
        }

        // Listen for incoming messages
        socket.on('receive_message', (data) => {
            console.log("Message received:", data);
            setChatHistory((prev) => [...prev, data]);
        });

        // Cleanup on component unmount
        return () => {
            socket.off('receive_message');
        };
    }, [user, userId]);

    // Handle sending messages
    const sendMessage = () => {
        if (!message.trim()) return;

        const roomId = [user._id, userId].sort().join("_"); // Generate Room ID

        const messageData = {
            senderId: user._id,
            senderName: user.name,
            receiverId: userId,
            content: message,
            roomId
        };

        // Send message via Socket.io
        socket.emit('send_message', messageData);

        // Add the message to local chat history
        // setChatHistory((prev) => [...prev, messageData]);

        // Clear the input field
        setMessage('');
    };

    return (
        <Container
            maxWidth="xs"
            sx={{
                width: 600,
                height: 800,
                position: 'relative',
                bgcolor: '#f9f9f9',
                borderRadius: 3,
                p: 1,
                border: '1px solid #ddd',
                marginTop: '50px',

            }}
        >
            <Paper elevation={4} sx={{
                height: 750, borderRadius: 2, backgroundColor: '#ffffff', overflowY: 'auto',
                '&::-webkit-scrollbar': {
                    display: 'none',
                },
                scrollbarWidth: 'none',
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                        Chat with {username}
                    </Typography>
                </Box>

                <List sx={{ maxHeight: '750px', overflow: 'auto', mb: 2 }}>
                    {chatHistory.map((msg, index) => (
                        <ListItem
                            key={index}
                            sx={{
                                justifyContent: msg.senderId === user._id ? 'flex-end' : 'flex-start',
                                mb: 1,
                            }}
                        >
                            <ListItemText
                                primary={msg.content}
                                sx={{
                                    bgcolor: msg.senderId === user._id ? 'primary.light' : 'grey.200',
                                    borderRadius: 2,
                                    p: 1,
                                    maxWidth: '60%',
                                    boxShadow: 1,
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>
            {/* Message Input */}
            <Box sx={{
                display: "flex",
                position: 'absolute',
                bottom: -30,
                width: '100%',
                left: 0,
                height: 50,
                backgroundColor: '#333',
                alignItems: 'center',
                paddingLeft: '5px',
                borderTop: '1px solid #444'
            }}>
                <TextField
                    fullWidth
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    size="small"
                    sx={{
                        backgroundColor: 'white',
                        borderRadius: 1,
                        '& .MuiInputBase-input': {
                            padding: '6px 8px'
                        },
                    }}
                />
                <Button variant="contained" color="primary" onClick={sendMessage} sx={{ mr: 1, ml: 1, textTransform: 'none' }}>
                    Send
                </Button>
            </Box>
        </Container>
    );
};

export default Chatbox;