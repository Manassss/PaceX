import React from 'react';
import { Typography, Button, Container, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
    const [posts, setPosts] = useState([]);  // Initialize posts state
    const [userName, setUserName] = useState('');
    const [users, setUsers] = useState([]);  // List of all users
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);  // Filtered users based on search
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    // Fetch posts from backend on component mount
    useEffect(() => {
        if (user && user.name) {  // ✅ Check if user exists before accessing name
            setUserName(user.name);
        }

        const fetchPosts = async () => {
            try {
                console.log('Fetching posts from API...');
                const res = await axios.get('http://localhost:5001/api/posts/all');  // API call to fetch posts
                // console.log('Fetched posts:', res.data);  // Log fetched posts
                setPosts(res.data);

            } catch (err) {
                console.error('Error fetching posts:', err.response?.data || err.message);  // Detailed error logging
            }
        };

        fetchPosts();
    }, [user]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/users/all');
                setUsers(res.data);
                // console.log(res.data);
            } catch (err) {
                console.error("Error fetching users:", err.response?.data?.message || err.message);
            }
        };

        fetchUsers();
    }, []);

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Filter users based on search term
        if (value) {
            const filtered = users.filter(u => u.name.toLowerCase().includes(value.toLowerCase()));
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers([]);
        }
    };

    // Navigate to selected user's profile
    const handleUserSelect = (event, selectedUser) => {
        if (selectedUser && selectedUser._id) {
            navigate(`/profile/${selectedUser._id}`);  // Navigate to the selected user's profile
        }
    };
    // Handle Logout
    const handleLogout = () => {
        logout();  // Clear user from AuthContext
        navigate('/login');  // Redirect to login page after logout
    };
    const handleProfile = () => {

        navigate(`/profile/${user._id}`);  // Redirect to login page after logout
    };

    // Sample Data


    const events = [
        { id: 1, name: "Career Fair 2025", date: "Feb 10, 2025" },
        { id: 2, name: "Coding Hackathon", date: "Feb 15, 2025" },
        { id: 3, name: "Spring Break Starts", date: "Mar 1, 2025" }
    ];

    const groups = [
        { id: 1, name: "Computer Science Club" },
        { id: 2, name: "Photography Enthusiasts" },
        { id: 3, name: "Basketball Team" }
    ];

    return (

        <div>
            {/* Main Content */}
            <Container 
                sx={{ 
                    mt: 4, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '80vh',
                    textAlign: 'center',
                    '@media (max-width: 768px)': {  // Styles for tablets and smaller screens
                        mt: 2,
                        height: '70vh',
                    },
                    '@media (max-width: 480px)': {  // Styles for mobile devices
                        height: '60vh',
                    }
                }}
            >
                <Typography 
                    variant="h4" 
                    gutterBottom 
                    sx={{
                        '@media (max-width: 768px)': {
                            fontSize: '1.8rem',
                        },
                        '@media (max-width: 480px)': {
                            fontSize: '1.5rem',
                        }
                    }}
                >
                    PaceX
                </Typography>
                <Box>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        component={Link} 
                        to="/login" 
                        sx={{ 
                            mr: 2, 
                            '@media (max-width: 480px)': {  // Adjust button size on mobile
                                width: '100%',
                                mb: 1,
                            }
                        }}
                    >
                        Login
                    </Button>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        component={Link} 
                        to="/register" 
                        sx={{
                            '@media (max-width: 480px)': { // Adjust button size on mobile
                                width: '100%',
                            }
                        }}
                    >
                        Sign Up
                    </Button>
                </Box>
                </Container>
        </div>
        
    );
};

export default Home;