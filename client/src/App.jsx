import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AdminRoute from './components/AdminRoute.jsx';

function App() {
    return (
        <>
            <nav>
                <Link to="/">Accueil</Link>
                <Link to="/connexion">Connexion</Link>
                <Link to="/admin">Admin</Link>
            </nav>

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/connexion" element={<LoginPage />} />
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminPage />
                        </AdminRoute>
                    }
                />
            </Routes>
        </>
    );
}

export default App;
