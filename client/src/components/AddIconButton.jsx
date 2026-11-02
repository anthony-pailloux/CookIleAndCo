// Bouton plus pour ajouter : fond bleu marine, icône blanche.
// `submit` envoie le formulaire parent. Le libellé reste dans aria-label.
import "./AddIconButton.css";

function AddIconButton({ ariaLabel, onClick, disabled, submit }) {
  let buttonType = "button";

  if (submit === true) {
    buttonType = "submit";
  }

  return (
    <button
      type={buttonType}
      className="admin-form__add-icon-btn"
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
        className="admin-form__add-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
        />
      </svg>
    </button>
  );
}

export default AddIconButton;
