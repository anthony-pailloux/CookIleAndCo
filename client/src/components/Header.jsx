import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Header.css";
import logoCookIle from "../assets/logo-cook-ile-co-cuisine-du-monde-horizontal.webp";
import { useAuth } from "../context/AuthContext.jsx";
import { logout } from "../services/authServices.js";

function getNavLinkClass({ isActive }) {
  if (isActive) {
    return "site-header__link site-header__link--active";
  } else {
    return "site-header__link";
  }
}

function Header() {
  const auth = useAuth();

  useEffect(function () {
    auth.loadSession();
  }, []);

  async function handleLogout() {
    await logout();
    auth.setUser(null);
  }

  let isAdmin = false;
  if (auth.user !== null && auth.user.role === "admin") {
    isAdmin = true;
  }
  return (
    <header className="site-header bg-green-textured">
      <div className="site-header__inner">
        <Link to="/" className="site-header__logo-link">
          <img
            src={logoCookIle}
            alt="Cook'île & Co — logo"
            className="site-header__logo"
            width={720}
            height={276}
            decoding="async"
          />
        </Link>

        <nav className="site-header__nav" aria-label="Navigation principale">
          <NavLink to="/" end className={getNavLinkClass}>
            Accueil
          </NavLink>

          <NavLink to="/recettes" className={getNavLinkClass}>
            Recettes
          </NavLink>

          <NavLink to="/categories" className={getNavLinkClass}>
            Catégories
          </NavLink>

          {isAdmin === true && (
            <NavLink to="/dashbord-admins" className={getNavLinkClass}>
              Dashboard
            </NavLink>
          )}
        </nav>

        {isAdmin === true && (
          <button
            type="button"
            className="site-header__logout-btn"
            onClick={handleLogout}
          >
            Déconnexion
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
