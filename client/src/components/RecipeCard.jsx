// Petite carte recette. Photo, titre, et temps (sauf sur l accueil).
import { Link } from "react-router-dom";
import { getRecipePhotoUrl } from "../utils/recipePhotoUrl.js";
import placeholderPhoto from "../assets/No_Image_Available.jpg";
import "./RecipeCard.css";

function RecipeCard({ recipe, isFirstCard, showTimes }) {
  const photoSource = getRecipePhotoUrl(recipe.photo);

  // Eager seulement pour la première carte du catalogue (au-dessus de la ligne de flottaison).
  let imageLoading = "lazy";
  let imageFetchPriority = "low";
  if (isFirstCard) {
    imageLoading = "eager";
    imageFetchPriority = "auto";
  }

  // Taille du fichier. Le CSS (100 % et aspect-ratio) garde le cadrage affiché.
  let imageWidth;
  let imageHeight;
  if (
    typeof recipe.imageWidth === "number" &&
    typeof recipe.imageHeight === "number"
  ) {
    imageWidth = recipe.imageWidth;
    imageHeight = recipe.imageHeight;
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
          width={imageWidth}
          height={imageHeight}
          loading={imageLoading}
          fetchPriority={imageFetchPriority}
          onError={(event) => {
            event.currentTarget.src = placeholderPhoto;
          }}
        />
        <div className="recipe-card__caption">
          <h2 className="recipe-card__title">{recipe.title}</h2>
          {timeBlock}
        </div>
      </div>
    </Link>
  );
}

export default RecipeCard;
