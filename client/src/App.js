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
import Navbar from './components/navbar';

function AppContent() {
  const location = useLocation(); // ✅ Now inside <Router>

  // ✅ Define routes where BottomNav should be hidden
  const hiddenRoutes = ['/', '/register', '/login', '/home'];

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
        <Route path="/navbar" element={<Navbar />} />

        <Route path="/marketplaceupload" element={
          <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY" libraries={["places"]}>
            <MarketplaceUpload />
          </LoadScript>
        } />
        <Route path="/messenger" element={<Messenger />} />
      </Routes>


    </>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <AppContent /> {/* ✅ Moved AppContent inside Router */}
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;