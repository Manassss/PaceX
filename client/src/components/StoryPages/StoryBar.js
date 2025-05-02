import { Box, IconButton, Avatar, Typography, Modal, useMediaQuery } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import StoryViewer from "./StoryViewer";
import { useAuth } from "../../auth/AuthContext";
import CameraCapture from "../CameraComponent";
import { host } from '../apinfo';
const StoryBar = ({
    users,

}) => {
    const { user } = useAuth();
    const storyScrollRef = useRef(null);
    const [stories, setStories] = useState([]);
    const [openStory, setOpenStory] = useState(false);
    const [currentStories, setCurrentStories] = useState([]);
    const [currentIndexStory, setCurrentIndexStory] = useState(0);
    const [storyUser, setStoryUser] = useState(null);
    const [openStoryCamera, setOpenStoryCamera] = useState(false);

    const fetchStories = async () => {
        try {
            const res = await axios.get(`${host}/api/story/all`);
            const todaystories = res.data.map(story => ({
                storyId: story._id,
                userId: story.userId,
                userName: story.userName,
                mediaUrl: story.mediaUrl,
                mediaType: story.mediaType,
                views: story.views,
                viewsNumber: story.viewsNumber
            }));
            setStories(todaystories);
        } catch (err) {
            console.error('Error fetching stories:', err);
        }
    };
    useEffect(() => {

        fetchStories();
    }, []);

    const groupedStories = stories.reduce((acc, story) => {
        if (!acc[story.userId]) acc[story.userId] = { userId: story.userId, stories: [] };
        acc[story.userId].stories.push(story);
        return acc;
    }, {});

    if (!groupedStories[user?._id]) {
        const myStories = stories.filter(s => s.userId === user?._id);
        if (myStories.length > 0) groupedStories[user._id] = { userId: user._id, stories: myStories };
    }

    const uniqueUserStories = Object.values(groupedStories);

    const sortedUniqueUserStories = [...uniqueUserStories].sort((a, b) => {
        const aViewed = a.stories.every(s => s.views?.includes(user?._id));
        const bViewed = b.stories.every(s => s.views?.includes(user?._id));
        return aViewed && !bViewed ? 1 : !aViewed && bViewed ? -1 : 0;
    });

    const handleStoryClick = (storyUser, stories) => {
        setStoryUser(storyUser);
        setCurrentStories(stories);
        setCurrentIndexStory(0);
        setOpenStory(true);
    };

    const markStoryAsViewed = async (storyId, userId) => {
        try {
            const postdata = { storyId, userId };
            console.log("postdata", postdata);
            await axios.put(`${host}/api/story/view`, postdata);
            console.log(`👀 User ${user?._id} viewed story ${storyId}`);
        } catch (error) {
            console.error("🔥 Error updating story view:", error);
        }
    };

    const handleDeleteStory = async (storyId) => {
        try {
            await axios.delete(`${host}/api/story/delete/${storyId}`);
            console.log("✅ Story deleted successfully");

            // Remove the deleted story from the state
            setCurrentStories((prevStories) => prevStories.filter((story) => story.storyId !== storyId));
            setStories((prevStories) => prevStories.filter((story) => story.storyId !== storyId))
            // If no more stories remain, close the modal
            if (currentStories.length === 1) {
                handleClose();
            } else {
                setCurrentIndexStory((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
            }
        } catch (err) {
            console.error("❌ Error deleting story:", err.response?.data || err.message);
        }
    };

    const handleClose = () => {
        setOpenStory(false);
        setCurrentStories([]);
        setCurrentIndexStory(0);
    };

    useEffect(() => {
        if (openStory && currentStories.length > 0) {
            console.log(currentStories[currentIndexStory]);
            markStoryAsViewed(currentStories[currentIndexStory].storyId, user?._id);
        }
    }, [currentIndexStory, openStory]);

    const scrollLeft = () => {
        if (storyScrollRef.current) {
            storyScrollRef.current.scrollBy({ left: -150, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (storyScrollRef.current) {
            storyScrollRef.current.scrollBy({ left: 150, behavior: "smooth" });
        }
    };

    const handleImageUpload = async (downloadURL, mediatype) => {
        try {
            const postData = {
                userId: user?._id,
                userName: user?.name,
                mediaUrl: downloadURL,
                mediaType: mediatype
            };
            await axios.post(`${host}/api/story/add`, postData);
            console.log("✅ Story uploaded successfully");
            setOpenStoryCamera(false);
            await fetchStories(); // 🔁 Refresh stories after upload
        } catch (err) {
            console.error("🔥 Error uploading story:", err.response?.data || err.message);
        }
    };
    const myStories = sortedUniqueUserStories.find(group => group.userId === user?._id);


    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: { xs: "90%", sm: "65%", md: "60%", lg: "45%" },
                display: "flex",
                alignItems: "center",
                // justifyContent: "center",6

                py: 2,
                position: 'fixed',
                zIndex: 1
            }}
        >
            {sortedUniqueUserStories.length > 8 && (
                <IconButton
                    onClick={scrollLeft}
                    sx={{
                        backgroundColor: "rgba(0,0,0,0.5)",
                        color: "white",
                    }}
                >
                    <ArrowBackIosNewIcon />
                </IconButton>
            )}

            <Box
                ref={storyScrollRef}
                sx={{
                    display: "flex",
                    overflowX: "auto",
                    gap: 2.8,
                    width: '100%',
                    py: 2,
                    px: 1.5,
                    alignItems: 'center',
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                    // backgroundColor: '#1d4c8f',
                    borderRadius: 10,
                    mr: 2,
                    backgroundColor: "#073574",
                    ml: 1.5,

                }}
            >
                {(() => {

                    if (myStories) {
                        return (
                            <Box
                                sx={{ position: "relative", cursor: "pointer" }}
                                onClick={() => handleStoryClick(user, myStories.stories)}
                            >
                                <Avatar src={user?.profileImage} sx={{ width: { xs: 50, sm: 65, md: 65, lg: 65 }, height: { xs: 50, sm: 65, md: 65, lg: 65 }, border: "2px solid #ff4500", mb: 2 }} />
                                <AddIcon
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenStoryCamera(true);
                                    }}
                                    sx={{
                                        position: "absolute",
                                        top: { xs: 60, sm: 75, md: 75, lg: 75 },
                                        right: 25,
                                        backgroundColor: "white",
                                        borderRadius: "50%",
                                        fontSize: { xs: 15, sm: 18, md: 18, lg: 18 },
                                        color: "#ff4500",
                                    }}
                                />
                            </Box>
                        );
                    } else {
                        return (
                            <Box sx={{ position: "relative", cursor: "pointer" }} onClick={() => setOpenStoryCamera(true)}>
                                <Avatar src={user?.profileImage} sx={{ width: { xs: 50, sm: 65, md: 65, lg: 65 }, height: { xs: 50, sm: 65, md: 65, lg: 65 }, border: "2px solid #ff4500", mb: 2 }} />
                                <AddIcon
                                    sx={{
                                        position: "absolute",
                                        top: { xs: 60, sm: 75, md: 75, lg: 75 },
                                        right: 25,
                                        backgroundColor: "white",
                                        borderRadius: "50%",
                                        fontSize: { xs: 15, sm: 18, md: 18, lg: 18 },
                                        color: "#ff4500",
                                    }}
                                />
                            </Box>
                        );
                    }
                })()}

                {sortedUniqueUserStories.map(({ userId, stories }, index) => {
                    if (userId === user?._id) return null;
                    const storyUser = users.find((u) => u.id === userId);
                    if (!storyUser) return null;
                    const hasSeenAll = stories.every((s) => s.views?.includes(user?._id));
                    return (
                        <Box
                            key={index}
                            textAlign="center"
                            sx={{ cursor: "pointer" }}
                            onClick={() => handleStoryClick(storyUser, stories)}
                        >
                            <Avatar
                                src={storyUser.profileImage}
                                sx={{
                                    width: { xs: 50, sm: 65, md: 65, lg: 65 },
                                    height: { xs: 50, sm: 65, md: 65, lg: 65 },
                                    border: `3px solid ${hasSeenAll ? "gray" : "#ff4500"}`,
                                    margin: "0 auto",
                                }}
                            />
                            <Typography variant="caption" sx={{ mt: 0.5, color: 'white' }}>
                                {storyUser.name.split(" ")[0]}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            {sortedUniqueUserStories.length > 8 && (
                <IconButton
                    onClick={scrollRight}
                    sx={{
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',

                    }}
                >
                    <ArrowForwardIosIcon />
                </IconButton>
            )}

            <StoryViewer
                open={openStory}
                handleClose={() => setOpenStory(false)}
                currentStories={currentStories}
                currentIndexStory={currentIndexStory}
                storyUser={storyUser}
                user={user}
                handleProfile={(id) => window.location.href = `/profile/${id}`}
                fetchUserStats={() => { }}
                handleDeleteStory={handleDeleteStory}
                handlePrev={() => setCurrentIndexStory(i => (i > 0 ? i - 1 : 0))}
                handleNext={() => {
                    if (currentIndexStory < currentStories.length - 1) {
                        setCurrentIndexStory(i => i + 1);
                    } else {
                        const currentUserIndex = sortedUniqueUserStories.findIndex(
                            u => u.userId === storyUser?.id || u.userId === storyUser?._id
                        );
                        const nextUserGroup = sortedUniqueUserStories[currentUserIndex + 1];
                        if (nextUserGroup) {
                            const nextUser = users.find(u => u.id === nextUserGroup.userId);
                            if (nextUser) {
                                setOpenStory(false);
                                setTimeout(() => {
                                    setStoryUser(nextUser);
                                    setCurrentStories(nextUserGroup.stories);
                                    setCurrentIndexStory(0);
                                    setOpenStory(true);
                                }, 100);
                            }
                        } else {
                            setOpenStory(false);
                        }
                    }
                }}
                handleNextUser={() => {
                    const currentUserIndex = sortedUniqueUserStories.findIndex(
                        u => u.userId === storyUser?.id || u.userId === storyUser?._id
                    );
                    const nextUserGroup = sortedUniqueUserStories[currentUserIndex + 1];
                    if (nextUserGroup) {
                        const nextUser = users.find(u => u.id === nextUserGroup.userId);
                        if (nextUser) {
                            setStoryUser(nextUser);
                            setCurrentStories(nextUserGroup.stories);
                            setCurrentIndexStory(0);
                        }
                    } else {
                        setOpenStory(false); // No more stories
                    }
                }}
            />
            <Modal open={openStoryCamera} onClose={() => setOpenStoryCamera(false)}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        p: 2,
                    }}
                >
                    <CameraCapture userId={user._id} onMediaUpload={handleImageUpload} />
                </Box>
            </Modal>
        </Box>
    );
};

export default StoryBar;