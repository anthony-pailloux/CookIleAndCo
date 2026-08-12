import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getFromApi } from "../services/api.js";
import { getRecipePhotoUrl } from "../utils/recipePhotoUrl.js";
import RecipeCard from "../components/RecipeCard.jsx";
import "./HomePage.css";
import "../components/Button.css";
import aboutImage from "../assets/table-familiale-cuisine-du-monde-nappe-madras-rhum.webp";
import heroBanner from "../assets/banniere-madras-antilles.webp";

function HomePage() {
  const [featuredRecipes, setFeaturedRecipes] = useState([]);

  useEffect(() => {
    async function loadFeaturedRecipes() {
      try {
        const response = await getFromApi("/api/recipes?limit=3");
        setFeaturedRecipes(response.data);
      } catch (err) {
        setFeaturedRecipes([]);
      }
    }

    loadFeaturedRecipes();
  }, []);

  const [featuredCategories, setFeaturedCategories] = useState([]);

  useEffect(() => {
    async function loadFeaturedCategories() {
      try {
        const response = await getFromApi("/api/categories");
        const firstFour = response.data.slice(0, 4);
        setFeaturedCategories(firstFour);
      } catch (err) {
        setFeaturedCategories([]);
      }
    }

    loadFeaturedCategories();
  }, []);

  return (
    <main className="home">
      <section className="home__hero">
        <div className="home__hero-media" aria-hidden="true">
          <img
            className="home__hero-img"
            src={heroBanner}
            alt=""
            width={1536}
            height={1024}
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
          <div className="home__hero-overlay" />
        </div>
        <div className="home__hero-content">
          <h1>Cook'île & Co</h1>
          <p className="home__hero-accroche">"An Nou Ay !"</p>
          <p className="home__hero-accroche">
            Des antilles aux saveurs du monde
          </p>
        </div>
      </section>

      <section className="home__about">
        <img
          className="home__about-img"
          src={aboutImage}
          alt="Table familiale aux saveurs des Antilles"
        />
        <div className="home__about-text">
          <h2>À propos</h2>
          <p>
            La cuisine de Tetelle sur Cook'île & Co, c'est le goût des Antilles
            et des saveurs du monde, partagé en famille. Recettes
            traditionnelles, douceurs maison et coups de cœur de Tetelle à
            cuisiner à votre rythme.
          </p>
        </div>
      </section>

      <section className="home__recipes">
        <h2>Quelques recettes</h2>

        {featuredRecipes.length === 0 && (
          <p className="home__recipes-empty">Aucune recette pour le moment.</p>
        )}

        {featuredRecipes.length > 0 && (
          <ul className="home__recipes-grid">
            {featuredRecipes.map((recipe, index) => {
              let isFirstCard = false;
              if (index === 0) {
                isFirstCard = true;
              }

              return (
                <li key={recipe.id} className="home__recipes-item">
                  <RecipeCard recipe={recipe} isFirstCard={isFirstCard} />
                </li>
              );
            })}
          </ul>
        )}

        <Link className="btn home__recipes-cta" to="/recettes">
          Voir toutes les recettes
        </Link>
      </section>

      <section className="home__categories">
        <h2>Parcourir par catégorie</h2>

        {featuredCategories.length === 0 && (
          <p className="home__categories-empty">
            Aucune catégorie pour le moment.
          </p>
        )}

        {featuredCategories.length > 0 && (
          <ul className="home__categories-grid">
            {featuredCategories.map((category) => {
              return (
                <li key={category.id}>
                  <Link
                    className="home__categories-card"
                    to={"/recettes?categorie=" + category.name}
                  >
                    <div className="home__categories-photo">
                      <img
                        src={getRecipePhotoUrl(category.image)}
                        alt={category.name}
                      />
                    </div>
                    <span className="home__categories-name">
                      {category.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <Link className="btn home__categories-cta" to="/categories">
          Voir toutes les catégories
        </Link>
      </section>
    </main>
  );
}

export default HomePage;
