import { Link } from "react-router-dom";
import { getRecipePhotoUrl } from "../utils/recipePhotoUrl.js";
import placeholderPhoto from "../assets/No_Image_Available.jpg";
import "./RecipeCard.css";

function RecipeCard({ recipe, isFirstCard }) {
  const photoSource = getRecipePhotoUrl(recipe.photo);

  let imageLoading = "lazy";
  if (isFirstCard) {
    imageLoading = "eager";
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
        <h2 className="recipe-card__title">{recipe.title}</h2>
        <div className="recipe-card__meta">
          <span className="recipe-card__badge">{recipe.category.name}</span>
          <span className="recipe-card__time">⏱ {recipe.cookingTime} min</span>
        </div>
      </div>
    </Link>
  );
}

export default RecipeCard;
