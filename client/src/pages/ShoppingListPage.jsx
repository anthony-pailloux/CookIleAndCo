// Listes de courses enregistrées : catalogue, puis détail d'une liste.
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminSectionNav from "../components/AdminSectionNav.jsx";
import AddIconButton from "../components/AddIconButton.jsx";
import CopyIconButton from "../components/CopyIconButton.jsx";
import DeleteIconButton from "../components/DeleteIconButton.jsx";
import EditIconButton from "../components/EditIconButton.jsx";
import OpenIconButton from "../components/OpenIconButton.jsx";
import SaveIconButton from "../components/SaveIconButton.jsx";
import SmsIconButton from "../components/SmsIconButton.jsx";
import WhatsAppIconButton from "../components/WhatsAppIconButton.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Feedback, { useFeedback } from "../components/Feedback.jsx";
import {
  listShoppingLists,
  getShoppingList,
  updateShoppingList,
  createShoppingListItem,
  updateShoppingListItem,
  deleteShoppingListItem,
  deleteShoppingList,
} from "../services/shoppingListServices.js";
import "../components/Button.css";
import "./AdminPage.css";
import "./ShoppingListPage.css";

function hasText(value) {
  if (value === null || value === undefined) {
    return false;
  }

  if (String(value).trim() === "") {
    return false;
  }

  return true;
}

function formatShoppingLine(item) {
  const quantityPresent = hasText(item.quantity);
  const unitPresent = hasText(item.unit);
  let line = "- ";

  if (quantityPresent === true && unitPresent === true) {
    line = line + item.quantity + " " + item.unit + " " + item.name;
  } else if (quantityPresent === true) {
    line = line + item.quantity + " " + item.name;
  } else if (unitPresent === true) {
    line = line + item.name + " (" + item.unit + ")";
  } else {
    line = line + item.name;
  }

  if (hasText(item.note) === true) {
    line = line + " — " + item.note;
  }

  return line;
}

function buildShoppingListText(items) {
  const lines = ["Liste de courses — Cook'île & Co"];

  for (let index = 0; index < items.length; index++) {
    lines.push(formatShoppingLine(items[index]));
  }

  return lines.join("\n");
}

function formatListDate(value) {
  const date = new Date(value);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function readItemText(value) {
  let text = "";

  if (value !== null && value !== undefined) {
    text = String(value);
  }

  return text;
}

async function saveShoppingListTitle(listId, title, confirm) {
  let updated = null;

  try {
    updated = await updateShoppingList(listId, { title: title });
  } catch (err) {
    if (err.status === 409) {
      const confirmed = await confirm({
        title: "Remplacer la liste",
        message: "Une liste porte déjà ce nom. La nouvelle va remplacer l'ancienne.",
        tone: "warning",
        confirmLabel: "Remplacer",
      });

      if (confirmed === true) {
        updated = await updateShoppingList(listId, {
          title: title,
          replace: true,
        });
      }
    } else {
      throw err;
    }
  }

  return updated;
}

function ShoppingTitleForm({ inputId, title, saving, onSave, onCancel }) {
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
    errorNode = <Feedback tone="error">{errorMessage}</Feedback>;
  }

  let okLabel = "OK";

  if (saving === true) {
    okLabel = "...";
  }

  return (
    <form className="shopping-list-page__title-form" onSubmit={handleSubmit}>
      <label className="shopping-list-page__sr-only" htmlFor={inputId}>
        Titre de la liste
      </label>
      <input
        id={inputId}
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
            onCancel();
          }
        }}
      />
      <button type="submit" className="btn shopping-list-page__title-ok" disabled={saving === true}>
        {okLabel}
      </button>
      {errorNode}
    </form>
  );
}

function ShoppingListItemRow({ item, listId, onUpdated, onRemoved }) {
  const { showToast } = useToast();
  const [name, setName] = useState(readItemText(item.name));
  const [quantity, setQuantity] = useState(readItemText(item.quantity));
  const [unit, setUnit] = useState(readItemText(item.unit));
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function handleSave(event) {
    event.preventDefault();
    setErrorMessage("");
    const trimmedName = name.trim();

    if (trimmedName === "") {
      setErrorMessage("Le nom est obligatoire.");
    } else {
      setSaving(true);

      try {
        const updated = await updateShoppingListItem(listId, item.id, {
          name: trimmedName,
          quantity: quantity,
          unit: unit,
        });
        setName(readItemText(updated.name));
        setQuantity(readItemText(updated.quantity));
        setUnit(readItemText(updated.unit));
        onUpdated(updated);
        showToast("Article enregistré.", "success");
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setSaving(false);
      }
    }
  }

  async function handleRemove() {
    setErrorMessage("");
    setRemoving(true);

    try {
      await deleteShoppingListItem(listId, item.id);
      onRemoved(item.id);
      showToast("Article retiré.", "success");
    } catch (err) {
      setErrorMessage(err.message);
      setRemoving(false);
    }
  }

  let errorNode = null;

  if (errorMessage !== "") {
    errorNode = <Feedback tone="error">{errorMessage}</Feedback>;
  }

  let note = null;

  if (hasText(item.note) === true) {
    note = <p className="shopping-list-page__note">{item.note}</p>;
  }

  const rowBusy = saving === true || removing === true;

  return (
    <li className="shopping-list-page__item">
      <form className="shopping-list-page__item-form" onSubmit={handleSave}>
        <div className="field">
          <label htmlFor={"item-name-" + item.id}>Nom</label>
          <input
            id={"item-name-" + item.id}
            className="input"
            type="text"
            maxLength={255}
            value={name}
            onChange={function (event) {
              setName(event.target.value);
            }}
          />
        </div>
        <div className="field">
          <label htmlFor={"item-quantity-" + item.id}>Quantité</label>
          <input
            id={"item-quantity-" + item.id}
            className="input"
            type="text"
            maxLength={255}
            value={quantity}
            onChange={function (event) {
              setQuantity(event.target.value);
            }}
          />
        </div>
        <div className="field">
          <label htmlFor={"item-unit-" + item.id}>Unité</label>
          <input
            id={"item-unit-" + item.id}
            className="input"
            type="text"
            maxLength={255}
            value={unit}
            onChange={function (event) {
              setUnit(event.target.value);
            }}
          />
        </div>
        <div className="shopping-list-page__item-actions">
          <SaveIconButton
            submit
            ariaLabel={"Enregistrer " + name}
            disabled={rowBusy === true}
          />
          <DeleteIconButton
            ariaLabel={"Retirer " + name}
            disabled={rowBusy === true}
            onClick={handleRemove}
          />
        </div>
      </form>
      {note}
      {errorNode}
    </li>
  );
}

function ShoppingListIndex() {
  const { showToast } = useToast();
  const { confirm } = useFeedback();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [editingListId, setEditingListId] = useState(null);
  const [savingListId, setSavingListId] = useState(null);

  useEffect(
    function () {
      async function loadPage() {
        try {
          const loadedLists = await listShoppingLists();
          setLists(loadedLists);
        } catch (err) {
          setErrorMessage("Impossible de charger les listes de courses.");
          showToast("Impossible de charger les listes de courses.", "error");
        } finally {
          setLoading(false);
        }
      }

      loadPage();
    },
    [showToast],
  );

  async function handleRenameList(listId, trimmed) {
    setSavingListId(listId);

    try {
      const updated = await saveShoppingListTitle(listId, trimmed, confirm);

      if (updated !== null) {
        const loadedLists = await listShoppingLists();
        setLists(loadedLists);
        setEditingListId(null);
        showToast("Liste renommée.", "success");
      }
    } finally {
      setSavingListId(null);
    }
  }

  async function handleDelete(list) {
    const confirmed = await confirm({
      title: "Supprimer la liste",
      message: "La liste « " + list.title + " » sera supprimée.",
      tone: "error",
      confirmLabel: "Supprimer",
    });

    if (confirmed === true) {
      setDeletingId(list.id);

      try {
        await deleteShoppingList(list.id);
        const loadedLists = await listShoppingLists();
        setLists(loadedLists);
        showToast("Liste supprimée.", "success");
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        setDeletingId(null);
      }
    }
  }

  let pageBody = (
    <p className="admin-page__status">Chargement des listes de courses...</p>
  );

  if (loading === false && errorMessage !== "") {
    pageBody = <Feedback tone="error">{errorMessage}</Feedback>;
  } else if (loading === false) {
    let listBody = (
      <div>
        <p className="shopping-list-page__empty">
          Aucune liste de courses pour le moment.
        </p>
        <Link
          className="shopping-list-page__planning-link"
          to="/dashboard-admins/planning"
        >
          Créer une liste depuis un planning
        </Link>
      </div>
    );

    if (lists.length > 0) {
      const rows = [];

      for (let index = 0; index < lists.length; index++) {
        const list = lists[index];

        let titleControl = (
          <div className="shopping-list-page__title-line">
            <p className="shopping-list-page__row-title">{list.title}</p>
            <EditIconButton
              ariaLabel={"Renommer " + list.title}
              onClick={function () {
                setEditingListId(list.id);
              }}
            />
          </div>
        );

        if (editingListId === list.id) {
          titleControl = (
            <ShoppingTitleForm
              inputId={"shopping-list-title-" + list.id}
              title={list.title}
              saving={savingListId === list.id}
              onCancel={function () {
                setEditingListId(null);
              }}
              onSave={function (trimmed) {
                return handleRenameList(list.id, trimmed);
              }}
            />
          );
        }

        rows.push(
          <li key={list.id} className="shopping-list-page__row">
            <div className="shopping-list-page__row-main">
              {titleControl}
              <p className="shopping-list-page__date">{formatListDate(list.createdAt)}</p>
            </div>
            <div className="shopping-list-page__row-actions">
              <OpenIconButton
                to={"/dashboard-admins/liste-courses/" + list.id}
                ariaLabel={"Ouvrir " + list.title}
              />
              <DeleteIconButton
                ariaLabel={"Supprimer " + list.title}
                disabled={deletingId === list.id}
                onClick={function () {
                  handleDelete(list);
                }}
              />
            </div>
          </li>,
        );
      }

      listBody = <ul className="shopping-list-page__rows">{rows}</ul>;
    }

    pageBody = (
      <section className="admin-page__section shopping-list-page__section">
        <h2 className="admin-page__section-title">Listes enregistrées</h2>
        {listBody}
      </section>
    );
  }

  return (
    <main className="admin-page shopping-list-page">
      <header className="admin-page__header">
        <h1 className="admin-page__title">Liste de courses</h1>
      </header>

      <AdminSectionNav />

      {pageBody}
    </main>
  );
}

function copyListFields(current, items) {
  return {
    id: current.id,
    title: current.title,
    planningId: current.planningId,
    createdAt: current.createdAt,
    items: items,
  };
}

function ShoppingListDetail() {
  const { showToast } = useToast();
  const { confirm } = useFeedback();
  const params = useParams();
  const listId = params.id;
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(
    function () {
      async function loadPage() {
        setLoading(true);
        setErrorMessage("");
        setEditingTitle(false);
        setNewName("");
        setNewQuantity("");
        setNewUnit("");
        setAddError("");

        try {
          const loadedList = await getShoppingList(listId);
          setList(loadedList);
        } catch (err) {
          setList(null);
          setErrorMessage(err.message);
          showToast("Impossible de charger la liste de courses.", "error");
        } finally {
          setLoading(false);
        }
      }

      loadPage();
    },
    [listId, showToast],
  );

  async function handleRename(trimmed) {
    setRenaming(true);

    try {
      const updated = await saveShoppingListTitle(listId, trimmed, confirm);

      if (updated !== null) {
        setList(function (current) {
          if (current === null) {
            return current;
          }

          return {
            id: current.id,
            title: updated.title,
            planningId: current.planningId,
            createdAt: current.createdAt,
            items: current.items,
          };
        });
        setEditingTitle(false);
        showToast("Liste renommée.", "success");
      }
    } finally {
      setRenaming(false);
    }
  }

  function handleItemUpdated(updatedItem) {
    setList(function (current) {
      if (current === null) {
        return current;
      }

      const nextItems = [];

      for (let index = 0; index < current.items.length; index++) {
        if (current.items[index].id === updatedItem.id) {
          nextItems.push(updatedItem);
        } else {
          nextItems.push(current.items[index]);
        }
      }

      return copyListFields(current, nextItems);
    });
  }

  function handleItemRemoved(itemId) {
    setList(function (current) {
      if (current === null) {
        return current;
      }

      const nextItems = [];

      for (let index = 0; index < current.items.length; index++) {
        if (current.items[index].id !== itemId) {
          nextItems.push(current.items[index]);
        }
      }

      return copyListFields(current, nextItems);
    });
  }

  async function handleAddItem(event) {
    event.preventDefault();
    setAddError("");
    const trimmedName = newName.trim();

    if (trimmedName === "") {
      setAddError("Le nom est obligatoire.");
    } else {
      setAdding(true);

      try {
        const created = await createShoppingListItem(listId, {
          name: trimmedName,
          quantity: newQuantity,
          unit: newUnit,
        });

        setList(function (current) {
          if (current === null) {
            return current;
          }

          const nextItems = current.items.slice();
          nextItems.push(created);
          return copyListFields(current, nextItems);
        });
        setNewName("");
        setNewQuantity("");
        setNewUnit("");
        showToast("Article ajouté.", "success");
      } catch (err) {
        setAddError(err.message);
      } finally {
        setAdding(false);
      }
    }
  }

  function handleWhatsApp() {
    const text = buildShoppingListText(list.items);
    const url = "https://wa.me/?text=" + encodeURIComponent(text);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handleCopy() {
    const text = buildShoppingListText(list.items);

    try {
      await navigator.clipboard.writeText(text);
      showToast("Liste copiée", "success");
    } catch (err) {
      showToast("Impossible de copier la liste.", "error");
    }
  }

  let pageBody = (
    <p className="admin-page__status">Chargement de la liste de courses...</p>
  );

  if (loading === false && errorMessage !== "") {
    pageBody = (
      <div>
        <Feedback tone="error">{errorMessage}</Feedback>
        <Link className="shopping-list-page__planning-link" to="/dashboard-admins/liste-courses">
          Toutes les listes
        </Link>
      </div>
    );
  } else if (loading === false && list !== null) {
    const items = list.items;
    const actionsDisabled = items.length === 0;
    const shoppingText = buildShoppingListText(items);
    const smsHref = "sms:?&body=" + encodeURIComponent(shoppingText);

    let smsControl = (
      <SmsIconButton ariaLabel="Envoyer par SMS" />
    );

    if (actionsDisabled === false) {
      smsControl = (
        <SmsIconButton ariaLabel="Envoyer par SMS" href={smsHref} />
      );
    }

    let listBody = (
      <p className="shopping-list-page__empty">
        Cette liste ne contient aucun article.
      </p>
    );

    if (items.length > 0) {
      const rows = [];

      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        rows.push(
          <ShoppingListItemRow
            key={item.id}
            item={item}
            listId={list.id}
            onUpdated={handleItemUpdated}
            onRemoved={handleItemRemoved}
          />,
        );
      }

      listBody = <ul className="shopping-list-page__items">{rows}</ul>;
    }

    let titleBlock = (
      <h2 className="admin-page__section-title shopping-list-page__title-line">
        <span>{list.title}</span>
        <EditIconButton
          ariaLabel={"Renommer " + list.title}
          onClick={function () {
            setEditingTitle(true);
          }}
        />
      </h2>
    );

    if (editingTitle === true) {
      titleBlock = (
        <div className="admin-page__section-title">
          <ShoppingTitleForm
            inputId="shopping-list-detail-title"
            title={list.title}
            saving={renaming}
            onCancel={function () {
              setEditingTitle(false);
            }}
            onSave={function (trimmed) {
              return handleRename(trimmed);
            }}
          />
        </div>
      );
    }

    let addErrorNode = null;

    if (addError !== "") {
      addErrorNode = <Feedback tone="error">{addError}</Feedback>;
    }

    pageBody = (
      <section className="admin-page__section shopping-list-page__section">
        <Link className="shopping-list-page__back" to="/dashboard-admins/liste-courses">
          Toutes les listes
        </Link>
        {titleBlock}
        <p className="shopping-list-page__date">{formatListDate(list.createdAt)}</p>

        <div className="shopping-list-page__actions">
          <WhatsAppIconButton
            ariaLabel="Envoyer par WhatsApp"
            disabled={actionsDisabled}
            onClick={handleWhatsApp}
          />
          {smsControl}
          <CopyIconButton
            ariaLabel="Copier la liste"
            disabled={actionsDisabled}
            onClick={handleCopy}
          />
        </div>

        {listBody}

        <div className="shopping-list-page__add">
        <h3 className="shopping-list-page__add-title">Ajouter un article</h3>
        <form className="shopping-list-page__item-form" onSubmit={handleAddItem}>
          <div className="field">
            <label htmlFor="new-item-name">Nom</label>
            <input
              id="new-item-name"
              className="input"
              type="text"
              maxLength={255}
              value={newName}
              onChange={function (event) {
                setNewName(event.target.value);
              }}
            />
          </div>
          <div className="field">
            <label htmlFor="new-item-quantity">Quantité</label>
            <input
              id="new-item-quantity"
              className="input"
              type="text"
              maxLength={255}
              value={newQuantity}
              onChange={function (event) {
                setNewQuantity(event.target.value);
              }}
            />
          </div>
          <div className="field">
            <label htmlFor="new-item-unit">Unité</label>
            <input
              id="new-item-unit"
              className="input"
              type="text"
              maxLength={255}
              value={newUnit}
              onChange={function (event) {
                setNewUnit(event.target.value);
              }}
            />
          </div>
          <AddIconButton
            submit
            ariaLabel="Ajouter un article"
            disabled={adding === true}
          />
        </form>
        {addErrorNode}
        </div>
      </section>
    );
  }

  return (
    <main className="admin-page shopping-list-page">
      <header className="admin-page__header">
        <h1 className="admin-page__title">Liste de courses</h1>
      </header>

      <AdminSectionNav />

      {pageBody}
    </main>
  );
}

function ShoppingListPage() {
  const params = useParams();

  if (params.id === undefined) {
    return <ShoppingListIndex />;
  } else {
    return <ShoppingListDetail />;
  }
}

export default ShoppingListPage;
