// URL inconnue : titre et lien vers l'accueil, dans le cadre du site.
import { useEffect } from "react";
import "./RecipesPage.css";

function NotFoundPage() {
  useEffect(function () {
    console.log("NotFoundPage — montée");
  }, []);

  return (
    <main className="recipes-page">
      <h1 className="recipes-page__title">Page introuvable</h1>
      <p className="recipes-page__status">
        <a href="/">Retour à l'accueil</a>
      </p>
    </main>
  );
}

export default NotFoundPage;
