import { Link, NavLink } from "react-router-dom";
import "./Header.css";
import logoCookIle from "../assets/logo-cook-ile-co-cuisine-du-monde-horizontal.webp";
import { useAuth } from "../context/AuthContext.jsx";
import { logout } from "../services/authServices.js";

function Header() {
  const auth = useAuth();

  async function handleLogout() {
    await logout();
    auth.setUser(null);
  }

  let showAdminLogout = false;
  if (auth.user !== null && auth.user.role === "admin") {
    showAdminLogout = true;
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
          <NavLink
            to="/"
            end
            className={({ isActive }) => {
              if (isActive) {
                return "site-header__link site-header__link--active";
              } else {
                return "site-header__link";
              }
            }}
          >
            Accueil
          </NavLink>

          <NavLink
            to="/recettes"
            className={({ isActive }) => {
              if (isActive) {
                return "site-header__link site-header__link--active";
              } else {
                return "site-header__link";
              }
            }}
          >
            Recettes
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) => {
              if (isActive) {
                return "site-header__link site-header__link--active";
              } else {
                return "site-header__link";
              }
            }}
          >
            Catégories
          </NavLink>
        </nav>

        {showAdminLogout === true && (
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
