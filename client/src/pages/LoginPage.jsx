// Page connexion admin v1 — email + mot de passe, redirection /admin après succès.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function LoginPage() {
    const auth = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await auth.login(email, password);
            console.log('LoginPage — connexion ok');
            navigate('/admin');
        } catch (err) {
            let message;
            if (err.message) {
                message = err.message;
            } else {
                message = 'Identifiants invalides';
            }
            setError(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main>
            <h1>Connexion</h1>
            <p>Cook&apos;île &amp; Co — espace administrateur</p>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={function (event) {
                            setEmail(event.target.value);
                        }}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password">Mot de passe</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={function (event) {
                            setPassword(event.target.value);
                        }}
                        required
                    />
                </div>

                {error && <p role="alert">{error}</p>}

                <button type="submit" disabled={submitting}>
                    Se connecter
                </button>
            </form>
        </main>
    );
}

export default LoginPage;
