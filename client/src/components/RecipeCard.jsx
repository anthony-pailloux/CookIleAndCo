function RecipeCard({ recipe }) {
  

  return (
    <>
      <div>
        <span>Catégorie: {recipe.category.name}</span>
        {recipe.title}
        <img src={recipe.photo} alt="recette préparé" />
        <p>Temps de cuisson: {recipe.cookingTime}mn</p>
        <p>Mise à jour le: {recipe.updatedAt}</p>
      </div>
    </>
  );
}

export default RecipeCard;
