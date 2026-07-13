// Contexte auth v1 : état admin, loadSession au montage AdminRoute (pas au boot global).
import { createContext, useContext, useState } from 'react';
import { getCurrentUser, login as loginApi, logout as logoutApi } from '../services/authServices.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // appelé par AdminRoute pour restaurer la session après F5
    async function loadSession() {
        setLoading(true);
        try {
            const data = await getCurrentUser();
            console.log('AuthContext — loadSession:', data);
            setUser(data);
        } catch (error) {
            console.log('AuthContext — pas de session:', error.message);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    function setUserFromLogin(data) {
        setUser(data);
    }

    async function login(email, password) {
        const data = await loginApi(email, password);
        setUser(data);
        return data;
    }

    async function logout() {
        await logoutApi();
        setUser(null);
    }

    const value = {
        user: user,
        loading: loading,
        loadSession: loadSession,
        setUserFromLogin: setUserFromLogin,
        login: login,
        logout: logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé dans AuthProvider');
    }
    return context;
}
