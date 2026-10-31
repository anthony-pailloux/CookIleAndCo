// Bouton corbeille unique pour toutes les suppressions de l'interface.
// Une seule teinte : fond rouge madras, icône blanche. Le libellé reste dans aria-label.
import "./DeleteIconButton.css";

function DeleteIconButton({ ariaLabel, onClick, disabled }) {
  return (
    <button
      type="button"
      className="admin-form__step-delete"
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled}
      onClick={function (event) {
        // Le clic ne doit pas remonter à la ligne (étape, ingrédient).
        event.stopPropagation();
        onClick();
      }}
    >
      <svg
        className="admin-form__step-delete-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M9 3h6v2h5v2h-1v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7H4V5h5V3zm0 2h6V4H9v1zM7 7v12h10V7H7zm2 2h2v8H9V9zm4 0h2v8h-2V9z"
        />
      </svg>
    </button>
  );
}

export default DeleteIconButton;
