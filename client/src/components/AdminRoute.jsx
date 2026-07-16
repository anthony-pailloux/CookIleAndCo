import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const auth = useAuth();

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
  if (auth.user === null || auth.user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Outlet />
    </>
  );
}

export default AdminRoute;
