import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, Paper, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';  // Import the AuthContext
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import backgroundImage from "../assets/paceuni.jpg"; // ✅ Import background image

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();  // Get the login function from context
    const auth = getAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { email, password } = formData;
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                setMessage("❌ Email not verified. Please check your inbox.");
                return;
            }

            const idToken = await user.getIdToken();
            const res = await axios.post('http://localhost:5001/api/users/login', { idToken });

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
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={10}
                    sx={{
                        p: 5,
                        borderRadius: 4,
                        backdropFilter: "blur(10px)",
                        backgroundColor: "rgba(255, 255, 255, 0.2)", // Frosted glass effect
                        boxShadow: "0px 8px 20px rgba(0,0,0,0.3)",
                        color: "#fff",
                        textAlign: "center",
                    }}
                >
                    <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                        Welcome Back!
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, fontSize: "1rem" }}>
                        Log in to continue
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            label="Email"
                            variant="outlined"
                            name="email"
                            type="email"
                            onChange={handleChange}
                            required
                            sx={{ backgroundColor: "white", borderRadius: 1 }}
                        />
                        <TextField
                            label="Password"
                            variant="outlined"
                            name="password"
                            type="password"
                            onChange={handleChange}
                            required
                            sx={{ backgroundColor: "white", borderRadius: 1 }}
                        />
                        <Button
                            variant="contained"
                            color="secondary"
                            type="submit"
                            sx={{
                                mt: 2,
                                py: 1.5,
                                fontWeight: "bold",
                                background: "linear-gradient(45deg, #FF416C, #FF4B2B)",
                                "&:hover": { background: "linear-gradient(45deg, #FF4B2B, #FF416C)" }
                            }}
                        >
                            Login
                        </Button>
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            Don't have an account? <Link href="/register" sx={{ color: "#FFD700", fontWeight: "bold" }}>Register</Link>
                        </Typography>
                    </Box>
                    {message && (
                        <Typography variant="body1" color="success.main" sx={{ mt: 2 }}>
                            {message}
                        </Typography>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;
