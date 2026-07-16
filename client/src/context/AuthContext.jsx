// Centralise l'état de connexion (user connecté ou null) pour toute l'app React.
// AuthProvider enveloppe l'app dans main.jsx ; loadSession interroge GET /api/auth/current-user.
// useAuth() permet à n'importe quelle page de lire user et loading sans re-fetch partout.
import { createContext, useContext, useState } from "react";
import {  getCurrentUser } from '../services/authServices.js'

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    async function loadSession() {     
        setLoading(true);

        try {
            const data = await  getCurrentUser();
            console.log(data);
            setUser(data);
        } catch (error) {
            setUser(null);
            console.log(error.message);
            
        }
        setLoading(false);
    }
    
    const contextValue = { user, loading, loadSession, setUser }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth doit être utilisé dans un AuthProvider");
    }
    return context;
}