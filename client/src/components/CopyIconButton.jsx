// Bouton pour copier : fond bleu marine, icône blanche.
// Le libellé reste dans aria-label.
import "./CopyIconButton.css";

function CopyIconButton({ ariaLabel, onClick, disabled }) {
  return (
    <button
      type="button"
      className="admin-form__copy"
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled}
      onClick={function (event) {
        // Le clic ne doit pas remonter à la ligne.
        event.stopPropagation();

        if (onClick) {
          onClick();
        }
      }}
    >
      <svg
        className="admin-form__copy-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
        />
      </svg>
    </button>
  );
}

export default CopyIconButton;
