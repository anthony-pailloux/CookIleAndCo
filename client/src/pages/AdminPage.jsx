import { useEffect, useState } from "react";
import { getFromApi, deleteToApi } from "../services/api.js";
import { createAdmin } from "../services/authServices.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getRecipePhotoUrl } from "../utils/recipePhotoUrl.js";
import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import "../components/Button.css";
import "./AdminPage.css";

function AdminPage() {
  const auth = useAuth();
  const { showToast } = useToast();

  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);

  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [adminFormError, setAdminFormError] = useState("");

  useEffect(() => {
    async function loadAdminRecipes() {
      setLoadingRecipes(true);

      try {
        const response = await getFromApi("/api/recipes?limit=50");
        setRecipes(response.data);
      } catch (err) {
        setRecipes([]);
        showToast("Impossible de charger les recettes.", "error");
      } finally {
        setLoadingRecipes(false);
      }
    }

    loadAdminRecipes();
  }, [showToast]);

  async function handleDeleteRecipe(recipeId, recipeTitle) {
    const confirmed = window.confirm(
      'Supprimer la recette "' + recipeTitle + '" ?',
    );

    if (confirmed === false) {
      return;
    }

    try {
      await deleteToApi("/api/recipes/" + recipeId);

      const newRecipes = [];
      for (let i = 0; i < recipes.length; i++) {
        if (recipes[i].id !== recipeId) {
          newRecipes.push(recipes[i]);
        }
      }
      setRecipes(newRecipes);
      showToast("Recette supprimée.", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function handleCreateAdminSubmit(event) {
    event.preventDefault();
    setAdminFormError("");

    try {
      await createAdmin(newAdminEmail, newAdminPassword);
      showToast("Administrateur créé avec succès.", "success");
      setNewAdminEmail("");
      setNewAdminPassword("");
    } catch (err) {
      setAdminFormError(err.message);
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-page__header">
        <h1 className="admin-page__title">Le Dashboard de Tetelle</h1>
        <p className="admin-page__email">{auth.user.email}</p>
      </header>

      <section className="admin-page__section admin-page__section--admins">
        <h2 className="admin-page__section-title">Ajouter un administrateur</h2>

        <form className="admin-page__form" onSubmit={handleCreateAdminSubmit}>
          <div className="field">
            <label htmlFor="new-admin-email">Email*</label>
            <input
              id="new-admin-email"
              className="input"
              type="email"
              name="email"
              placeholder="Email du nouvel admin"
              value={newAdminEmail}
              onChange={function (event) {
                setNewAdminEmail(event.target.value);
              }}
            />
          </div>

          <div className="field">
            <label htmlFor="new-admin-password">Mot de passe*</label>
            <input
              id="new-admin-password"
              className="input"
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={newAdminPassword}
              onChange={function (event) {
                setNewAdminPassword(event.target.value);
              }}
            />
          </div>

          {adminFormError !== "" && (
            <p className="alert-error">{adminFormError}</p>
          )}

          <button type="submit" className="btn">
            Créer l'administrateur
          </button>
        </form>
      </section>

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
                      <div className="admin-recipes-table__actions">
                        <Link
                          to={"/admin/recettes/" + recipe.id + "/modifier"}
                          className="btn btn--outline"
                        >
                          Modifier
                        </Link>
                        <Button
                          className="btn--danger"
                          onClick={function () {
                            handleDeleteRecipe(recipe.id, recipe.title);
                          }}
                        >
                          Supprimer
                        </Button>
                      </div>
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
