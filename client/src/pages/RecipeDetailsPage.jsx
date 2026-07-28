import { useEffect, useState } from "react";
import { getFromApi } from "../services/api";
import { Link, useParams } from "react-router-dom";
import IngredientItem from "../components/IngredientItem";
import placeholderPhoto from "../assets/No_Image_Available.jpg";
import tipsIcon from "../assets/tipsandtricks.png";
import Button from "../components/button";
import "../components/Button.css";
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
            <div className="recipe-info">
              <h1>{recipeDetails.title}</h1>
              <span className="meal-type-info">
                {recipeDetails.mealType.name}
              </span>
              <p>Temps de cuisson: {recipeDetails.cookingTime}mn</p>
              <Button className="btnDetailsPage">Partager</Button>
            </div>
          </section>

          <section className="recipe-content">
            <div className="recipe-hero-info">
              <h2>Ingrédients</h2>
              <ul>
                {recipeDetails.ingredients.map((ingredient) => {
                  return (
                    <li key={ingredient.id}>
                      <IngredientItem ingredient={ingredient} />
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="recipe-preparation">
              <h2 className="recipe-preparation-title">Préparation</h2>
              <ol className="recipe-step-list">
                {recipeDetails.steps.map((step) => {
                  return <li key={step.id}>{step.description}</li>;
                })}
              </ol>
            </div>
          </section>

          {recipeDetails.tips && (
            <section className="recipe-advice">
              <img
                src={tipsIcon}
                alt="Astuces et conseils"
                className="recipe-advice-banner"
              />
              <p>{recipeDetails.tips}</p>
            </section>
          )}

          <nav className="recipe-details-nav">
            <Link className="recipe-details-nav-link" to="/">
              Accueil
            </Link>
            <Link className="recipe-details-nav-link" to="/recettes">
              Liste des recettes
            </Link>
          </nav>
        </>
      )}
    </div>
  );
}

export default RecipeDetailsPage;
