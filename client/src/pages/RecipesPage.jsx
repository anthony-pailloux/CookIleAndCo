import { useState, useEffect } from "react";
import { getFromApi } from "../services/api.js";

function RecipePage() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    async function loadRecipes() {
      const response = await getFromApi("/api/recipes?page=1&limit=12");
      setRecipes(response.recipes);
    }

    loadRecipes();
  }, []);

  let emptyMessage;

  if (recipes.length === 0) {
    emptyMessage = <p>Aucune recette pour le moment.</p>;
  }

  return (
    <div>
      <h2>Catalogue des recettes</h2>
      {emptyMessage}

      <ul>
        {recipes.map((recipe) => {
          return (
            <li key={recipe.id}>
              <img src={recipe.photo} alt="plat préparé" />
              <h1>{recipe.title}</h1>
              <span>Temps de préparation: {recipe.cookingTime}mn</span>
              <p>{recipe.updatedAt}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default RecipePage;
