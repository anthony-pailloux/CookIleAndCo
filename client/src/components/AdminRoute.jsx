// Protège les routes /admin : vérifie la session au montage, redirige vers /connexion si besoin.
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function AdminRoute({ children }) {
    const auth = useAuth();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        async function checkSession() {
            await auth.loadSession();
            setReady(true);
        }
        checkSession();
    }, []);

    if (!ready || auth.loading) {
        return <p>Chargement…</p>;
    }

    if (!auth.user || auth.user.role !== 'admin') {
        return <Navigate to="/connexion" replace />;
    }

    return children;
}

export default AdminRoute;
