import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, Paper, Link } from '@mui/material';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const auth = getAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { name, email, password } = formData;

            // Register the user with Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const idToken = await user.getIdToken(); // Get Firebase ID Token

            // Send necessary user data (excluding password) and Firebase ID token to backend
            const res = await axios.post('http://localhost:5001/api/users/register', {
                idToken,
                name,
                email,
                password

            });

            setMessage('🎉 Registration Successful!');
            // Send verification email
            await sendEmailVerification(user);
            console.log("📧 Verification Email Sent!");

            setMessage("📩 Please check your email and verify your account before logging in.");



            navigate('/login'); // Redirect to home

        } catch (err) {
            setMessage('❌ Registration Failed');
            console.error("Registration Error:", err.response?.data?.message || "Server Error");
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h4" component="h1" align="center" gutterBottom>
                    Register
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Name"
                        variant="outlined"
                        name="name"
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="Email (.edu)"
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
                        Register
                    </Button>
                    <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                        Already have an account? <Link href="/login">Login</Link>
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

export default Register;