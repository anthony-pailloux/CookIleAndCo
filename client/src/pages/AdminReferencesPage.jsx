// Page dashboard : gérer les catégories, origines et types de repas.
import { useEffect, useState } from "react";
import {
  listCategories,
  listOrigins,
  listMealTypes,
} from "../services/referenceServices.js";
import { useToast } from "../context/ToastContext.jsx";
import AdminReferenceField from "../components/AdminReferenceField.jsx";
import AdminSectionNav from "../components/AdminSectionNav.jsx";
import "../components/Button.css";
import "./AdminPage.css";
import "./AdminReferencesPage.css";

function AdminReferencesPage() {
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);

  // Sert seulement à choisir la ligne à modifier ou à supprimer dans chaque bloc.
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

  let pageBody = (
    <p className="admin-page__status">Chargement des listes...</p>
  );

  if (loadingLists === false) {
    pageBody = (
      <div className="admin-references-page__stack">
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
          article="une"
        />

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
          article="une"
        />

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
          article="un"
        />
      </div>
    );
  }

  return (
    <main className="admin-page admin-references-page">
      <header className="admin-page__header">
        <h1 className="admin-page__title">
          Catégories, origines et types de repas
        </h1>
      </header>

      <AdminSectionNav />

      {pageBody}
    </main>
  );
}

export default AdminReferencesPage;
