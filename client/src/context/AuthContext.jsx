// État de connexion partagé dans toute l'app React.

import { createContext, useContext, useState } from "react";
import { getCurrentUser } from "../services/authServices.js";

const AuthContext = createContext(null);

// Enveloppe l'app dans main.jsx.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Vérifie si un admin est encore connecté.
  async function loadSession() {
    setLoading(true);

    try {
      const data = await getCurrentUser();

      setUser(data);
    } catch (error) {
      setUser(null);
    }
    setLoading(false);
  }

  const contextValue = { user, loading, loadSession, setUser };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Donne user et loading à la page qui appelle useAuth().
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}
