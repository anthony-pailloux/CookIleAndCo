// Formulaire admin — création et édition d'une recette.
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getFromApi, postToApi } from "../services/api.js";
import "../components/Button.css";
import "./AdminPage.css";
import "./AdminRecipeFormPage.css";

const apiBaseUrl = import.meta.env.VITE_API_URL;

function AdminRecipeFormPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
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

  const [optionsError, setOptionsError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadFormOptions() {
      setOptionsError("");

      try {
        const categoriesResponse = await getFromApi("/api/categories");
        const originsResponse = await getFromApi("/api/origins");
        const mealTypesResponse = await getFromApi("/api/mealTypes");

        setCategories(categoriesResponse.data);
        setOrigins(originsResponse.data);
        setMealTypes(mealTypesResponse.data);
      } catch (err) {
        setOptionsError("Impossible de charger les listes du formulaire.");
      }
    }

    loadFormOptions();
  }, []);

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

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

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
      const createdRecipe = await postToApi("/api/recipes", recipeBody);

      if (photoFile !== null && photoFile !== undefined) {
        const formData = new FormData();
        formData.append("photo", photoFile);

        const photoResponse = await fetch(
          apiBaseUrl + "/api/recipes/" + createdRecipe.id + "/photo",
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

        if (!photoResponse.ok) {
          setErrorMessage(
            "Recette créée, mais la photo n'a pas pu être envoyée."
          );
          return;
        }
      }

      navigate("/admin");
    } catch (err) {
      setErrorMessage(err.message);
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-page__header">
        <h1 className="admin-page__title">Nouvelle recette</h1>
      </header>

      <section className="admin-page__section">
        {optionsError !== "" && (
          <p className="admin-form__error">{optionsError}</p>
        )}

        <form className="admin-form" onSubmit={handleSubmit}>
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
              {categories.map(function (category) {
                return (
                  <option key={category.id} value={category.id}>
                    {category.name}
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
              {origins.map(function (origin) {
                return (
                  <option key={origin.id} value={origin.id}>
                    {origin.name}
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
              {mealTypes.map(function (mealType) {
                return (
                  <option key={mealType.id} value={mealType.id}>
                    {mealType.name}
                  </option>
                );
              })}
            </select>
          </div>

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
                        event.target.value
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
                        event.target.value
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
                        event.target.value
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

          {errorMessage !== "" && (
            <p className="admin-form__error">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="btn btn--primary admin-form__submit-btn"
          >
            Enregistrer la recette
          </button>
        </form>

        <Link to="/admin" className="admin-page__back-link">
          Retour au dashboard
        </Link>
      </section>
    </main>
  );
}

export default AdminRecipeFormPage;