import "./RecipePage.css";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getFromApi } from "../services/api.js";
import RecipeCard from "../components/RecipeCard.jsx";
import Button from "../components/button";
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

  function resetPageInUrl() {
    goToPage(1);
  }

  function handleMealTypeChange(event) {
    setSelectedMealType(event.target.value);
    resetPageInUrl();
  }

  function handleOriginChange(event) {
    setSelectedOrigin(event.target.value);
    resetPageInUrl();
  }

  function handleCategoryChange(event) {
    setSelectedCategory(event.target.value);
    resetPageInUrl();
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    const nextParams = new URLSearchParams(searchParams);
    const trimmed = searchText.trim();

    if (trimmed === "") {
      nextParams.delete("q");
    } else {
      nextParams.set("q", trimmed);
    }

    nextParams.delete("page");
    setSearchParams(nextParams);
  }

  // Charge les recettes selon page et filtres
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
      console.log("loadRecipes — path:", path);

      try {
        const response = await getFromApi(path);
        console.log("loadRecipes — count:", response.data.length);
        setRecipes(response.data);
        setTotalPages(response.meta.totalPages);
      } catch (err) {
        console.log("loadRecipes — erreur:", err.message);
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
      const originsResponse = await getFromApi("/api/origins");
      const mealTypesResponse = await getFromApi("/api/mealTypes");
      const categoriesResponse = await getFromApi("/api/categories");

      setOrigins(originsResponse.data);
      setMealTypes(mealTypesResponse.data);
      setCategories(categoriesResponse.data);
    }

    loadFiltersData();
  }, []);

  // Boutons numéros de page (← Préc · 1 · 2 · 3 · Suiv →)
  const pageButtons = [];
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    let pageBtnClass = "catalog-pagination__page";
    if (pageNum === currentPage) {
      pageBtnClass =
        "catalog-pagination__page catalog-pagination__page--active";
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
    contentMessage = <p className="catalog__status">Chargement...</p>;
  } else if (recipes.length === 0) {
    contentMessage = (
      <p className="catalog__status">Aucune recette pour le moment.</p>
    );
  }

  return (
    <main className="catalog">
      <h1 className="catalog__title">Toutes les recettes</h1>

      {/* Barre recherche — visuel wireframe ; logique API en TCK-402 */}
      <form className="catalog__search" onSubmit={handleSearchSubmit}>
        <input
          className="input catalog__search-input"
          type="search"
          placeholder="Rechercher une recette..."
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value);
          }}
        />
        <Button className="btn--primary catalog__search-btn">Rechercher</Button>
      </form>

      {/* 3 filtres en ligne — selects comme le wireframe */}
      <div className="catalog__filters">
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

      {/* Grille 3 colonnes desktop — 12 cartes max */}
      {!loading && recipes.length > 0 && (
        <ul className="catalog__grid">
          {recipes.map((recipe, index) => {
            let isFirstCard = false;
            if (index === 0) {
              isFirstCard = true;
            }

            return (
              <li key={recipe.id} className="catalog__grid-item">
                <RecipeCard recipe={recipe} isFirstCard={isFirstCard} />
              </li>
            );
          })}
        </ul>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <nav
          className="catalog-pagination"
          aria-label="Pagination du catalogue"
        >
          <button
            type="button"
            className="catalog-pagination__nav"
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
            className="catalog-pagination__nav"
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
