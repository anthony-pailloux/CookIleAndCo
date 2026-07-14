import { useState } from "react";
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <section className="login-page">
        <h2>Formulaire de connexion</h2>

        <form action="" className="login-form">
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
            <label htmlFor="email">Mot de passe*</label>
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

          <button type="submit" className="btn">
            Se connecter
          </button>
        </form>
      </section>
    </>
  );
}

export default LoginPage;
