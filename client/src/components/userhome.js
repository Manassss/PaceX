import React from 'react';
import { Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const UserHome = () => {
  const { user, logout } = useAuth();  // Assume user and logout are provided by context
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');  // Redirect to login page after logout
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Welcome {user?.name || 'User'}!
        </Typography>
        <Typography variant="h6" align="center">
          Email: {user?.email || 'No email available'}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={handleLogout}
          sx={{ mt: 3, display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
        >
          Logout
        </Button>
      </Paper>
    </Container>
  );
};

export default UserHome;
