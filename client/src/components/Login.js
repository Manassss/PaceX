import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, Paper, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
<<<<<<< HEAD
import Logo from "../assets/PACE.png";
import { motion } from "framer-motion";
=======
import backgroundImage from "../assets/paceuni.jpg"; // ✅ Import background image
>>>>>>> origin/dev-manas

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
<<<<<<< HEAD
    const { login } = useAuth();
    const [animateContent, setAnimateContent] = useState(false);
    const [animateLogo, setAnimateLogo] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setAnimateLogo(true);
            setAnimateContent(true);
        }, 1000);
    }, []);

=======
    const { login } = useAuth();  // Get the login function from context
>>>>>>> origin/dev-manas
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
<<<<<<< HEAD
            login(res.data.user);
            navigate('/userhome');
=======
            console.log('User Logged In:', res.data);

            login(res.data.user);
            navigate('/userhome');

>>>>>>> origin/dev-manas
        } catch (err) {
            setMessage('❌ Login Failed');
            console.error("Login Error:", err.response?.data?.message || "Server Error");
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
                animate={{
                    y: animateLogo ? "-100px" : "0%",
                    scale: animateLogo ? 1 : 1.3,
                    opacity: 1,
                }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                style={{
                    width: "200px",
                    height: "180px",
                    marginBottom: "10px",
                    position: "relative",
                }}
            />

            {animateContent && (
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
                            Welcome Back!
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
                            <TextField
                                label="Email"
                                variant="outlined"
                                name="email"
                                type="email"
                                required
                                onChange={handleChange}
                                sx={{ backgroundColor: "white", borderRadius: 1 }}
                            />
                            <TextField
                                label="Password"
                                variant="outlined"
                                name="password"
                                type="password"
                                required
                                onChange={handleChange}
                                sx={{ backgroundColor: "white", borderRadius: 1 }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                sx={{
                                    mt: 2,
                                    py: 1.5,
                                    fontWeight: "bold",
                                    background: "linear-gradient(135deg, #3a86ff, #0056b3)",
                                    "&:hover": { background: "linear-gradient(135deg, #0056b3, #3a86ff)" },
                                    width: { xs: "100%", sm: "auto" }
                                }}
                            >
                                Login
                            </Button>
                            <Typography variant="body2" sx={{ mt: 2 }}>
                                Don't have an account?{' '}
                                <Link href="/register" sx={{ color: "#ff6f00", fontWeight: "bold" }}>
                                    Sign Up
                                </Link>
                            </Typography>
                        </Box>
                    </Container>
                </motion.div>
            )}
        </div>
=======
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
>>>>>>> origin/dev-manas
    );
};

export default Login;
