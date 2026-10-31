// Liste, ajout, modification et suppression d'un référentiel
// (catégorie, origine ou type de repas).
import { useRef, useState } from "react";
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
import DeleteIconButton from "./DeleteIconButton.jsx";
import EditIconButton from "./EditIconButton.jsx";
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
  article,
}) {
  const { showToast } = useToast();

  // Image optionnelle : true seulement si le parent le demande.
  let imageSupported = false;
  if (supportsImage === true) {
    imageSupported = true;
  }

  let itemArticle = "une";
  if (article === "un") {
    itemArticle = "un";
  }

  let newNameLabel = "Nouvelle " + entityLabel;
  if (itemArticle === "un") {
    newNameLabel = "Nouveau " + entityLabel;
  }

  let emptyMessage = "Aucune " + entityLabel + " pour le moment.";
  if (itemArticle === "un") {
    emptyMessage = "Aucun " + entityLabel + " pour le moment.";
  }

  // Chaque référentiel précise l'action dans le libellé du champ de modification.
  let editNameLabel = "Nom";
  if (entityLabel === "catégorie") {
    editNameLabel = "Modifier la catégorie";
  } else if (entityLabel === "origine") {
    editNameLabel = "Modifier l'origine";
  } else if (entityLabel === "type de repas") {
    editNameLabel = "Modifier un type de repas";
  }

  const addNameId = selectId + "-new-name";
  const editNameId = selectId + "-edit-name";
  const imageInputId = selectId + "-image";

  const [newName, setNewName] = useState("");
  const [editName, setEditName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const imageInputRef = useRef(null);

  function clearImageFile() {
    setImageFile(null);
    if (imageInputRef.current !== null) {
      imageInputRef.current.value = "";
    }
  }

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
    clearImageFile();
  }

  async function handleAdd() {
    if (newName === "") {
      showToast("Saisis un nom.", "error");
      return;
    }

    try {
      const createdItem = await createReferenceItem(apiPath, newName);

      if (imageSupported && imageFile !== null) {
        await uploadReferenceImage(apiPath, createdItem.id, imageFile);
      }

      await refreshItems();
      onSelectedIdChange(String(createdItem.id));
      setEditName(createdItem.name);
      setNewName("");
      clearImageFile();
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
      showToast("Choisis d'abord une " + entityLabel + ".", "error");
      return;
    }

    if (imageFile === null) {
      showToast("Choisis une image.", "error");
      return;
    }

    try {
      await uploadReferenceImage(apiPath, selectedId, imageFile);
      await refreshItems();
      clearImageFile();
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
      clearImageFile();
      showToast("Suppression réussie.", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  let selectedLabel = "";
  if (hasSelection) {
    selectedLabel = findItemName(selectedId);
  }

  let deleteAriaLabel = "Supprimer " + article + " " + entityLabel;
  if (selectedLabel !== "") {
    deleteAriaLabel =
      "Supprimer " +
      article +
      " " +
      entityLabel +
      ' "' +
      selectedLabel +
      '"';
  }

  let editAriaLabel = "Modifier " + article + " " + entityLabel;
  if (selectedLabel !== "") {
    editAriaLabel =
      "Modifier " +
      article +
      " " +
      entityLabel +
      ' "' +
      selectedLabel +
      '"';
  }

  let selectedImageUrl = "";
  if (hasSelection && imageSupported) {
    selectedImageUrl = getRecipePhotoUrl(findItemImage(selectedId));
  }

  let emptyNotice = null;
  if (items.length === 0) {
    emptyNotice = <p className="admin-reference-field__empty">{emptyMessage}</p>;
  }

  let selectedHasImage = false;
  if (hasSelection === true && findItemImage(selectedId) !== "") {
    selectedHasImage = true;
  }

  let imageFieldLabel = "Image";
  if (selectedHasImage === true) {
    imageFieldLabel = "Remplacer l'image";
  }

  let photoBlock = null;
  let fileField = null;
  if (imageSupported) {
    let photoContent = (
      <div className="admin-reference-field__photo-fit admin-reference-field__photo-fit--empty">
        <p className="admin-reference-field__photo-empty">Aucune image</p>
      </div>
    );

    if (selectedHasImage === true) {
      photoContent = (
        <div className="admin-reference-field__photo-fit">
          <img
            className="admin-reference-field__photo-preview"
            src={selectedImageUrl}
            alt={selectedLabel}
          />
        </div>
      );
    }

    photoBlock = (
      <div className="admin-reference-field__photo">
        {photoContent}
      </div>
    );

    fileField = (
      <div className="admin-reference-field__field">
        <label htmlFor={imageInputId}>{imageFieldLabel}</label>
        <div className="admin-reference-field__file-frame">
          <input
            id={imageInputId}
            ref={imageInputRef}
            className="input admin-reference-field__file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={function (event) {
              const selectedFile = event.target.files[0];
              if (selectedFile) {
                setImageFile(selectedFile);
              } else {
                setImageFile(null);
              }
            }}
          />
        </div>
      </div>
    );
  }

  const addField = (
    <div className="admin-reference-field__field">
      <label htmlFor={addNameId}>{newNameLabel}</label>
      <input
        id={addNameId}
        className="input"
        type="text"
        value={newName}
        onChange={function (event) {
          setNewName(capitalizeFirstLetter(event.target.value));
        }}
      />
    </div>
  );

  const editField = (
    <div className="admin-reference-field__field">
      <label htmlFor={editNameId}>{editNameLabel}</label>
      <input
        id={editNameId}
        className="input"
        type="text"
        value={editName}
        disabled={hasSelection === false}
        onChange={function (event) {
          setEditName(capitalizeFirstLetter(event.target.value));
        }}
      />
    </div>
  );

  const selectField = (
    <div className="admin-reference-field__field">
      <label htmlFor={selectId}>{emptyOptionLabel}</label>
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
    </div>
  );

  // Type de repas : select, nouveau nom et modification sur la même ligne.
  let details = (
    <div className="admin-reference-field__text-only">
      {selectField}
      {addField}
      {editField}
    </div>
  );

  if (imageSupported) {
    details = (
      <div className="admin-reference-field__layout">
        <div className="admin-reference-field__grid">
          <div className="admin-reference-field__pair">
            {selectField}
            {fileField}
          </div>
          <div className="admin-reference-field__pair">
            {addField}
            {editField}
          </div>
        </div>
        {photoBlock}
      </div>
    );
  }

  let imageUpdateButton = null;
  if (imageSupported) {
    imageUpdateButton = (
      <button
        type="button"
        className="admin-reference-field__icon-btn admin-reference-field__icon-btn--image"
        aria-label="Mettre à jour l'image"
        title="Mettre à jour l'image"
        disabled={hasSelection === false}
        onClick={handleImageUpdate}
      >
        <svg
          className="admin-reference-field__icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill="currentColor"
            d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
          />
        </svg>
      </button>
    );
  }

  return (
    <fieldset className="admin-reference-field">
      <legend>{label}</legend>

      {emptyNotice}
      {details}

      <div className="admin-reference-field__toolbar">
        <button
          type="button"
          className="btn btn--primary admin-form__add-btn"
          aria-label="Ajouter"
          title="Ajouter"
          onClick={handleAdd}
        >
          +
        </button>
        <EditIconButton
          ariaLabel={editAriaLabel}
          disabled={hasSelection === false}
          onClick={handleUpdate}
        />
        {imageUpdateButton}
        <DeleteIconButton
          ariaLabel={deleteAriaLabel}
          disabled={hasSelection === false}
          onClick={handleDelete}
        />
      </div>
    </fieldset>
  );
}

export default AdminReferenceField;
