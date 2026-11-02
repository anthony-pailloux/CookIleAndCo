// Ligne d'ingrédient : mesure (quantité + unité) séparée du nom.
function IngredientItem({ ingredient }) {
  const measureParts = [];

  if (ingredient.quantity) {
    measureParts.push(ingredient.quantity);
  }

  if (ingredient.unit) {
    measureParts.push(ingredient.unit);
  }

  let measure = "";
  if (measureParts.length > 0) {
    measure = measureParts.join(" ");
  }

  return (
    <p className="recipe-detail__ingredient">
      {measure !== "" && (
        <span className="recipe-detail__ingredient-qty">{measure}</span>
      )}
      <span className="recipe-detail__ingredient-name">{ingredient.name}</span>
    </p>
  );
}

export default IngredientItem;
