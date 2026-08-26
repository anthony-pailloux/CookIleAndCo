// Filtre admin. Si personne n est connecte, on renvoie a l accueil.
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function AdminRoute() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const auth = useAuth();

  // Session pour bloquer le dashboard si personne n est connecte.
  useEffect(() => {
    async function checkSession() {
      await auth.loadSession();
      setSessionChecked(true);
    }
    checkSession();
  }, []);

  if (auth.loading === true || sessionChecked === false) {
    return <p>Chargement...</p>;
  }
  if (auth.admin === null) {
    return <Navigate to="/" replace />;
  }

  // Ici s affiche la page enfant (dashboard ou formulaire recette).
  return (
    <>
      <Outlet />
    </>
  );
}

export default AdminRoute;
