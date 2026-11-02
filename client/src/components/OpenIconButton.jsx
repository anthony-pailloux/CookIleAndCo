// Bouton ou lien pour ouvrir : fond bleu marine, icône blanche.
// Lien si `to` est fourni, sinon bouton. Le libellé reste dans aria-label.
import { Link } from "react-router-dom";
import "./OpenIconButton.css";

function OpenIconButton({ ariaLabel, onClick, disabled, to }) {
  let openIcon = (
    <svg
      className="admin-form__open-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M11 7 9.6 8.4 12.2 11H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"
      />
    </svg>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="admin-form__open"
        aria-label={ariaLabel}
        title={ariaLabel}
        onClick={function (event) {
          // Le clic ne doit pas remonter à la ligne.
          event.stopPropagation();
        }}
      >
        {openIcon}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="admin-form__open"
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled}
      onClick={function (event) {
        // Le clic ne doit pas remonter à la ligne.
        event.stopPropagation();
        onClick();
      }}
    >
      {openIcon}
    </button>
  );
}

export default OpenIconButton;
