// Page fiche recette — affiche une recette complète (hero, ingrédients, étapes, conseils, partage).
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getFromApi } from "../services/api";
import { getRecipePhotoUrl } from "../utils/recipePhotoUrl.js";
import IngredientItem from "../components/IngredientItem";
import placeholderPhoto from "../assets/No_Image_Available.jpg";
import Button from "../components/button";
import "../components/Button.css";
import "./RecipeDetailsPage.css";

function RecipeDetailsPage() {
  const [recipeDetails, setRecipeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const { id } = useParams();

  useEffect(() => {
    async function loadRecipeDetails() {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await getFromApi(`/api/recipes/${id}`);
        setRecipeDetails(response);
      } catch (err) {
        setRecipeDetails(null);
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadRecipeDetails();
  }, [id]);

  // État chargement
  if (loading) {
    return (
      <main className="recipe-detail">
        <p className="recipe-detail__status">Chargement...</p>
      </main>
    );
  }

  // État erreur
  if (errorMessage) {
    return (
      <main className="recipe-detail">
        <p className="recipe-detail__status">{errorMessage}</p>
        <Link className="recipe-detail__back-link" to="/recettes">
          Retour au catalogue
        </Link>
      </main>
    );
  }

  const photoSource = getRecipePhotoUrl(recipeDetails.photo);

  return (
    <main className="recipe-detail">
      {/* Hero */}
      <section className="recipe-detail__hero">
        <div className="recipe-detail__photo">
          <img
            src={photoSource}
            alt={recipeDetails.title}
            onError={(event) => {
              event.currentTarget.src = placeholderPhoto;
            }}
          />
        </div>

        <div className="recipe-detail__intro">
          <h1 className="recipe-detail__title">{recipeDetails.title}</h1>
          <span className="recipe-detail__badge">
            {recipeDetails.category.name}
          </span>
          <p className="recipe-detail__time">
            ⏱ {recipeDetails.cookingTime} minutes
          </p>
          <Button className="btn--outline recipe-detail__share-btn">
            Partager
          </Button>
        </div>
      </section>

      {/* Ingrédients + Préparation */}
      <section className="recipe-detail__body">
        <div className="recipe-detail__ingredients">
          <h2 className="recipe-detail__section-title">Ingrédients</h2>
          <ul className="recipe-detail__ingredient-list">
            {recipeDetails.ingredients.map((ingredient) => {
              return (
                <li key={ingredient.id}>
                  <IngredientItem ingredient={ingredient} />
                </li>
              );
            })}
          </ul>
        </div>

        <div className="recipe-detail__steps">
          <h2 className="recipe-detail__section-title">Préparation</h2>
          <ol className="recipe-detail__step-list">
            {recipeDetails.steps.map((step) => {
              return (
                <li key={step.id}>
                  <span className="recipe-detail__step-num">
                    {step.stepNumber}
                  </span>
                  <p className="recipe-detail__step-text">{step.description}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Conseils de Tetelle */}
      {recipeDetails.tips && (
        <section className="recipe-detail__tips">
          <h2 className="recipe-detail__section-title">Conseils de Tetelle</h2>
          <p>{recipeDetails.tips}</p>
        </section>
      )}

      {/* Partage — logique réelle en TCK-504 */}
      <section className="recipe-detail__share">
        <Button className="btn--primary recipe-detail__share-main">
          Partager cette recette
        </Button>
        <p className="recipe-detail__share-links">
          <button type="button" className="recipe-detail__share-link">
            Facebook
          </button>
          <span> · </span>
          <button type="button" className="recipe-detail__share-link">
            WhatsApp
          </button>
          <span> · </span>
          <button type="button" className="recipe-detail__share-link">
            Copier le lien
          </button>
        </p>
      </section>
    </main>
  );
}

export default RecipeDetailsPage;
