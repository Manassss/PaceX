import React, { createContext, useContext, useState } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider to wrap around the app
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);  // User state

    // Function to log in and set user data
    const login = (userData) => {
        console.log('Setting user in AuthContext:', userData);  // Debugging line
        setUser(userData);
    };

    // Function to log out
    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);