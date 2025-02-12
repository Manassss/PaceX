import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, Paper, Link } from '@mui/material';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import backgroundImage from "../assets/paceuni.jpg"; // ✅ Import background image

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        email: '',
        password: ''
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const auth = getAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { firstName, email, password } = formData;

            // Register the user with Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const idToken = await user.getIdToken(); // Get Firebase ID Token

            // Send necessary user data (excluding password) and Firebase ID token to backend
            await axios.post('http://localhost:5001/api/users/register', {
                idToken,
                firstName,
                email
            });

            setMessage('🎉 Registration Successful!');

            // Send verification email
            await sendEmailVerification(user);
            console.log("📧 Verification Email Sent!");

            setMessage("📩 Please check your email and verify your account before logging in.");
            navigate('/login'); // Redirect to login

        } catch (err) {
            setMessage('❌ Registration Failed');
            console.error("Registration Error:", err.response?.data?.message || "Server Error");
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: 3
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    p: 5,
                    borderRadius: 4,
                    width: '100%',
                    maxWidth: 400,
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)'
                }}
            >
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                    Sign Up
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                    Create an account to get started!
                    <p> Please use your Pace Id to create account!</p>
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="First Name"
                        variant="outlined"
                        name="firstName"
                        onChange={handleChange}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Email (.edu)"
                        variant="outlined"
                        name="email"
                        type="email"
                        onChange={handleChange}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        name="password"
                        type="password"
                        onChange={handleChange}
                        required
                        fullWidth
                    />
                    <Button variant="contained" color="primary" type="submit" sx={{ mt: 2, borderRadius: 2 }}>
                        Register
                    </Button>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Already have an account? <Link href="/login">Login</Link>
                    </Typography>
                </Box>
                {message && (
                    <Typography variant="body1" color="success.main" sx={{ mt: 2 }}>
                        {message}
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default Register;
