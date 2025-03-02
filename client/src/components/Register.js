import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, Paper, Link } from '@mui/material';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { motion } from "framer-motion";
import Logo from "../assets/PACE.png";

const Register = () => {
=======
import backgroundImage from "../assets/paceuni.jpg"; // ✅ Import background image


const Register = () => {

    const [selectedFile, setSelectedFile] = useState(null);  // State for image upload

>>>>>>> origin/dev-manas
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        username: ''
<<<<<<< HEAD
=======

>>>>>>> origin/dev-manas
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
            const { name, email, password, username } = formData;
<<<<<<< HEAD
=======

            // Register the user with Firebase
>>>>>>> origin/dev-manas
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const idToken = await user.getIdToken();

<<<<<<< HEAD
=======
            // Send necessary user data (excluding password) and Firebase ID token to backend
>>>>>>> origin/dev-manas
            await axios.post('http://localhost:5001/api/users/register', {
                idToken,
                name,
                email,
                password,
                username
            });

            setMessage('🎉 Registration Successful!');
<<<<<<< HEAD
=======

            // Send verification email
>>>>>>> origin/dev-manas
            await sendEmailVerification(user);
            setMessage("📩 Please check your email and verify your account before logging in.");
<<<<<<< HEAD
            navigate('/login');
=======
            navigate('/login'); // Redirect to login

>>>>>>> origin/dev-manas
        } catch (err) {
            setMessage('❌ Registration Failed');
            console.error("Registration Error:", err.response?.data?.message || "Server Error");
        }
    };

    return (
<<<<<<< HEAD
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                padding: "20px",
                position: "relative",
                overflow: "hidden",
                background: "linear-gradient(135deg, #faf8f5 , #f0ebe4 )", 
            }}
        >
            <motion.img
                src={Logo}
                alt="PaceX Logo"
                initial={{ y: 0, scale: 1.3, opacity: 1 }}
                animate={{ y: "-100px", scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                style={{
                    width: "200px",
                    height: "180px",
                    marginBottom: "10px",
                    position: "relative",
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
            >
                <Container
                    sx={{
                        width: { xs: "90%", sm: "450px" },
                        height: "auto",
                        borderRadius: "30px",
                        background: "linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)",
                        backdropFilter: "blur(15px)",
                        padding: "20px",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.05)",
                    }}
                >
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                            color: "#333",
                            marginBottom: "20px",
                            fontWeight: "bold",
                            fontSize: { xs: "1.5rem", sm: "2rem" },
                        }}
                    >
                        Sign Up
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                        Create an account to get started!
                        <p> Please use your Pace Id to create an account!</p>
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField label="Username" variant="outlined" name="username" onChange={handleChange} required fullWidth />
                        <TextField label="First Name" variant="outlined" name="name" onChange={handleChange} required fullWidth />
                        <TextField label="Email (.edu)" variant="outlined" name="email" type="email" onChange={handleChange} required fullWidth />
                        <TextField label="Password" variant="outlined" name="password" type="password" onChange={handleChange} required fullWidth />
                        <Button variant="contained" color="primary" type="submit" sx={{ mt: 2, borderRadius: 2, width: { xs: "100%", sm: "auto" } }}>
                            Register
                        </Button>
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            Already have an account? <Link href="/login">Login</Link>
                        </Typography>
                    </Box>
                    {message && <Typography variant="body1" color="success.main" sx={{ mt: 2 }}>{message}</Typography>}
                </Container>
            </motion.div>
        </div>
=======
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
                        label="Username"
                        variant="outlined"
                        name="username"
                        onChange={handleChange}
                        required
                        fullWidth
                    />
                    <TextField
                        label="First Name"
                        variant="outlined"
                        name="name"
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
>>>>>>> origin/dev-manas
    );
};

export default Register;
