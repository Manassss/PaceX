import React from "react";
import { Typography, Button, Container, Box } from "@mui/material";
import { Link } from "react-router-dom";
import backgroundImage from "../assets/background.jpg"; // ✅ Import background image
import logoImage from "../assets/logo.jpg"; // Import logo image

const Home = () => {
  // ✅ Define styles with background image
  const styles = {
    background: `url(${backgroundImage}) no-repeat center center/cover`,
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    textAlign: "center",
    color: "#fff",
    padding: "20px",
    position: "relative", // Added for absolute positioning of logo
  };

  // Logo styles
  const logoStyles = {
    position: "absolute",
    top: "20px",
    left: "20px",
    width: "80px",
    height: "auto",
    borderRadius: "50%", // Make it circular
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)", // Add shadow for better visibility
    zIndex: 10, // Ensure it's above other elements
  };

  // Home link styles
  const homeLinkStyles = {
    position: "absolute",
    top: "20px",
    right: "20px",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "18px",
    textDecoration: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    backgroundColor: "rgba(0,0,0,0.2)",
    transition: "background-color 0.3s",
    zIndex: 10,
  };

  return (
    <div style={styles}>
      {/* Logo in the upper left corner */}
      <img src={logoImage} alt="PaceX Logo" style={logoStyles} />
      
      {/* Home link in the upper right corner */}
      <Link to="/" style={homeLinkStyles}>
        Home
      </Link>
      
      <Container
        sx={{
          backdropFilter: "blur(6px)", // ✅ Blurred effect for readability
          backgroundColor: "rgba(0,0,0,0.5)", // ✅ Transparent overlay
          borderRadius: "15px",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Welcome to PaceX
        </Typography>

        {/* ✅ Login and Signup Buttons */}
        <Box>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/login"
            sx={{ mr: 2 }}
          >
            Login
          </Button>
          <Button
            variant="contained"
            color="secondary"
            component={Link}
            to="/register"
          >
            Sign Up
          </Button>
        </Box>
      </Container>
    </div>
  );
};

export default Home;
