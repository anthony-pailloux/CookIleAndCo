// Page dashboard : gerer les categories, origines et types de repas.
// Le composant AdminReferenceField fait le CRUD. On ne le reecrit pas.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  listCategories,
  listOrigins,
  listMealTypes,
} from "../services/referenceServices.js";
import { useToast } from "../context/ToastContext.jsx";
import AdminReferenceField from "../components/AdminReferenceField.jsx";
import "../components/Button.css";
import "./AdminPage.css";
import "./AdminReferencesPage.css";

function AdminReferencesPage() {
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);

  // Sert seulement a choisir la ligne a modifier ou a supprimer dans chaque bloc.
  const [categoryId, setCategoryId] = useState("");
  const [originId, setOriginId] = useState("");
  const [mealTypeId, setMealTypeId] = useState("");

  const [loadingLists, setLoadingLists] = useState(true);

  useEffect(
    function () {
      async function loadLists() {
        try {
          const categoriesResponse = await listCategories();
          const originsResponse = await listOrigins();
          const mealTypesResponse = await listMealTypes();

          setCategories(categoriesResponse.data);
          setOrigins(originsResponse.data);
          setMealTypes(mealTypesResponse.data);
        } catch (err) {
          showToast("Impossible de charger les listes.", "error");
        } finally {
          setLoadingLists(false);
        }
      }

      loadLists();
    },
    [showToast],
  );

  return (
    <main className="admin-page admin-references-page">
      <header className="admin-page__header">
        <h1 className="admin-page__title">
          Catégories, origines et types de repas
        </h1>
        <p className="admin-references-page__intro">
          Ces listes servent à classer les recettes.
        </p>
        <Link
          to="/dashboard-admins"
          className="admin-references-page__back-link"
        >
          Retour au dashboard
        </Link>
      </header>

      {loadingLists === true && (
        <p className="admin-page__status">Chargement des listes...</p>
      )}

      {loadingLists === false && (
        <div className="admin-references-page__list">
          <section className="admin-references-page__block">
            <AdminReferenceField
              label="Catégorie"
              selectId="reference-category"
              emptyOptionLabel="Choisir une catégorie"
              apiPath="/api/categories"
              entityLabel="catégorie"
              items={categories}
              onItemsChange={setCategories}
              selectedId={categoryId}
              onSelectedIdChange={setCategoryId}
              supportsImage={true}
            />
          </section>

          <section className="admin-references-page__block">
            <AdminReferenceField
              label="Origine"
              selectId="reference-origin"
              emptyOptionLabel="Choisir une origine"
              apiPath="/api/origins"
              entityLabel="origine"
              items={origins}
              onItemsChange={setOrigins}
              selectedId={originId}
              onSelectedIdChange={setOriginId}
              supportsImage={true}
            />
          </section>

          <section className="admin-references-page__block">
            <AdminReferenceField
              label="Type de repas"
              selectId="reference-meal-type"
              emptyOptionLabel="Choisir un type de repas"
              apiPath="/api/mealTypes"
              entityLabel="type de repas"
              items={mealTypes}
              onItemsChange={setMealTypes}
              selectedId={mealTypeId}
              onSelectedIdChange={setMealTypeId}
            />
          </section>
        </div>
      )}
    </main>
  );
}

export default AdminReferencesPage;
