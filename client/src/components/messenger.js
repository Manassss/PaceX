import React, { useState, useEffect, useRef } from 'react';
import {
  Container, TextField, List, ListItem, ListItemAvatar, Avatar,
  ListItemText, Typography, IconButton, Box, useMediaQuery, Paper, Button
} from '@mui/material';
import { Search, ArrowBack, Send } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import io from 'socket.io-client';
import Chatbox from './Chatbox';
import { host } from '../components/apinfo';
const socket = io(`${host}`, {
  transports: ["websocket", "polling"],
  withCredentials: true
});

const Messenger = ({ resetChatbox = false, isNavbarCollapsed = false }) => {
  const [search, setSearch] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const { user } = useAuth();
  const userId = user?._id;
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const bottomRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch chat users with defensive API parsing
  const fetchChatUsers = async () => {
    try {
      const res = await axios.get(`${host}/api/chat/getusers/${userId}`);
      const data = Array.isArray(res.data) ? res.data : res.data.users; // Check response structure
      setUsers(data.map(user => ({
        id: user._id,
        name: user.name,
        profileImage: user.profileImage,
      })));
    } catch (err) {
      console.error("❌ Error fetching chat users:", err.message);
    }
  };
  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${host}/api/users/profile/${userId}`);
      setUserDetails(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err.message);
    }
  };

  useEffect(() => {
    console.log("🔁 Messenger component mounted");
    if (!userId) return;

    fetchUserProfile();
    fetchChatUsers();
  }, [userId]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!search.trim()) {
        // fall back to your “chatted‑with” list
        return fetchChatUsers();
      }
      try {
        const res = await axios.get(
          `${host}/api/users/search`,
          { params: { query: search } }
        );
        setUsers(res.data);
      } catch (err) {
        console.error('Search failed:', err);
      }
    };

    fetchAllUsers();
  }, [search]);

  useEffect(() => {
    if (resetChatbox) {
      setSelectedUser(null);
    }
  }, [resetChatbox]);

  // useEffect(() => {
  //   if (!selectedUser || !userId) return;

  //   getMessages();

  //   socket.on("connect", () => console.log("Connected"));

  //   const roomId = [user._id, selectedUser.id].sort().join("_");
  //   socket.emit('join_room', roomId);

  //   socket.on('receive_message', (data) => {
  //     setChatHistory((prev) => [...prev, data]);
  //   });

  //   return () => {
  //     socket.off('receive_message');
  //   };
  // }, [selectedUser, userId]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [chatHistory]);

  // const getMessages = async () => {
  //   try {
  //     console.log("selccccc", selectedUser)
  //     const response = await axios.get(`${host}/api/chat/get`, {
  //       params: { user1: selectedUser.id, user2: user._id }
  //     });
  //     setChatHistory(response.data);
  //     console.log("📜 Chat history loaded:", response.data);
  //   } catch (err) {
  //     console.error('Error getting messages:', err.response?.data || err.message);
  //   }
  // };

  // const postMessage = async (data) => {
  //   try {
  //     await axios.post(`${host}/api/chat/send`, data);
  //     console.log("✅ Message posted to DB:", data);
  //   } catch (err) {
  //     console.error('❌ Error sending message:', err.response?.data || err.message);
  //   }
  // };

  // const sendMessage = (sharedContent = null) => {
  //   if (!message.trim() && !sharedContent) return;

  //   const roomId = [user._id, selectedUser.id].sort().join("_");

  //   const messageData = {
  //     senderId: user._id,
  //     senderName: user.name,
  //     receiverId: selectedUser._id,
  //     text: sharedContent ? "" : message.trim(),
  //     roomId,
  //     ...(sharedContent && { sharedContent }),
  //   };
  //   console.log("ababababab", messageData)
  //   socket.emit('send_message', messageData);
  //   postMessage(messageData);
  //   setMessage('');
  // };

  const handleSelect = (item) => {
    setSelectedUser(item);
  };

  const handleBack = () => {
    setSelectedUser(null);
    setChatHistory([]);
  };

  // Compute filtered users list with defensive fallback on name
  const filteredUsers = users.filter(item =>
    (item.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        position: "fixed",
        top: 0,
        left: { xs: "0", sm: "120px", md: "120px", lg: "120px" },
        height: "100vh",
        width: "100%",
        zIndex: 999,
        transition: "left 0.3s ease",
        overflow: "hidden",
      }}
    >
      {/* Messenger Sidebar */}
      <Box
        sx={{
          ...styles.container,
          width: { xs: "100%", sm: "30%", md: "30%", lg: "20%" },
          height: { xs: selectedUser ? 0 : "100vh", sm: "100vh" },
          display: { xs: selectedUser ? 'none' : 'block', sm: 'block' },
          background: "#eddecf",
          padding: "20px",
          overflowY: "auto",
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Sidebar Header */}
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <Avatar src={userDetails.profileImage} sx={{ width: 60, height: 60, mx: 'auto' }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: 'black',
              cursor: 'pointer',
              '&:hover': { opacity: 0.7 },
            }}
          >
            {userDetails.name}
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1 }} />,
              sx: { borderRadius: '20px', boxShadow: '0px 4px 6px rgba(0,0,0,0.1)', bgcolor: "white" }
            }}
          />
        </Box>

        {/* Chat User List */}
        <List sx={styles.messageList}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((item) => (
              <ListItem
                button
                key={item.id}
                onClick={() => handleSelect(item)}
                sx={styles.listItem}
              >
                <ListItemAvatar>
                  <Avatar src={item.profileImage} />
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography sx={styles.username}>{item.name}</Typography>}
                />
              </ListItem>
            ))
          ) : (
            <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>
              No users found.
            </Typography>
          )}
        </List>
      </Box>

      {selectedUser ? (
        <Box
          sx={{
            flexGrow: 1,
            height: "100vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            width: { xs: "100%", sm: "60%", md: "70%" }
          }}
        >
      <Chatbox
        userId={selectedUser.id || selectedUser._id}
        username={selectedUser.name}
        onBack={() => setSelectedUser(null)} // ✅ correctly handles back
      />
        </Box>
      ) : (
        <Box
          sx={{
            flexGrow: 1,
            height: "100vh",
            backgroundColor: "#f0f2f5",
            display: {
              xs: 'none', sm: 'flex', md: 'flex', lg: 'flex'
            },
            justifyContent: "center",
            alignItems: "center",
            width: { xs: "100%", sm: "60%", md: "70%" }
          }}
        >
          <Typography variant="h5" color="textSecondary" sx={{ textAlign: "center", px: 3 }}>
            Select a user to start chatting
          </Typography>
        </Box>
      )}
    </Box>
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
    color: "black",
  },
  chatContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 3,
    background: "white",
    width: '100%'
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #ddd',
    cursor: 'pointer',
    bgcolor: '#f3f8ff',
  },
  messageList: {
    overflowY: 'auto',
    flexGrow: 1,
    cursor: 'pointer',
    '&::-webkit-scrollbar': {
      width: 0,
      height: 0,
    },
    scrollBehavior: 'smooth',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    cursor: 'pointer',
    '&:hover': {
      background: "#B0C4DE",
    },
  },
  username: {
    fontWeight: 'bold',
    fontSize: '20px',
    '&:hover': {
      transform: "scale(1.05)",
    },
    color: 'black',
    cursor: 'pointer',
  },
};
