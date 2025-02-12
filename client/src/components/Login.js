import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, Paper, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';  // Import the AuthContext

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();  // Get the login function from context

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5001/api/users/login', formData);
            setMessage('🎉 Login Successful!');
            console.log('User Logged In:', res.data);

            login(res.data.user);

            navigate('/userhome');

        } catch (err) {
            setMessage('❌ Login Failed');
            console.error("Login Error:", err.response?.data?.message || "Server Error");
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
            <Paper elevation={3} sx={{
                p: 4, borderRadius: 3, 
                '@media (max-width: 600px)': { p: 2 },  // For mobile
                '@media (max-width: 900px)': { p: 3 }   // For tablets
            }}>
                <Typography variant="h4" component="h1" align="center" gutterBottom sx={{
                    '@media (max-width: 600px)': { fontSize: '1.5rem' },  // For mobile
                    '@media (max-width: 900px)': { fontSize: '1.75rem' }   // For tablets
                }}>
                    Login
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{
                    display: 'flex', flexDirection: 'column', gap: 2,
                    '@media (max-width: 600px)': { gap: 1 }  // For mobile
                }}>
                    <TextField
                        label="Email"
                        variant="outlined"
                        name="email"
                        type="email"
                        onChange={handleChange}
                        required
                        sx={{
                            '@media (max-width: 600px)': { fontSize: '0.875rem' }  // Mobile font size
                        }}
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        name="password"
                        type="password"
                        onChange={handleChange}
                        required
                        sx={{
                            '@media (max-width: 600px)': { fontSize: '0.875rem' }  // Mobile font size
                        }}
                    />
                    <Button variant="contained" color="primary" type="submit" sx={{
                        mt: 2,
                        '@media (max-width: 600px)': { padding: '8px' }, // For mobile
                        '@media (max-width: 900px)': { padding: '10px' }  // For tablets
                    }}>
                        Login
                    </Button>
                    <Typography variant="body2" align="center" sx={{
                        mt: 2,
                        '@media (max-width: 600px)': { fontSize: '0.875rem' }, // For mobile
                        '@media (max-width: 900px)': { fontSize: '1rem' }   // For tablets
                    }}>
                        Don't have an account? <Link href="/register">Register</Link>
                    </Typography>
                </Box>
                {message && (
                    <Typography variant="body1" color="success.main" align="center" sx={{
                        mt: 2,
                        '@media (max-width: 600px)': { fontSize: '0.875rem' }  // Mobile font size
                    }}>
                        {message}
                    </Typography>
                )}
            </Paper>
        </Container>
    );
};

export default Login;
