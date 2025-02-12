import React from "react";
import { Typography, Button, Container, Box } from "@mui/material";
import { Link } from "react-router-dom";
import backgroundImage from "../assets/paceuni.jpg"; // ✅ Import background image

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
  };

  return (
    <div style={styles}>
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
