// components/RecommendedUsers.js
import React from 'react';
import { Box, Paper, Typography, List, ListItem, Avatar, ListItemText, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import axios from "axios";

const RecommendedUsers = ({ users, visibleCount, setVisibleCount, handleFollowToggle, following }) => {
    const { user } = useAuth();
    const [recommendedProfiles, setRecommendedProfiles] = useState([]);

    useEffect(() => {
        const fetchFollowing = async () => {
            try {
                if (!user?._id) return;
                const res = await axios.get(`http://localhost:5001/api/users/profile/${user._id}`);
                const followingList = res.data.followings || [];

                const rec = users
                    .filter((candidate) => candidate.id !== user._id && !followingList.includes(candidate.id))
                    .map((candidate) => {
                        const mutualConnections = countMutualConnections(user, candidate);
                        const searchBoost = getSearchBoost(candidate.id);
                        const recommendationScore = mutualConnections + searchBoost;
                        return { ...candidate, recommendationScore };
                    })
                    .sort((a, b) => b.recommendationScore - a.recommendationScore);

                setRecommendedProfiles(rec);
            } catch (err) {
                console.error("Error fetching following list:", err);
            }
        };

        fetchFollowing();
    }, [user, users]);

    const countMutualConnections = (currentUser, candidate) => {
        if (!currentUser.followings || !candidate.followings) return 0;
        const currentSet = new Set(currentUser.followings.map(String));
        let count = 0;
        candidate.followings.forEach((id) => {
            if (currentSet.has(id.toString())) count++;
        });
        return count;
    };

    const getSearchBoost = (candidateId) => {
        const dummyFrequentlySearched = ["dummyId1", "dummyId2"];
        return dummyFrequentlySearched.includes(candidateId) ? 5 : 0;
    };
    return (
        <Box
            sx={{
                width: 350,
                position: "fixed",
                top: 20,
                right: "5%",
                height: "90vh",
                display: { xs: "none", md: "block" },
                zIndex: 1,
            }}
        >
            <Paper
                sx={{
                    padding: 2,
                    borderRadius: "15px",
                    background: "#073574",
                    backdropFilter: "blur(10px)",
                    color: "white",
                    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
                    overflow: "hidden",
                }}
            >
                <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
                    Recommended for You
                </Typography>

                <List sx={{ padding: 0 }}>
                    {recommendedProfiles.slice(0, 12).map((profile) => {
                        const isFollowing = following.includes(profile.id);

                        return (
                            <ListItem
                                key={profile.id}
                                sx={{
                                    borderRadius: "10px",
                                    padding: "8px 12px",
                                    mb: 1,
                                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <Link
                                    to={`/profile/${profile.id}`}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        textDecoration: "none",
                                        color: "inherit",
                                        flex: 1,
                                    }}
                                >
                                    <Avatar src={profile.profileImage} sx={{ width: 40, height: 40 }} />
                                    <ListItemText primary={profile.name?.split(" ")[0]} />
                                </Link>

                                <Button
                                    variant={isFollowing ? "outlined" : "contained"}
                                    color="secondary"
                                    size="small"
                                    sx={{
                                        borderRadius: "20px",
                                        textTransform: "none",
                                        fontSize: "12px",
                                        minWidth: "90px",
                                    }}
                                    onClick={() => handleFollowToggle(profile.id)}
                                >
                                    {isFollowing ? "Disconnect" : "Connect"}
                                </Button>
                            </ListItem>
                        );
                    })}
                </List>


            </Paper>
        </Box>
    );
};

export default RecommendedUsers;