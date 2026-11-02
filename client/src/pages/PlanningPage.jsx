// Plannings nommés : choix à gauche, semaine du planning ouvert à droite.
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSectionNav from "../components/AdminSectionNav.jsx";
import AddIconButton from "../components/AddIconButton.jsx";
import DeleteIconButton from "../components/DeleteIconButton.jsx";
import EditIconButton from "../components/EditIconButton.jsx";
import UpdateIconButton from "../components/UpdateIconButton.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Feedback, { useFeedback } from "../components/Feedback.jsx";
import { listMealTypes } from "../services/referenceServices.js";
import { listRecipes } from "../services/recipeServices.js";
import {
  listPlannings,
  createPlanning,
  updatePlanning,
  deletePlanning,
  listPlanningEntries,
  createPlanningEntry,
  deletePlanningEntry,
} from "../services/planningServices.js";
import { createShoppingList, listShoppingLists } from "../services/shoppingListServices.js";
import { capitalizeFirstLetter } from "../utils/capitalizeFirstLetter.js";
import "../components/Button.css";
import "./AdminPage.css";
import "./PlanningPage.css";

const planningDays = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

async function loadAllRecipes() {
  const allRecipes = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await listRecipes({
      page: page,
      limit: 50,
    });

    const rows = response.data;

    for (let index = 0; index < rows.length; index++) {
      allRecipes.push(rows[index]);
    }

    if (response.meta !== undefined && response.meta !== null) {
      totalPages = response.meta.totalPages;
    } else {
      totalPages = page;
    }

    page = page + 1;
  }

  allRecipes.sort(function (firstRecipe, secondRecipe) {
    return firstRecipe.title.localeCompare(secondRecipe.title, "fr");
  });

  return allRecipes;
}

function PlanningTitleForm({ title, saving, onSave, onCancel }) {
  const [value, setValue] = useState(title);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef(null);

  useEffect(function () {
    if (inputRef.current !== null) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    const trimmed = value.trim();

    if (trimmed === "") {
      setErrorMessage("Le titre est obligatoire.");
    } else if (trimmed.length > 80) {
      setErrorMessage("Le titre doit contenir entre 1 et 80 caractères.");
    } else {
      setErrorMessage("");

      try {
        await onSave(trimmed);
      } catch (err) {
        setErrorMessage(err.message);
      }
    }
  }

  let errorNode = null;

  if (errorMessage !== "") {
    errorNode = (
      <Feedback tone="error" className="planning-page__title-error">
        {errorMessage}
      </Feedback>
    );
  }

  let okLabel = "OK";

  if (saving === true) {
    okLabel = "...";
  }

  return (
    <form
      className="planning-page__title-form"
      onSubmit={handleSubmit}
      onClick={function (event) {
        event.stopPropagation();
      }}
    >
      <label className="planning-page__sr-only" htmlFor="planning-rename-title">
        Titre du planning
      </label>
      <input
        id="planning-rename-title"
        ref={inputRef}
        className="input"
        type="text"
        maxLength={80}
        value={value}
        onChange={function (event) {
          setValue(event.target.value);
        }}
        onKeyDown={function (event) {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onCancel();
          }
        }}
      />
      <button type="submit" className="planning-page__title-ok" disabled={saving === true}>
        {okLabel}
      </button>
      {errorNode}
    </form>
  );
}

function PlanningPage() {
  const { showToast } = useToast();
  const { confirm } = useFeedback();
  const navigate = useNavigate();

  const [mealTypes, setMealTypes] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [plannings, setPlannings] = useState([]);
  const [selectedPlanningId, setSelectedPlanningId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entriesLoading, setEntriesLoading] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [creatingPlanning, setCreatingPlanning] = useState(false);
  const [deletingPlanningId, setDeletingPlanningId] = useState(null);
  const [editingPlanningId, setEditingPlanningId] = useState(null);
  const [savingPlanningId, setSavingPlanningId] = useState(null);

  const [recipeId, setRecipeId] = useState("");
  const [day, setDay] = useState("");
  const [mealTypeId, setMealTypeId] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [creatingList, setCreatingList] = useState(false);
  const [shoppingLists, setShoppingLists] = useState([]);

  useEffect(
    function () {
      async function loadPage() {
        try {
          const mealTypesResponse = await listMealTypes();
          const loadedMealTypes = mealTypesResponse.data.slice();
          loadedMealTypes.sort(function (firstType, secondType) {
            return firstType.id - secondType.id;
          });
          setMealTypes(loadedMealTypes);

          const loadedRecipes = await loadAllRecipes();
          setRecipes(loadedRecipes);

          const loadedPlannings = await listPlannings();
          setPlannings(loadedPlannings);

          const loadedLists = await listShoppingLists();
          setShoppingLists(loadedLists);

          if (loadedPlannings.length > 0) {
            setSelectedPlanningId(loadedPlannings[0].id);
            const planningEntries = await listPlanningEntries(loadedPlannings[0].id);
            setEntries(planningEntries);
          } else {
            setSelectedPlanningId(null);
            setEntries([]);
          }
        } catch (err) {
          showToast("Impossible de charger le planning.", "error");
        } finally {
          setLoading(false);
        }
      }

      loadPage();
    },
    [showToast],
  );

  async function handleSelectPlanning(planningId) {
    if (planningId !== selectedPlanningId) {
      setSelectedPlanningId(planningId);
      setEntries([]);
      setEntriesLoading(true);
      setFormError("");

      try {
        const planningEntries = await listPlanningEntries(planningId);
        setEntries(planningEntries);
      } catch (err) {
        showToast("Impossible de charger ce planning.", "error");
      } finally {
        setEntriesLoading(false);
      }
    }
  }

  async function handleCreatePlanning(event) {
    event.preventDefault();
    setTitleError("");
    const trimmed = newTitle.trim();

    if (trimmed === "") {
      setTitleError("Le titre est obligatoire.");
    } else if (trimmed.length > 80) {
      setTitleError("Le titre doit contenir entre 1 et 80 caractères.");
    } else {
      setCreatingPlanning(true);

      try {
        const created = await createPlanning({ title: trimmed });
        const loadedPlannings = await listPlannings();
        setPlannings(loadedPlannings);
        setSelectedPlanningId(created.id);
        setEntries([]);
        setNewTitle("");
        showToast("Planning créé.", "success");
      } catch (err) {
        setTitleError(err.message);
      } finally {
        setCreatingPlanning(false);
      }
    }
  }

  async function handleRenamePlanning(planningId, trimmed) {
    setSavingPlanningId(planningId);

    try {
      let renamed = null;

      try {
        renamed = await updatePlanning(planningId, { title: trimmed });
      } catch (err) {
        if (err.status === 409) {
          const confirmed = await confirm({
            title: "Remplacer la liste",
            message: "Une liste porte déjà ce nom. La nouvelle va remplacer l'ancienne.",
            tone: "warning",
            confirmLabel: "Remplacer",
          });

          if (confirmed === true) {
            renamed = await updatePlanning(planningId, {
              title: trimmed,
              replace: true,
            });
          }
        } else {
          throw err;
        }
      }

      if (renamed !== null) {
        rememberPlanningTitle(planningId, renamed.title);
        const loadedLists = await listShoppingLists();
        setShoppingLists(loadedLists);
        setEditingPlanningId(null);
        showToast("Planning renommé.", "success");
      }
    } finally {
      setSavingPlanningId(null);
    }
  }

  async function handleDeletePlanning(planning) {
    const confirmed = await confirm({
      title: "Supprimer le planning",
      message:
        "Le planning « " +
        planning.title +
        " » sera supprimé. Les recettes placées seront retirées.",
      tone: "error",
      confirmLabel: "Supprimer",
    });

    if (confirmed === true) {
      setDeletingPlanningId(planning.id);

      try {
        await deletePlanning(planning.id);
        const loadedPlannings = await listPlannings();
        setPlannings(loadedPlannings);
        showToast("Planning supprimé.", "success");

        if (planning.id === editingPlanningId) {
          setEditingPlanningId(null);
        }

        if (planning.id === selectedPlanningId) {
          if (loadedPlannings.length > 0) {
            setSelectedPlanningId(loadedPlannings[0].id);
            const planningEntries = await listPlanningEntries(loadedPlannings[0].id);
            setEntries(planningEntries);
          } else {
            setSelectedPlanningId(null);
            setEntries([]);
          }
        }
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        setDeletingPlanningId(null);
      }
    }
  }

  async function handleAdd(event) {
    event.preventDefault();
    setFormError("");

    if (selectedPlanningId === null) {
      setFormError("Choisis d'abord un planning.");
    } else if (recipeId === "" || day === "" || mealTypeId === "") {
      setFormError("Choisis une recette, un jour et un type de repas.");
    } else {
      setSaving(true);

      try {
        await createPlanningEntry(selectedPlanningId, {
          recipeId: Number(recipeId),
          day: day,
          mealTypeId: Number(mealTypeId),
        });

        const planningEntries = await listPlanningEntries(selectedPlanningId);
        setEntries(planningEntries);
        showToast("Recette ajoutée au planning.", "success");
      } catch (err) {
        setFormError(err.message);
      } finally {
        setSaving(false);
      }
    }
  }

  async function handleRemove(entryId) {
    setRemovingId(entryId);

    try {
      await deletePlanningEntry(selectedPlanningId, entryId);
      const planningEntries = await listPlanningEntries(selectedPlanningId);
      setEntries(planningEntries);
      showToast("Recette retirée du planning.", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setRemovingId(null);
    }
  }

  function findLatestShoppingList(planningId) {
    let found = null;

    for (let index = 0; index < shoppingLists.length; index++) {
      if (shoppingLists[index].planningId === planningId) {
        if (found === null) {
          found = shoppingLists[index];
        }
      }
    }

    return found;
  }

  function rememberPlanningTitle(planningId, title) {
    const nextPlannings = [];

    for (let index = 0; index < plannings.length; index++) {
      if (plannings[index].id === planningId) {
        nextPlannings.push({
          id: plannings[index].id,
          title: title,
        });
      } else {
        nextPlannings.push(plannings[index]);
      }
    }

    setPlannings(nextPlannings);
  }

  function rememberShoppingList(created) {
    const summary = {
      id: created.id,
      title: created.title,
      planningId: created.planningId,
      createdAt: created.createdAt,
    };
    const nextLists = [];
    let replaced = false;

    for (let index = 0; index < shoppingLists.length; index++) {
      if (shoppingLists[index].id === created.id) {
        nextLists.push(summary);
        replaced = true;
      } else {
        nextLists.push(shoppingLists[index]);
      }
    }

    if (replaced === false) {
      nextLists.unshift(summary);
    }

    setShoppingLists(nextLists);
  }

  async function handleCreateShoppingList() {
    let selectedPlanning = null;

    for (let index = 0; index < plannings.length; index++) {
      if (plannings[index].id === selectedPlanningId) {
        selectedPlanning = plannings[index];
      }
    }

    if (selectedPlanning === null) {
      showToast("Choisis un planning.", "error");
    } else {
      const linkedList = findLatestShoppingList(selectedPlanning.id);

      if (linkedList !== null) {
        const confirmed = await confirm({
          title: "Mettre à jour la liste",
          message:
            "La liste « " +
            linkedList.title +
            " » sera recalculée avec les recettes de ce planning. Les articles actuels seront remplacés.",
          tone: "warning",
          confirmLabel: "Mettre à jour",
        });

        if (confirmed === true) {
          setCreatingList(true);

          try {
            const updated = await createShoppingList({
              title: linkedList.title,
              planningId: selectedPlanning.id,
              replace: true,
            });
            rememberPlanningTitle(selectedPlanning.id, updated.title);
            rememberShoppingList(updated);
            showToast("Liste de courses mise à jour.", "success");
            navigate("/dashboard-admins/liste-courses/" + updated.id);
          } catch (err) {
            showToast(err.message, "error");
          } finally {
            setCreatingList(false);
          }
        }
      } else {
        const answer = window.prompt("Titre de la liste de courses", selectedPlanning.title);

        if (answer !== null) {
          const trimmed = answer.trim();

          if (trimmed === "") {
            showToast("Le titre est obligatoire.", "error");
          } else if (trimmed.length > 80) {
            showToast("Le titre doit contenir entre 1 et 80 caractères.", "error");
          } else {
            setCreatingList(true);

            try {
              let created = null;

              try {
                created = await createShoppingList({
                  title: trimmed,
                  planningId: selectedPlanning.id,
                });
              } catch (err) {
                if (err.status === 409) {
                  const confirmed = await confirm({
                    title: "Remplacer la liste",
                    message:
                      "Une liste porte déjà ce nom. La nouvelle va remplacer l'ancienne.",
                    tone: "warning",
                    confirmLabel: "Remplacer",
                  });

                  if (confirmed === true) {
                    created = await createShoppingList({
                      title: trimmed,
                      planningId: selectedPlanning.id,
                      replace: true,
                    });
                  }
                } else {
                  showToast(err.message, "error");
                }
              }

              if (created !== null) {
                rememberPlanningTitle(selectedPlanning.id, created.title);
                rememberShoppingList(created);
                navigate("/dashboard-admins/liste-courses/" + created.id);
              }
            } catch (err) {
              showToast(err.message, "error");
            } finally {
              setCreatingList(false);
            }
          }
        }
      }
    }
  }

  const entriesBySlot = {};

  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    const slotKey = entry.day + "-" + entry.mealType.id;

    if (entriesBySlot[slotKey] === undefined) {
      entriesBySlot[slotKey] = [];
    }

    entriesBySlot[slotKey].push(entry);
  }

  let selectedPlanning = null;

  for (let index = 0; index < plannings.length; index++) {
    if (plannings[index].id === selectedPlanningId) {
      selectedPlanning = plannings[index];
    }
  }

  let pageBody = (
    <p className="admin-page__status">Chargement du planning...</p>
  );

  if (loading === false) {
    const planningItems = [];

    for (let index = 0; index < plannings.length; index++) {
      const planning = plannings[index];
      let selectClassName = "planning-page__select";

      if (planning.id === selectedPlanningId) {
        selectClassName = "planning-page__select planning-page__select--active";
      }

      let titleControl = (
        <>
          <span className="planning-page__name">{planning.title}</span>
          <EditIconButton
            ariaLabel={"Renommer " + planning.title}
            onClick={function () {
              // Le planning édité doit rester celui affiché.
              handleSelectPlanning(planning.id);
              setEditingPlanningId(planning.id);
            }}
          />
        </>
      );

      if (editingPlanningId === planning.id) {
        titleControl = (
          <PlanningTitleForm
            title={planning.title}
            saving={savingPlanningId === planning.id}
            onCancel={function () {
              setEditingPlanningId(null);
            }}
            onSave={function (trimmed) {
              return handleRenamePlanning(planning.id, trimmed);
            }}
          />
        );
      }

      let currentValue = "false";

      if (planning.id === selectedPlanningId) {
        currentValue = "true";
      }

      planningItems.push(
        <li
          key={planning.id}
          className="planning-page__planning"
          aria-current={currentValue}
          onClick={function () {
            handleSelectPlanning(planning.id);
          }}
        >
          <div className={selectClassName}>
            {titleControl}
          </div>
          <DeleteIconButton
            ariaLabel={"Supprimer " + planning.title}
            disabled={deletingPlanningId === planning.id}
            onClick={function () {
              handleDeletePlanning(planning);
            }}
          />
        </li>,
      );
    }

    let planningList = null;

    if (planningItems.length > 0) {
      planningList = <ul className="planning-page__list">{planningItems}</ul>;
    }

    let createLabel = "Créer";
    if (creatingPlanning === true) {
      createLabel = "Création...";
    }

    let titleErrorNode = null;
    if (titleError !== "") {
      titleErrorNode = <Feedback tone="error">{titleError}</Feedback>;
    }

    const sidebar = (
      <aside className="admin-page__section planning-page__sidebar">
        <h2 className="admin-page__section-title">Mes plannings</h2>
        {planningList}
        <form className="planning-page__create" onSubmit={handleCreatePlanning}>
          <div className="field">
            <label htmlFor="planning-title">Nouveau planning</label>
            <input
              id="planning-title"
              className="input"
              type="text"
              maxLength={80}
              value={newTitle}
              onChange={function (event) {
                setNewTitle(event.target.value);
              }}
            />
          </div>
          <button type="submit" className="btn" disabled={creatingPlanning === true}>
            {createLabel}
          </button>
        </form>
        {titleErrorNode}
      </aside>
    );

    let mainColumn = (
      <section className="admin-page__section">
        <h2 className="admin-page__section-title">Aucun planning</h2>
        <p className="planning-page__intro">
          Indique un titre, puis crée ton premier planning. La semaine s'affichera ici.
        </p>
      </section>
    );

    if (selectedPlanning !== null) {
      let recipeOptions = (
        <option value="">Aucune recette disponible</option>
      );

      if (recipes.length > 0) {
        recipeOptions = [
          <option key="empty-recipe" value="">
            Choisir une recette
          </option>,
        ];

        for (let index = 0; index < recipes.length; index++) {
          const recipe = recipes[index];
          recipeOptions.push(
            <option key={recipe.id} value={recipe.id}>
              {recipe.title}
            </option>,
          );
        }
      }

      let mealTypeOptions = (
        <option value="">Aucun type de repas</option>
      );

      if (mealTypes.length > 0) {
        mealTypeOptions = [
          <option key="empty-meal-type" value="">
            Choisir un type de repas
          </option>,
        ];

        for (let index = 0; index < mealTypes.length; index++) {
          const mealType = mealTypes[index];
          mealTypeOptions.push(
            <option key={mealType.id} value={mealType.id}>
              {mealType.name}
            </option>,
          );
        }
      }

      const dayOptions = [
        <option key="empty-day" value="">
          Choisir un jour
        </option>,
      ];

      for (let index = 0; index < planningDays.length; index++) {
        const planningDay = planningDays[index];
        dayOptions.push(
          <option key={planningDay} value={planningDay}>
            {capitalizeFirstLetter(planningDay)}
          </option>,
        );
      }

      const linkedList = findLatestShoppingList(selectedPlanning.id);
      const listActionDisabled = creatingList === true || entriesLoading === true;
      let listAction;

      if (linkedList !== null) {
        listAction = (
          <UpdateIconButton
            ariaLabel="Mettre à jour la liste de courses"
            disabled={listActionDisabled}
            onClick={handleCreateShoppingList}
          />
        );
      } else {
        let createLabel = "Créer une liste de courses";

        if (creatingList === true) {
          createLabel = "Création...";
        }

        listAction = (
          <button
            type="button"
            className="btn planning-page__create-list"
            disabled={listActionDisabled}
            onClick={handleCreateShoppingList}
          >
            {createLabel}
          </button>
        );
      }

      const formBusy = saving === true || entriesLoading === true;

      let formErrorNode = null;
      if (formError !== "") {
        formErrorNode = <Feedback tone="error">{formError}</Feedback>;
      }

      let weekBody = (
        <p className="admin-page__status">Chargement du planning...</p>
      );

      if (entriesLoading === false) {
        const dayCards = [];

        for (let dayIndex = 0; dayIndex < planningDays.length; dayIndex++) {
          const planningDay = planningDays[dayIndex];
          const slots = [];

          for (let typeIndex = 0; typeIndex < mealTypes.length; typeIndex++) {
            const mealType = mealTypes[typeIndex];
            const slotKey = planningDay + "-" + mealType.id;
            let slotEntries = entriesBySlot[slotKey];

            if (slotEntries === undefined) {
              slotEntries = [];
            }

            const entryItems = [];

            for (let entryIndex = 0; entryIndex < slotEntries.length; entryIndex++) {
              const entry = slotEntries[entryIndex];

              entryItems.push(
                <li key={entry.id} className="planning-page__entry">
                  <p className="planning-page__entry-title">{entry.recipe.title}</p>
                  <DeleteIconButton
                    ariaLabel={"Retirer " + entry.recipe.title}
                    disabled={removingId === entry.id}
                    onClick={function () {
                      handleRemove(entry.id);
                    }}
                  />
                </li>,
              );
            }

            let slotBody = (
              <p className="planning-page__empty">Aucune recette</p>
            );

            if (entryItems.length > 0) {
              slotBody = (
                <ul className="planning-page__entries">{entryItems}</ul>
              );
            }

            slots.push(
              <div key={mealType.id} className="planning-page__slot">
                <h4 className="planning-page__slot-title">{mealType.name}</h4>
                {slotBody}
              </div>,
            );
          }

          let dayBody = (
            <p className="planning-page__empty">Aucun type de repas.</p>
          );

          if (slots.length > 0) {
            dayBody = slots;
          }

          dayCards.push(
            <section key={planningDay} className="planning-page__day">
              <h3 className="planning-page__day-title">
                {capitalizeFirstLetter(planningDay)}
              </h3>
              {dayBody}
            </section>,
          );
        }

        weekBody = (
          <div className="planning-page__grid-scroll">
            <div className="planning-page__grid">{dayCards}</div>
          </div>
        );
      }

      mainColumn = (
        <div className="planning-page__main">
          <section className="admin-page__section planning-page__section">
            <form className="planning-page__form" onSubmit={handleAdd}>
              <div className="planning-page__form-header">
                <h2 className="admin-page__section-title">Ajouter une recette</h2>
                <AddIconButton
                  submit
                  ariaLabel="Ajouter au planning"
                  disabled={formBusy === true}
                />
              </div>

              <div className="planning-page__form-fields">
              <div className="field">
                <label htmlFor="planning-recipe">Recette</label>
                <select
                  id="planning-recipe"
                  className="input"
                  value={recipeId}
                  onChange={function (event) {
                    setRecipeId(event.target.value);
                  }}
                >
                  {recipeOptions}
                </select>
              </div>

              <div className="field">
                <label htmlFor="planning-day">Jour</label>
                <select
                  id="planning-day"
                  className="input"
                  value={day}
                  onChange={function (event) {
                    setDay(event.target.value);
                  }}
                >
                  {dayOptions}
                </select>
              </div>

              <div className="field">
                <label htmlFor="planning-meal-type">Type de repas</label>
                <select
                  id="planning-meal-type"
                  className="input"
                  value={mealTypeId}
                  onChange={function (event) {
                    setMealTypeId(event.target.value);
                  }}
                >
                  {mealTypeOptions}
                </select>
              </div>
              </div>
            </form>

            {formErrorNode}
          </section>

          <section className="admin-page__section planning-page__week">
            <div className="planning-page__week-toolbar">
              <h2 className="admin-page__section-title">{selectedPlanning.title}</h2>
              {listAction}
            </div>
            {weekBody}
          </section>
        </div>
      );
    }

    pageBody = (
      <div className="planning-page__layout">
        {sidebar}
        {mainColumn}
      </div>
    );
  }

  return (
    <main className="admin-page planning-page">
      <header className="admin-page__header">
        <h1 className="admin-page__title">Planning de la semaine</h1>
      </header>

      <AdminSectionNav />

      {pageBody}
    </main>
  );
}

export default PlanningPage;
