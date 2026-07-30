import { useEffect, useState } from "react";
import { getFromApi, deleteToApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getRecipePhotoUrl } from "../utils/recipePhotoUrl.js";
import { Link } from "react-router-dom";
import Button from "../components/button.jsx";
import "../components/Button.css";
import "./AdminPage.css";

function AdminPage() {
  const auth = useAuth();

  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);

  useEffect(() => {
    async function loadAdminRecipes() {
      setLoadingRecipes(true);

      try {
        const response = await getFromApi("/api/recipes?limit=50");
        console.log("AdminPage — recettes:", response);
        setRecipes(response.data);
      } catch (err) {
        console.log("AdminPage — erreur recettes:", err.message);
        setRecipes([]);
      } finally {
        setLoadingRecipes(false);
      }
    }

    loadAdminRecipes();
  }, []);

  async function handleDeleteRecipe(recipeId, recipeTitle) {
    const confirmed = window.confirm(
      'Supprimer la recette "' + recipeTitle + '" ?',
    );

    if (confirmed === false) {
      return;
    }

    try {
      const result = await deleteToApi("/api/recipes/" + recipeId);
      console.log("AdminPage — supprimée:", result);

      const newRecipes = [];
      for (let i = 0; i < recipes.length; i++) {
        if (recipes[i].id !== recipeId) {
          newRecipes.push(recipes[i]);
        }
      }
      setRecipes(newRecipes);
    } catch (err) {
      console.log("AdminPage — erreur suppression:", err.message);
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-page__header">
        <h1 className="admin-page__title">Le Dashboard de Tetelle</h1>
        <p className="admin-page__email">{auth.user.email}</p>
      </header>

      <section className="admin-page__section">
        <h2 className="admin-page__section-title">Mes recettes</h2>
        <Link to="/admin/recettes/nouvelle" className="btn admin-page__add-btn">
          + Ajouter une recette
        </Link>

        {loadingRecipes === true && (
          <p className="admin-page__status">Chargement des recettes...</p>
        )}

        {loadingRecipes === false && recipes.length === 0 && (
          <p className="admin-page__status">Aucune recette pour le moment.</p>
        )}

        {loadingRecipes === false && recipes.length > 0 && (
          <table className="admin-recipes-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map(function (recipe) {
                const photoUrl = getRecipePhotoUrl(recipe.photo);

                return (
                  <tr key={recipe.id}>
                    <td>
                      <img
                        src={photoUrl}
                        alt={recipe.title}
                        width="60"
                        height="60"
                      />
                    </td>
                    <td>{recipe.title}</td>
                    <td>{recipe.category.name}</td>
                    <td>
                      <Button
                        className="btn--outline"
                        onClick={function () {
                          console.log(
                            "AdminPage — modifier recette id:",
                            recipe.id,
                          );
                        }}
                      >
                        Modifier
                      </Button>
                      <Button
                        className="btn--danger"
                        onClick={function () {
                          handleDeleteRecipe(recipe.id, recipe.title);
                        }}
                      >
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

export default AdminPage;
