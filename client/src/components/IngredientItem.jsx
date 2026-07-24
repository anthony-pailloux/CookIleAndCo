import placeholderPhoto from "../assets/No_Image_Available.jpg";

function IngredientItem({ ingredients }) {
    let photoSource;

    if (recipe.photo) {
        photoSource = recipe.photo;
    } else {
        photoSource = placeholderPhoto;
    }

    return (
        // console.log(ingredients)
        <>
        <div>
        <ul>
            <h2>Ingrédients</h2>
            {recipeDetails.ingredients.map((ingredient) => {
              return (
                <li key={ingredient.id}>
                  <p>Nom: {ingredient.name} quantité: {ingredient.quantity}
                  {ingredient.unit}</p>
                  <p>Temps de cuisson: {recipeDetails.cookingTime}</p>
                </li>
              );
            })}
          </ul>
        </div>
        </>

        
        
    );
}

export default IngredientItem;