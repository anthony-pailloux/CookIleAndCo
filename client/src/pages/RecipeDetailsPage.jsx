// Page fiche recette — affiche une recette complète (hero, ingrédients, étapes, conseils, partage).
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getFromApi, postToApi } from "../services/api";
import { getRecipePhotoUrl } from "../utils/recipePhotoUrl.js";
import IngredientItem from "../components/IngredientItem.jsx";
import placeholderPhoto from "../assets/No_Image_Available.jpg";
import Button from "../components/Button.jsx";
import "../components/Button.css";
import "./RecipeDetailsPage.css";

function RecipeDetailsPage() {
  const [recipeDetails, setRecipeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [comments, setComments] = useState([]);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [content, setContent] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [commentError, setCommentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    async function loadRecipeDetails() {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await getFromApi(`/api/recipes/${id}`);
        setRecipeDetails(response);
      } catch (err) {
        setRecipeDetails(null);
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadRecipeDetails();
  }, [id]);

  useEffect(() => {
    async function loadCommentsData() {
      try {
        const captchaData = await getFromApi("/api/captcha");
        setCaptchaQuestion(captchaData.question);
        console.log("loadCommentsData — captcha:", captchaData.question);

        const commentsData = await getFromApi(`/api/recipes/${id}/comments`);
        setComments(commentsData);
        console.log("loadCommentsData — count:", commentsData.length);
      } catch (err) {
        console.log("loadCommentsData — erreur:", err.message);
      }
    }

    if (!loading && !errorMessage) {
      loadCommentsData();
    }
  }, [id, loading, errorMessage]);

  async function handleCommentSubmit(event) {
    event.preventDefault();
    setCommentError("");
    setIsSubmitting(true);

    try {
      const newComment = await postToApi(`/api/recipes/${id}/comments`, {
        pseudo: pseudo,
        content: content,
        captchaAnswer: captchaAnswer,
      });

      console.log("handleCommentSubmit — ok:", newComment);

      setComments([newComment, ...comments]);
      setContent("");
      setCaptchaAnswer("");

      const captchaData = await getFromApi("/api/captcha");
      setCaptchaQuestion(captchaData.question);
    } catch (err) {
      setCommentError(err.message);

      const captchaData = await getFromApi("/api/captcha");
      setCaptchaQuestion(captchaData.question);
      setCaptchaAnswer("");
    } finally {
      setIsSubmitting(false);
    }
  }

  // État chargement
  if (loading) {
    return (
      <main className="recipe-detail">
        <p className="recipe-detail__status">Chargement...</p>
      </main>
    );
  }

  // État erreur
  if (errorMessage) {
    return (
      <main className="recipe-detail">
        <p className="recipe-detail__status">{errorMessage}</p>
        <Link className="recipe-detail__back-link" to="/recettes">
          Retour au catalogue
        </Link>
      </main>
    );
  }

  const photoSource = getRecipePhotoUrl(recipeDetails.photo);

  return (
    <main className="recipe-detail">
      {/* Hero */}
      <section className="recipe-detail__hero">
        <div className="recipe-detail__photo">
          <img
            src={photoSource}
            alt={recipeDetails.title}
            onError={(event) => {
              event.currentTarget.src = placeholderPhoto;
            }}
          />
        </div>

        <div className="recipe-detail__intro">
          <h1 className="recipe-detail__title">{recipeDetails.title}</h1>
          <span className="recipe-detail__badge">
            {recipeDetails.category.name}
          </span>
          <p className="recipe-detail__time">
            ⏱ {recipeDetails.cookingTime} minutes
          </p>
          <Button className="btn--outline recipe-detail__share-btn">
            Partager
          </Button>
        </div>
      </section>

      {/* Ingrédients + Préparation */}
      <section className="recipe-detail__body">
        <div className="recipe-detail__ingredients">
          <h2 className="recipe-detail__section-title">Ingrédients</h2>
          <ul className="recipe-detail__ingredient-list">
            {recipeDetails.ingredients.map((ingredient) => {
              return (
                <li key={ingredient.id}>
                  <IngredientItem ingredient={ingredient} />
                </li>
              );
            })}
          </ul>
        </div>

        <div className="recipe-detail__steps">
          <h2 className="recipe-detail__section-title">Préparation</h2>
          <ol className="recipe-detail__step-list">
            {recipeDetails.steps.map((step) => {
              return (
                <li key={step.id}>
                  <span className="recipe-detail__step-num">
                    {step.stepNumber}
                  </span>
                  <p className="recipe-detail__step-text">{step.description}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Conseils de Tetelle */}
      {recipeDetails.tips && (
        <section className="recipe-detail__tips">
          <h2 className="recipe-detail__section-title">Conseils de Tetelle</h2>
          <p>{recipeDetails.tips}</p>
        </section>
      )}

      {/* Btn partage */}
      <section className="recipe-detail__share">
        <Button className="btn--primary recipe-detail__share-main">
          Partager cette recette
        </Button>
        <p className="recipe-detail__share-links">
          <button type="button" className="recipe-detail__share-link">
            Facebook
          </button>
          <span> · </span>
          <button type="button" className="recipe-detail__share-link">
            WhatsApp
          </button>
          <span> · </span>
          <button type="button" className="recipe-detail__share-link">
            Copier le lien
          </button>
        </p>
      </section>


      {/* Commentaires */}
      <section className="recipe-detail__comments">
        <h2 className="recipe-detail__section-title">Commentaires</h2>

        {comments.length === 0 && (
          <p className="recipe-detail__comments-empty">
            Aucun commentaire pour l'instant. Soyez le premier à réagir !
          </p>
        )}

        {comments.length > 0 && (
          <ul className="recipe-detail__comment-list">
            {comments.map(function (comment) {
              return (
                <li key={comment.id} className="recipe-detail__comment-item">
                  <strong>{comment.pseudo}</strong>
                  <p>{comment.content}</p>
                </li>
              );
            })}
          </ul>
        )}

        <form
          className="recipe-detail__comment-form"
          onSubmit={handleCommentSubmit}
        >
          <label htmlFor="comment-pseudo">Votre pseudo</label>
          <input
            id="comment-pseudo"
            name="pseudo"
            type="text"
            maxLength={30}
            value={pseudo}
            onChange={function (event) {
              setPseudo(event.target.value);
            }}
            placeholder="Ex. Marie, Christophe"
            autoComplete="nickname"
          />

          <label htmlFor="comment-content">Votre commentaire</label>
          <textarea
            id="comment-content"
            name="content"
            rows="3"
            value={content}
            onChange={function (event) {
              setContent(event.target.value);
            }}
            placeholder="Partagez votre avis sur cette recette…"
          />

          <label htmlFor="comment-captcha">
            Vérification : {captchaQuestion}
          </label>
          <input
            id="comment-captcha"
            name="captchaAnswer"
            type="number"
            value={captchaAnswer}
            onChange={function (event) {
              setCaptchaAnswer(event.target.value);
            }}
            placeholder="Votre réponse"
          />

          {commentError && (
            <p className="recipe-detail__comment-error">{commentError}</p>
          )}

          <Button
            type="submit"
            className="btn--primary"
            disabled={isSubmitting}
          >
            Publier
          </Button>
        </form>
      </section>
    </main>
  );
}

export default RecipeDetailsPage;
