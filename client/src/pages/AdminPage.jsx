import { useAuth } from "../context/AuthContext.jsx";
import { logout } from "../services/authServices.js";

function AdminPage() {
  const auth = useAuth();

  async function handleLogout() {
    await logout();
    auth.setUser(null);
  }

  return (
    <>
      <div>
        <h2>"Le Dashboard de Tetelle"</h2>
        <p>{auth.user.email}</p>
        <button onClick={handleLogout} className="btn">Déconnexion</button>
      </div>
    </>
  );
}

export default AdminPage;
