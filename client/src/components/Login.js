import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, Paper, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';  // Import the AuthContext
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();  // Get the login function from context

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const auth = getAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Extract email and password from the form

        try {
            const { email, password } = formData;


            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            // Check if email is verified
            if (!user.emailVerified) {
                setMessage("❌ Email not verified. Please check your inbox.");
                return;
            }
            const idToken = await user.getIdToken(); // Get Firebase token

            // Send the Firebase token to backend for verification
            const res = await axios.post('http://localhost:5001/api/users/login', { idToken });

            setMessage('🎉 Login Successful!');
            console.log('User Logged In:', res.data);

            login(res.data.user); // Store user data in context or state

            navigate('/home'); // Redirect to home

        } catch (err) {
            setMessage('❌ Login Failed');
            console.error("Login Error:", err.response?.data?.message || "Server Error");
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h4" component="h1" align="center" gutterBottom>
                    Login
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Email"
                        variant="outlined"
                        name="email"
                        type="email"
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        name="password"
                        type="password"
                        onChange={handleChange}
                        required
                    />
                    <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
                        Login
                    </Button>
                    <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                        Don't have an account? <Link href="/register">Register</Link>
                    </Typography>
                </Box>
                {message && (
                    <Typography variant="body1" color="success.main" align="center" sx={{ mt: 2 }}>
                        {message}
                    </Typography>
                )}
            </Paper>
        </Container>
    );
};

export default Login;