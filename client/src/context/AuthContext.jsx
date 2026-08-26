// Memoire de connexion. Toute l app peut lire admin avec useAuth().
import { createContext, useContext, useState } from "react";
import { getCurrentAdmin } from "../services/authServices.js";

const AuthContext = createContext(null);

// Pose AuthProvider autour de App dans main.jsx.
export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);

  // Demande au serveur si un admin est encore connecte.
  async function loadSession() {
    setLoading(true);

    try {
      const data = await getCurrentAdmin();

      setAdmin(data);
    } catch (error) {
      setAdmin(null);
    }
    setLoading(false);
  }

  const contextValue = { admin, loading, loadSession, setAdmin };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Petit raccourci pour lire admin depuis une page.
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}
