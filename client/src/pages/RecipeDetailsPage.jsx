import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getFromApi, postToApi, deleteToApi } from "../services/api";
import { getRecipePhotoUrl } from "../utils/recipePhotoUrl.js";
import IngredientItem from "../components/IngredientItem.jsx";
import placeholderPhoto from "../assets/No_Image_Available.jpg";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
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
  const auth = useAuth();

  const { id } = useParams();
  const { showToast } = useToast();

  useEffect(function () {
    auth.loadSession();
  }, []);

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

        const commentsData = await getFromApi(`/api/recipes/${id}/comments`);

        setComments(commentsData);
      } catch (err) {
        setCommentError("Impossible de charger les commentaires.");
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

  async function handleDeleteComment(commentId, pseudo) {
    const confirmed = window.confirm(
      'Supprimer le commentaire de "' + pseudo + '" ?',
    );

    if (confirmed === false) {
      return;
    }

    try {
      await deleteToApi("/api/recipes/" + id + "/comments/" + commentId);

      const newComments = [];
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].id !== commentId) {
          newComments.push(comments[i]);
        }
      }
      setComments(newComments);
      showToast("Commentaire supprimé.", "success");
    } catch (err) {
      showToast(err.message, "error");
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

  const recipeShareUrl = window.location.origin + "/recettes/" + id;

  function handleShareFacebook() {
    const facebookUrl =
      "https://www.facebook.com/sharer/sharer.php?u=" +
      encodeURIComponent(recipeShareUrl);

    window.open(facebookUrl, "_blank", "noopener,noreferrer");
  }

  function handleShareWhatsApp() {
    let message = recipeDetails.title + " — Cook'île & Co " + recipeShareUrl;
    const whatsappUrl = "https://wa.me/?text=" + encodeURIComponent(message);

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(recipeShareUrl);
      showToast("Lien copié !", "success");
    } catch (err) {
      showToast("Impossible de copier le lien.", "error");
    }
  }

  async function handleShareMain() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipeDetails.title,
          text: "Découvre cette recette sur Cook'île & Co",
          url: recipeShareUrl,
        });
      } catch (err) {
        // annulation utilisateur : on ne fait rien
      }
    } else {
      await handleCopyLink();
    }
  }

  let isAdmin = false;
  if (auth.user !== null && auth.user.role === "admin") {
    isAdmin = true;
  }

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
          <section className="recipe-detail__share recipe-detail__share--hero">
            <Button
              className="btn--primary recipe-detail__share-main"
              onClick={handleShareMain}
            >
              Partager cette recette
            </Button>
            <p className="recipe-detail__share-links">
              <button
                type="button"
                className="recipe-detail__share-link"
                onClick={handleShareFacebook}
              >
                Facebook
              </button>
              <span> · </span>
              <button
                type="button"
                className="recipe-detail__share-link"
                onClick={handleShareWhatsApp}
              >
                WhatsApp
              </button>
              <span> · </span>
              <button
                type="button"
                className="recipe-detail__share-link"
                onClick={handleCopyLink}
              >
                Copier le lien
              </button>
            </p>
          </section>
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

      {/* Commentaires */}
      <section className="recipe-detail__comments">
        <h2 className="recipe-detail__section-title">Commentaires</h2>

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

          <div className="recipe-detail__captcha">
            <p className="recipe-detail__captcha-title">
              Vérification anti-spam
            </p>

            <div className="recipe-detail__captcha-row">
              <span
                className="recipe-detail__captcha-question"
                aria-hidden="true"
              >
                {captchaQuestion}
              </span>
              <input
                id="comment-captcha"
                name="captchaAnswer"
                type="number"
                className="recipe-detail__captcha-input"
                value={captchaAnswer}
                onChange={function (event) {
                  setCaptchaAnswer(event.target.value);
                }}
                placeholder="Résultat"
                aria-label="Réponse à la vérification"
              />
            </div>

            <p className="recipe-detail__captcha-hint">
              Résous l'addition pour confirmer que tu n'es pas un robot.
            </p>
          </div>

          {commentError && (
            <p className="recipe-detail__comment-error">{commentError}</p>
          )}

          <button
            type="submit"
            className="btn btn--primary recipe-detail__share-main"
            disabled={isSubmitting}
          >
            Publier
          </button>
        </form>

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
                  {isAdmin && (
                    <button
                      type="button"
                      className="recipe-detail__share-link"
                      onClick={function () {
                        handleDeleteComment(comment.id, comment.pseudo);
                      }}
                    >
                      Supprimer
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

export default RecipeDetailsPage;
