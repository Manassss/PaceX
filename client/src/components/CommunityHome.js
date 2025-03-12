import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios
import {
    Container,
    TextField,
    Card,
    CardContent,
    Typography,
    Grid,
    Box,
    Avatar,
    IconButton,
    InputAdornment,
    Button,
    Modal,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";
import ForumIcon from "@mui/icons-material/Forum";
import AddIcon from "@mui/icons-material/Add";
import CreateCommunity from "./CreateCommunity";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom"; // Import navigation hook

const CommunityHome = () => {
    const navigate = useNavigate(); // Initialize navigation
    const [searchTerm, setSearchTerm] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const { user } = useAuth();
    const [communities, setCommunities] = useState([]);

    // Fetch communities from the database
    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const response = await axios.get("http://localhost:5001/api/community"); // Adjust API endpoint if needed
                setCommunities(response.data);
            } catch (error) {
                console.error("Error fetching communities:", error);
            }
        };

        fetchCommunities();
    }, []);

    // Filter communities based on search
    const filteredCommunities = communities.filter((community) =>
        community.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container maxWidth="md">
            {/* Search Bar and Add Community Button */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4, mb: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search for communities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ ml: 2 }}
                    startIcon={<AddIcon />}
                    onClick={() => setOpenModal(true)}
                >
                    Create Community
                </Button>
            </Box>

            {/* Communities List */}
            <Grid container spacing={3}>
                {filteredCommunities.map((community) => (
                    <Grid item xs={12} sm={6} key={community._id}>
                        <Card elevation={3} sx={{ display: "flex", alignItems: "center", p: 2, cursor: "pointer" }}
                            onClick={() => navigate(`/community/${community._id}`)}>
                            <Avatar src={community.coverImage} sx={{ width: 56, height: 56, mr: 2 }} />
                            <CardContent sx={{ flex: 1 }}>
                                <Typography variant="h6">{community.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {community.description}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                                    <IconButton disabled>
                                        <PeopleIcon />
                                    </IconButton>
                                    <Typography variant="body2">{community.members.length} members</Typography>
                                    <IconButton disabled sx={{ ml: 2 }}>
                                        <ForumIcon />
                                    </IconButton>
                                    <Typography variant="body2">{community.posts} posts</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Modal for Create Community */}
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <CreateCommunity onClose={() => setOpenModal(false)} userId={user._id} />
                </Box>
            </Modal>
        </Container>
    );
};

export default CommunityHome;