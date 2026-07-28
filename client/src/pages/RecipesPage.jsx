import "./RecipePage.css";
import { useState, useEffect } from "react";
import { getFromApi } from "../services/api.js";
import RecipeCard from "../components/RecipeCard.jsx";
import { Link } from "react-router-dom";

function RecipePage() {
  const [recipes, setRecipes] = useState([]);

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

  return (
    <>
      <div className="recipe-container">
        <h1>Catalogue des recettes</h1>
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
        <Link className="recipe-details-nav-link" to="/recettes">
          Liste des recettes
        </Link>
      </nav>
    </>
  );
}

export default RecipePage;
