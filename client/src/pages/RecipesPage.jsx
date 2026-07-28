import "./RecipePage.css";
import { useState, useEffect } from "react";
import { getFromApi } from "../services/api.js";
import RecipeCard from "../components/RecipeCard.jsx";
import { Link } from "react-router-dom";

const mealTypeOptions = ["Petit-déjeuner", "Déjeuner", "Goûter", "Dîner"];
const originOptions = ["Antille", "Asie"];
const categoryOptions = [
  "Boisson",
  "Dessert",
  "Gâteau",
  "Beignets",
  "Tarte",
  "Crème",
  "Fait maison",
  "Glace",
  "Friandise",
  "Ptit dèj",
  "Punch arrangé",
  "Pâtisserie",
  "Boulangerie",
];

function RecipePage() {
  const [recipes, setRecipes] = useState([]);
  const [selectedMealType, setSelectedMealType] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [isMealTypeOpen, setIsMealTypeOpen] = useState(false);
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

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
      const response = await getFromApi("/api/recipes?page=1&limit=12");
      setRecipes(response.data);
    }

    loadRecipes();
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
                {mealTypeOptions.map((mealTypeName) => {
                  let filterBtnClass = "recipe-filter-btn";

                  if (selectedMealType === mealTypeName) {
                    filterBtnClass = "recipe-filter-btn-active";
                  }

                  return (
                    <button
                      key={mealTypeName}
                      type="button"
                      className={filterBtnClass}
                      onClick={() => {
                        handleMealTypeClick(mealTypeName);
                      }}
                    >
                      {mealTypeName}
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
                {originOptions.map((originName) => {
                  let filterBtnClass = "recipe-filter-btn";

                  if (selectedOrigin === originName) {
                    filterBtnClass = "recipe-filter-btn-active";
                  }

                  return (
                    <button
                      key={originName}
                      type="button"
                      className={filterBtnClass}
                      onClick={() => {
                        handleOriginClick(originName);
                      }}
                    >
                      {originName}
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
                {categoryOptions.map((categoryName) => {
                  let filterBtnClass = "recipe-filter-btn";

                  if (selectedCategory === categoryName) {
                    filterBtnClass = "recipe-filter-btn-active";
                  }

                  return (
                    <button
                      key={categoryName}
                      type="button"
                      className={filterBtnClass}
                      onClick={() => {
                        handleCategoryClick(categoryName);
                      }}
                    >
                      {categoryName}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        {emptyMessage}

        <ul className="recipes-list">
          {recipes.map((recipe) => {
            return (
              <li key={recipe.id} className="recipes-list-item">
                <RecipeCard recipe={recipe} />
              </li>
            );
          })}
        </ul>
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