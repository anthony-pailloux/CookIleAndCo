// Select + CRUD inline pour une liste de référence (catégorie, origine, type de repas).
import { useState } from "react";
import {
  getFromApi,
  postToApi,
  putToApi,
  deleteToApi,
} from "../services/api.js";
import "./AdminReferenceField.css";

function AdminReferenceField(props) {
  const label = props.label;
  const selectId = props.selectId;
  const emptyOptionLabel = props.emptyOptionLabel;
  const apiPath = props.apiPath;
  const entityLabel = props.entityLabel;
  const items = props.items;
  const onItemsChange = props.onItemsChange;
  const selectedId = props.selectedId;
  const onSelectedIdChange = props.onSelectedIdChange;

  const [newName, setNewName] = useState("");
  const [editName, setEditName] = useState("");
  const [formError, setFormError] = useState("");

  const hasSelection = selectedId !== "";

  function findItemName(itemId) {
    let foundName = "";
    for (let i = 0; i < items.length; i++) {
      if (String(items[i].id) === String(itemId)) {
        foundName = items[i].name;
      }
    }
    return foundName;
  }

  async function refreshItems() {
    const response = await getFromApi(apiPath);
    onItemsChange(response.data);
  }

  function handleSelectChange(event) {
    const newSelectedId = event.target.value;
    onSelectedIdChange(newSelectedId);
    setEditName(findItemName(newSelectedId));
    setFormError("");
  }

  async function handleAdd() {
    setFormError("");

    if (newName === "") {
      setFormError("Saisis un nom.");
      return;
    }

    try {
      const createdItem = await postToApi(apiPath, { name: newName });
      await refreshItems();
      onSelectedIdChange(String(createdItem.id));
      setEditName(createdItem.name);
      setNewName("");
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function handleUpdate() {
    setFormError("");

    if (selectedId === "") {
      setFormError("Choisis d'abord un élément à modifier.");
      return;
    }

    if (editName === "") {
      setFormError("Saisis un nom.");
      return;
    }

    try {
      await putToApi(apiPath + "/" + selectedId, { name: editName });
      await refreshItems();
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function handleDelete() {
    setFormError("");

    if (selectedId === "") {
      setFormError("Choisis d'abord un élément à supprimer.");
      return;
    }

    const itemName = findItemName(selectedId);
    const confirmed = window.confirm(
      "Supprimer " + entityLabel + ' "' + itemName + '" ?',
    );

    if (confirmed === false) {
      return;
    }

    try {
      await deleteToApi(apiPath + "/" + selectedId);
      await refreshItems();
      onSelectedIdChange("");
      setEditName("");
    } catch (err) {
      setFormError(err.message);
    }
  }

  let selectedLabel = "";
  if (hasSelection) {
    selectedLabel = findItemName(selectedId);
  }

  return (
    <div className="admin-reference-field">
      <h3 className="admin-reference-field__heading">{label}</h3>

      <div className="admin-reference-field__grid">
        <fieldset className="admin-reference-field__panel">
          <legend>Choisir</legend>
          <label className="admin-reference-field__hint" htmlFor={selectId}>
            {emptyOptionLabel}
          </label>
          <select
            id={selectId}
            className="input"
            value={selectedId}
            onChange={handleSelectChange}
          >
            <option value="">{emptyOptionLabel}</option>
            {items.map(function (item) {
              return (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              );
            })}
          </select>
        </fieldset>

        <fieldset className="admin-reference-field__panel">
          <legend>Ajouter</legend>
          <input
            className="input"
            type="text"
            placeholder={"Nouvelle " + entityLabel}
            value={newName}
            onChange={function (event) {
              setNewName(event.target.value);
            }}
          />
          <button
            type="button"
            className="btn admin-form__add-btn"
            onClick={handleAdd}
          >
            + Ajouter
          </button>
        </fieldset>

        <fieldset className="admin-reference-field__panel">
          <legend>Modifier</legend>
          {!hasSelection && (
            <p className="admin-reference-field__hint">
              Choisis une {entityLabel} dans « Choisir ».
            </p>
          )}
          <input
            className="input"
            type="text"
            placeholder="Nouveau nom"
            value={editName}
            disabled={!hasSelection}
            onChange={function (event) {
              setEditName(event.target.value);
            }}
          />
          <button
            type="button"
            className="btn btn--outline admin-form__add-btn"
            disabled={!hasSelection}
            onClick={handleUpdate}
          >
            Modifier
          </button>
        </fieldset>

        <fieldset className="admin-reference-field__panel">
          <legend>Supprimer</legend>
          {!hasSelection && (
            <p className="admin-reference-field__hint">
              Choisis une {entityLabel} dans « Choisir ».
            </p>
          )}
          {hasSelection && (
            <p className="admin-reference-field__selected-name">
              {selectedLabel}
            </p>
          )}
          <button
            type="button"
            className="btn btn--danger admin-reference-field__delete-btn"
            disabled={!hasSelection}
            onClick={handleDelete}
          >
            Supprimer
          </button>
        </fieldset>
      </div>

      {formError !== "" && (
        <p className="admin-form__error">{formError}</p>
      )}
    </div>
  );
}

export default AdminReferenceField;