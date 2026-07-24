
function IngredientItem({ ingredient }) {

    return (
        <>
        <p>{ingredient.quantity} {ingredient.unit} {ingredient.name}</p>
        </>

        
        
    );
}

export default IngredientItem;