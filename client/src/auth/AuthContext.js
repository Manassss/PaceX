// src/auth/AuthContext.js
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef
} from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import axios from 'axios';
import { updateProfile as fbUpdate } from "firebase/auth";

async function updateProfile(updates) {
    const auth = getAuth();
    if (!auth.currentUser) throw new Error("No user");
    return fbUpdate(auth.currentUser, {
      displayName: updates.name,
      photoURL:    updates.profileImage
    });
  }
  

const AuthContext = createContext({
    user: null,
    loading: true,
    login: () => { },
    logout: () => { },
    updateProfile,
    
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const logoutTimer = useRef(null);

    const clearTimer = () => {
        if (logoutTimer.current) {
            clearTimeout(logoutTimer.current);
            logoutTimer.current = null;
        }
    };

    const scheduleLogout = (ms) => {
        clearTimer();
        logoutTimer.current = setTimeout(() => {
            doLogout();
        }, ms);
    };

    // called by your Login form after backend login succeeds
    const login = (apiUser) => {
        setUser(apiUser);
        setPosts(apiUser.posts || []);

        // stamp a hard expiry 1h from now
        const now = Date.now();
        const expiry = now + 60 * 60 * 1000;
        localStorage.setItem('loginExpiry', String(expiry));

        // schedule the auto‑logout
        scheduleLogout(expiry - now);
    };

    const doLogout = async () => {
        const auth = getAuth();
        await signOut(auth);
        setUser(null);
        clearTimer();
        localStorage.removeItem('loginExpiry');
    };

    // if you ever need a manual logout button:
    const logout = () => doLogout();

    useEffect(() => {
        const auth = getAuth();
        const unsub = onAuthStateChanged(auth, async (fbUser) => {
            // 1) no firebase user at all → just clear
            if (!fbUser) {
                setLoading(false);
                return;
            }

            const now = Date.now();
            const expiryStr = localStorage.getItem('loginExpiry');

            if (expiryStr) {
                const expiry = parseInt(expiryStr, 10);
                if (now < expiry) {
                    // still valid: re‑hydrate your API user
                    try {
                        const idToken = await fbUser.getIdToken();
                        const res = await axios.post(
                            'http://localhost:5001/api/users/login',
                            { idToken }
                        );
                        setUser(res.data.user);
                        setPosts(res.data.user.posts || []);

                        // schedule the remaining time
                        scheduleLogout(expiry - now);
                    } catch (err) {
                        console.error('Rehydrate failed, logging out:', err);
                        doLogout();
                    }
                } else {
                    // expired → sign out
                    doLogout();
                }
            } else {
                // NO expiry found (e.g. you just refreshed mid‑session)
                // treat as “fresh login”: re‑hydrate + stamp a new hour
                try {
                    const idToken = await fbUser.getIdToken();
                    const res = await axios.post(
                        'http://localhost:5001/api/users/login',
                        { idToken }
                    );
                    login(res.data.user);
                } catch (err) {
                    console.error('Fresh rehydrate failed:', err);
                    doLogout();
                }
            }

            setLoading(false);
        });

        return unsub;
    }, []);

    useEffect(() => {
      if (!user || !user._id) {
        setPosts([]);
        return;
      }
      // Fetch posts for the logged-in user
      axios.get(`http://localhost:5001/api/posts/${user._id}`)
        .then(res => setPosts(res.data))
        .catch(err => console.error('Error fetching user posts:', err));
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, loading, posts, setPosts, login, logout, updateProfile }}>
            {/* don’t render children until we know if we auto‑logged in or out */}
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);