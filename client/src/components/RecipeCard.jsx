import "./RecipeCard.css";

function RecipeCard({ recipe }) {
  return (
    <div className="recipes-card">
      <span className="recipe-card-category">{recipe.category.name}</span>
      <h2 className="recipe-card-title">{recipe.title}</h2>
      <img
        src={recipe.photo}
        alt="recette préparé"
        className="recipe-card-photo"
      />
      <p className="recipe-card-meta">
        Temps de cuisson: {recipe.cookingTime}mn
      </p>
      <p>Mise à jour le: {recipe.updatedAt}</p>
    </div>
  );
}

export default RecipeCard;
