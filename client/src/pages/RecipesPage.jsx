import "./RecipePage.css";
import { useState, useEffect } from "react";
import { getFromApi } from "../services/api.js";
import RecipeCard from "../components/RecipeCard.jsx";
import { Link } from "react-router-dom";

function RecipePage() {
  const [recipes, setRecipes] = useState([]);

  const [categories, setCategories] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);

  const [selectedMealType, setSelectedMealType] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [isMealTypeOpen, setIsMealTypeOpen] = useState(false);
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  function handleMealTypeClick(mealTypeName) {
    if (selectedMealType === mealTypeName) {
      setSelectedMealType("");
    } else {
      setSelectedMealType(mealTypeName);
    }
  }

  function handleOriginClick(originName) {
    if (selectedOrigin === originName) {
      setSelectedOrigin("");
    } else {
      setSelectedOrigin(originName);
    }
  }

  function handleCategoryClick(categoryName) {
    if (selectedCategory === categoryName) {
      setSelectedCategory("");
    } else {
      setSelectedCategory(categoryName);
    }
  }

  useEffect(() => {
    async function loadRecipes() {
      const path = "/api/recipes?page=" + currentPage + "&limit=12";
      const response = await getFromApi(path);

      setRecipes(response.data);
      setTotalPages(response.meta.totalPages);
    }

    loadRecipes();
  }, [currentPage]);

  useEffect(() => {
    async function loadCategory() {
      const originsResponse = await getFromApi("/api/origins");
      const mealTypesResponse = await getFromApi("/api/mealTypes");
      const categoriesResponse = await getFromApi("/api/categories");

      setOrigins(originsResponse.data);
      setMealTypes(mealTypesResponse.data);
      setCategories(categoriesResponse.data);
    }
    loadCategory();
  }, []);

  let emptyMessage;

  if (recipes.length === 0) {
    emptyMessage = <p>Aucune recette pour le moment.</p>;
  }

  let mealTypeGroupClass = "recipes-filters-group-closed";
  if (isMealTypeOpen) {
    mealTypeGroupClass = "recipes-filters-group-open";
  }

  let originGroupClass = "recipes-filters-group-closed";
  if (isOriginOpen) {
    originGroupClass = "recipes-filters-group-open";
  }

  let categoryGroupClass = "recipes-filters-categories-closed";
  if (isCategoryOpen) {
    categoryGroupClass = "recipes-filters-categories-open";
  }

  return (
    <>
      <div className="recipe-container">
        <h1>Catalogue des recettes</h1>

        <div className="recipes-filters-panel">
          <div className="bg-green-textured">
            <section className="recipes-filters">
              <button
                type="button"
                className="recipes-filters-toggle"
                onClick={() => {
                  setIsMealTypeOpen(!isMealTypeOpen);
                }}
              >
                Type de repas
              </button>

              <div className={mealTypeGroupClass}>
                {mealTypes.map((mealType) => {
                  let filterBtnClass = "recipe-filter-btn";

                  if (selectedMealType === mealType.name) {
                    filterBtnClass = "recipe-filter-btn-active";
                  }

                  return (
                    <button
                      key={mealType.id}
                      type="button"
                      className={filterBtnClass}
                      onClick={() => {
                        handleMealTypeClick(mealType.name);
                      }}
                    >
                      {mealType.name}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="recipes-filters">
              <button
                type="button"
                className="recipes-filters-toggle"
                onClick={() => {
                  setIsOriginOpen(!isOriginOpen);
                }}
              >
                Origine
              </button>

              <div className={originGroupClass}>
                {origins.map((origin) => {
                  let filterBtnClass = "recipe-filter-btn";

                  if (selectedOrigin === origin.name) {
                    filterBtnClass = "recipe-filter-btn-active";
                  }

                  return (
                    <button
                      key={origin.id}
                      type="button"
                      className={filterBtnClass}
                      onClick={() => {
                        handleOriginClick(origin.name);
                      }}
                    >
                      {origin.name}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="recipes-filters">
              <button
                type="button"
                className="recipes-filters-toggle"
                onClick={() => {
                  setIsCategoryOpen(!isCategoryOpen);
                }}
              >
                Catégorie
              </button>

              <div className={categoryGroupClass}>
                {categories.map((category) => {
                  let filterBtnClass = "recipe-filter-btn";

                  if (selectedCategory === category.name) {
                    filterBtnClass = "recipe-filter-btn-active";
                  }

                  return (
                    <button
                      key={category.id}
                      type="button"
                      className={filterBtnClass}
                      onClick={() => {
                        handleCategoryClick(category.name);
                      }}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        {emptyMessage}

        <ul className="recipes-list">
          {recipes.map((recipe, index) => {
            let isFirstCard = false;
            if (index === 0) {
              isFirstCard = true;
            }
            return (
              <li key={recipe.id} className="recipes-list-item">
                <RecipeCard recipe={recipe} isFirstCard={isFirstCard} />
              </li>
            );
          })}
        </ul>

        <nav className="recipes-pagination">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => {
              setCurrentPage(currentPage - 1);
            }}
          >
            Précédent
          </button>

          <span>
            Page {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => {
              setCurrentPage(currentPage + 1);
            }}
          >
            Suivant
          </button>
        </nav>
      </div>

      <nav className="recipe-details-nav">
        <Link className="recipe-details-nav-link" to="/">
          Accueil
        </Link>
      </nav>
    </>
  );
}

export default RecipePage;
