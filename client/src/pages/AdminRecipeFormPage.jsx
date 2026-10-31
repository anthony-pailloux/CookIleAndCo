// Page du formulaire recette cote admin.
// Sert a creer une recette ou a modifier une recette deja enregistree.
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getRecipeById,
  createRecipe,
  updateRecipe,
  uploadRecipePhoto,
} from "../services/recipeServices.js";
import {
  listCategories,
  listOrigins,
  listMealTypes,
} from "../services/referenceServices.js";
import { useToast } from "../context/ToastContext.jsx";
import { getRecipePhotoUrl } from "../utils/recipePhotoUrl.js";
import { capitalizeFirstLetter } from "../utils/capitalizeFirstLetter.js";
import AdminSectionNav from "../components/AdminSectionNav.jsx";
import DeleteIconButton from "../components/DeleteIconButton.jsx";
import "../components/Button.css";
import "./AdminPage.css";
import "./AdminRecipeFormPage.css";

function AdminRecipeFormPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { id: recipeId } = useParams();

  // S il y a un numero dans l adresse, on modifie une recette existante.
  let isEditMode = false;
  if (recipeId !== undefined) {
    isEditMode = true;
  }

  const [title, setTitle] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [preparationTime, setPreparationTime] = useState("");
  // Photo choisie sur l ordinateur. On l envoie seulement en enregistrant.
  const [photoFile, setPhotoFile] = useState(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState("");
  // Apercu local du fichier choisi, avant l enregistrement.
  const [chosenPhotoUrl, setChosenPhotoUrl] = useState("");
  const [tips, setTips] = useState("");

  // Les trois listes deroulantes du formulaire.
  const [categories, setCategories] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);

  const [categoryId, setCategoryId] = useState("");
  const [originId, setOriginId] = useState("");
  const [mealTypeId, setMealTypeId] = useState("");

  // Une ligne au depart. Le serveur n accepte pas une liste vide.
  const [ingredients, setIngredients] = useState([
    { quantity: "", unit: "", name: "" },
  ]);

  const [steps, setSteps] = useState([{ description: "" }]);

  // Creation : la seule etape vide est ouverte. Modification : les etapes restent repliees.
  let initialEditingStepIndex = 0;
  if (recipeId !== undefined) {
    initialEditingStepIndex = null;
  }
  const [editingStepIndex, setEditingStepIndex] = useState(
    initialEditingStepIndex,
  );

  // Creation : le seul ingredient vide est ouvert. Modification : les lignes restent repliees.
  let initialEditingIngredientIndex = 0;
  if (recipeId !== undefined) {
    initialEditingIngredientIndex = null;
  }
  const [editingIngredientIndex, setEditingIngredientIndex] = useState(
    initialEditingIngredientIndex,
  );

  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [recipeLoadFailed, setRecipeLoadFailed] = useState(false);

  // Au premier affichage, on recupere les trois listes.
  useEffect(
    function () {
      async function loadFormOptions() {
        try {
          const categoriesResponse = await listCategories();
          const originsResponse = await listOrigins();
          const mealTypesResponse = await listMealTypes();

          setCategories(categoriesResponse.data);
          setOrigins(originsResponse.data);
          setMealTypes(mealTypesResponse.data);
        } catch (err) {
          showToast("Impossible de charger les listes du formulaire.", "error");
        }
      }

      loadFormOptions();
    },
    [showToast],
  );

  // En modification, on remplit les champs avec la recette deja enregistree.
  useEffect(
    function () {
      if (isEditMode === false) {
        return;
      }

      async function loadRecipeForEdit() {
        setLoadingRecipe(true);
        setRecipeLoadFailed(false);

        try {
          const recipe = await getRecipeById(recipeId);

          setTitle(capitalizeFirstLetter(recipe.title));
          setCookingTime(String(recipe.cookingTime));
          setPreparationTime(String(recipe.preparationTime));
          setCurrentPhotoUrl(getRecipePhotoUrl(recipe.photo));

          if (recipe.tips !== null && recipe.tips !== undefined) {
            setTips(capitalizeFirstLetter(recipe.tips));
          } else {
            setTips("");
          }

          setCategoryId(String(recipe.category.id));
          setOriginId(String(recipe.origin.id));
          setMealTypeId(String(recipe.mealType.id));

          // Quantite et unite sont optionnelles. Le serveur peut renvoyer null.
          const loadedIngredients = [];
          for (let i = 0; i < recipe.ingredients.length; i++) {
            const item = recipe.ingredients[i];

            let quantityValue = "";
            if (item.quantity !== null && item.quantity !== undefined) {
              quantityValue = item.quantity;
            }

            let unitValue = "";
            if (item.unit !== null && item.unit !== undefined) {
              unitValue = item.unit;
            }

            loadedIngredients.push({
              quantity: quantityValue,
              unit: unitValue,
              name: capitalizeFirstLetter(item.name),
            });
          }

          // S il n y a aucun ingredient, on montre quand meme une ligne vide.
          if (loadedIngredients.length === 0) {
            loadedIngredients.push({ quantity: "", unit: "", name: "" });
          }
          setIngredients(loadedIngredients);

          const loadedSteps = [];
          for (let j = 0; j < recipe.steps.length; j++) {
            loadedSteps.push({
              description: capitalizeFirstLetter(recipe.steps[j].description),
            });
          }

          if (loadedSteps.length === 0) {
            loadedSteps.push({ description: "" });
          }
          setSteps(loadedSteps);
          // Page courte : on n ouvre aucune etape tant que l admin ne clique pas la ligne.
          setEditingStepIndex(null);
          // Meme choix pour les ingredients deja enregistres.
          setEditingIngredientIndex(null);
        } catch (err) {
          setRecipeLoadFailed(true);
          showToast("Impossible de charger la recette.", "error");
        } finally {
          setLoadingRecipe(false);
        }
      }

      loadRecipeForEdit();
    },
    [recipeId, isEditMode, showToast],
  );

  // Le fichier choisi s affiche tout de suite. On libere l URL au changement.
  useEffect(
    function () {
      let objectUrl = "";

      if (photoFile instanceof File) {
        objectUrl = URL.createObjectURL(photoFile);
        setChosenPhotoUrl(objectUrl);
      } else {
        setChosenPhotoUrl("");
      }

      return function () {
        if (objectUrl !== "") {
          URL.revokeObjectURL(objectUrl);
        }
      };
    },
    [photoFile],
  );

  // On fabrique un nouveau tableau. Sinon React ne voit pas le changement.
  function addIngredient() {
    const newIngredients = [];
    for (let i = 0; i < ingredients.length; i++) {
      newIngredients.push(ingredients[i]);
    }
    newIngredients.push({ quantity: "", unit: "", name: "" });
    setIngredients(newIngredients);
    // Le nouvel ingredient s ouvre. L index vaut la longueur d avant l ajout.
    setEditingIngredientIndex(ingredients.length);
  }

  // On met a jour un champ d une ligne, les autres restent identiques.
  function updateIngredient(ingredientIndex, fieldName, newValue) {
    const newIngredients = [];
    for (let i = 0; i < ingredients.length; i++) {
      if (i === ingredientIndex) {
        const updatedItem = {
          quantity: ingredients[i].quantity,
          unit: ingredients[i].unit,
          name: ingredients[i].name,
        };

        if (fieldName === "quantity") {
          updatedItem.quantity = newValue;
        } else if (fieldName === "unit") {
          updatedItem.unit = newValue;
        } else if (fieldName === "name") {
          updatedItem.name = capitalizeFirstLetter(newValue);
        }

        newIngredients.push(updatedItem);
      } else {
        newIngredients.push(ingredients[i]);
      }
    }
    setIngredients(newIngredients);
  }

  function removeIngredient(ingredientIndex) {
    // On ne supprime pas la derniere ligne, le serveur en veut au moins une.
    if (ingredients.length <= 1) {
      return;
    }

    const newIngredients = [];
    for (let i = 0; i < ingredients.length; i++) {
      if (i !== ingredientIndex) {
        newIngredients.push(ingredients[i]);
      }
    }
    setIngredients(newIngredients);

    // On recale l ingredient ouvert, sinon les champs montreraient la mauvaise ligne.
    if (editingIngredientIndex === null) {
      return;
    }

    if (editingIngredientIndex === ingredientIndex) {
      setEditingIngredientIndex(null);
    } else if (editingIngredientIndex > ingredientIndex) {
      setEditingIngredientIndex(editingIngredientIndex - 1);
    }
  }

  // Pareil que pour les ingredients, avec les etapes.
  function addStep() {
    const newSteps = [];
    for (let i = 0; i < steps.length; i++) {
      newSteps.push(steps[i]);
    }
    newSteps.push({ description: "" });
    setSteps(newSteps);
    // La nouvelle etape s ouvre. L index vaut la longueur d avant l ajout.
    setEditingStepIndex(steps.length);
  }

  function updateStep(stepIndex, newDescription) {
    const newSteps = [];
    for (let i = 0; i < steps.length; i++) {
      if (i === stepIndex) {
        newSteps.push({ description: capitalizeFirstLetter(newDescription) });
      } else {
        newSteps.push(steps[i]);
      }
    }
    setSteps(newSteps);
  }

  function removeStep(stepIndex) {
    if (steps.length <= 1) {
      return;
    }

    const newSteps = [];
    for (let i = 0; i < steps.length; i++) {
      if (i !== stepIndex) {
        newSteps.push(steps[i]);
      }
    }
    setSteps(newSteps);

    // On recale l etape ouverte, sinon le textarea montrerait la mauvaise ligne.
    if (editingStepIndex === null) {
      return;
    }

    if (editingStepIndex === stepIndex) {
      setEditingStepIndex(null);
    } else if (editingStepIndex > stepIndex) {
      setEditingStepIndex(editingStepIndex - 1);
    }
  }

  // D abord on sauve le texte de la recette, ensuite la photo si elle est choisie.
  async function handleSubmit(event) {
    event.preventDefault();

    const recipeBody = {
      title: title,
      cookingTime: Number(cookingTime),
      preparationTime: Number(preparationTime),
      categoryId: Number(categoryId),
      originId: Number(originId),
      mealTypeId: Number(mealTypeId),
      ingredients: ingredients,
      steps: steps,
      tips: tips,
    };

    try {
      let savedRecipeId = "";

      if (isEditMode) {
        await updateRecipe(recipeId, recipeBody);
        savedRecipeId = recipeId;
      } else {
        const createdRecipe = await createRecipe(recipeBody);
        savedRecipeId = String(createdRecipe.id);
      }

      // La photo part dans un appel a part, pas dans le meme envoi que le texte.
      if (photoFile !== null && photoFile !== undefined) {
        try {
          await uploadRecipePhoto(savedRecipeId, photoFile);
        } catch (photoErr) {
          console.log("la photo n a pas pu etre uploadee", savedRecipeId);

          if (isEditMode === false) {
            showToast(
              "Recette enregistrée, mais la photo n'a pas pu être envoyée.",
              "error",
            );
            // La recette est deja sauvee. On ouvre la page modifier pour ne pas en creer une deuxieme.
            // On remplace l adresse actuelle. Le bouton retour ne ramene pas au formulaire vide.
            navigate(
              "/dashboard-admins/recettes/" + savedRecipeId + "/modifier",
              { replace: true },
            );
          } else {
            showToast(photoErr.message, "error");
          }

          return;
        }
      }

      if (isEditMode) {
        showToast("Recette mise à jour.", "success");
      } else {
        showToast("Recette enregistrée.", "success");
      }

      navigate("/dashboard-admins");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  let pageTitle = "Nouvelle recette";
  if (isEditMode) {
    pageTitle = "Modifier la recette";
  }

  let submitLabel = "Enregistrer la recette";
  if (isEditMode) {
    submitLabel = "Mettre à jour la recette";
  }

  // Priorite : fichier choisi, puis photo deja enregistree, sinon le texte vide.
  let photoPreview = (
    <div className="admin-form__photo-fit admin-form__photo-fit--empty">
      <p className="admin-form__photo-empty">Aucune image</p>
    </div>
  );
  if (chosenPhotoUrl !== "") {
    photoPreview = (
      <div className="admin-form__photo-fit">
        <img
          className="admin-form__photo-preview"
          src={chosenPhotoUrl}
          alt="Aperçu de la photo choisie"
        />
      </div>
    );
  } else if (isEditMode === true && currentPhotoUrl !== "") {
    photoPreview = (
      <div className="admin-form__photo-fit">
        <img
          className="admin-form__photo-preview"
          src={currentPhotoUrl}
          alt="Photo actuelle de la recette"
        />
      </div>
    );
  }

  // En modification, on attend que la recette soit chargee avant d afficher le formulaire.
  if (isEditMode && loadingRecipe === true) {
    return (
      <main className="admin-page admin-recipe-form-page">
        <AdminSectionNav />
        <p className="admin-page__status">Chargement de la recette...</p>
      </main>
    );
  }

  // Impossible de charger la recette. Le retour se fait via le lien Dashboard du header.
  if (isEditMode && recipeLoadFailed === true) {
    return (
      <main className="admin-page admin-recipe-form-page">
        <AdminSectionNav />
      </main>
    );
  }

  return (
    <main className="admin-page admin-recipe-form-page">
      <header className="admin-page__header">
        <h1 className="admin-page__title">{pageTitle}</h1>
      </header>

      <AdminSectionNav />

      <form className="admin-form" onSubmit={handleSubmit}>
        <fieldset className="admin-form__section admin-form__section--infos">
          <legend>Informations générales</legend>

          <div className="admin-form__infos-layout">
            <div className="admin-form__infos-grid">
              <div className="admin-form__infos-pair">
                <div className="admin-form__field">
                  <label htmlFor="recipe-title">Titre *</label>
                  <input
                    id="recipe-title"
                    className="input"
                    type="text"
                    value={title}
                    onChange={function (event) {
                      setTitle(capitalizeFirstLetter(event.target.value));
                    }}
                  />
                </div>

                <div className="admin-form__field">
                  <label htmlFor="recipe-photo">Photo</label>
                  <div className="admin-form__file-frame">
                    <input
                      id="recipe-photo"
                      className="input admin-form__file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      aria-label="Photo de la recette"
                      onChange={function (event) {
                        const selectedFile = event.target.files[0];
                        setPhotoFile(selectedFile);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form__infos-pair">
                <div className="admin-form__field">
                  <label htmlFor="recipe-cooking-time">
                    Temps de cuisson <span className="admin-form__time-suffix">(min) *</span>
                  </label>
                  <input
                    id="recipe-cooking-time"
                    className="input"
                    type="number"
                    min="1"
                    value={cookingTime}
                    onChange={function (event) {
                      setCookingTime(event.target.value);
                    }}
                  />
                </div>

                <div className="admin-form__field">
                  <label htmlFor="recipe-preparation-time">
                    Temps de préparation <span className="admin-form__time-suffix">(min) *</span>
                  </label>
                  <input
                    id="recipe-preparation-time"
                    className="input"
                    type="number"
                    min="1"
                    value={preparationTime}
                    onChange={function (event) {
                      setPreparationTime(event.target.value);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="admin-form__photo-column">
              {photoPreview}
            </div>
          </div>
        </fieldset>

        <fieldset className="admin-form__section admin-form__section--with-add">
          <legend>Ingrédients</legend>

          <div className="admin-form__ingredients">
            {ingredients.map(function (ingredient, ingredientIndex) {
              const lineNumber = ingredientIndex + 1;
              const quantityId = "ingredient-quantity-" + ingredientIndex;
              const unitId = "ingredient-unit-" + ingredientIndex;
              const nameId = "ingredient-name-" + ingredientIndex;

              let deleteButton = null;
              if (ingredients.length > 1) {
                deleteButton = (
                  <DeleteIconButton
                    ariaLabel={"Supprimer l'ingrédient " + lineNumber}
                    onClick={function () {
                      removeIngredient(ingredientIndex);
                    }}
                  />
                );
              }

              if (editingIngredientIndex === ingredientIndex) {
                return (
                  <div
                    key={ingredientIndex}
                    className="admin-form__ingredient admin-form__ingredient--open"
                  >
                    <div className="admin-form__step-row">
                      <span className="admin-form__ingredient-title">
                        Ingrédient {lineNumber}
                      </span>
                      {deleteButton}
                    </div>

                    <div className="admin-form__ingredient-fields">
                      <div
                        className="admin-form__ingredient-head"
                        aria-hidden="true"
                      >
                        <span>Quantité</span>
                        <span>Unité</span>
                        <span>Nom *</span>
                      </div>

                      <div className="admin-form__ingredient-line">
                        <div className="admin-form__ingredient-cell">
                          <label
                            className="admin-form__ingredient-caption"
                            htmlFor={quantityId}
                          >
                            Quantité
                            <span className="admin-form__sr-only">
                              , ingrédient {lineNumber}
                            </span>
                          </label>
                          <input
                            id={quantityId}
                            className="input"
                            type="text"
                            value={ingredient.quantity}
                            onChange={function (event) {
                              updateIngredient(
                                ingredientIndex,
                                "quantity",
                                event.target.value,
                              );
                            }}
                          />
                        </div>

                        <div className="admin-form__ingredient-cell">
                          <label
                            className="admin-form__ingredient-caption"
                            htmlFor={unitId}
                          >
                            Unité
                            <span className="admin-form__sr-only">
                              , ingrédient {lineNumber}
                            </span>
                          </label>
                          <input
                            id={unitId}
                            className="input"
                            type="text"
                            value={ingredient.unit}
                            onChange={function (event) {
                              updateIngredient(
                                ingredientIndex,
                                "unit",
                                event.target.value,
                              );
                            }}
                          />
                        </div>

                        <div className="admin-form__ingredient-cell admin-form__ingredient-name">
                          <label
                            className="admin-form__ingredient-caption"
                            htmlFor={nameId}
                          >
                            Nom *
                            <span className="admin-form__sr-only">
                              , ingrédient {lineNumber}
                            </span>
                          </label>
                          <input
                            id={nameId}
                            className="input"
                            type="text"
                            value={ingredient.name}
                            onChange={function (event) {
                              updateIngredient(
                                ingredientIndex,
                                "name",
                                event.target.value,
                              );
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              const previewParts = [];
              if (
                ingredient.quantity !== "" &&
                ingredient.quantity !== null &&
                ingredient.quantity !== undefined
              ) {
                previewParts.push(String(ingredient.quantity));
              }
              if (ingredient.unit !== "") {
                previewParts.push(ingredient.unit);
              }
              if (ingredient.name !== "") {
                previewParts.push(ingredient.name);
              }

              let previewText = "Ingrédient vide";
              let previewClassName =
                "admin-form__step-preview admin-form__step-preview--empty";
              let previewTitle;
              if (previewParts.length > 0) {
                previewText = previewParts.join(" ");
                previewClassName = "admin-form__step-preview";
                previewTitle = previewText;
              }

              return (
                <div key={ingredientIndex} className="admin-form__ingredient">
                  {/* Clic sur le texte : ouvre cet ingredient pour le modifier. */}
                  <div
                    className="admin-form__step-row"
                    onClick={function () {
                      setEditingIngredientIndex(ingredientIndex);
                    }}
                  >
                    <button type="button" className="admin-form__step-summary">
                      <span className={previewClassName} title={previewTitle}>
                        {previewText}
                      </span>
                    </button>
                    {deleteButton}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="btn btn--primary admin-form__add-btn"
            aria-label="Ajouter un ingrédient"
            onClick={addIngredient}
          >
            +
          </button>
        </fieldset>

        <fieldset className="admin-form__section admin-form__section--with-add">
          <legend>Préparation</legend>

          <ol className="admin-form__steps">
            {steps.map(function (step, stepIndex) {
              const stepNumber = stepIndex + 1;

              if (editingStepIndex === stepIndex) {
                return (
                  <li
                    key={stepIndex}
                    className="admin-form__step admin-form__step--open"
                  >
                    <div className="admin-form__step-row">
                      <label htmlFor={"step-description-" + stepIndex}>
                        Étape {stepNumber}
                      </label>
                      {steps.length > 1 && (
                        <DeleteIconButton
                          ariaLabel={"Supprimer l'étape " + stepNumber}
                          onClick={function () {
                            removeStep(stepIndex);
                          }}
                        />
                      )}
                    </div>
                    <textarea
                      id={"step-description-" + stepIndex}
                      className="input admin-form__textarea"
                      rows="4"
                      value={step.description}
                      onChange={function (event) {
                        updateStep(stepIndex, event.target.value);
                      }}
                    />
                  </li>
                );
              }

              let previewText = "Étape vide";
              let previewClassName =
                "admin-form__step-preview admin-form__step-preview--empty";
              let previewTitle;
              if (step.description !== "") {
                previewText = step.description;
                previewClassName = "admin-form__step-preview";
                previewTitle = step.description;
              }

              return (
                <li key={stepIndex} className="admin-form__step">
                  {/* Clic sur pastille + texte : meme action que l ancien bouton Modifier. */}
                  <div
                    className="admin-form__step-row"
                    onClick={function () {
                      setEditingStepIndex(stepIndex);
                    }}
                  >
                    <button type="button" className="admin-form__step-summary">
                      <span
                        className="admin-form__step-number"
                        aria-hidden="true"
                      >
                        {stepNumber}
                      </span>
                      <span className={previewClassName} title={previewTitle}>
                        {previewText}
                      </span>
                    </button>
                    {steps.length > 1 && (
                      <DeleteIconButton
                        ariaLabel={"Supprimer l'étape " + stepNumber}
                        onClick={function () {
                          removeStep(stepIndex);
                        }}
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <button
            type="button"
            className="btn btn--primary admin-form__add-btn"
            aria-label="Ajouter une étape"
            onClick={addStep}
          >
            +
          </button>
        </fieldset>

        <fieldset className="admin-form__section">
          <legend>Conseils de Tetelle</legend>

          <div className="admin-form__field">
            <label htmlFor="recipe-tips">Conseils et astuces</label>
            <textarea
              id="recipe-tips"
              className="input admin-form__textarea"
              rows="4"
              value={tips}
              onChange={function (event) {
                setTips(capitalizeFirstLetter(event.target.value));
              }}
            />
          </div>
        </fieldset>

        <fieldset className="admin-form__section">
          <legend>Classification</legend>

          <div className="admin-form__class-row">
            <div className="admin-form__field">
              <label htmlFor="recipe-category">Catégorie *</label>
              <select
                id="recipe-category"
                className="input"
                value={categoryId}
                onChange={function (event) {
                  setCategoryId(event.target.value);
                }}
              >
                <option value="">Choisir une catégorie</option>
                {categories.map(function (item) {
                  return (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="admin-form__field">
              <label htmlFor="recipe-origin">Origine *</label>
              <select
                id="recipe-origin"
                className="input"
                value={originId}
                onChange={function (event) {
                  setOriginId(event.target.value);
                }}
              >
                <option value="">Choisir une origine</option>
                {origins.map(function (item) {
                  return (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="admin-form__field">
              <label htmlFor="recipe-meal-type">Type de repas *</label>
              <select
                id="recipe-meal-type"
                className="input"
                value={mealTypeId}
                onChange={function (event) {
                  setMealTypeId(event.target.value);
                }}
              >
                <option value="">Choisir un type de repas</option>
                {mealTypes.map(function (item) {
                  return (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </fieldset>

        <div className="admin-form__actions">
          <button
            type="submit"
            className="btn btn--primary admin-form__submit-btn"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </main>
  );
}

export default AdminRecipeFormPage;
