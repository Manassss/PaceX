import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import io from 'socket.io-client';
import { useAuth } from '../auth/AuthContext';

const socket = io('http://localhost:5001');  // Connect to the backend Socket.io server

const Chatbox = ({ recipientId, recipientName }) => {
    const { user } = useAuth();  // Get the logged-in user
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);

    // Join the user's personal room when the component mounts
    useEffect(() => {
        if (user && user._id) {
            socket.emit('join_room', user._id);
        }

        // Listen for incoming messages
        socket.on('receive_message', (data) => {
            if (data.senderId === recipientId) {  // Only show messages from the current chat partner
                setChatHistory((prev) => [...prev, data]);
            }
        });

        // Cleanup on component unmount
        return () => {
            socket.off('receive_message');
        };
    }, [user, recipientId]);

    // Handle sending messages
    const sendMessage = () => {
        const messageData = {
            senderId: user._id,
            senderName: user.name,
            recipientId,
            content: message,
        };

        // Send message via Socket.io
        socket.emit('send_message', messageData);

        // Add the message to local chat history
        setChatHistory((prev) => [...prev, messageData]);

        // Clear the input field
        setMessage('');
    };

    return (
        <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>Chat with {recipientName}</Typography>
            <List sx={{ maxHeight: '300px', overflow: 'auto', mb: 2 }}>
                {chatHistory.map((msg, index) => (
                    <ListItem key={index} sx={{ justifyContent: msg.senderId === user._id ? 'flex-end' : 'flex-start' }}>
                        <ListItemText
                            primary={msg.content}
                            sx={{
                                bgcolor: msg.senderId === user._id ? 'primary.light' : 'grey.300',
                                borderRadius: 2,
                                p: 1,
                                maxWidth: '60%',
                            }}
                        />
                    </ListItem>
                ))}
            </List>

            {/* Message Input */}
            <Box display="flex">
                <TextField
                    fullWidth
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button variant="contained" color="primary" onClick={sendMessage} sx={{ ml: 2 }}>
                    Send
                </Button>
            </Box>
        </Paper>
    );
};

export default Chatbox;