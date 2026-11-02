// Bouton coche pour enregistrer : fond vert madras, icône blanche.
// `submit` envoie le formulaire parent. Le libellé reste dans aria-label.
import "./SaveIconButton.css";

function SaveIconButton({ ariaLabel, onClick, disabled, submit }) {
  let buttonType = "button";

  if (submit === true) {
    buttonType = "submit";
  }

  return (
    <button
      type={buttonType}
      className="admin-form__save"
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled}
      onClick={function (event) {
        // Le clic ne doit pas remonter à la ligne. Le submit du formulaire reste intact.
        event.stopPropagation();

        if (onClick) {
          onClick();
        }
      }}
    >
      <svg
        className="admin-form__save-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
        />
      </svg>
    </button>
  );
}

export default SaveIconButton;
