import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, Paper, Link, Checkbox, FormControlLabel } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';  // Import the AuthContext
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import backgroundImage from "../assets/background.jpg"; // ✅ Import background image
import logoImage from "../assets/logo.jpg"; // Import logo image
import { styled } from '@mui/material/styles';

// Custom styled components
const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    height: '53px',
    width: '313px',
    background: 'rgba(41, 0, 0, 0.46)',
    borderRadius: '16px',
    color: 'rgba(255, 255, 255, 0.74)',
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.74)',
    fontFamily: 'Inter',
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: '16px',
  },
});

const StyledButton = styled(Button)({
  width: '187px',
  height: '53px',
  background: 'rgba(41, 0, 0, 0.46)',
  borderRadius: '16px',
  color: 'rgba(255, 255, 255, 0.74)',
  fontFamily: 'Inter',
  fontStyle: 'normal',
  fontWeight: 700,
  fontSize: '16px',
  textTransform: 'uppercase',
  '&:hover': {
    background: 'rgba(41, 0, 0, 0.6)',
  },
});

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
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
                position: "relative",
            }}
        >
            {/* Logo in the upper left corner */}
            <Box
                component="img"
                src={logoImage}
                alt="PaceX Logo"
                sx={{
                    position: "absolute",
                    top: "20px",
                    left: "20px",
                    width: "80px",
                    height: "auto",
                    borderRadius: "50%", // Make it circular
                    boxShadow: "0 4px 8px rgba(0,0,0,0.3)", // Add shadow for better visibility
                    zIndex: 10, // Ensure it's above other elements
                }}
            />
            
            {/* Home link in the upper right corner */}
            <RouterLink to="/" style={{ textDecoration: 'none' }}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "20px",
                        right: "20px",
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "18px",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        backgroundColor: "rgba(0,0,0,0.3)",
                        transition: "background-color 0.3s",
                        '&:hover': {
                            backgroundColor: "rgba(0,0,0,0.5)",
                        },
                        zIndex: 10,
                    }}
                >
                    Home
                </Box>
            </RouterLink>
            
            <Box
                sx={{
                    width: '447px',
                    height: '529px',
                    background: 'linear-gradient(180deg, rgba(105, 100, 100, 0.46) 1.5%, rgba(255, 255, 255, 0.01) 100%)',
                    borderRadius: '33px',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 20px',
                }}
            >
                <Typography 
                    variant="h4" 
                    component="h1" 
                    sx={{
                        fontFamily: 'Inter',
                        fontWeight: 700,
                        fontSize: '24px',
                        color: '#FFFFFF',
                        textShadow: '0px 5px 2px rgba(0, 0, 0, 0.25)',
                        mb: 4,
                        textAlign: 'center',
                    }}
                >
                    LOGIN
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3, alignItems: 'center' }}>
                    <StyledTextField
                        placeholder="EMAIL ID / USER NAME"
                        variant="outlined"
                        name="email"
                        type="email"
                        onChange={handleChange}
                        required
                        InputProps={{
                            style: { color: 'rgba(255, 255, 255, 0.74)' }
                        }}
                    />
                    <StyledTextField
                        placeholder="PASSWORD"
                        variant="outlined"
                        name="password"
                        type="password"
                        onChange={handleChange}
                        required
                        InputProps={{
                            style: { color: 'rgba(255, 255, 255, 0.74)' }
                        }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '313px', mt: 1 }}>
                        <FormControlLabel
                            control={
                                <Checkbox 
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        '&.Mui-checked': {
                                            color: 'rgba(255, 255, 255, 0.8)',
                                        },
                                    }}
                                />
                            }
                            label={
                                <Typography sx={{ 
                                    fontFamily: 'Inter',
                                    fontStyle: 'normal',
                                    fontWeight: 300,
                                    fontSize: '12px',
                                    color: 'rgba(255, 255, 255, 0.74)',
                                }}>
                                    Keep me logged in
                                </Typography>
                            }
                        />
                        <Typography 
                            sx={{ 
                                fontFamily: 'Inter',
                                fontStyle: 'normal',
                                fontWeight: 400,
                                fontSize: '12px',
                                color: '#FFFFFF',
                                cursor: 'pointer',
                                alignSelf: 'center',
                            }}
                        >
                            Forget Password
                        </Typography>
                    </Box>
                    
                    <StyledButton type="submit">
                        Login
                    </StyledButton>
                    
                    <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', width: '313px', justifyContent: 'center' }}>
                        <Box sx={{ width: '135px', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }} />
                        <Typography sx={{ 
                            mx: 2, 
                            fontFamily: 'Inter',
                            fontStyle: 'normal',
                            fontWeight: 300,
                            fontSize: '12px',
                            color: '#FFFFFF',
                        }}>
                            or
                        </Typography>
                        <Box sx={{ width: '135px', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }} />
                    </Box>
                    
                    <Typography sx={{ 
                        mt: 1,
                        fontFamily: 'Inter',
                        fontStyle: 'normal',
                        fontWeight: 300,
                        fontSize: '14px',
                        color: '#FFFFFF',
                    }}>
                    </Typography>
                    
                    <Typography sx={{ 
                        
                        fontFamily: 'Inter',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.7)',
                    }}>
                        Not a member? <Link href="/register" sx={{ color: 'rgba(255, 255, 255, 0.9)', textDecoration: 'none' }}>Sign up now</Link>
                    </Typography>
                </Box>
                
                {message && (
                    <Typography variant="body1" sx={{ mt: 2, color: message.includes('❌') ? '#ff6b6b' : '#4ecca3' }}>
                        {message}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default Login;
