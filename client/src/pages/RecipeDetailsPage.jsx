// Fiche d une recette, ingredients, etapes et commentaires.
import { useEffect, useRef, useState } from "react";
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
  buildRecipeCanonicalUrl,
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
  const [sharePanelOpen, setSharePanelOpen] = useState(false);
  const shareAnchorRef = useRef(null);

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

  // Une autre fiche ne doit pas rouvrir le panneau de la précédente.
  useEffect(function () {
    setSharePanelOpen(false);
  }, [id]);

  useEffect(function () {
    if (sharePanelOpen === true) {
      function closeIfOutside(event) {
        const anchor = shareAnchorRef.current;
        let inside = false;

        if (anchor !== null && anchor.contains(event.target)) {
          inside = true;
        }

        if (inside === false) {
          setSharePanelOpen(false);
        }
      }

      function closeOnEscape(event) {
        if (event.key === "Escape") {
          setSharePanelOpen(false);
        }
      }

      document.addEventListener("mousedown", closeIfOutside);
      document.addEventListener("keydown", closeOnEscape);

      return function () {
        document.removeEventListener("mousedown", closeIfOutside);
        document.removeEventListener("keydown", closeOnEscape);
      };
    }
  }, [sharePanelOpen]);

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

  // Taille du fichier. Le CSS (100 % et aspect-ratio) garde le cadrage affiché.
  let imageWidth;
  let imageHeight;
  if (
    typeof recipeDetails.imageWidth === "number" &&
    typeof recipeDetails.imageHeight === "number"
  ) {
    imageWidth = recipeDetails.imageWidth;
    imageHeight = recipeDetails.imageHeight;
  }

  // URL publique, la même que og:url. window.location donnerait localhost en dev.
  const recipeShareUrl = buildRecipeCanonicalUrl(id);

  let whatsappTitle = "";
  if (recipeDetails.title !== null && recipeDetails.title !== undefined) {
    whatsappTitle = String(recipeDetails.title);
  }

  // L'URL doit rester seule sur la dernière ligne, sinon WhatsApp n'attache pas la carte.
  whatsappTitle = whatsappTitle.split("\r").join(" ");
  whatsappTitle = whatsappTitle.split("\n").join(" ");

  const whatsappText = whatsappTitle + "\n" + recipeShareUrl;
  const facebookShareUrl =
    "https://www.facebook.com/sharer/sharer.php?u=" +
    encodeURIComponent(recipeShareUrl);
  const whatsappShareUrl =
    "https://wa.me/?text=" + encodeURIComponent(whatsappText);

  const shareText = "Découvre cette recette sur Cook'île & Co";
  const mailtoUrl =
    "mailto:?subject=" +
    encodeURIComponent(whatsappTitle) +
    "&body=" +
    encodeURIComponent(shareText + "\n" + recipeShareUrl);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(recipeShareUrl);
      showToast("Lien copié !", "success");
      // Le toast confirme la copie : le panneau n'a plus à rester ouvert.
      setSharePanelOpen(false);
    } catch (err) {
      showToast("Impossible de copier le lien.", "error");
    }
  }

  function openSharePanel() {
    console.log("partage fiche — panneau");
    setSharePanelOpen(true);
  }

  function handleShareMain() {
    // Appel direct dans le clic : un await avant share() ferait perdre le geste.
    if (typeof navigator.share !== "function") {
      // Pas de feuille native (Firefox ordinateur, navigateur Cursor).
      if (sharePanelOpen === true) {
        setSharePanelOpen(false);
      } else {
        openSharePanel();
      }
    } else {
      if (sharePanelOpen === true) {
        setSharePanelOpen(false);
      }

      const dataWithText = {
        title: recipeDetails.title,
        text: shareText,
        url: recipeShareUrl,
      };
      const dataWithTitle = {
        title: recipeDetails.title,
        url: recipeShareUrl,
      };
      const dataWithUrl = {
        url: recipeShareUrl,
      };

      let shareData;

      // Safari refuse parfois title + text + url : on choisit avant le seul appel.
      if (
        typeof navigator.canShare !== "function" ||
        navigator.canShare(dataWithText) !== false
      ) {
        shareData = dataWithText;
      } else if (navigator.canShare(dataWithTitle) !== false) {
        shareData = dataWithTitle;
      } else {
        shareData = dataWithUrl;
      }

      console.log("partage fiche — feuille système");

      navigator.share(shareData).catch(function (err) {
        // AbortError = feuille fermée : pas de toast, pas de copie.
        let aborted = false;
        if (err && err.name === "AbortError") {
          aborted = true;
        }

        if (aborted === false) {
          openSharePanel();
        }
      });
    }
  }

  function renderSharePanel() {
    return (
      <div
        className="recipe-detail__share-panel"
        role="dialog"
        id="recipe-share-panel"
        aria-label="Partager cette recette"
      >
        <div className="recipe-detail__share-panel-head">
          <p className="recipe-detail__share-panel-title">Partager</p>
          <button
            type="button"
            className="recipe-detail__share-panel-close"
            aria-label="Fermer"
            onClick={function () {
              setSharePanelOpen(false);
            }}
          >
            <svg
              className="recipe-detail__share-icon-svg"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path
                fill="currentColor"
                d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          </button>
        </div>
        <a
          className="recipe-detail__share-panel-item recipe-detail__share-panel-item--email"
          href={mailtoUrl}
          onClick={function () {
            console.log("partage fiche — email", recipeShareUrl);
            setSharePanelOpen(false);
          }}
        >
          <svg
            className="recipe-detail__share-icon-svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="currentColor"
              d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z"
            />
          </svg>
          <span>E-mail</span>
        </a>
        <a
          className="recipe-detail__share-panel-item recipe-detail__share-panel-item--facebook"
          href={facebookShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={function () {
            console.log("partage fiche — facebook", recipeShareUrl);
            setSharePanelOpen(false);
          }}
        >
          <svg
            className="recipe-detail__share-icon-svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="currentColor"
              d="M15.1 4H12.7C10.4 4 9.2 5.3 9.2 7.4v1.7H7v2.9h2.2V20h3.1v-8h2.6l.4-2.9h-3V7.6c0-.7.2-1.1 1.1-1.1h1.7V4z"
            />
          </svg>
          <span>Facebook</span>
        </a>
        <a
          className="recipe-detail__share-panel-item recipe-detail__share-panel-item--whatsapp"
          href={whatsappShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={function () {
            console.log("partage fiche — whatsapp", recipeShareUrl);
            setSharePanelOpen(false);
          }}
        >
          <svg
            className="recipe-detail__share-icon-svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="currentColor"
              d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.41a10.1 10.1 0 0 0 4.65 1.12h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2zm5.76 13.86c-.24.68-1.2 1.25-1.96 1.41-.52.11-1.2.2-3.48-.75-2.92-1.21-4.8-4.17-4.95-4.36-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.26-.29.58-.36.77-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.82 2 .89 2.15.07.14.12.32.02.51-.1.2-.14.32-.28.49-.14.17-.29.38-.42.51-.14.14-.28.29-.12.56.16.27.7 1.16 1.51 1.88 1.04.92 1.91 1.21 2.18 1.35.27.13.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.6-.14.24.09 1.54.73 1.8.86.27.13.44.2.51.31.07.11.07.64-.17 1.32z"
            />
          </svg>
          <span>WhatsApp</span>
        </a>
        <button
          type="button"
          className="recipe-detail__share-panel-item recipe-detail__share-panel-item--copy"
          onClick={function () {
            console.log("partage fiche — copie", recipeShareUrl);
            handleCopyLink();
          }}
        >
          <svg
            className="recipe-detail__share-icon-svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="currentColor"
              d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
            />
          </svg>
          <span>Copier le lien</span>
        </button>
      </div>
    );
  }

  let sharePanel = null;
  if (sharePanelOpen === true) {
    sharePanel = renderSharePanel();
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
          <div className="recipe-detail__share-links">
            {/* Feuille du navigateur, ou panneau du site s'il n'y en a pas. */}
            <div className="recipe-detail__share-anchor" ref={shareAnchorRef}>
              <button
                type="button"
                className="recipe-detail__share-link recipe-detail__share-link--share"
                aria-label="Partager cette recette"
                aria-haspopup="dialog"
                aria-expanded={sharePanelOpen}
                aria-controls="recipe-share-panel"
                onClick={handleShareMain}
              >
                <svg
                  className="recipe-detail__share-icon-svg"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
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
              {sharePanel}
            </div>
            <a
              className="recipe-detail__share-link recipe-detail__share-link--facebook"
              href={facebookShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Partager sur Facebook"
              onClick={function () {
                console.log("partage fiche — facebook", recipeShareUrl);
              }}
            >
              <svg
                className="recipe-detail__share-icon-svg"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M15.1 4H12.7C10.4 4 9.2 5.3 9.2 7.4v1.7H7v2.9h2.2V20h3.1v-8h2.6l.4-2.9h-3V7.6c0-.7.2-1.1 1.1-1.1h1.7V4z"
                />
              </svg>
            </a>
            <a
              className="recipe-detail__share-link recipe-detail__share-link--whatsapp"
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Partager sur WhatsApp"
              onClick={function () {
                console.log("partage fiche — whatsapp", recipeShareUrl);
              }}
            >
              <svg
                className="recipe-detail__share-icon-svg"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.41a10.1 10.1 0 0 0 4.65 1.12h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2zm5.76 13.86c-.24.68-1.2 1.25-1.96 1.41-.52.11-1.2.2-3.48-.75-2.92-1.21-4.8-4.17-4.95-4.36-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.26-.29.58-.36.77-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.82 2 .89 2.15.07.14.12.32.02.51-.1.2-.14.32-.28.49-.14.17-.29.38-.42.51-.14.14-.28.29-.12.56.16.27.7 1.16 1.51 1.88 1.04.92 1.91 1.21 2.18 1.35.27.13.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.6-.14.24.09 1.54.73 1.8.86.27.13.44.2.51.31.07.11.07.64-.17 1.32z"
                />
              </svg>
            </a>
            <button
              type="button"
              className="recipe-detail__share-link recipe-detail__share-link--copy"
              aria-label="Copier le lien"
              onClick={function () {
                console.log("partage fiche — copie", recipeShareUrl);
                handleCopyLink();
              }}
            >
              <svg
                className="recipe-detail__share-icon-svg"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
                />
              </svg>
            </button>
          </div>
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
            width={imageWidth}
            height={imageHeight}
            onError={(event) => {
              event.currentTarget.src = placeholderPhoto;
            }}
          />
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
