// Bouton WhatsApp : fond vert madras, icône blanche.
// Le libellé reste dans aria-label.
import "./WhatsAppIconButton.css";

function WhatsAppIconButton({ ariaLabel, onClick, disabled }) {
  return (
    <button
      type="button"
      className="admin-form__whatsapp"
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
        className="admin-form__whatsapp-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.41a10.1 10.1 0 0 0 4.65 1.12h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2zm5.76 13.86c-.24.68-1.2 1.25-1.96 1.41-.52.11-1.2.2-3.48-.75-2.92-1.21-4.8-4.17-4.95-4.36-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.26-.29.58-.36.77-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.82 2 .89 2.15.07.14.12.32.02.51-.1.2-.14.32-.28.49-.14.17-.29.38-.42.51-.14.14-.28.29-.12.56.16.27.7 1.16 1.51 1.88 1.04.92 1.91 1.21 2.18 1.35.27.13.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.6-.14.24.09 1.54.73 1.8.86.27.13.44.2.51.31.07.11.07.64-.17 1.32z"
        />
      </svg>
    </button>
  );
}

export default WhatsAppIconButton;
