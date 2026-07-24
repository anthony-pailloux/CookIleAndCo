import { useEffect, useState } from "react";
import { getFromApi } from "../services/api";
import { useParams } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import IngredientItem from "../components/IngredientItem";


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
          
        </>
      )}
    </div>
  );
}

export default RecipeDetailsPage;
