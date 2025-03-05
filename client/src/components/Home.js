import React, { useState, useEffect } from "react";
import { Typography, Button, Container, Box } from "@mui/material";
import { Link } from "react-router-dom";
import Logo from "../assets/PACE.png";
import { motion } from "framer-motion";

const Home = () => {
  const [animateContent, setAnimateContent] = useState(false);
  const [animateLogo, setAnimateLogo] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setAnimateLogo(true);
    }, 1500);

    setTimeout(() => {
      setAnimateContent(true);
    }, 2500);
  }, []);

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
              Welcome to PaceX
            </Typography>

            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
              <Button
                variant="contained"
                sx={{
                  background: "linear-gradient(135deg, #3a86ff, #0056b3)",
                  color: "#fff",
                  width: { xs: "100%", sm: "auto" },
                }}
                component={Link}
                to="/login"
              >
                Login
              </Button>
              <Button
                variant="contained"
                sx={{
                  background: "linear-gradient(135deg, #ff9f43, #ff6f00)",
                  color: "#fff",
                  width: { xs: "100%", sm: "auto" },
                }}
                component={Link}
                to="/register"
              >
                Sign Up
              </Button>
            </Box>
          </Container>
        </motion.div>
      )}
    </div>
  );
};

export default Home;
