import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getFromApi } from "../services/api.js";
import RecipeCard from "../components/RecipeCard.jsx";
import "./HomePage.css";
import "../components/Button.css";
import aboutImage from "../assets/table-familiale-cuisine-du-monde-nappe-madras-rhum.webp";
import placeholderPhoto from "../assets/No_Image_Available.jpg";
import heroBanner from "../assets/banniere-madras-antilles.webp";

function HomePage() {
  const [featuredRecipes, setFeaturedRecipes] = useState([]);

  useEffect(() => {
    async function loadFeaturedRecipes() {
      try {
        const response = await getFromApi("/api/recipes?limit=3");
        console.log("HomePage — recettes:", response.data.length);
        setFeaturedRecipes(response.data);
      } catch (err) {
        console.log("HomePage — erreur recettes:", err.message);
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
      <section
  className="home-hero"
  style={{ backgroundImage: "url(" + heroBanner + ")" }}
>
  <div className="home-hero__content">
    <h1>Tetelle Cook'île & Co</h1>
    <p className="home-hero__accroche">"An Nou Ay !"</p>
    <p className="home-hero__accroche">Des antilles aux saveurs du monde</p>
    <Link className="btn home-hero__cta" to="/recettes">
      Voir le catalogue
    </Link>
  </div>
</section>

      <section className="home-about">
        <img
          className="home-about__img"
          src={aboutImage}
          alt="Table familiale aux saveurs des Antilles"
        />
        <div className="home-about__text">
          <h2>À propos</h2>
          <p>
            Tetelle Cook'île & Co, c'est le goût des Antilles et des saveurs du
            monde, partagé en famille. Recettes traditionnelles, douceurs maison
            et coups de cœur de Tetelle à cuisiner à votre rythme.
          </p>
        </div>
      </section>

      <section className="home-recipes">
        <h2>Quelques recettes</h2>

        {featuredRecipes.length === 0 && (
          <p className="home-recipes__empty">Aucune recette pour le moment.</p>
        )}

        {featuredRecipes.length > 0 && (
          <ul className="home-recipes__grid">
            {featuredRecipes.map((recipe, index) => {
              let isFirstCard = false;
              if (index === 0) {
                isFirstCard = true;
              }

              return (
                <li key={recipe.id} className="home-recipes__item">
                  <RecipeCard recipe={recipe} isFirstCard={isFirstCard} />
                </li>
              );
            })}
          </ul>
        )}

        <Link className="btn home-recipes__cta" to="/recettes">
          Voir toutes les recettes
        </Link>
      </section>

      <section className="home-categories">
        <h2>Parcourir par catégorie</h2>

        {featuredCategories.length === 0 && (
          <p className="home-categories__empty">
            Aucune catégorie pour le moment.
          </p>
        )}

        {featuredCategories.length > 0 && (
          <ul className="home-categories__grid">
            {featuredCategories.map((category) => {
              return (
                <li key={category.id}>
                  <Link
                    className="home-categories__card"
                    to={"/recettes?categorie=" + category.name}
                  >
                    <div className="home-categories__photo">
                      <img src={placeholderPhoto} alt={category.name} />
                    </div>
                    <span className="home-categories__name">
                      {category.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <Link className="btn home-categories__cta" to="/categories">
          Voir toutes les catégories
        </Link>
      </section>
    </main>
  );
}

export default HomePage;
