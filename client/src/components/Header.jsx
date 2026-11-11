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
  const headerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  // Session ici pour afficher Dashboard si un admin est encore connecte.
  useEffect(function () {
    auth.loadSession();
  }, []);

  // Transparent seulement après avoir défilé toute la hauteur du header.
  useEffect(function () {
    function updateScrolledState() {
      let headerHeight = 0;

      if (headerRef.current !== null) {
        headerHeight = headerRef.current.offsetHeight;
      }

      if (headerHeight > 0 && window.scrollY >= headerHeight) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    }

    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState);
    window.addEventListener("resize", updateScrolledState);

    return function removeScrollListeners() {
      window.removeEventListener("scroll", updateScrolledState);
      window.removeEventListener("resize", updateScrolledState);
    };
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

  // Un changement de page referme le menu mobile.
  useEffect(
    function () {
      setIsMenuOpen(false);
    },
    [location.pathname],
  );

  // Echap ferme la recherche ou le menu, meme si le focus est ailleurs.
  useEffect(
    function () {
      if (isSearchOpen === false && isMenuOpen === false) {
        return;
      }

      function handleEscape(event) {
        if (event.key === "Escape") {
          event.preventDefault();
          setIsSearchOpen(false);
          setIsMenuOpen(false);
        }
      }

      document.addEventListener("keydown", handleEscape);

      return function removeEscapeListener() {
        document.removeEventListener("keydown", handleEscape);
      };
    },
    [isSearchOpen, isMenuOpen],
  );

  // Un clic en dehors du header referme le menu mobile.
  useEffect(
    function () {
      if (isMenuOpen === false) {
        return;
      }

      function handlePointerDown(event) {
        if (headerRef.current === null) {
          return;
        }

        if (headerRef.current.contains(event.target) === false) {
          setIsMenuOpen(false);
        }
      }

      document.addEventListener("pointerdown", handlePointerDown);

      return function removePointerDown() {
        document.removeEventListener("pointerdown", handlePointerDown);
      };
    },
    [isMenuOpen],
  );

  async function handleLogout() {
    setIsMenuOpen(false);
    await logout();
    auth.setAdmin(null);
  }

  function handleToggleSearch() {
    if (isSearchOpen === true) {
      setIsSearchOpen(false);
    } else {
      setIsMenuOpen(false);
      setSearchText(readRecipeSearch(location));
      setIsSearchOpen(true);
    }
  }

  function handleToggleMenu() {
    if (isMenuOpen === true) {
      setIsMenuOpen(false);
    } else {
      setIsSearchOpen(false);
      setIsMenuOpen(true);
    }
  }

  function handleNavClick(event) {
    if (event.target.closest("a") !== null) {
      setIsMenuOpen(false);
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

  let menuToggleLabel = "Ouvrir le menu";
  if (isMenuOpen === true) {
    menuToggleLabel = "Fermer le menu";
  }

  let navClassName = "site-header__nav";
  if (isMenuOpen === true) {
    navClassName = "site-header__nav site-header__nav--open";
  }

  let headerClassName = "site-header bg-green-textured";
  if (isScrolled === true) {
    headerClassName = "site-header bg-green-textured site-header--scrolled";
  }

  let menuIcon;
  if (isMenuOpen === true) {
    menuIcon = (
      <svg
        className="site-header__menu-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden="true"
        focusable="false"
      >
        <line
          x1="6"
          y1="6"
          x2="18"
          y2="18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="18"
          y1="6"
          x2="6"
          y2="18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  } else {
    menuIcon = (
      <svg
        className="site-header__menu-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden="true"
        focusable="false"
      >
        <line
          x1="4"
          y1="7"
          x2="20"
          y2="7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="4"
          y1="12"
          x2="20"
          y2="12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="4"
          y1="17"
          x2="20"
          y2="17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <header ref={headerRef} className={headerClassName}>
      <div className="site-header__inner">
        <button
          type="button"
          className="site-header__menu-toggle"
          aria-label={menuToggleLabel}
          aria-expanded={isMenuOpen}
          aria-controls="site-header-menu"
          onClick={handleToggleMenu}
        >
          {menuIcon}
        </button>

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

        <nav
          id="site-header-menu"
          className={navClassName}
          aria-label="Navigation principale"
          onClick={handleNavClick}
        >
          <NavLink to="/" end className={getNavLinkClass}>
            Accueil
          </NavLink>

          <NavLink to="/recettes" className={getNavLinkClass}>
            Recettes
          </NavLink>

          <NavLink to="/categories" className={getNavLinkClass}>
            Catégorie et origine
          </NavLink>

          {auth.admin !== null && (
            <NavLink to="/dashboard-admins" className={getNavLinkClass}>
              Dashboard
            </NavLink>
          )}

          {auth.admin !== null && (
            <button
              type="button"
              className="site-header__logout-btn site-header__logout-btn--menu"
              onClick={handleLogout}
            >
              Déconnexion
            </button>
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
              className="site-header__logout-btn site-header__logout-btn--bar"
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
