// Page catégories & origines — wireframe PAGE-11
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFromApi } from "../services/api.js";
import { getRecipePhotoUrl } from "../utils/recipePhotoUrl.js";
import placeholderPhoto from "../assets/No_Image_Available.jpg";
import "./CategoriesPage.css";

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [origins, setOrigins] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const categoriesResponse = await getFromApi("/api/categories");
        const originsResponse = await getFromApi("/api/origins");

        console.log("CategoriesPage — catégories:", categoriesResponse.data.length);
        console.log("CategoriesPage — origines:", originsResponse.data.length);

        setCategories(categoriesResponse.data);
        setOrigins(originsResponse.data);
      } catch (err) {
        console.log("CategoriesPage — erreur:", err.message);
        setCategories([]);
        setOrigins([]);
      }
    }

    loadData();
  }, []);

  return (
    <main className="categories-page">
      <header className="categories-page__header">
        <h1>Catégories &amp; origines</h1>
        <p className="categories-page__intro">
          Choisis une catégorie ou une origine pour voir les recettes associées.
        </p>
      </header>

      <section className="categories-page__section">
        <h2>Catégories</h2>

        {categories.length === 0 && (
          <p className="categories-page__empty">Aucune catégorie pour le moment.</p>
        )}

        {categories.length > 0 && (
          <ul className="categories-page__grid">
            {categories.map((category) => {
              return (
                <li key={category.id}>
                  <Link
                    className="categories-page__card"
                    to={"/recettes?categorie=" + category.name}
                  >
                    <div className="categories-page__photo">
                      <img
                        src={getRecipePhotoUrl(category.image)}
                        alt={category.name}
                      />
                    </div>
                    <div className="categories-page__body">
                      <span className="categories-page__name">{category.name}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="categories-page__section categories-page__section--origins">
        <h2>Origines</h2>
        <p className="categories-page__subtitle">
          Des Antilles aux saveurs du monde.
        </p>

        {origins.length === 0 && (
          <p className="categories-page__empty">Aucune origine pour le moment.</p>
        )}

        {origins.length > 0 && (
          <ul className="categories-page__grid">
            {origins.map((origin) => {
              return (
                <li key={origin.id}>
                  <Link
                    className="categories-page__card"
                    to={"/recettes?origine=" + origin.name}
                  >
                    <div className="categories-page__photo">
                      <img src={placeholderPhoto} alt={origin.name} />
                    </div>
                    <div className="categories-page__body">
                      <span className="categories-page__name">{origin.name}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

export default CategoriesPage;