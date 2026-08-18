// Formulaire admin — création et modification de recette.
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getFromApi, postToApi, putToApi } from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { getRecipePhotoUrl } from "../utils/recipePhotoUrl.js";
import AdminReferenceField from "../components/AdminReferenceField.jsx";
import "../components/Button.css";
import "./AdminPage.css";
import "./AdminRecipeFormPage.css";

const apiBaseUrl = import.meta.env.VITE_API_URL || '';

function AdminRecipeFormPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { id: recipeId } = useParams();

  let isEditMode = false;
  if (recipeId !== undefined) {
    isEditMode = true;
  }

  const [title, setTitle] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState("");
  const [tips, setTips] = useState("");

  const [categories, setCategories] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);

  const [categoryId, setCategoryId] = useState("");
  const [originId, setOriginId] = useState("");
  const [mealTypeId, setMealTypeId] = useState("");

  const [ingredients, setIngredients] = useState([
    { quantity: "", unit: "", name: "" },
  ]);

  const [steps, setSteps] = useState([{ description: "" }]);

  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [recipeLoadFailed, setRecipeLoadFailed] = useState(false);

  useEffect(
    function () {
      async function loadFormOptions() {
        try {
          const categoriesResponse = await getFromApi("/api/categories");
          const originsResponse = await getFromApi("/api/origins");
          const mealTypesResponse = await getFromApi("/api/mealTypes");

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

  useEffect(
    function () {
      if (isEditMode === false) {
        return;
      }

      async function loadRecipeForEdit() {
        setLoadingRecipe(true);
        setRecipeLoadFailed(false);

        try {
          const recipe = await getFromApi("/api/recipes/" + recipeId);

          setTitle(recipe.title);
          setCookingTime(String(recipe.cookingTime));
          setCurrentPhotoUrl(getRecipePhotoUrl(recipe.photo));

          if (recipe.tips !== null && recipe.tips !== undefined) {
            setTips(recipe.tips);
          } else {
            setTips("");
          }

          setCategoryId(String(recipe.category.id));
          setOriginId(String(recipe.origin.id));
          setMealTypeId(String(recipe.mealType.id));

          const loadedIngredients = [];
          for (let i = 0; i < recipe.ingredients.length; i++) {
            const item = recipe.ingredients[i];

            let unitValue = "";
            if (item.unit !== null && item.unit !== undefined) {
              unitValue = item.unit;
            }

            loadedIngredients.push({
              quantity: item.quantity,
              unit: unitValue,
              name: item.name,
            });
          }

          if (loadedIngredients.length === 0) {
            loadedIngredients.push({ quantity: "", unit: "", name: "" });
          }
          setIngredients(loadedIngredients);

          const loadedSteps = [];
          for (let j = 0; j < recipe.steps.length; j++) {
            loadedSteps.push({
              description: recipe.steps[j].description,
            });
          }

          if (loadedSteps.length === 0) {
            loadedSteps.push({ description: "" });
          }
          setSteps(loadedSteps);
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

  function addIngredient() {
    const newIngredients = [];
    for (let i = 0; i < ingredients.length; i++) {
      newIngredients.push(ingredients[i]);
    }
    newIngredients.push({ quantity: "", unit: "", name: "" });
    setIngredients(newIngredients);
  }

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
          updatedItem.name = newValue;
        }

        newIngredients.push(updatedItem);
      } else {
        newIngredients.push(ingredients[i]);
      }
    }
    setIngredients(newIngredients);
  }

  function removeIngredient(ingredientIndex) {
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
  }

  function addStep() {
    const newSteps = [];
    for (let i = 0; i < steps.length; i++) {
      newSteps.push(steps[i]);
    }
    newSteps.push({ description: "" });
    setSteps(newSteps);
  }

  function updateStep(stepIndex, newDescription) {
    const newSteps = [];
    for (let i = 0; i < steps.length; i++) {
      if (i === stepIndex) {
        newSteps.push({ description: newDescription });
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
  }

  async function uploadRecipePhoto(targetRecipeId, file) {
    const formData = new FormData();
    formData.append("photo", file);

    const photoResponse = await fetch(
      apiBaseUrl + "/api/recipes/" + targetRecipeId + "/photo",
      {
        method: "POST",
        credentials: "include",
        body: formData,
      },
    );

    const data = await photoResponse.json();

    if (!photoResponse.ok) {
      let message;
      if (data && data.error) {
        message = data.error;
      } else {
        message = "Erreur serveur";
      }
      throw new Error(message);
    }

    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const recipeBody = {
      title: title,
      cookingTime: Number(cookingTime),
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
        await putToApi("/api/recipes/" + recipeId, recipeBody);
        savedRecipeId = recipeId;
      } else {
        const createdRecipe = await postToApi("/api/recipes", recipeBody);
        savedRecipeId = String(createdRecipe.id);
      }

      if (photoFile !== null && photoFile !== undefined) {
        try {
          await uploadRecipePhoto(savedRecipeId, photoFile);
        } catch (photoErr) {
          showToast(photoErr.message, "error");
          return;
        }
      }

      if (isEditMode) {
        showToast("Recette mise à jour.", "success");
      } else {
        showToast("Recette enregistrée.", "success");
      }

      navigate("/dashbord-admins");
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

  if (isEditMode && loadingRecipe === true) {
    return (
      <main className="admin-page admin-recipe-form-page">
        <p className="admin-page__status">Chargement de la recette...</p>
      </main>
    );
  }

  if (isEditMode && recipeLoadFailed === true) {
    return (
      <main className="admin-page admin-recipe-form-page">
        <Link to="/dashbord-admins" className="admin-recipe-form-page__back-link">
          Retour au dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="admin-page admin-recipe-form-page">
      <header className="admin-page__header">
        <h1 className="admin-page__title">{pageTitle}</h1>
      </header>

      <form className="admin-form" onSubmit={handleSubmit}>
        <fieldset className="admin-form__section">
          <legend>Informations générales</legend>

          <div className="admin-form__field">
            <label htmlFor="recipe-title">Titre *</label>
            <input
              id="recipe-title"
              className="input"
              type="text"
              value={title}
              onChange={function (event) {
                setTitle(event.target.value);
              }}
            />
          </div>

          <div className="admin-form__field">
            <label htmlFor="recipe-cooking-time">
              Temps de cuisson (min) *
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
            <label htmlFor="recipe-photo">Photo</label>
            {isEditMode && currentPhotoUrl !== "" && (
              <img
                className="admin-reference-field__preview"
                src={currentPhotoUrl}
                alt="Photo actuelle"
              />
            )}
            <input
              id="recipe-photo"
              className="input admin-form__file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={function (event) {
                const selectedFile = event.target.files[0];
                setPhotoFile(selectedFile);
              }}
            />
          </div>
        </fieldset>

        <fieldset className="admin-form__section">
          <legend>Ingrédients</legend>

          {ingredients.map(function (ingredient, ingredientIndex) {
            return (
              <fieldset key={ingredientIndex} className="admin-form__group">
                <legend>Ingrédient {ingredientIndex + 1} *</legend>

                <div className="admin-form__field">
                  <label htmlFor={"ingredient-quantity-" + ingredientIndex}>
                    Quantité *
                  </label>
                  <input
                    id={"ingredient-quantity-" + ingredientIndex}
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

                <div className="admin-form__field">
                  <label htmlFor={"ingredient-unit-" + ingredientIndex}>
                    Unité
                  </label>
                  <input
                    id={"ingredient-unit-" + ingredientIndex}
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

                <div className="admin-form__field">
                  <label htmlFor={"ingredient-name-" + ingredientIndex}>
                    Nom *
                  </label>
                  <input
                    id={"ingredient-name-" + ingredientIndex}
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

                {ingredients.length > 1 && (
                  <button
                    type="button"
                    className="btn btn--danger admin-form__remove-btn"
                    onClick={function () {
                      removeIngredient(ingredientIndex);
                    }}
                  >
                    Supprimer cet ingrédient
                  </button>
                )}
              </fieldset>
            );
          })}

          <button
            type="button"
            className="btn admin-form__add-btn"
            onClick={addIngredient}
          >
            + Ajouter un ingrédient
          </button>
        </fieldset>

        <fieldset className="admin-form__section">
          <legend>Préparation</legend>

          {steps.map(function (step, stepIndex) {
            return (
              <fieldset key={stepIndex} className="admin-form__group">
                <legend>Étape {stepIndex + 1} *</legend>

                <div className="admin-form__field">
                  <label htmlFor={"step-description-" + stepIndex}>
                    Description *
                  </label>
                  <textarea
                    id={"step-description-" + stepIndex}
                    className="input admin-form__textarea"
                    rows="4"
                    value={step.description}
                    onChange={function (event) {
                      updateStep(stepIndex, event.target.value);
                    }}
                  />
                </div>

                {steps.length > 1 && (
                  <button
                    type="button"
                    className="btn btn--danger admin-form__remove-btn"
                    onClick={function () {
                      removeStep(stepIndex);
                    }}
                  >
                    Supprimer cette étape
                  </button>
                )}
              </fieldset>
            );
          })}

          <button
            type="button"
            className="btn admin-form__add-btn"
            onClick={addStep}
          >
            + Ajouter une étape
          </button>

          <div className="admin-form__field">
            <label htmlFor="recipe-tips">Conseils de Tetelle</label>
            <textarea
              id="recipe-tips"
              className="input admin-form__textarea"
              rows="4"
              value={tips}
              onChange={function (event) {
                setTips(event.target.value);
              }}
            />
          </div>
        </fieldset>

        <fieldset className="admin-form__section admin-form__section--full-width">
          <legend>Classification</legend>

          <AdminReferenceField
            label="Catégorie"
            selectId="recipe-category"
            emptyOptionLabel="Choisir une catégorie"
            apiPath="/api/categories"
            entityLabel="catégorie"
            items={categories}
            onItemsChange={setCategories}
            selectedId={categoryId}
            onSelectedIdChange={setCategoryId}
            supportsImage={true}
          />

          <AdminReferenceField
            label="Origine"
            selectId="recipe-origin"
            emptyOptionLabel="Choisir une origine"
            apiPath="/api/origins"
            entityLabel="origine"
            items={origins}
            onItemsChange={setOrigins}
            selectedId={originId}
            onSelectedIdChange={setOriginId}
          />

          <AdminReferenceField
            label="Type de repas"
            selectId="recipe-meal-type"
            emptyOptionLabel="Choisir un type de repas"
            apiPath="/api/mealTypes"
            entityLabel="type de repas"
            items={mealTypes}
            onItemsChange={setMealTypes}
            selectedId={mealTypeId}
            onSelectedIdChange={setMealTypeId}
          />
        </fieldset>

        <button
          type="submit"
          className="btn btn--primary admin-form__submit-btn admin-form__full-row"
        >
          {submitLabel}
        </button>
      </form>

      <Link to="/dashboard-admins" className="admin-recipe-form-page__back-link">
        Retour au dashboard
      </Link>
    </main>
  );
}

export default AdminRecipeFormPage;
