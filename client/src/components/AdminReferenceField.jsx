// Liste / ajout / modif / suppression (categorie, origine, type de repas).
import { useState } from "react";
import {
  listReferenceItems,
  createReferenceItem,
  updateReferenceItem,
  deleteReferenceItem,
  uploadReferenceImage,
} from "../services/referenceServices.js";
import { useToast } from "../context/ToastContext.jsx";
import { getRecipePhotoUrl } from "../utils/recipePhotoUrl.js";
import { capitalizeFirstLetter } from "../utils/capitalizeFirstLetter.js";
import "./AdminReferenceField.css";

function AdminReferenceField({
  label,
  selectId,
  emptyOptionLabel,
  apiPath,
  entityLabel,
  items,
  onItemsChange,
  selectedId,
  onSelectedIdChange,
  supportsImage,
}) {
  const { showToast } = useToast();

  // Image optionnelle, true seulement si le parent le demande
  let imageSupported = false;
  if (supportsImage === true) {
    imageSupported = true;
  }

  const [newName, setNewName] = useState("");
  const [editName, setEditName] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);

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

  function findItemImage(itemId) {
    let foundImage = "";
    for (let i = 0; i < items.length; i++) {
      if (String(items[i].id) === String(itemId)) {
        if (items[i].image) {
          foundImage = items[i].image;
        }
      }
    }
    return foundImage;
  }

  async function refreshItems() {
    const response = await listReferenceItems(apiPath);
    onItemsChange(response.data);
  }

  function handleSelectChange(event) {
    const newSelectedId = event.target.value;
    onSelectedIdChange(newSelectedId);
    setEditName(findItemName(newSelectedId));
    setEditImageFile(null);
  }

  async function handleAdd() {
    if (newName === "") {
      showToast("Saisis un nom.", "error");
      return;
    }

    try {
      const createdItem = await createReferenceItem(apiPath, newName);

      if (imageSupported && newImageFile !== null) {
        await uploadReferenceImage(apiPath, createdItem.id, newImageFile);
      }

      await refreshItems();
      onSelectedIdChange(String(createdItem.id));
      setEditName(createdItem.name);
      setNewName("");
      setNewImageFile(null);
      showToast("Ajout réussi.", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function handleUpdate() {
    if (selectedId === "") {
      showToast("Choisis d'abord un élément à modifier.", "error");
      return;
    }

    if (editName === "") {
      showToast("Saisis un nom.", "error");
      return;
    }

    try {
      await updateReferenceItem(apiPath, selectedId, editName);
      await refreshItems();
      showToast("Modification réussie.", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function handleImageUpdate() {
    if (selectedId === "") {
      showToast("Choisis d'abord une catégorie.", "error");
      return;
    }

    if (editImageFile === null) {
      showToast("Choisis une image.", "error");
      return;
    }

    try {
      await uploadReferenceImage(apiPath, selectedId, editImageFile);
      await refreshItems();
      setEditImageFile(null);
      showToast("Image mise à jour.", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function handleDelete() {
    if (selectedId === "") {
      showToast("Choisis d'abord un élément à supprimer.", "error");
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
      await deleteReferenceItem(apiPath, selectedId);
      await refreshItems();
      onSelectedIdChange("");
      setEditName("");
      setEditImageFile(null);
      showToast("Suppression réussie.", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  let selectedLabel = "";
  if (hasSelection) {
    selectedLabel = findItemName(selectedId);
  }

  let selectedImageUrl = "";
  if (hasSelection && imageSupported) {
    selectedImageUrl = getRecipePhotoUrl(findItemImage(selectedId));
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
              setNewName(capitalizeFirstLetter(event.target.value));
            }}
          />
          {imageSupported && (
            <input
              className="input admin-reference-field__file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={function (event) {
                const selectedFile = event.target.files[0];
                setNewImageFile(selectedFile);
              }}
            />
          )}
          <button
            type="button"
            className="btn admin-reference-field__add-btn"
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
              setEditName(capitalizeFirstLetter(event.target.value));
            }}
          />
          <button
            type="button"
            className="btn btn--outline admin-reference-field__add-btn"
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

      {imageSupported && hasSelection && (
        <fieldset className="admin-reference-field__panel admin-reference-field__panel--image">
          <legend>Image</legend>
          <img
            className="admin-reference-field__preview"
            src={selectedImageUrl}
            alt={selectedLabel}
          />
          <input
            className="input admin-reference-field__file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={function (event) {
              const selectedFile = event.target.files[0];
              setEditImageFile(selectedFile);
            }}
          />
          <button
            type="button"
            className="btn admin-reference-field__add-btn"
            onClick={handleImageUpdate}
          >
            Mettre à jour l&apos;image
          </button>
        </fieldset>
      )}
    </div>
  );
}

export default AdminReferenceField;
