import { Link } from "react-router-dom";
import placeholderPhoto from "../assets/No_Image_Available.jpg";
import "./RecipeCard.css";

function RecipeCard({ recipe,isFirstCard  }) {
  let photoSource;

  if (recipe.photo) {
    photoSource = recipe.photo;
  } else {
    photoSource = placeholderPhoto;
  }

  let imageLoading = "lazy";
  if (isFirstCard) {
    imageLoading = "eager";
  }

  return (
    <Link className="recipes-card bg-green-textured" to={`/recettes/${recipe.id}`}>
      <div className="recipe-card-photo-zone">
        <img
          src={photoSource}
          alt="recette préparé"
          className="recipe-card-photo"
          loading={imageLoading}
          onError={(event) => {
            event.currentTarget.src = placeholderPhoto;
          }}
        />
      </div>
      <div className="recipe-card-text">
        <span className="recipe-card-category">{recipe.category.name}</span>
        <h2 className="recipe-card-title">{recipe.title}</h2>

        <p className="recipe-card-meta">
          Temps de cuisson: {recipe.cookingTime}mn
        </p>
        
      </div>
    </Link>
  );
}

export default RecipeCard;
