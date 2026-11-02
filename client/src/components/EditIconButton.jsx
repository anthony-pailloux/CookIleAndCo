// Bouton crayon pour modifier : fond marine foncé, icône jaune madras.
// Lien si `to` est fourni, sinon bouton. Le libellé reste dans aria-label.
import { Link } from "react-router-dom";
import "./EditIconButton.css";

function EditIconButton({ ariaLabel, onClick, disabled, to }) {
  let pencilIcon = (
    <svg
      className="admin-form__edit-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
      />
    </svg>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="admin-form__edit"
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        {pencilIcon}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="admin-form__edit"
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled}
      onClick={function (event) {
        // Le clic ne doit pas remonter à la ligne.
        event.stopPropagation();
        onClick();
      }}
    >
      {pencilIcon}
    </button>
  );
}

export default EditIconButton;
