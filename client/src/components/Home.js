import React from 'react';
import { Typography, Button, Container, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            {/* Main Content */}
            <Container 
                sx={{ 
                    mt: 4, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '80vh',
                    textAlign: 'center',
                    '@media (max-width: 768px)': {  // Styles for tablets and smaller screens
                        mt: 2,
                        height: '70vh',
                    },
                    '@media (max-width: 480px)': {  // Styles for mobile devices
                        height: '60vh',
                    }
                }}
            >
                <Typography 
                    variant="h4" 
                    gutterBottom 
                    sx={{
                        '@media (max-width: 768px)': {
                            fontSize: '1.8rem',
                        },
                        '@media (max-width: 480px)': {
                            fontSize: '1.5rem',
                        }
                    }}
                >
                    PaceX
                </Typography>
                <Box>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        component={Link} 
                        to="/login" 
                        sx={{ 
                            mr: 2, 
                            '@media (max-width: 480px)': {  // Adjust button size on mobile
                                width: '100%',
                                mb: 1,
                            }
                        }}
                    >
                        Login
                    </Button>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        component={Link} 
                        to="/register" 
                        sx={{
                            '@media (max-width: 480px)': { // Adjust button size on mobile
                                width: '100%',
                            }
                        }}
                    >
                        Sign Up
                    </Button>
                </Box>
            </Container>
        </div>
    );
};

export default Home;