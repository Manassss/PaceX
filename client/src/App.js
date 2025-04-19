import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./components/Home";
import AddPost from "./components/Post/AddPost";
import { AuthProvider } from "./auth/AuthContext";
import ProfilePage from "./components/ProfilePage";
import UserHome from "./components/userhome";
import Marketplace from "./components/Marketplace";
import MarketplaceUpload from "./components/MarketplaceUpload";
import Chatbox from "./components/Chatbox";
import Messenger from "./components/messenger";
import Navbar from "./components/navbar";
import { LoadScript } from "@react-google-maps/api";
import { useAuth } from "./auth/AuthContext";
import io from "socket.io-client";
import Notifications from "./components/Notification";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CommunityHome from "./components/CommunityHome";
import CommunityDetail from "./components/CommunityDetail";
import SearchPanel from "./components/Search";
import { host } from '../components/apinfo';
// ✅ Initialize socket connection
const socket = io(`${host}`, { transports: ["websocket"] });

function AppContent({ userId }) {
  const location = useLocation();
  const hiddenRoutes = ["/", "/register", "/login", "/home", "/chatbox"];
  const showNavbar = !hiddenRoutes.includes(location.pathname);
  const [isCollapsed, setIsCollapsed] = useState(true);


  // ✅ Listen for real-time notifications
  useEffect(() => {
    if (!userId) return;

    const eventName = `notification-${userId}`;
    console.log(`🔔 Listening for notifications on ${eventName}`);

    const handleNotification = (notification) => {
      console.log("📩 New notification:", notification);
      toast.info(`New ${notification.type} from ${notification.sender}!`);
    };

    socket.on(eventName, handleNotification);

    return () => {
      socket.off(eventName, handleNotification);
    };
  }, [userId]);

  return (
    <>
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
        </Routes>

        {/* Navbar Section */}
        {showNavbar && (
          <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        )}

        {/* Main Content */}
        <Box
          sx={{
            flexGrow: 1,
            // width: "100%",
            overflowY: "auto",
            ml: { xs: "0", sm: "7.5%", md: "7.5%", lg: "7.5%", },
            height: "100vh",
            transition: "margin-left 0.3s ease",
            // mr: "10%"
          }}
        >
          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            pauseOnHover
            draggable
          />

          {/* Real-time Notification Component */}
          {userId && <Notifications userId={userId} />}

          {/* Routes */}
          <Routes>

            <Route path="/Search" element={<SearchPanel />} />

            <Route path="/add-post" element={<AddPost />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/userhome/" element={<UserHome />} />
            <Route path="/chatbox" element={<Chatbox />} />
            <Route path="/marketplace/:userId" element={<Marketplace />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/navbar" element={<Navbar />} />
            <Route path="/community" element={<CommunityHome />} />
            <Route path="/community/:id" element={<CommunityDetail />} />
            <Route
              path="/marketplaceupload"
              element={
                <LoadScript googleMapsApiKey={process.env.GOOGLE_MAPS_API} libraries={["places"]}>
                  <MarketplaceUpload />
                </LoadScript>
              }
            />
            <Route path="/messenger" element={<Box
              sx={{
                position: "fixed",
                top: 0,
                left: { xs: '0', sm: "120px", md: '120px', lg: '120px' }, // Match collapsed navbar
                height: "100vh",
                display: "flex",
                zIndex: 1100,
                transition: "left 0.4s ease",
              }}
            >
              <Messenger isCollapsed={isCollapsed} />
            </Box>} />
          </Routes>
        </Box>
      </Box>
    </>
  );
}

function App() {
  const { user } = useAuth() || {};
  const userId = user?._id;

  return (
    <div className="App">

      <Router> {/* ✅ Only One Router */}
        {/* ✅ Notification Toast Container */}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} pauseOnHover draggable />

        {/* ✅ Main App Content */}
        <AppContent userId={userId} />
      </Router>

    </div>
  );
}

export default App;
