import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, Link } from '@mui/material';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import Logo from "../assets/PACE.png";
import { host } from '../components/apinfo';
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    username: ''
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

      // Create user using Firebase Authentication.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get an ID token to send to your backend.
      const idToken = await user.getIdToken();

      // Send registration data (and token) to your backend API.
      await axios.post(`${host}/api/users/register`, {
        idToken,
        name,
        email,
        password,
        username
      });

      setMessage('🎉 Registration Successful!');
      await sendEmailVerification(user);
      setMessage("📩 Please check your email and verify your account before logging in.");
      navigate('/login');
    } catch (err) {
      // Enhanced error logging: display detailed error information from Firebase.
      if (err.code && err.message) {
        console.error("Registration Error:", err.code, err.message);
        setMessage(`❌ Registration Failed: ${err.message}`);
      } else {
        console.error("Registration Error:", err.response?.data?.message || "Server Error");
        setMessage('❌ Registration Failed: Server Error');
      }
    }
  };

  return (
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
            <p>Please use your Pace Id to create an account!</p>
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
  );
};

export default Register;
