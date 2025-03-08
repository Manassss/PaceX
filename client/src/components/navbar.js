import React, { useState, useEffect } from "react";
import axios from "axios";
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
          <IconButton sx={{ color: "white" }}>
            <NotificationsIcon fontSize={"medium"} />
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
