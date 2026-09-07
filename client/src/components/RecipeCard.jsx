// Petite carte recette. Photo, titre, et temps (sauf sur l accueil).
import { Link } from "react-router-dom";
import { getRecipePhotoUrl } from "../utils/recipePhotoUrl.js";
import placeholderPhoto from "../assets/No_Image_Available.jpg";
import "./RecipeCard.css";

function RecipeCard({ recipe, isFirstCard, showTimes }) {
  const photoSource = getRecipePhotoUrl(recipe.photo);

  let imageLoading = "lazy";
  if (isFirstCard) {
    imageLoading = "eager";
  }

  let displayTimes = true;
  if (showTimes === false) {
    displayTimes = false;
  }

  let timeBlock = null;
  if (displayTimes === true) {
    timeBlock = (
      <span className="recipe-card__time">
        Préparation ⏱ {recipe.preparationTime} min · Cuisson ⏱{" "}
        {recipe.cookingTime} min
      </span>
    );
  }

  return (
    <Link className="recipe-card" to={`/recettes/${recipe.id}`}>
      <div className="recipe-card__photo">
        <img
          src={photoSource}
          alt={recipe.title}
          loading={imageLoading}
          onError={(event) => {
            event.currentTarget.src = placeholderPhoto;
          }}
        />
      </div>

      <div className="recipe-card__body">
        <div className="recipe-card__header">
          <h2 className="recipe-card__title">{recipe.title}</h2>
          {timeBlock}
        </div>
      </div>
    </Link>
  );
}

export default RecipeCard;
