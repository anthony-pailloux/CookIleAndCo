import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
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

// q deja present sur le catalogue ou le dashboard, pour pre-remplir le champ.
function readRecipeSearch(location) {
  let searchText = "";

  if (
    location.pathname === "/recettes" ||
    location.pathname === "/dashboard-admins"
  ) {
    const params = new URLSearchParams(location.search);
    const queryFromUrl = params.get("q");

    if (queryFromUrl !== null) {
      searchText = queryFromUrl;
    }
  }

  return searchText;
}

function Header() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Session ici pour afficher Dashboard si un admin est encore connecte.
  useEffect(function () {
    auth.loadSession();
  }, []);

  // Le champ prend le focus des que le panneau s ouvre.
  useEffect(
    function () {
      if (isSearchOpen === true && searchInputRef.current !== null) {
        searchInputRef.current.focus();
      }
    },
    [isSearchOpen],
  );

  // Echap ferme le panneau, y compris si le focus n est plus dans le champ.
  useEffect(
    function () {
      if (isSearchOpen === false) {
        return;
      }

      function handleEscape(event) {
        if (event.key === "Escape") {
          event.preventDefault();
          setIsSearchOpen(false);
        }
      }

      document.addEventListener("keydown", handleEscape);

      return function removeEscapeListener() {
        document.removeEventListener("keydown", handleEscape);
      };
    },
    [isSearchOpen],
  );

  async function handleLogout() {
    await logout();
    auth.setAdmin(null);
  }

  function handleToggleSearch() {
    if (isSearchOpen === true) {
      setIsSearchOpen(false);
    } else {
      setSearchText(readRecipeSearch(location));
      setIsSearchOpen(true);
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    const trimmed = searchText.trim();
    const pathname = location.pathname;

    if (pathname === "/recettes") {
      const nextParams = new URLSearchParams(location.search);

      if (trimmed === "") {
        nextParams.delete("q");
      } else {
        nextParams.set("q", trimmed);
      }

      // Meme effet que l ancien formulaire : une recherche repart de la page 1.
      nextParams.delete("page");

      navigate({
        pathname: "/recettes",
        search: nextParams.toString(),
      });
    } else if (pathname === "/dashboard-admins") {
      const nextParams = new URLSearchParams(location.search);

      // section=admins est l onglet comptes. Le resultat se voit sur les recettes.
      if (nextParams.get("section") === "admins") {
        nextParams.delete("section");
      }

      if (trimmed === "") {
        nextParams.delete("q");
      } else {
        nextParams.set("q", trimmed);
      }

      navigate({
        pathname: "/dashboard-admins",
        search: nextParams.toString(),
      });
    } else {
      const nextParams = new URLSearchParams();

      if (trimmed !== "") {
        nextParams.set("q", trimmed);
      }

      navigate({
        pathname: "/recettes",
        search: nextParams.toString(),
      });
    }

    setIsSearchOpen(false);
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsSearchOpen(false);
    }
  }

  let searchToggleLabel = "Rechercher une recette";
  if (isSearchOpen === true) {
    searchToggleLabel = "Fermer la recherche";
  }

  let searchToggleClass = "site-header__search-toggle";
  if (isSearchOpen === true) {
    searchToggleClass =
      "site-header__search-toggle site-header__search-toggle--open";
  }

  let searchControls;
  if (isSearchOpen === true) {
    searchControls = "site-header-search";
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

          {auth.admin !== null && (
            <NavLink to="/dashboard-admins" className={getNavLinkClass}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="site-header__actions">
          <div className="site-header__search">
            <button
              type="button"
              className={searchToggleClass}
              aria-label={searchToggleLabel}
              aria-expanded={isSearchOpen}
              aria-controls={searchControls}
              onClick={handleToggleSearch}
            >
              <svg
                className="site-header__search-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                aria-hidden="true"
                focusable="false"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="6.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="16"
                  y1="16"
                  x2="21"
                  y2="21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {isSearchOpen === true && (
              <form
                className="site-header__search-panel"
                role="search"
                onSubmit={handleSearchSubmit}
              >
                <input
                  id="site-header-search"
                  ref={searchInputRef}
                  className="site-header__search-input"
                  type="search"
                  maxLength={80}
                  placeholder="Rechercher une recette…"
                  aria-label="Rechercher une recette"
                  autoComplete="off"
                  value={searchText}
                  onChange={function (event) {
                    setSearchText(event.target.value);
                  }}
                  onKeyDown={handleSearchKeyDown}
                />
              </form>
            )}
          </div>

          {auth.admin !== null && (
            <button
              type="button"
              className="site-header__logout-btn"
              onClick={handleLogout}
            >
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
