// Select + CRUD inline pour une liste de référence (catégorie, origine, type de repas).
import { useState } from "react";
import {
  getFromApi,
  postToApi,
  putToApi,
  deleteToApi,
} from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { getRecipePhotoUrl } from "../utils/recipePhotoUrl.js";
import { capitalizeFirstLetter } from "../utils/capitalizeFirstLetter.js";
import "./AdminReferenceField.css";

const apiBaseUrl = import.meta.env.VITE_API_URL || "";

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

  // supportsImage est optionnel : true seulement si le parent passe supportsImage={true}
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
    const response = await getFromApi(apiPath);
    onItemsChange(response.data);
  }

  async function uploadImage(itemId, file) {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await fetch(
      apiBaseUrl + apiPath + "/" + itemId + "/image",
      {
        method: "POST",
        credentials: "include",
        body: formData,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      let message;
      if (data && data.error) {
        message = data.error;
      } else {
        message = "Erreur serveur";
      }
      throw new Error(message);
    }

    return data;
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
      const createdItem = await postToApi(apiPath, { name: newName });

      if (imageSupported && newImageFile !== null) {
        await uploadImage(createdItem.id, newImageFile);
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
      await putToApi(apiPath + "/" + selectedId, { name: editName });
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
      await uploadImage(selectedId, editImageFile);
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
      await deleteToApi(apiPath + "/" + selectedId);
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
