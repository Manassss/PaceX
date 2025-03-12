import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Container,
    Typography,
    Box,
    Button,
    CircularProgress,
} from "@mui/material";
import { useAuth } from "../auth/AuthContext";

const CommunityDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get community ID from URL
    const { user } = useAuth();
    const [community, setCommunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false); // Admin status

    useEffect(() => {
        const fetchCommunity = async () => {
            try {
                const response = await axios.get(`http://localhost:5001/api/community/${id}`);
                console.log("rsss", response.data)
                setCommunity(response.data);
                const memberData = response.data.members.find(member => member.userId === user._id);
                setIsMember(!!memberData);

                // Check if user is an admin based on role
                setIsAdmin(response.data.createdBy === user._id);
                console.log("admin", response.data.createdBy === user._id)
                setLoading(false);
            } catch (error) {
                console.error("Error fetching community details:", error);
                setLoading(false);
            }
        };

        fetchCommunity();
    }, [id, user]);

    const handleMembership = async () => {
        try {

            const response = await axios.post(`http://localhost:5001/api/community/togglemember`, { communityId: id, userId: user._id });
            setIsMember(prevState => !prevState); // Toggle membership state in UI
        } catch (error) {
            console.error("Error updating membership:", error);
        }
    };
    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5001/api/community/${id}`);
            alert("Community deleted successfully!");
            navigate("/community"); // Redirect to home or another page
        } catch (error) {
            console.error("Error deleting community:", error);
        }
    };

    if (loading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 5 }} />;

    return (
        <Container maxWidth="md">
            {/* Cover Image */}
            <Box
                sx={{
                    width: "100%",
                    height: 250,
                    backgroundImage: `url(${community.coverImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: 2
                }}
            />

            {/* Community Info */}
            <Box sx={{ mt: 2, textAlign: "center" }}>
                <Typography variant="h4">{community.name}</Typography>
                <Typography variant="body1" color="text.secondary">{community.description}</Typography>
            </Box>


            {/* Admin Delete Button or Join/Leave Button */}
            <Box sx={{ mt: 3, textAlign: "center" }}>
                {isAdmin ? (
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                    >
                        Delete Community
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color={isMember ? "secondary" : "primary"}
                        onClick={handleMembership}
                    >
                        {isMember ? "Leave Community" : "Join Community"}
                    </Button>
                )}
            </Box>
        </Container>
    );
};

export default CommunityDetail;