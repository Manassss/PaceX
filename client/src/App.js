import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import AddPost from './components/AddPost';
import { AuthProvider } from './auth/AuthContext';
import ProfilePage from './components/ProfilePage';

function App() {
  return (
    <div className="App">
      <h1>University Social Platform</h1>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />  {/* Home Route */}
            <Route path="/add-post" element={<AddPost />} />  {/* Add Post Route */}
            <Route path="/profile/:id" element={<ProfilePage />} />  {/* Dynamic profile route */}
          </Routes>
        </Router>
      </AuthProvider>
    </div>)
}



export default App;