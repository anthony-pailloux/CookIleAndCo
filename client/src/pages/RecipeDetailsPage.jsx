// Fiche d une recette, ingredients, etapes et commentaires.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getRecipeById,
  listRecipeComments,
  createRecipeComment,
  deleteRecipeComment,
} from "../services/recipeServices.js";
import { recordPageView } from "../services/recipeViewServices.js";
import { getCaptcha } from "../services/captchaServices.js";
import { getRecipePhotoUrl } from "../utils/recipePhotoUrl.js";
import IngredientItem from "../components/IngredientItem.jsx";
import DeleteIconButton from "../components/DeleteIconButton.jsx";
import EditIconButton from "../components/EditIconButton.jsx";
import placeholderPhoto from "../assets/No_Image_Available.jpg";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Feedback, { useFeedback } from "../components/Feedback.jsx";
import {
  applyRecipeDocumentSeo,
  removeNoindexMeta,
  restoreDefaultDocumentSeo,
} from "../utils/recipeSeo.js";
import "../components/Button.css";
import "./RecipeDetailsPage.css";

// Bloque le second envoi de StrictMode, puis se libère au vrai départ de la fiche.
let recordedRecipeViewId = null;

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
  const { confirm } = useFeedback();

  useEffect(() => {
    async function loadRecipeDetails() {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await getRecipeById(id);
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

  useEffect(function () {
    if (recipeDetails) {
      applyRecipeDocumentSeo(recipeDetails);
      return;
    }

    if (errorMessage !== "") {
      restoreDefaultDocumentSeo();
    }
  }, [recipeDetails, errorMessage]);

  useEffect(function () {
    return function () {
      restoreDefaultDocumentSeo();
      removeNoindexMeta();
    };
  }, []);

  useEffect(() => {
    async function loadCommentsData() {
      try {
        const captchaData = await getCaptcha();

        setCaptchaQuestion(captchaData.question);

        const commentsData = await listRecipeComments(id);

        setComments(commentsData);
      } catch (err) {
        setCommentError("Impossible de charger les commentaires.");
      }
    }

    if (!loading && !errorMessage) {
      loadCommentsData();
    }
  }, [id, loading, errorMessage]);

  let loadedRecipeId = null;
  if (recipeDetails) {
    loadedRecipeId = recipeDetails.id;
  }

  useEffect(function () {
    if (loading) {
      return;
    }

    if (errorMessage !== "") {
      return;
    }

    if (loadedRecipeId === null) {
      return;
    }

    if (String(loadedRecipeId) !== String(id)) {
      return;
    }

    if (recordedRecipeViewId === loadedRecipeId) {
      return;
    }

    recordedRecipeViewId = loadedRecipeId;

    recordPageView("recipe", loadedRecipeId).catch(function () {
      // Échec réseau ou refus : la fiche reste lisible, sans message.
    });

    return function () {
      const sentId = loadedRecipeId;

      setTimeout(function () {
        if (recordedRecipeViewId === sentId) {
          recordedRecipeViewId = null;
        }
      }, 0);
    };
  }, [id, loading, errorMessage, loadedRecipeId]);

  async function handleCommentSubmit(event) {
    event.preventDefault();
    setCommentError("");
    setIsSubmitting(true);

    try {
      const newComment = await createRecipeComment(id, {
        pseudo: pseudo,
        content: content,
        captchaAnswer: captchaAnswer,
      });

      setComments([newComment, ...comments]);
      setContent("");
      setCaptchaAnswer("");

      const captchaData = await getCaptcha();
      setCaptchaQuestion(captchaData.question);
    } catch (err) {
      setCommentError(err.message);

      const captchaData = await getCaptcha();
      setCaptchaQuestion(captchaData.question);
      setCaptchaAnswer("");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId, pseudo) {
    const confirmed = await confirm({
      title: "Supprimer le commentaire",
      message: "Le commentaire de « " + pseudo + " » sera retiré de la recette.",
      tone: "error",
      confirmLabel: "Supprimer",
    });

    if (confirmed === false) {
      return;
    }

    try {
      await deleteRecipeComment(id, commentId);

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

  // Etat chargement
  if (loading) {
    return (
      <main className="recipe-detail">
        <p className="recipe-detail__status">Chargement...</p>
      </main>
    );
  }

  // Etat erreur
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

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(recipeShareUrl);
      showToast("Lien copié !", "success");
    } catch (err) {
      showToast("Impossible de copier le lien.", "error");
    }
  }

  function handleShareMain() {
    // Appel direct dans le clic : un await avant share() ferait perdre le geste.
    if (typeof navigator.share === 'function') {
      navigator
        .share({
          title: recipeDetails.title,
          text: "Découvre cette recette sur Cook'île & Co",
          url: recipeShareUrl,
        })
        .catch(function (err) {
          if (err.name === 'AbortError') {
            // Feuille fermée : pas de copie du lien, pas de message d'erreur.
          }
        });
    } else {
      handleCopyLink();
    }
  }

  return (
    <main className="recipe-detail">
      {/* En-tête : surtitre, titre, repères, puis photo encadrée */}
      <section className="recipe-detail__hero">
        <header className="recipe-detail__header">
          <p className="recipe-detail__eyebrow">
            {recipeDetails.category.name}
          </p>
          <h1 className="recipe-detail__title">{recipeDetails.title}</h1>
          <dl className="recipe-detail__meta">
            <div className="recipe-detail__meta-item">
              <dt className="recipe-detail__meta-label">Préparation</dt>
              <dd className="recipe-detail__meta-value">
                {recipeDetails.preparationTime} min
              </dd>
            </div>
            <div className="recipe-detail__meta-item">
              <dt className="recipe-detail__meta-label">Cuisson</dt>
              <dd className="recipe-detail__meta-value">
                {recipeDetails.cookingTime} min
              </dd>
            </div>
            <div className="recipe-detail__meta-item">
              <dt className="recipe-detail__meta-label">Origine</dt>
              <dd className="recipe-detail__meta-value">
                {recipeDetails.origin.name}
              </dd>
            </div>
            <div className="recipe-detail__meta-item">
              <dt className="recipe-detail__meta-label">Type de repas</dt>
              <dd className="recipe-detail__meta-value">
                {recipeDetails.mealType.name}
              </dd>
            </div>
          </dl>
          {auth.admin !== null && (
            <div className="recipe-detail__actions">
              <EditIconButton
                to={
                  "/dashboard-admins/recettes/" +
                  recipeDetails.id +
                  "/modifier"
                }
                ariaLabel={
                  'Modifier la recette "' + recipeDetails.title + '"'
                }
              />
            </div>
          )}
        </header>

        <div className="recipe-detail__photo">
          <img
            src={photoSource}
            alt={recipeDetails.title}
            onError={(event) => {
              event.currentTarget.src = placeholderPhoto;
            }}
          />
          {/* Icône sur la photo : partage natif, ou copie du lien si indisponible. */}
          <button
            type="button"
            className="recipe-detail__share-icon"
            aria-label="Partager cette recette"
            onClick={handleShareMain}
          >
            <svg
              className="recipe-detail__share-icon-svg"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              aria-hidden="true"
              focusable="false"
            >
              <circle
                cx="6"
                cy="12"
                r="2.15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="17"
                cy="7"
                r="2.15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="17"
                cy="17"
                r="2.15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="8.1"
                y1="11.1"
                x2="14.9"
                y2="8.1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="8.1"
                y1="12.9"
                x2="14.9"
                y2="15.9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </section>

      {/* Ingredients + preparation */}
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
            <Feedback tone="error" className="recipe-detail__comment-error">
              {commentError}
            </Feedback>
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
                  {auth.admin !== null && (
                    <DeleteIconButton
                      ariaLabel={
                        'Supprimer le commentaire de "' + comment.pseudo + '"'
                      }
                      onClick={function () {
                        handleDeleteComment(comment.id, comment.pseudo);
                      }}
                    />
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
