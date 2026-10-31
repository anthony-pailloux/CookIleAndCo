// Tableau de bord, comptes admin et liste des recettes.
import { useEffect, useState } from "react";
import { listRecipes, deleteRecipe } from "../services/recipeServices.js";
import { createAdmin, listAdmins, deleteAdmin, updateAdmin } from "../services/authServices.js";
import { useToast } from "../context/ToastContext.jsx";
import { getRecipePhotoUrl } from "../utils/recipePhotoUrl.js";
import { Link, useLocation } from "react-router-dom";
import DeleteIconButton from "../components/DeleteIconButton.jsx";
import EditIconButton from "../components/EditIconButton.jsx";
import AdminSectionNav, {
  isAdminsDashboardSection,
} from "../components/AdminSectionNav.jsx";
import "../components/Button.css";
import "./AdminPage.css";

function AdminPage() {
  const { showToast } = useToast();
  const location = useLocation();

  // q ne touche pas section=admins (onglet comptes). La loupe du header ecrit q ici.
  let adminSearch = "";
  const adminSearchFromUrl = new URLSearchParams(location.search).get("q");
  if (adminSearchFromUrl !== null) {
    adminSearch = adminSearchFromUrl.trim();
  }

  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [trackedSearch, setTrackedSearch] = useState(adminSearch);

  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [adminFormError, setAdminFormError] = useState("");

  const [editingAdminId, setEditingAdminId] = useState(null);
  const [editAdminEmail, setEditAdminEmail] = useState("");
  const [editAdminPassword, setEditAdminPassword] = useState("");
  const [editAdminFormError, setEditAdminFormError] = useState("");

  // Nouvelle recherche : page 1 avant le chargement, pas avec l ancienne page.
  if (trackedSearch !== adminSearch) {
    setTrackedSearch(adminSearch);
    setCurrentPage(1);
  }

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
        search: adminSearch,
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
  }, [currentPage, adminSearch]);

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

  let activeTab = "recipes";
  if (isAdminsDashboardSection(location.search) === true) {
    activeTab = "admins";
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

      <AdminSectionNav />

      {activeTab === "admins" && (
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
                  <th className="admin-recipes-table__actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(function (admin) {
                  return (
                    <tr key={admin.id}>
                      <td data-label="Email">{admin.email}</td>
                      <td
                        className="admin-recipes-table__actions-col"
                        data-label="Actions"
                      >
                        {admin.isProtected === false && (
                          <div className="admin-admins-table__actions">
                            <EditIconButton
                              ariaLabel={
                                "Modifier l'administrateur " + admin.email
                              }
                              onClick={function () {
                                handleStartEditAdmin(admin);
                              }}
                            />
                            <DeleteIconButton
                              ariaLabel={
                                "Supprimer l'administrateur " + admin.email
                              }
                              onClick={function () {
                                handleDeleteAdmin(admin.id, admin.email);
                              }}
                            />
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
      <section className="admin-page__section">
        <h2 className="admin-page__section-title">Mes recettes</h2>

        {loadingRecipes === true && (
          <p className="admin-page__status">Chargement des recettes...</p>
        )}

        {loadingRecipes === false &&
          recipes.length === 0 &&
          adminSearch === "" && (
            <p className="admin-page__status">Aucune recette pour le moment.</p>
          )}

        {loadingRecipes === false &&
          recipes.length === 0 &&
          adminSearch !== "" && (
            <p className="admin-page__status">
              Aucune recette trouvée pour « {adminSearch} ».
            </p>
          )}

        {loadingRecipes === false && recipes.length > 0 && (
          <div className="admin-page__table-wrap">
            <table className="admin-recipes-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Titre</th>
                  <th>Catégorie</th>
                  <th className="admin-recipes-table__actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map(function (recipe) {
                  const photoUrl = getRecipePhotoUrl(recipe.photo);

                  return (
                    <tr key={recipe.id}>
                      <td data-label="Photo">
                        {/* Lien vers la fiche publique, pas vers le formulaire admin. */}
                        <Link
                          className="admin-recipes-table__photo-link"
                          to={"/recettes/" + recipe.id}
                          aria-label={"Voir la fiche : " + recipe.title}
                        >
                          <img
                            src={photoUrl}
                            alt={recipe.title}
                            width="60"
                            height="60"
                          />
                        </Link>
                      </td>
                      <td data-label="Titre">{recipe.title}</td>
                      <td data-label="Catégorie">{recipe.category.name}</td>
                      <td
                        className="admin-recipes-table__actions-col"
                        data-label="Actions"
                      >
                        <div className="admin-recipes-table__actions">
                          <EditIconButton
                            to={
                              "/dashboard-admins/recettes/" +
                              recipe.id +
                              "/modifier"
                            }
                            ariaLabel={
                              'Modifier la recette "' + recipe.title + '"'
                            }
                          />
                          <DeleteIconButton
                            ariaLabel={
                              'Supprimer la recette "' + recipe.title + '"'
                            }
                            onClick={function () {
                              handleDeleteRecipe(recipe.id, recipe.title);
                            }}
                          />
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
