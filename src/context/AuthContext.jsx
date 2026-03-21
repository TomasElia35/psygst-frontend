import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('psygst_user');
        return stored ? JSON.parse(stored) : null;
    });

    const login = useCallback(async (username, password) => {
        const { data } = await api.post('/auth/login', { username, password });
        localStorage.setItem('psygst_token', data.token);
        localStorage.setItem('psygst_user', JSON.stringify(data));
        setUser(data);
        return data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('psygst_token');
        localStorage.removeItem('psygst_user');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
