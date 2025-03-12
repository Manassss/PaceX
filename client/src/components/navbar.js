import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client"; // ✅ Import socket.io-client
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  TextField,
  Popover,
  List,
  ListItem,
  ListItemText,
  Paper,
  Badge
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/PACE.png"; // Import Logo

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [users, setUsers] = useState([]); // Store all users
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null); // Notification Menu
  const [notifications, setNotifications] = useState([]); // Store notifications
  const [unreadCount, setUnreadCount] = useState(0); // Count unread notifications



   // ✅ Fetch Notifications
   
  // ✅ Initialize socket connection
  const socket = io("http://localhost:5001", { transports: ["websocket"] });

  // ✅ Fetch Notifications from API
  useEffect(() => {
    if (!user?._id) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/notifications/${user._id}`);
        console.log("🔍 Notifications Response:", res.data);  // ✅ Log the response

        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.read).length);
      } catch (error) {
        console.error("🔥 Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [user]);


  // ✅ Listen for Real-Time Notifications
  useEffect(() => {
    if (!user?._id) return;

    const eventName = `notification-${user._id}`;
    console.log(`📡 Listening for notifications on "${eventName}"`);

    const handleNotification = (notification) => {
      console.log("📩 New notification:", notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on(eventName, handleNotification);

    return () => {
      socket.off(eventName, handleNotification);
    };
  }, [user]);

  // ✅ Open & Close Notification Dropdown
  const handleNotifClick = (event) => {
    setNotifAnchorEl(event.currentTarget);
    setUnreadCount(0); // Mark all as read when opened
  };

  const handleNotifClose = async () => {
    setNotifAnchorEl(null);

    // ✅ Mark notifications as read
    try {
      await axios.put(`http://localhost:5001/api/notifications/mark-read/${user._id}`);
    } catch (error) {
      console.error("🔥 Error marking notifications as read:", error);
    }
  };

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/users/all");
        const transformedUsers = res.data.map((user) => ({
          id: user._id,
          name: user.name,
          bio: user.bio,
          email: user.email,
          role: user.role,
          university: user.university,
          profileImage: user.profileImage,
          joinedAt: new Date(user.joinedAt).toLocaleDateString(),
        }));
        setUsers(transformedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length > 0) {
      setFilteredUsers(
        users.filter(
          (u) =>
            u.name.toLowerCase().includes(value.toLowerCase()) ||
            u.email.toLowerCase().includes(value.toLowerCase())
        )
      );
      setSearchAnchorEl(e.currentTarget); // Keeps dropdown open while typing
    } else {
      setFilteredUsers([]);
      setSearchAnchorEl(null);
    }
  };

  // Close search dropdown
  const handleClosePopover = () => {
    setSearchAnchorEl(null);
  };

  // Navigate to user profile
  const handleProfile = (userId) => {
    navigate(`/profile/${userId}`);
    handleClosePopover();
  };

  // Handle Profile Dropdown
  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: "#073574",
        paddingX: { xs: 1, sm: 2 },
        height: { xs: "70px", sm: "100px" },
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo on the Left */}
        <Box
          component="img"
          src={Logo}
          alt="PaceX Logo"
          sx={{
            height: { xs: 60, sm: 100 },
            cursor: "pointer",
          }}
          onClick={() => navigate("/userhome")}
        />

        {/* Search Bar */}
        <Box sx={{ width: { xs: "50%", sm: "60%", md: "40%" }, position: "relative" }}>
          <TextField
            color="white"
            fullWidth
            variant="outlined"
            placeholder="Search account..."
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              color: "white",
              backgroundColor: "white",
              borderRadius: "20px", // Curved corners
              border: "1px solid black", // Thin black border
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
                "& fieldset": { borderColor: "white" },
                "&:hover fieldset": { borderColor: "white" },
                "&.Mui-focused fieldset": { borderColor: "white" },
              },
            }}
          />

          {/* Search Results */}
          {searchTerm && (
            <Paper
              sx={{
                position: "absolute",
                width: "100%",
                zIndex: 10,
                mt: 1,
                maxHeight: "150px",
                overflowY: "auto",
                borderRadius: "15px", // Curved dropdown
                backgroundColor: "white", // Slight transparency
                backdropFilter: "blur(5px)", // Adds subtle blur effect
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Soft shadow
              }}
            >
              <List>
                {filteredUsers.length > 0 ? (
                  filteredUsers.slice(0, 3).map((user) => ( // Show only 3 results at a time
                    <ListItem button key={user._id} onClick={() => handleProfile(user.id)}>

                      <Avatar src={user.profileImage} sx={{ width: 30, height: 30, mr: 1 }} />
                      <ListItemText primary={user.name} />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No users found" />
                  </ListItem>
                )}
              </List>
            </Paper>
          )}
        </Box>

        {/* Icons and User Profile */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, sm: 5 } }}>
          {/* Notification Bell with Badge */}
          <IconButton sx={{ color: "white" }} onClick={handleNotifClick}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon fontSize="medium" />
            </Badge>
          </IconButton>

          {/* Notification Dropdown */}
          <Menu
  anchorEl={notifAnchorEl}
  open={Boolean(notifAnchorEl)}
  onClose={handleNotifClose}
  sx={{
    "& .MuiPaper-root": {
      backgroundColor: "white",
      borderRadius: "10px",
      minWidth: "250px",
      boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
    }
  }}
>
  {notifications.length === 0 ? (
    <MenuItem disabled>No new notifications</MenuItem>
  ) : (
    notifications.map((notif, index) => (
      <MenuItem key={index} onClick={() => navigate(notif.postId ? `/post/${notif.postId}` : `/profile/${notif.sender}`)}>
        <Avatar src={notif.senderProfile || "/default-avatar.png"} sx={{ width: 30, height: 30, marginRight: 1 }} />
        <ListItemText
          primary={
            notif.type === "follow"
              ? `${notif.senderName || "Unknown User"} started following you`
              : notif.type === "like"
              ? `${notif.senderName || "Unknown User"} liked your post`
              : notif.type
          }
        />
      </MenuItem>
    ))
  )}
</Menu>






          <IconButton sx={{ color: "white" }}>
            <BookmarkIcon fontSize={"medium"} />
          </IconButton>

          <IconButton sx={{ color: "white" }}>
            <BookmarkIcon fontSize={"medium"} />
          </IconButton>

          {/* User Profile Dropdown */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={handleProfileClick}
          >
            <Typography
              sx={{
                color: "white",
                fontWeight: "bold",
                mr: { xs: 0.5, sm: 1 },
                fontSize: { xs: "0.8rem", sm: "1rem" },
              }}
            >
              {user?.name}
            </Typography>
            <Avatar
              src={user?.profileImage}
              sx={{
                width: { xs: 40, sm: 50 },
                height: { xs: 40, sm: 50 },
              }}
            />
          </Box>

          <Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleClose}
  sx={{
    "& .MuiPaper-root": {
      backgroundColor: " #f8f2ec", // Background color of menu
      borderRadius: "10px",
      color: "#073574", // Text color
      boxShadow: "0px 4px 10px rgba(0,0,0,0.3)", // Shadow effect
      minWidth: "200px",
    },
  }}
>
  {[
    { label: "Profile", path: `/profile/${user?._id}` },
    { label: "Saved Posts", path: "/saved" },
    { label: "Settings", path: "/settings" },
    { label: "Logout", path: "/home" },
  ].map((item, index) => (
    <MenuItem
      key={index}
      onClick={() => navigate(item.path)}
      sx={{
        fontSize: "16px",
        fontWeight: "500",
        padding: "12px 20px",
        transition: "0.3s",
        "&:hover": {
          backgroundColor: "#0a4a8c", // Hover color
          color: "#fff",
        },
      }}
    >
      {item.label}
    </MenuItem>
  ))}
</Menu>

        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
