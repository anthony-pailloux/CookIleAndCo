import { useEffect, useState } from "react";
import { getFromApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getRecipePhotoUrl } from "../utils/recipePhotoUrl.js";
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

  return (
    <main className="admin-page">
      <header className="admin-page__header">
        <h1 className="admin-page__title">Le Dashboard de Tetelle</h1>
        <p className="admin-page__email">{auth.user.email}</p>
      </header>

      <section className="admin-page__section">
        <h2 className="admin-page__section-title">Mes recettes</h2>

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
                          console.log(
                            "AdminPage — supprimer recette id:",
                            recipe.id,
                          );
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
