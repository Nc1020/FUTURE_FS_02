import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Optionally verify token with backend here or just decode it
            // For simple MVP we just assume if token exists, we are logged in.
            // But better to decode to get role.
            try {
                // simple decode for role if needed, or just set true
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ ...payload.user, token });
            } catch (e) {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        setUser({ ...userData, token });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
