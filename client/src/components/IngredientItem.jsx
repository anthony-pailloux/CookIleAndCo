function IngredientItem({ ingredient }) {
  const parts = [];

  if (ingredient.quantity) {
    parts.push(ingredient.quantity);
  }

  if (ingredient.unit) {
    parts.push(ingredient.unit);
  }

  if (ingredient.name) {
    parts.push(ingredient.name);
  }

  return (
    <>
      <p>
        {parts.join(" ")}
      </p>
    </>
  );
}

export default IngredientItem;
