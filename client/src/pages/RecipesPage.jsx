import { useState } from "react";
import { useEffect } from "react";
import { getFromApi } from "../services/api.js"

function RecipePage() {
    const [recipes, setRecipes] = useState([]);
    
    useEffect(() => {
        async function loadRecipes() {
            const response = await getFromApi("/api/recipes?page=1&limit=12");
            console.log(response);
            setRecipes(response.recipes)
        }
        loadRecipes()
    }, []);

    return (
        
        
        <div>
            <h2>Catalogue des recettes</h2>
            <p>"Il y actuellement {recipes.length} recette en bdd"</p>
        </div>
        
        
    )
}

export default RecipePage;