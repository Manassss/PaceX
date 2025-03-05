import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Paper, List, ListItem, ListItemText, Container } from '@mui/material';
import io from 'socket.io-client';
import { useAuth } from '../auth/AuthContext';
import axios from 'axios';
import { Send } from '@mui/icons-material'; // Importing the Send icon


const socket = io("http://localhost:5001", {
    transports: ["websocket", "polling"],
    withCredentials: true
});

const Chatbox = ({ userId, username }) => {
    const { user } = useAuth();  // Get the logged-in user
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);

    useEffect(() => {
        if (!userId || !username) return;

        console.log(`Chat with ${userId} -- ${username}`);
        getMessages();

        socket.on("connect", () => {
            console.log("Connected to server");
        });

        if (user && user._id) {
            const roomId = [user._id, userId].sort().join("_");  // Unique Room ID for 1-on-1 chat
            socket.emit('join_room', roomId);
        }

        socket.on('receive_message', (data) => {
            console.log("Message received:", data);
            setChatHistory((prev) => [...prev, data]);
        });

        return () => {
            socket.off('receive_message');
        };
    }, [user, userId]);

    const sendMessage = () => {
        if (!message.trim()) return;

        const roomId = [user._id, userId].sort().join("_"); 
        const messageData = {
            senderId: user._id,
            senderName: user.name,
            receiverId: userId,
            text: message,
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
                text: message,
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
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: 2,
        p: 1,
    }}
>
    {/* Chat History List */}
    <List
        sx={{
            flexGrow: 1, // Expands to take available space
            maxHeight: '65%', // Ensures it does not overlap input field
            overflowY: 'auto', // Enables scrolling
            mb: 2, // Adds space before input
        }}
    >
        {chatHistory.map((msg, index) => (
            <ListItem
                key={index}
                sx={{
                    justifyContent: msg.senderId === user._id ? 'flex-end' : 'flex-start',
                    mb: 1,
                }}
            >
                <ListItemText
                    primary={msg.text}
                    sx={{
                        bgcolor: msg.senderId === user._id ? '#f8f2ec' : '#073574',
                        color: msg.senderId === user._id ? 'black' : 'white',
                        borderRadius: 2,
                        p: 1,
                        maxWidth: '50%',
                        boxShadow: 1,
                    }}
                />
            </ListItem>
        ))}
    </List>

    {/* Fixed Message Input Section */}
    <Box
        sx={{
            display: "flex",
            position: "fixed", // Fixed positioning for input box
            bottom: 10, // Adjust this value for spacing above the bottom
            right: "-8%",
            transform: "translateX(-50%)", // Centering horizontally
            width: "20%", // Adjust input box width
            p: 1,
        }}
    >
        <TextField
            fullWidth
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            size="small"
            sx={{
                backgroundColor: 'white',
                borderRadius: 50, // Fully rounded input
                '& .MuiInputBase-root': { borderRadius: 50 },
                '& .MuiInputBase-input': {
                    padding: '12px 15px',
                },
            }}
        />
        <Button
            onClick={sendMessage}
            sx={{
                minWidth: 0,
                p: 1.5,
                borderRadius: '50%', // Circular button
                bgcolor: "#2196F3",
                color: "white",
                ml: -5, // Moves button inside the input field
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
