// Bouton ou lien SMS : fond bleu marine, icône blanche.
// Lien sms: si `href` est fourni, sinon bouton désactivé. Le libellé reste dans aria-label.
import "./SmsIconButton.css";

function SmsIconButton({ ariaLabel, onClick, disabled, href }) {
  let messageIcon = (
    <svg
      className="admin-form__sms-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2zm3 5h10v2H7V8zm0 4h6v2H7v-2z"
      />
    </svg>
  );

  if (href) {
    return (
      <a
        href={href}
        className="admin-form__sms"
        aria-label={ariaLabel}
        title={ariaLabel}
        onClick={function (event) {
          // Le clic ne doit pas remonter à la ligne. Le lien sms: reste suivi.
          event.stopPropagation();

          if (onClick) {
            onClick();
          }
        }}
      >
        {messageIcon}
      </a>
    );
  }

  return (
    <button
      type="button"
      className="admin-form__sms"
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled
      onClick={function (event) {
        event.stopPropagation();

        if (onClick) {
          onClick();
        }
      }}
    >
      {messageIcon}
    </button>
  );
}

export default SmsIconButton;
