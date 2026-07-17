import { login } from "../services/authServices.js";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";


function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const auth = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    try {
      const loggedUser = await login(email, password);
      auth.setUser(loggedUser);
      navigate('/admin');

    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <>
      <section className="login-page">
        <h2>Formulaire de connexion</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label htmlFor="email">Email*</label>
            <input
              id="email"
              className="input"
              type="email"
              name="email"
              placeholder="Entre ton email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Mot de passe*</label>
            <input
              id="password"
              className="input"
              type="password"
              name="password"
              placeholder="Entre ton mot de passe"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {errorMessage !== "" && <p className="alert-error">{errorMessage}</p>}

          <button onClick={handleSubmit} className="btn">
            Se connecter
          </button>
        </form>
      </section>
    </>
  );
}

export default LoginPage;
