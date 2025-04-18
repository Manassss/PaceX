import React, { useRef, useState, useEffect } from 'react';
import {
    Box,
    Modal,
    Typography,
    IconButton,
    Avatar,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useAuth } from '../../auth/AuthContext';
import axios
    from 'axios';
const StoryViewer = ({
    open,
    handleClose,
    currentStories,
    currentIndexStory,
    storyUser,
    handleProfile,
    //fetchViewers,
    handleDeleteStory,
    handlePrev,
    handleNext
}) => {
    //     const [stories, setStories] = useState([]);
    // const [openStory, setOpenStory] = useState(false);
    // const [currentStories, setCurrentStories] = useState([]);
    // const [currentIndexStory, setCurrentIndexStory] = useState(0);
    // const [storyUser, setstoryUser] = useState(null);
    const [viewers, setViewers] = useState([]);
    const [showViewers, setShowViewers] = useState(false);
    // const storyScrollRef = useRef(null);
    const { user } = useAuth()
    const [progress, setProgress] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);
    const videoRef = useRef(null);
    const metadataLoadedRef = useRef(false);
    const videoReadyRef = useRef(false);
    const [isVideoReady, setIsVideoReady] = useState(false); // NEW
    const [canAutoAdvance, setCanAutoAdvance] = useState(false); // NEW

    const fetchViewers = async (storyId) => {
        try {
            const res = await axios.get(`http://localhost:5001/api/story/views/${storyId}`);
            setViewers(res.data);
            setShowViewers(true);
        } catch (err) {
            console.error("Error fetching story viewers:", err);
        }
    };

    useEffect(() => {
        metadataLoadedRef.current = false;
        videoReadyRef.current = false;
        setIsVideoReady(false);
        setCanAutoAdvance(false); // NEW
        setProgress(0);
        setVideoDuration(0);
    }, [currentIndexStory, currentStories]);

    useEffect(() => {
        setShowViewers(false);
        const currentStory = currentStories[currentIndexStory];
        let timer;

        if (!open || !currentStory) return;

        if (currentStory.mediaType === "image") {
            setProgress(0);
            let progressValue = 0;

            timer = setInterval(() => {
                progressValue += 1;
                setProgress(progressValue);
                if (progressValue >= 100) {
                    clearInterval(timer);
                    setTimeout(() => {
                        handleNext();
                    }, 100); // short buffer to avoid premature switch
                }
            }, 50);
        }

        if (currentStory.mediaType === "video") {
            setProgress(0);

            const checkDurationInterval = setInterval(() => {
                if (videoRef.current && videoRef.current.duration > 0) {

                    clearInterval(checkDurationInterval);
                    const videoDuration = videoRef.current.duration;
                    //console.log("vid", videoDuration);
                    let progressValue = 0;
                    const updateInterval = (videoDuration * 1000) / 100; // 100 steps = 10ms each step

                    videoRef.current.play();

                    timer = setInterval(() => {
                        progressValue += 1;
                        setProgress(progressValue);
                        if (progressValue >= 100) {
                            clearInterval(timer);
                            setTimeout(() => {
                                handleNext();
                            }, 100);
                        }
                    }, updateInterval);
                }
            }, 100);
        }
        console.log("Showing story index:", currentIndexStory, currentStories[currentIndexStory]);
        return () => clearInterval(timer);
    }, [currentIndexStory, open]);

    const waitForDuration = (videoEl, callback) => {
        const check = setInterval(() => {
            if (videoEl.duration && !isNaN(videoEl.duration) && videoEl.duration !== Infinity) {
                clearInterval(check);
                callback(videoEl.duration);
            }
        }, 100);
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "25%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    width: 430,
                    height: 800,
                    bgcolor: "black",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 2,
                    overflow: "hidden",
                    mt: 30,
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "4px",
                        backgroundColor: "rgba(255,255,255,0.3)",
                        zIndex: 10,
                    }}
                >
                    <Box
                        sx={{
                            width: `${progress}%`,
                            height: "100%",
                            backgroundColor: "#ff4500",
                            transition: progress === 0 ? "none" : "width 0.2s linear",
                        }}
                    />
                </Box>

                {currentStories.length > 0 && (
                    currentStories[currentIndexStory].mediaType === "video" ? (
                        <video
                            ref={videoRef}
                            key={`story-${currentIndexStory}`}
                            src={currentStories[currentIndexStory].mediaUrl}
                            muted
                            controls={false}
                            onLoadedMetadata={() => {
                                const videoEl = videoRef.current;
                                if (!videoEl) return;

                                setProgress(0);

                                waitForDuration(videoEl, (duration) => {
                                    let progressValue = 0;
                                    const updateInterval = (duration * 1000) / 100;

                                    videoEl.play().catch((err) => console.error("Playback error:", err));

                                    const timer = setInterval(() => {
                                        progressValue += 1;
                                        setProgress(progressValue);
                                        if (progressValue >= 100) {
                                            clearInterval(timer);
                                            setTimeout(() => {
                                                handleNext();
                                            }, 100);
                                        }
                                    }, updateInterval);
                                });
                            }}

                            onEnded={() => {
                                //  setProgress(0);
                                setTimeout(() => {
                                    handleNext();
                                }, 100); // small buffer
                            }}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                borderRadius: 10,
                            }}
                        />
                    ) : (
                        <img
                            key={`story-${currentIndexStory}`}
                            src={currentStories[currentIndexStory].mediaUrl}
                            alt={`Story ${currentIndexStory + 1}`}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                borderRadius: 10,
                            }}
                        />
                    )
                )}

                {storyUser && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 10,
                            display: "flex",
                            gap: 1,
                            padding: "5px 10px",
                        }}
                    >
                        <Avatar
                            src={storyUser.profileImage}
                            sx={{ width: 30, height: 30, cursor: "pointer" }}
                            onClick={() => handleProfile(storyUser.userId)}
                        />
                        <Typography variant="h6" sx={{ color: "white" }}>
                            {storyUser.name?.split(" ")[0]}
                        </Typography>
                    </Box>
                )}
                {storyUser?.id === user?._id && (
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: "94%",
                            top: "5%",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <IconButton onClick={() => fetchViewers(currentStories[currentIndexStory].storyId)}>
                            <VisibilityIcon sx={{ color: "white" }} />
                        </IconButton>
                        <Typography sx={{ color: "white" }}>
                            {currentStories[currentIndexStory]?.viewsNumber ?? 0} views
                        </Typography>
                    </Box>
                )}

                {storyUser?._id === user?._id && (
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: "5%",
                            left: "38%",
                            display: "flex",
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <IconButton onClick={() => fetchViewers(currentStories[currentIndexStory].storyId)}>
                            <VisibilityIcon sx={{ color: "white" }} />
                        </IconButton>
                        <Typography sx={{ color: "white" }}>
                            {currentStories[currentIndexStory]?.viewsNumber ?? 0} views
                        </Typography>
                    </Box>
                )}

                <Box
                    sx={{
                        position: "absolute",
                        bottom: '10%',
                        left: "50%",
                        transform: "translateX(-50%)",
                    }}
                >
                    <Typography variant="subtitle2" sx={{ color: "white" }}>
                        {`${currentIndexStory + 1} of ${currentStories.length}`}
                    </Typography>
                </Box>

                <Box sx={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 1 }}>
                    {storyUser?._id === user?._id && (
                        <IconButton
                            onClick={() => handleDeleteStory(currentStories[currentIndexStory].storyId)}
                            sx={{
                                backgroundColor: "rgba(255, 0, 0, 0.7)",
                                color: "white",
                                "&:hover": { backgroundColor: "red" },
                            }}
                        >
                            <DeleteIcon sx={{ width: 20, height: 20 }} />
                        </IconButton>
                    )}
                </Box>

                {currentIndexStory > 0 && (
                    <IconButton
                        onClick={() => {
                            if (videoRef.current) videoRef.current.pause();
                            setTimeout(() => {
                                handlePrev();
                            }, 50);
                        }}
                        sx={{
                            position: "absolute",
                            left: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            backgroundColor: "rgba(255, 255, 255, 0.3)",
                            color: "white",
                        }}
                    >
                        <ArrowBackIosNewIcon />
                    </IconButton>
                )}

                {currentIndexStory < currentStories.length - 1 && (
                    <IconButton
                        onClick={() => {
                            if (videoRef.current) videoRef.current.pause();
                            setTimeout(() => {
                                handleNext();
                            }, 50);
                        }}
                        sx={{
                            position: "absolute",
                            right: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            backgroundColor: "rgba(255, 255, 255, 0.3)",
                            color: "white",
                        }}
                    >
                        <ArrowForwardIosIcon />
                    </IconButton>
                )}

                <Modal open={showViewers} onClose={() => setShowViewers(false)}>
                    <Box sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)", width: 400, bgcolor: "white", boxShadow: 24, borderRadius: 2, p: 2, bottom: "10%" }}>
                        <Typography variant="h6">Viewers</Typography>
                        <List>
                            {viewers.map((viewer) => (
                                <ListItem key={viewer.id}>
                                    <Avatar src={viewer.profileImage} sx={{ mr: 2 }} />
                                    <ListItemText primary={viewer.name} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Modal>

            </Box>
        </Modal>
    );
};

export default StoryViewer;
