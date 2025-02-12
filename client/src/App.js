import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import AddPost from './components/AddPost';
import { AuthProvider } from './auth/AuthContext';
import ProfilePage from './components/ProfilePage';
import UserHome from './components/userhome';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />  {/* Home Route */}
            <Route path="/add-post" element={<AddPost />} />  {/* Add Post Route */}
            <Route path="/profile/:id" element={<ProfilePage />} />  {/* Dynamic profile route */}
            <Route path="/userhome" element={<UserHome />} />

          </Routes>
        </Router>
      </AuthProvider>
    </div>)
}



export default App;