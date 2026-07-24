import { useEffect, useState } from "react";
import { getFromApi } from "../services/api";
import { useParams } from "react-router-dom";
import IngredientItem from "../components/IngredientItem";
import placeholderPhoto from "../assets/No_Image_Available.jpg";
import "./RecipeDetailsPage.css";
import "../components/RecipeCard.css";

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
  let photoSource;

  if (!recipeDetails) {
    emptyMessage = <p>Chargement...</p>;
  } else {
    if (recipeDetails.photo) {
      photoSource = recipeDetails.photo;
    } else {
      photoSource = placeholderPhoto;
    }
  }

  return (
    <div>
      {emptyMessage}
      {recipeDetails && (
        <>
          <section className="recipe-hero">
            <div className="recipe-card-photo-zone recipe-photo-zone-detail">
              <img
                className="recipe-card-photo recipe-details-placeholder-photo"
                src={photoSource}
                alt="recette-préparer"
                onError={(event) => {
                  event.currentTarget.src = placeholderPhoto;
                }}
              />
            </div>
            <h1>{recipeDetails.title}</h1>
          </section>

          <section className="recipe-content">
            <div className="recipe-hero-info">
              <h2>Ingrédients</h2>
              <ul className="">
                {recipeDetails.ingredients.map((ingredient) => {
                  return (
                    <li key={ingredient.id} className="">
                      <IngredientItem ingredient={ingredient} />
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="recipe-preparation">
              <h2 className="recipe-preparation-title">Préparation</h2>
              <p>Temps de cuisson: {recipeDetails.cookingTime}mn</p>
              <ol className="recipe-step-list">
                {recipeDetails.steps.map((step) => {
                  <li key={step.id}>{step.description}</li>;
                })}
              </ol>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default RecipeDetailsPage;
