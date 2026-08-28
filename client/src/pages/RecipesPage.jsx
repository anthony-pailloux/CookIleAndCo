// Catalogue des recettes, avec recherche, filtres et pages.
import "./RecipesPage.css";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { listRecipes } from "../services/recipeServices.js";
import { listCategories, listOrigins, listMealTypes } from "../services/referenceServices.js";
import RecipeCard from "../components/RecipeCard.jsx";
import "../components/Button.css";

function RecipesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSearch = searchParams.get("q") || "";

  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);

  // On lit l URL tout de suite, sinon le 1er fetch part sans filtre
  // (puis la reponse "toutes les recettes" ecrase le resultat filtre).
  let initialCategory = "";
  const categorieFromUrlAtStart = searchParams.get("categorie");
  if (categorieFromUrlAtStart !== null) {
    initialCategory = categorieFromUrlAtStart;
  }

  let initialOrigin = "";
  const origineFromUrlAtStart = searchParams.get("origine");
  if (origineFromUrlAtStart !== null) {
    initialOrigin = origineFromUrlAtStart;
  }

  let initialMealType = "";
  const repasFromUrlAtStart = searchParams.get("repas");
  if (repasFromUrlAtStart !== null) {
    initialMealType = repasFromUrlAtStart;
  }

  const [selectedMealType, setSelectedMealType] = useState(initialMealType);
  const [selectedOrigin, setSelectedOrigin] = useState(initialOrigin);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchText, setSearchText] = useState(activeSearch);

  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Page courante lue depuis l URL (?page=2)
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

  // Ecrit un parametre dans l URL sans ecraser les autres (filtres + recherche)
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

  // Recopie les filtres depuis l URL
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

  // Charge les recettes selon l URL (source de verite des filtres)
  useEffect(() => {
    let cancelled = false;

    async function loadRecipes() {
      setLoading(true);

      let categoryFilter = "";
      const categorieFromUrl = searchParams.get("categorie");
      if (categorieFromUrl !== null) {
        categoryFilter = categorieFromUrl;
      }

      let originFilter = "";
      const origineFromUrl = searchParams.get("origine");
      if (origineFromUrl !== null) {
        originFilter = origineFromUrl;
      }

      let mealTypeFilter = "";
      const repasFromUrl = searchParams.get("repas");
      if (repasFromUrl !== null) {
        mealTypeFilter = repasFromUrl;
      }

      console.log("loadRecipes — filtres:", {
        category: categoryFilter,
        origin: originFilter,
        mealType: mealTypeFilter,
        search: activeSearch,
        page: currentPage,
      });

      try {
        const response = await listRecipes({
          page: currentPage,
          limit: 12,
          category: categoryFilter,
          origin: originFilter,
          mealType: mealTypeFilter,
          search: activeSearch,
        });

        if (cancelled === false) {
          setRecipes(response.data);
          setTotalPages(response.meta.totalPages);
        }
      } catch (err) {
        if (cancelled === false) {
          setRecipes([]);
          setTotalPages(1);
        }
      } finally {
        if (cancelled === false) {
          setLoading(false);
        }
      }
    }

    loadRecipes();

    return function cleanup() {
      cancelled = true;
    };
  }, [searchParams, currentPage, activeSearch]);

  // Charge origines, types de repas, categories pour les listes
  useEffect(() => {
    async function loadFiltersData() {
      try {
        const originsResponse = await listOrigins();
        const mealTypesResponse = await listMealTypes();
        const categoriesResponse = await listCategories();

        setOrigins(originsResponse.data);
        setMealTypes(mealTypesResponse.data);
        setCategories(categoriesResponse.data);
      } catch (err) {
        // Page publique, listes vides si l API ne repond pas
        setOrigins([]);
        setMealTypes([]);
        setCategories([]);
      }
    }
    loadFiltersData();
  }, []);

  // Boutons numeros de page
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

export default RecipesPage;
