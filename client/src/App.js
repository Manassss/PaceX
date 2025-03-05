import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import AddPost from './components/AddPost';
import { AuthProvider } from './auth/AuthContext';
import ProfilePage from './components/ProfilePage';
import UserHome from './components/userhome';
import Marketplace from './components/Marketplace';
import MarketplaceUpload from './components/MarketplaceUplaod';
import Chatbox from './components/Chatbox';
import Messenger from './components/messenger';
import BottomNav from './components/BottamNav';
import { LoadScript } from '@react-google-maps/api';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Notifications from './components/Notification';
import { useAuth } from './auth/AuthContext';
import { io } from "socket.io-client";

// Initialize socket connection
const socket = io("http://localhost:5001", { transports: ["websocket"] });
function AppContent({ userId }) {
  const location = useLocation(); // ✅ Now inside <Router>

  // ✅ Define routes where BottomNav should be hidden
  const hiddenRoutes = ['/', '/register', '/login', '/home', '/chatbox'];

  // Listen for notifications
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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/add-post" element={<AddPost />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/userhome/" element={<UserHome />} />
        <Route path="/chatbox" element={<Chatbox />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplaceupload" element={
          <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY" libraries={["places"]}>
            <MarketplaceUpload />
          </LoadScript>
        } />
        <Route path="/messenger" element={<Messenger />} />
      </Routes>

      {/* ✅ Show BottomNav only if the current route is NOT in hiddenRoutes */}
      {!hiddenRoutes.includes(location.pathname) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', position: 'fixed', bottom: 0, width: '100%' }}>
          <BottomNav />
        </Box>
      )}
    </>
  );
}

function App() {
  const { user } = useAuth() || {};
  const userId = user?._id;
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          {/* Notification Toast Container */}
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} pauseOnHover draggable />
          {/* Main App */}
          <AppContent userId={userId} />

        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;