// Dashboard admin v1 (stub) — affiche l'admin connecté et permet la déconnexion.
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function AdminPage() {
    const auth = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await auth.logout();
        console.log('AdminPage — déconnexion ok');
        navigate('/connexion');
    }

    return (
        <main>
            <header>
                <h1>Dashboard admin</h1>
                <p>Connecté : {auth.user.email}</p>
                <button type="button" onClick={handleLogout}>
                    Se déconnecter
                </button>
            </header>
            <p>Espace administration — CRUD recettes à venir (TCK-301).</p>
        </main>
    );
}

export default AdminPage;
