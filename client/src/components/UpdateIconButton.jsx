// Bouton pour mettre à jour : fond bleu marine, icône blanche.
// Le libellé reste dans aria-label.
import "./UpdateIconButton.css";

function UpdateIconButton({ ariaLabel, onClick, disabled }) {
  return (
    <button
      type="button"
      className="admin-form__update"
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled}
      onClick={function (event) {
        // Le clic ne doit pas remonter à la ligne.
        event.stopPropagation();
        onClick();
      }}
    >
      <svg
        className="admin-form__update-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M17.65 6.35A7.95 7.95 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08a5.99 5.99 0 0 1-5.65 4c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
        />
      </svg>
    </button>
  );
}

export default UpdateIconButton;
