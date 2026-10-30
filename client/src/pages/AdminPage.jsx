// Tableau de bord, comptes admin et liste des recettes.
import { useEffect, useState } from "react";
import { listRecipes, deleteRecipe } from "../services/recipeServices.js";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [adminFormError, setAdminFormError] = useState("");

  const [editingAdminId, setEditingAdminId] = useState(null);
  const [editAdminEmail, setEditAdminEmail] = useState("");
  const [editAdminPassword, setEditAdminPassword] = useState("");
  const [editAdminFormError, setEditAdminFormError] = useState("");

  const [activeTab, setActiveTab] = useState("recipes");

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

  // 12 recettes par page, comme le catalogue public.
  async function loadAdminRecipes(pageToLoad) {
    setLoadingRecipes(true);

    try {
      const response = await listRecipes({
        page: pageToLoad,
        limit: 12,
      });

      setRecipes(response.data);

      let pagesCount = 0;
      if (response.meta !== undefined && response.meta !== null) {
        pagesCount = response.meta.totalPages;
      }
      setTotalPages(pagesCount);

      // Apres une suppression, la page demandee peut ne plus exister.
      if (pagesCount === 0) {
        if (pageToLoad !== 1) {
          setCurrentPage(1);
        }
      } else if (pageToLoad > pagesCount) {
        setCurrentPage(pagesCount);
      }
    } catch (err) {
      setRecipes([]);
      setTotalPages(0);
      showToast("Impossible de charger les recettes.", "error");
    } finally {
      setLoadingRecipes(false);
    }
  }

  useEffect(() => {
    loadAdminRecipes(currentPage);
    // showToast n est pas une dependance : une nouvelle fonction recrerait la liste en boucle
  }, [currentPage]);

  useEffect(() => {
    loadAdminsList();
  }, []);

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
      await deleteRecipe(recipeId);
      showToast("Recette supprimée.", "success");

      // Derniere ligne de la page : on recule, le useEffect recharge la liste.
      if (recipes.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        await loadAdminRecipes(currentPage);
      }
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

  let recipesTabClassName;
  if (activeTab === "recipes") {
    recipesTabClassName = "admin-page__tab admin-page__tab--active";
  } else {
    recipesTabClassName = "admin-page__tab";
  }

  let adminsTabClassName;
  if (activeTab === "admins") {
    adminsTabClassName = "admin-page__tab admin-page__tab--active";
  } else {
    adminsTabClassName = "admin-page__tab";
  }

  function goToPage(pageNumber) {
    if (pageNumber < 1) {
      return;
    }

    if (totalPages > 0 && pageNumber > totalPages) {
      return;
    }

    setCurrentPage(pageNumber);
  }

  const pageButtons = [];
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    let pageBtnClass = "admin-page__pagination-page";
    if (pageNum === currentPage) {
      pageBtnClass =
        "admin-page__pagination-page admin-page__pagination-page--active";
    }

    pageButtons.push(
      <button
        key={pageNum}
        type="button"
        className={pageBtnClass}
        onClick={function () {
          goToPage(pageNum);
        }}
      >
        {pageNum}
      </button>,
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-page__header">
        <h1 className="admin-page__title">Le Dashboard de Tetelle</h1>
      </header>

      {/* Barre d'onglets : un seul panneau visible */}
      <div
        className="admin-page__tabs"
        role="tablist"
        aria-label="Sections du dashboard"
      >
        <button
          type="button"
          id="admin-tab-recipes"
          role="tab"
          className={recipesTabClassName}
          aria-selected={activeTab === "recipes"}
          aria-controls="admin-panel-recipes"
          onClick={function () {
            setActiveTab("recipes");
          }}
        >
          Mes recettes
        </button>
        <button
          type="button"
          id="admin-tab-admins"
          role="tab"
          className={adminsTabClassName}
          aria-selected={activeTab === "admins"}
          aria-controls="admin-panel-admins"
          onClick={function () {
            setActiveTab("admins");
          }}
        >
          Administrateurs
        </button>
      </div>

      {activeTab === "admins" && (
      <section
        className="admin-page__section admin-page__section--admins"
        id="admin-panel-admins"
        role="tabpanel"
        aria-labelledby="admin-tab-admins"
      >
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(function (admin) {
                  return (
                    <tr key={admin.id}>
                      <td data-label="Email">{admin.email}</td>
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
              autoComplete="off"
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
              autoComplete="new-password"
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
      )}

      {activeTab === "recipes" && (
      <section
        className="admin-page__section"
        id="admin-panel-recipes"
        role="tabpanel"
        aria-labelledby="admin-tab-recipes"
      >
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

        {loadingRecipes === false && totalPages > 1 && (
          <nav
            className="admin-page__pagination"
            aria-label="Pagination des recettes"
          >
            <button
              type="button"
              className="admin-page__pagination-nav"
              disabled={currentPage <= 1}
              onClick={function () {
                goToPage(currentPage - 1);
              }}
            >
              ← Préc
            </button>

            {pageButtons}

            <button
              type="button"
              className="admin-page__pagination-nav"
              disabled={currentPage >= totalPages}
              onClick={function () {
                goToPage(currentPage + 1);
              }}
            >
              Suiv →
            </button>
          </nav>
        )}
      </section>
      )}
    </main>
  );
}

export default AdminPage;
