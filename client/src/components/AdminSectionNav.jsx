// Navigation des sections du dashboard admin.
// Le bouton actif suit l'adresse courante, avec les mêmes classes que l'ancien onglet.
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

// Les administrateurs restent sur /dashboard-admins : le parametre distingue l'onglet.
function isAdminsDashboardSection(search) {
  const params = new URLSearchParams(search);

  if (params.get("section") === "admins") {
    return true;
  } else {
    return false;
  }
}

function getSectionClassName(isActive) {
  if (isActive) {
    return "admin-page__tab admin-page__tab--active";
  } else {
    return "admin-page__tab";
  }
}

function AdminSectionNav() {
  const location = useLocation();
  const pathname = location.pathname;
  const toolbarRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // La bordure n'existe que lorsque la barre est collée en haut de l'écran.
  useEffect(() => {
    function updateScrolledState() {
      let toolbar = toolbarRef.current;

      if (toolbar) {
        // 100vw compte la barre de défilement : on la retire pour un trait bord à bord.
        let scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth < 0) {
          scrollbarWidth = 0;
        }
        document.documentElement.style.setProperty(
          "--admin-scrollbar",
          scrollbarWidth + "px"
        );

        let toolbarTop = toolbar.getBoundingClientRect().top;
        if (toolbarTop <= 1) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
      }
    }

    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState);
    window.addEventListener("resize", updateScrolledState);

    return function removeScrollListener() {
      window.removeEventListener("scroll", updateScrolledState);
      window.removeEventListener("resize", updateScrolledState);
      document.documentElement.style.removeProperty("--admin-scrollbar");
    };
  }, []);

  // Link, pas NavLink : NavLink ne compare que le chemin.
  // « Mes recettes » et « Administrateurs » partagent /dashboard-admins.
  // La création allume seulement « Ajouter une recette ».
  // La modification (/recettes/:id/modifier) laisse « Mes recettes » actif.
  let recipesActive = false;
  let createRecipeActive = false;
  let adminsActive = false;
  let referencesActive = false;

  if (pathname === "/dashboard-admins/recettes/nouvelle") {
    createRecipeActive = true;
  } else if (pathname.startsWith("/dashboard-admins/referentiels")) {
    referencesActive = true;
  } else if (
    pathname === "/dashboard-admins" &&
    isAdminsDashboardSection(location.search) === true
  ) {
    adminsActive = true;
  } else if (pathname === "/dashboard-admins") {
    recipesActive = true;
  } else if (pathname.startsWith("/dashboard-admins/recettes")) {
    recipesActive = true;
  }

  let recipesClassName = getSectionClassName(recipesActive);
  let createRecipeClassName = getSectionClassName(createRecipeActive);
  let adminsClassName = getSectionClassName(adminsActive);
  let referencesClassName = getSectionClassName(referencesActive);

  let recipesAriaCurrent;
  if (recipesActive) {
    recipesAriaCurrent = "page";
  }

  let createRecipeAriaCurrent;
  if (createRecipeActive) {
    createRecipeAriaCurrent = "page";
  }

  let adminsAriaCurrent;
  if (adminsActive) {
    adminsAriaCurrent = "page";
  }

  let referencesAriaCurrent;
  if (referencesActive) {
    referencesAriaCurrent = "page";
  }

  let toolbarClassName = "admin-page__toolbar";
  if (isScrolled) {
    toolbarClassName = "admin-page__toolbar admin-page__toolbar--scrolled";
  }

  return (
    <nav
      ref={toolbarRef}
      className={toolbarClassName}
      aria-label="Sections du dashboard"
    >
      <div className="admin-page__tabs">
        <Link
          to="/dashboard-admins"
          id="admin-tab-recipes"
          className={recipesClassName}
          aria-current={recipesAriaCurrent}
        >
          Mes recettes
        </Link>
        <Link
          to="/dashboard-admins/recettes/nouvelle"
          id="admin-tab-create-recipe"
          className={createRecipeClassName}
          aria-current={createRecipeAriaCurrent}
        >
          Ajouter une recette
        </Link>
        <Link
          to="/dashboard-admins/referentiels"
          className={referencesClassName}
          aria-current={referencesAriaCurrent}
        >
          Catégories, origines, repas
        </Link>
        <Link
          to="/dashboard-admins?section=admins"
          id="admin-tab-admins"
          className={adminsClassName}
          aria-current={adminsAriaCurrent}
        >
          Administrateurs
        </Link>
      </div>
    </nav>
  );
}

export default AdminSectionNav;
export { isAdminsDashboardSection };
