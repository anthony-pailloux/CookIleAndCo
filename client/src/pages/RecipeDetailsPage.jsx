import { useEffect, useState } from "react";
import { getFromApi } from "../services/api";
import { useParams } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";

function RecipeDetailsPage() {
  const [recipeDetails, setRecipesDetails] = useState();
  const { id } = useParams();

  useEffect(() => {
    async function loadRecipeDetails() {
      const response = await getFromApi(`/api/recipes/${id}`);

      setRecipesDetails(response);
    }
    loadRecipeDetails();
  }, [id]);

  let emptyMessage;

  if (!recipeDetails) {
    emptyMessage = <p>Chargement...</p>;
  }

  return (
    <div>
      {emptyMessage}
      {recipeDetails && (
        <>
          <h1>{recipeDetails.title}</h1>
          <ul>
            <h2>Ingrédients</h2>
            {recipeDetails.ingredients.map((ingredient) => {
              return (
                <li key={ingredient.id}>
                  <p>Nom: {ingredient.name} quantité: {ingredient.quantity}
                  {ingredient.unit}</p>
                  <p>Temps de cuisson: {recipeDetails.cookingTime}</p>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

export default RecipeDetailsPage;
