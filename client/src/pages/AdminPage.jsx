import { useEffect, useState } from "react";
import { getFromApi, deleteToApi } from "../services/api.js";
import { createAdmin, listAdmins, deleteAdmin, updateAdmin } from "../services/authServices.js";
import { useToast } from "../context/ToastContext.jsx";
import { getRecipePhotoUrl } from "../utils/recipePhotoUrl.js";
import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import "../components/Button.css";
import "./AdminPage.css";

function AdminPage() {
  const { showToast } = useToast();

  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);

  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [adminFormError, setAdminFormError] = useState("");

  const [editingAdminId, setEditingAdminId] = useState(null);
  const [editAdminEmail, setEditAdminEmail] = useState("");
  const [editAdminPassword, setEditAdminPassword] = useState("");
  const [editAdminFormError, setEditAdminFormError] = useState("");

  async function loadAdminsList() {
    setLoadingAdmins(true);

    try {
      const response = await listAdmins();
      setAdmins(response.data);
    } catch (err) {
      setAdmins([]);
      showToast("Impossible de charger les administrateurs.", "error");
    }

    setLoadingAdmins(false);
  }

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
    loadAdminsList();
  }, [showToast]);

  function handleStartEditAdmin(admin) {
    setEditingAdminId(admin.id);
    setEditAdminEmail(admin.email);
    setEditAdminPassword("");
    setEditAdminFormError("");
    setAdminFormError("");
  }

  function handleCancelEditAdmin() {
    setEditingAdminId(null);
    setEditAdminEmail("");
    setEditAdminPassword("");
    setEditAdminFormError("");
  }

  async function handleUpdateAdminSubmit(event) {
    event.preventDefault();
    setEditAdminFormError("");

    try {
      await updateAdmin(editingAdminId, editAdminEmail, editAdminPassword);
      showToast("Administrateur modifié avec succès.", "success");
      handleCancelEditAdmin();
      await loadAdminsList();
    } catch (err) {
      setEditAdminFormError(err.message);
    }
  }

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
      await loadAdminsList();
    } catch (err) {
      setAdminFormError(err.message);
    }
  }

  async function handleDeleteAdmin(adminId, adminEmail) {
    const confirmed = window.confirm(
      "Supprimer l'administrateur \"" + adminEmail + '" ?',
    );

    if (confirmed === false) {
      return;
    }

    try {
      await deleteAdmin(adminId);

      if (editingAdminId === adminId) {
        handleCancelEditAdmin();
      }

      const newAdmins = [];
      for (let i = 0; i < admins.length; i++) {
        if (admins[i].id !== adminId) {
          newAdmins.push(admins[i]);
        }
      }
      setAdmins(newAdmins);
      showToast("Administrateur supprimé.", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-page__header">
        <h1 className="admin-page__title">Le Dashboard de Tetelle</h1>
      </header>

      <section className="admin-page__section admin-page__section--admins">
        <h2 className="admin-page__section-title">Administrateurs</h2>

        {loadingAdmins === true && (
          <p className="admin-page__status">
            Chargement des administrateurs...
          </p>
        )}

        {loadingAdmins === false && admins.length === 0 && (
          <p className="admin-page__status">Aucun administrateur.</p>
        )}

        {loadingAdmins === false && admins.length > 0 && (
          <div className="admin-page__table-wrap">
            <table className="admin-recipes-table admin-admins-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(function (admin) {
                  return (
                    <tr key={admin.id}>
                      <td data-label="Email">{admin.email}</td>
                      <td data-label="Rôle">
                        {admin.isPrincipal === true && (
                          <span className="admin-admins-table__badge">
                            Principal
                          </span>
                        )}
                        {admin.isDev === true && (
                          <span className="admin-admins-table__badge admin-admins-table__badge--dev">
                            Dev
                          </span>
                        )}
                        {admin.isPrincipal === false && admin.isDev === false && (
                          <span>Admin</span>
                        )}
                      </td>
                      <td data-label="Actions">
                        {admin.isProtected === false && (
                          <div className="admin-admins-table__actions">
                            <Button
                              className="btn--outline"
                              onClick={function () {
                                handleStartEditAdmin(admin);
                              }}
                            >
                              Modifier
                            </Button>
                            <Button
                              className="btn--danger"
                              onClick={function () {
                                handleDeleteAdmin(admin.id, admin.email);
                              }}
                            >
                              Supprimer
                            </Button>
                          </div>
                        )}
                        {admin.isProtected === true && (
                          <span className="admin-page__status">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {editingAdminId !== null && (
          <>
            <h3 className="admin-page__subsection-title">
              Modifier l'administrateur
            </h3>

            <form
              className="admin-page__form"
              onSubmit={handleUpdateAdminSubmit}
            >
              <div className="field">
                <label htmlFor="edit-admin-email">Email*</label>
                <input
                  id="edit-admin-email"
                  className="input"
                  type="email"
                  name="email"
                  value={editAdminEmail}
                  onChange={function (event) {
                    setEditAdminEmail(event.target.value);
                  }}
                />
              </div>

              <div className="field">
                <label htmlFor="edit-admin-password">Mot de passe*</label>
                <input
                  id="edit-admin-password"
                  className="input"
                  type="password"
                  name="password"
                  placeholder="Nouveau mot de passe"
                  value={editAdminPassword}
                  onChange={function (event) {
                    setEditAdminPassword(event.target.value);
                  }}
                />
              </div>

              {editAdminFormError !== "" && (
                <p className="alert-error">{editAdminFormError}</p>
              )}

              <div className="admin-page__form-actions">
                <button type="submit" className="btn">
                  Enregistrer
                </button>
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={handleCancelEditAdmin}
                >
                  Annuler
                </button>
              </div>
            </form>
          </>
        )}

        <h3 className="admin-page__subsection-title">
          Ajouter un administrateur
        </h3>

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
        <Link
          to="/dashboard-admins/recettes/nouvelle"
          className="btn admin-page__add-btn"
        >
          + Ajouter une recette
        </Link>

        {loadingRecipes === true && (
          <p className="admin-page__status">Chargement des recettes...</p>
        )}

        {loadingRecipes === false && recipes.length === 0 && (
          <p className="admin-page__status">Aucune recette pour le moment.</p>
        )}

        {loadingRecipes === false && recipes.length > 0 && (
          <div className="admin-page__table-wrap">
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
                      <td data-label="Photo">
                        <img
                          src={photoUrl}
                          alt={recipe.title}
                          width="60"
                          height="60"
                        />
                      </td>
                      <td data-label="Titre">{recipe.title}</td>
                      <td data-label="Catégorie">{recipe.category.name}</td>
                      <td data-label="Actions">
                        <div className="admin-recipes-table__actions">
                          <Link
                            to={
                              "/dashboard-admins/recettes/" +
                              recipe.id +
                              "/modifier"
                            }
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
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminPage;
