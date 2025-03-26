import React, { useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Modal
} from "@mui/material";
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  Event as EventIcon,
  Groups as CommunityIcon,
  Store as MarketplaceIcon,
  AddBox as CreateIcon,
  Info as InfoIcon,
  MoreHoriz as MoreIcon
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Logo from "../assets/PACE.png";
import axios from "axios";
import SearchPanel from "./Search";
import AddPost from './AddPost'; // adjust the path if needed



const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);



  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    else if (hour < 18) return "Good afternoon";
    else return "Good evening";
  };

  
  const navItems = [
    { icon: <HomeIcon />, label: "Home", path: "/userhome" },
    {
      icon: <SearchIcon />,
      label: "Search",
      onClick: () => {
        setIsCollapsed(true);
        setShowSearchPanel(true); // show the panel
      },
    }, 
    { icon: <NotificationsIcon />, label: "Notifications", path: "/notifications" },
    { icon: <ChatIcon />, label: "Messenger", path: "/messenger" },
    { icon: <EventIcon />, label: "Events", path: "/events" },
    { icon: <CommunityIcon />, label: "Community", path: "/community" },
    { icon: <MarketplaceIcon />, label: "Marketplace", path: "/marketplace" },
    {
      icon: <CreateIcon />,
      label: "Create",
      onClick: () => {
        setOpenCreateModal(true);
      },
    }
      ];

  return (
<Box
  sx={{
    width: isCollapsed ? "120px" : "380px",
    transition: "width 0.3s ease",
    height: "100vh",
    bgcolor: "#073574",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    paddingLeft: isCollapsed ? "8px" : "16px",
    paddingRight: isCollapsed ? "8px" : "16px",
    py: 2,
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
    overflow: "hidden"
  }}
>
      {/* Top Section */}
      <Box>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 3 }}>
        <Box
  component="img"
  src={Logo}
  alt="PaceX Logo"
  sx={{
    height: isCollapsed ? 100 : 150, // ✅ reduce size when collapsed
    maxWidth: "100%",              // ✅ avoid overflow
    objectFit: "contain",
    transition: "all 0.3s ease",
    marginLeft: "auto",
    marginRight: "auto",
    display: "block"
  }}
  onClick={() => navigate("/userhome")}
/>

        </Box>

        {!isCollapsed && (
          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
              fontWeight: 900,
              fontSize: "1.7rem",
              textTransform: "capitalize",
              letterSpacing: "0.5px",
              mb: 3,
              background: "linear-gradient(to right,rgb(236, 50, 152), #fad0c4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)"
            }}
          >
            {getGreeting()},<br /> {user?.name?.split(" ")[0]}
          </Typography>
        )}

        {/* Profile Section */}
        <Box
  sx={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    mt: 3,
    gap: 1,
    cursor: "pointer",
    transition: "all 0.3s ease"
  }}
  onClick={() => {
    setIsCollapsed(true);
    setShowSearchPanel(false);
    navigate(`/profile/${user?._id}`);
  }}
>
  <Avatar
    src={user?.profileImage}
    sx={{
      width: isCollapsed ? 80 : 95,
      height: isCollapsed ? 80 : 95,
      transition: "all 0.3s ease"
    }}
  />
  {!isCollapsed && (
    <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
      {user?.name}
    </Typography>
  )}
</Box>


        {/* Navigation Items */}
        <List sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: isCollapsed ? 2 : 1, // spacing between icons
    mt: isCollapsed ? 3 : 2, }}>
          {navItems.map((item, i) => (
            <Tooltip title={isCollapsed ? item.label : ""} placement="right" key={i}>
              <ListItem
                button
                onClick={() => {
                  if (item.label === "Search") {
                    setIsCollapsed(true);
                    setShowSearchPanel(true); // Open the search panel
                  } else {
                    setShowSearchPanel(false); // ✅ Close search panel on all other clicks
                    if (item.label === "Home") {
                      setIsCollapsed(false);
                      navigate(item.path);
                    } else if (item.onClick) {
                      setIsCollapsed(true);
                      item.onClick();
                    } else {
                      setIsCollapsed(true);
                      navigate(item.path);
                    }
                  }
                }}
                sx={{
                  cursor: "pointer",
                  bgcolor: "#f8f2ec",
                  my: 1,
                  borderRadius: 2,
                  width: "80%",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  "&:hover": { bgcolor: "#e3dad3" }
                }}
              >
                <ListItemIcon sx={{ color: "#073574", minWidth: 30 }}>{item.icon}</ListItemIcon>
                {!isCollapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      color: "#073574"
                    }}
                    sx={{ textAlign: "center" }}
                  />
                )}
              </ListItem>
            </Tooltip>
          ))}
        </List>


        {/* Profile Menu */}
        <Menu anchorEl={profileMenuAnchor} open={Boolean(profileMenuAnchor)} onClose={() => setProfileMenuAnchor(null)}>
          <MenuItem onClick={() => navigate(`/profile/${user?._id}`)}>View Profile</MenuItem>
          <MenuItem onClick={() => navigate("/saved")}>Saved</MenuItem>
          <MenuItem onClick={() => navigate("/settings")}>Settings</MenuItem>
          <MenuItem onClick={() => navigate("/home")}>Logout</MenuItem>
        </Menu>
      </Box>

      {/* Bottom Section */}
      <Box>
        {/* More Dropdown */}
        <Tooltip title={isCollapsed ? "More" : ""} placement="right">
          <ListItem
            button
            onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
            sx={{
              cursor: "pointer",
              bgcolor: "#f8f2ec",
              borderRadius: 2,
              my: 1,
              width: "80%",
              mx: "auto",
              justifyContent: isCollapsed ? "center" : "flex-start",
              "&:hover": { bgcolor: "#e3dad3" },
              mb: 4
            }}
          >
            <ListItemIcon sx={{ color: "#073574" }}>
              <MoreIcon />
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText
                primary="More"
                primaryTypographyProps={{ fontSize: "0.9rem", color: "#073574" }}
                sx={{ textAlign: "center" }}
              />
            )}
          </ListItem>
        </Tooltip>

        <Menu anchorEl={moreMenuAnchor} open={Boolean(moreMenuAnchor)} onClose={() => setMoreMenuAnchor(null)}>
          <MenuItem onClick={() => navigate("/settings")}>Settings</MenuItem>
          <MenuItem onClick={() => navigate("/saved")}>Saved Posts</MenuItem>
          <MenuItem onClick={() => navigate("/home")}>Logout</MenuItem>
        </Menu>
      </Box>
      
      {showSearchPanel && (
            <Box
            sx={{
              position: "fixed",
              top: 0,
              left: isCollapsed ? "120px" : "380px",
              height: "100vh",
              width: 300,
              bgcolor: "#f8f2ec",
              zIndex: 1200,
              boxShadow: "4px 0 12px rgba(0,0,0,0.1)",
              transform: showSearchPanel ? "translateX(0)" : "translateX(-100%)",
              opacity: showSearchPanel ? 1 : 0,
              pointerEvents: showSearchPanel ? 'auto' : 'none', // Prevent interaction when hidden
              transition: "transform 0.4s ease, opacity 0.4s ease"
            }}
          >
            <SearchPanel onClose={() => setShowSearchPanel(false)} />
          </Box>
          
)}

<Modal
  open={openCreateModal}
  onClose={() => setOpenCreateModal(false)}
  closeAfterTransition
  BackdropProps={{
    sx: {
      backdropFilter: 'blur(8px)',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
  }}
>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: { xs: '90%', sm: 500 },
      bgcolor: '#f8f2ec',
      borderRadius: 3,
      boxShadow: 24,
      p: 3,
      maxHeight: '90vh',
      overflowY: 'auto',
    }}
  >
<AddPost open={openCreateModal} onClose={() => setOpenCreateModal(false)} />
</Box>
</Modal>

    </Box>
    
  );
};

export default Navbar;
