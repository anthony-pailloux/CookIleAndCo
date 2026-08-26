// Memoire de connexion. Toute l app peut lire user avec useAuth().
import { createContext, useContext, useState } from "react";
import { getCurrentUser } from "../services/authServices.js";

const AuthContext = createContext(null);

// Pose AuthProvider autour de App dans main.jsx.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Demande au serveur si un admin est encore connecte.
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

// Petit raccourci pour lire user depuis une page.
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}
