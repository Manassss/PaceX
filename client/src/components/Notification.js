import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

// Create or import a socket instance
const socket = io("http://localhost:5001", {
    transports: ["websocket"],
    // withCredentials, extraHeaders, etc. if needed
});

function Notifications({ userId }) {
    useEffect(() => {
        if (!userId) return;  // Only listen if userId is defined

        const eventName = `notification-${userId}`;
        console.log(`Notifications: Subscribing to "${eventName}"`);

        const handleNotification = (notification) => {
            console.log("Received Notification:", notification);
            // Show a toast pop-up
            toast.info(
                `New notification from ${notification.sender} - ${notification.type}`,
                {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                }
            );
        };

        // Listen for notifications from the server
        socket.on(eventName, handleNotification);

        // Cleanup when userId changes or component unmounts
        return () => {
            socket.off(eventName, handleNotification);
        };
    }, [userId]);

    // This component doesn't render anything visible — it just handles socket events.
    return null;
}

export default Notifications;