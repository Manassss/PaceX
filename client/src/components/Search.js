import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Avatar,
  Typography,
} from "@mui/material";
import { host } from '../components/apinfo';
import { useAuth } from "../auth/AuthContext";
const SearchPanel = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value) return setFilteredUsers([]);
    try {
      const res = await axios.get(`${host}/api/users/all`);
      const filtered = res.data
        .filter(
          (u) =>
            (u.name.toLowerCase().includes(value.toLowerCase()) ||
              u.email.toLowerCase().includes(value.toLowerCase())) &&
            !user.blockeduser.includes(u._id) &&
            !user.blockedby.includes(u._id)
        )
        .slice(0, 5);
      setFilteredUsers(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        backgroundColor: "#073574",
        padding: 3,
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid #062a5f",
        position: "relative",
      }}
    >
      {/* Heading */}
      <Typography
        variant="h5"
        sx={{
          color: "white",
          fontWeight: 600,
          textAlign: "center",
          mb: 3,
          letterSpacing: "0.5px",
        }}
      >
        Search
      </Typography>

      {/* Input Box */}
      <Box
        sx={{
          backgroundColor: "#f8f2ec",
          borderRadius: "30px",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <input
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            background: "transparent",
            border: "none",
            color: "#222",
            width: "100%",
            outline: "none",
            fontSize: "15px",
          }}
        />
      </Box>

      {/* Results */}
      <Box sx={{ mt: 3, overflowY: "auto", flexGrow: 1 }}>
        {filteredUsers.map((u) => (
          <Box
            key={u._id}
            onClick={() => {
              navigate(`/profile/${u._id}`);
              onClose();
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              my: 1,
              px: 2,
              py: 1.2,
              color: "#fff",
              background: "linear-gradient(to right, #f8f2ec, #e8ded4)",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                background: "linear-gradient(to right, #e8ded4, #f8f2ec)",
                transform: "scale(1.02)",
              },
            }}
          >
            <Avatar src={u.profileImage} sx={{ width: 36, height: 36 }} />
            <Box>
              <Typography fontSize={14} fontWeight={600} color="#073574">
                {u.name}
              </Typography>
              <Typography fontSize={12} color="#073574">
                {u.email}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SearchPanel;
