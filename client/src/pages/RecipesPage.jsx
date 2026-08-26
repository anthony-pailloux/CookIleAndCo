// Page catalogue paginée des recettes avec recherche et filtres.
import "./RecipePage.css";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getFromApi } from "../services/api.js";
import RecipeCard from "../components/RecipeCard.jsx";
import "../components/Button.css";

function RecipePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSearch = searchParams.get("q") || "";

  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);

  const [selectedMealType, setSelectedMealType] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchText, setSearchText] = useState(activeSearch);

  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Page courante lue depuis l'URL (?page=2)
  let currentPage = 1;
  const rawPage = searchParams.get("page");
  if (rawPage !== null && rawPage !== "") {
    const pageNumber = Number(rawPage);
    if (!Number.isNaN(pageNumber) && pageNumber > 0) {
      currentPage = pageNumber;
    }
  }

  function goToPage(pageNumber) {
    const nextParams = new URLSearchParams(searchParams);

    if (pageNumber <= 1) {
      nextParams.delete("page");
    } else {
      nextParams.set("page", String(pageNumber));
    }

    setSearchParams(nextParams);
  }

  // Écrit un paramètre dans l'URL sans écraser les autres (filtres + recherche)
  function applyQueryParam(paramName, value) {
    const nextParams = new URLSearchParams(searchParams);

    if (value === "") {
      nextParams.delete(paramName);
    } else {
      nextParams.set(paramName, value);
    }

    nextParams.delete("page");

    if (nextParams.toString() === "") {
      setSearchParams({});
    } else {
      setSearchParams(nextParams);
    }
  }

  function handleMealTypeChange(event) {
    const value = event.target.value;
    setSelectedMealType(value);
    applyQueryParam("repas", value);
  }

  function handleOriginChange(event) {
    const value = event.target.value;
    setSelectedOrigin(value);
    applyQueryParam("origine", value);
  }

  function handleCategoryChange(event) {
    const value = event.target.value;
    setSelectedCategory(value);
    applyQueryParam("categorie", value);
  }

  function applySearchToUrl(value) {
    const trimmed = value.trim();
    applyQueryParam("q", trimmed);
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    applySearchToUrl(searchText);
  }

  // Synchronise les filtres avec l'URL (?categorie=… & ?origine=… & ?repas=…)
  useEffect(() => {
    const categorieFromUrl = searchParams.get("categorie");
    const origineFromUrl = searchParams.get("origine");
    const repasFromUrl = searchParams.get("repas");

    if (categorieFromUrl !== null) {
      setSelectedCategory(categorieFromUrl);
    } else {
      setSelectedCategory("");
    }

    if (origineFromUrl !== null) {
      setSelectedOrigin(origineFromUrl);
    } else {
      setSelectedOrigin("");
    }

    if (repasFromUrl !== null) {
      setSelectedMealType(repasFromUrl);
    } else {
      setSelectedMealType("");
    }
  }, [searchParams]);

  // Charge les recettes selon page, recherche et filtres
  useEffect(() => {
    async function loadRecipes() {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("page", currentPage);
      params.set("limit", 12);

      if (selectedCategory !== "") {
        params.set("categorie", selectedCategory);
      }
      if (selectedOrigin !== "") {
        params.set("origine", selectedOrigin);
      }
      if (selectedMealType !== "") {
        params.set("repas", selectedMealType);
      }
      if (activeSearch !== "") {
        params.set("q", activeSearch);
      }

      const path = "/api/recipes?" + params.toString();

      try {
        const response = await getFromApi(path);
        setRecipes(response.data);
        setTotalPages(response.meta.totalPages);
      } catch (err) {
        setRecipes([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }

    loadRecipes();
  }, [
    currentPage,
    selectedCategory,
    selectedOrigin,
    selectedMealType,
    activeSearch,
  ]);

  // Charge origines, types de repas, catégories pour les selects
  useEffect(() => {
    async function loadFiltersData() {
      try {
        const originsResponse = await getFromApi("/api/origins");
        const mealTypesResponse = await getFromApi("/api/mealTypes");
        const categoriesResponse = await getFromApi("/api/categories");

        setOrigins(originsResponse.data);
        setMealTypes(mealTypesResponse.data);
        setCategories(categoriesResponse.data);
      } catch (err) {
        // Page publique : pas de toast, selects vides comme si aucune donnée
        setOrigins([]);
        setMealTypes([]);
        setCategories([]);
      }
    }
    loadFiltersData();
  }, []);

  // Boutons numéros de page
  const pageButtons = [];
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    let pageBtnClass = "recipes-page__pagination-page";
    if (pageNum === currentPage) {
      pageBtnClass =
        "recipes-page__pagination-page recipes-page__pagination-page--active";
    }

    pageButtons.push(
      <button
        key={pageNum}
        type="button"
        className={pageBtnClass}
        onClick={() => {
          goToPage(pageNum);
        }}
      >
        {pageNum}
      </button>,
    );
  }

  let contentMessage;
  if (loading) {
    contentMessage = <p className="recipes-page__status">Chargement...</p>;
  } else if (recipes.length === 0) {
    if (activeSearch !== "") {
      contentMessage = (
        <p className="recipes-page__status">
          Aucune recette trouvée pour « {activeSearch} ».
        </p>
      );
    } else {
      contentMessage = (
        <p className="recipes-page__status">Aucune recette pour le moment.</p>
      );
    }
  }

  return (
    <main className="recipes-page">
      <h1 className="recipes-page__title">Toutes les recettes</h1>

      <form className="recipes-page__search" onSubmit={handleSearchSubmit}>
        <input
          className="recipes-page__search-input"
          type="search"
          placeholder="Rechercher une recette..."
          value={searchText}
          onChange={(event) => {
            const value = event.target.value;
            setSearchText(value);

            if (value.trim() === "") {
              applySearchToUrl("");
            }
          }}
        />
        <button type="submit" className="btn recipes-page__search-btn">
          Rechercher
        </button>
      </form>

      <div className="recipes-page__filters">
        <div className="field field--filter">
          <label htmlFor="filter-origin">Origine</label>
          <select
            className="select"
            id="filter-origin"
            value={selectedOrigin}
            onChange={handleOriginChange}
          >
            <option value="">Toutes les origines</option>
            {origins.map((origin) => {
              return (
                <option key={origin.id} value={origin.name}>
                  {origin.name}
                </option>
              );
            })}
          </select>
        </div>

        <div className="field field--filter">
          <label htmlFor="filter-meal-type">Type de repas</label>
          <select
            className="select"
            id="filter-meal-type"
            value={selectedMealType}
            onChange={handleMealTypeChange}
          >
            <option value="">Tous les types</option>
            {mealTypes.map((mealType) => {
              return (
                <option key={mealType.id} value={mealType.name}>
                  {mealType.name}
                </option>
              );
            })}
          </select>
        </div>

        <div className="field field--filter">
          <label htmlFor="filter-category">Catégorie</label>
          <select
            className="select"
            id="filter-category"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category) => {
              return (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {contentMessage}

      {!loading && recipes.length > 0 && (
        <ul className="recipes-page__grid">
          {recipes.map((recipe, index) => {
            let isFirstCard = false;
            if (index === 0) {
              isFirstCard = true;
            }

            return (
              <li key={recipe.id} className="recipes-page__grid-item">
                <RecipeCard recipe={recipe} isFirstCard={isFirstCard} />
              </li>
            );
          })}
        </ul>
      )}

      {!loading && totalPages > 1 && (
        <nav
          className="recipes-page__pagination"
          aria-label="Pagination du catalogue"
        >
          <button
            type="button"
            className="recipes-page__pagination-nav"
            disabled={currentPage <= 1}
            onClick={() => {
              goToPage(currentPage - 1);
            }}
          >
            ← Préc
          </button>

          {pageButtons}

          <button
            type="button"
            className="recipes-page__pagination-nav"
            disabled={currentPage >= totalPages}
            onClick={() => {
              goToPage(currentPage + 1);
            }}
          >
            Suiv →
          </button>
        </nav>
      )}
    </main>
  );
}

export default RecipePage;
