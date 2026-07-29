// En-tête du site — logo + navigation principale
import { Link, NavLink } from "react-router-dom";
import "./Header.css";
import logoCookIle from "../assets/logo-cook-ile-co-cuisine-du-monde-horizontal.webp";

function Header() {
  return (
    <header className="site-header bg-green-textured">
      <div className="site-header__inner">
        <Link to="/" className="site-header__logo-link">
          <img
            src={logoCookIle}
            alt="Cook'île & Co — logo"
            className="site-header__logo"
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
      </div>
    </header>
  );
}

export default Header;