// Alerte, toast et modale : un seul habillage Madras.
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import "./Feedback.css";

const FeedbackContext = createContext(null);

function FeedbackIcon({ tone }) {
  let graphic = (
    <>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 11v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
    </>
  );

  if (tone === "success") {
    graphic = (
      <>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path
          d="M8 12.5l2.5 2.5L16 9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    );
  } else if (tone === "warning") {
    graphic = (
      <>
        <path
          d="M12 4.5l8 14H4l8-14z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M12 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16.2" r="1" fill="currentColor" />
      </>
    );
  } else if (tone === "error") {
    graphic = (
      <>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7.5v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16.5" r="1" fill="currentColor" />
      </>
    );
  }

  return (
    <svg className="feedback__svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {graphic}
    </svg>
  );
}

function Feedback({
  variant,
  tone,
  title,
  children,
  className,
  open,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  let layout = "alert";
  if (variant === "modal" || variant === "toast" || variant === "alert") {
    layout = variant;
  }

  let safeTone = "info";
  if (tone === "error" || tone === "success" || tone === "warning" || tone === "info") {
    safeTone = tone;
  }

  useEffect(
    function () {
      if (layout !== "modal" || open === false) {
        return undefined;
      }

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const previouslyFocused = document.activeElement;

      if (panelRef.current) {
        const cancelButton = panelRef.current.querySelector("[data-feedback-cancel]");
        if (cancelButton) {
          cancelButton.focus();
        }
      }

      function handleKeyDown(event) {
        if (event.key === "Escape") {
          event.preventDefault();
          if (onCloseRef.current) {
            onCloseRef.current();
          }
          return;
        }

        if (event.key !== "Tab" || panelRef.current === null) {
          return;
        }

        const focusable = panelRef.current.querySelectorAll("button");
        if (focusable.length === 0) {
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey === true && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (event.shiftKey === false && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }

      document.addEventListener("keydown", handleKeyDown);

      return function () {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = previousOverflow;

        if (previouslyFocused && typeof previouslyFocused.focus === "function") {
          previouslyFocused.focus();
        }
      };
    },
    [layout, open],
  );

  if (layout === "modal" && open === false) {
    return null;
  }

  let heading = title;
  if (!heading) {
    if (safeTone === "error") {
      heading = "Attention";
    } else if (safeTone === "success") {
      heading = "Succès";
    } else if (safeTone === "warning") {
      heading = "Confirmation";
    } else {
      heading = "Information";
    }
  }

  let acceptLabel = "Confirmer";
  if (confirmLabel) {
    acceptLabel = confirmLabel;
  }

  let dismissLabel = "Annuler";
  if (cancelLabel) {
    dismissLabel = cancelLabel;
  }

  const icon = (
    <span className="feedback__icon">
      <FeedbackIcon tone={safeTone} />
    </span>
  );

  if (layout === "modal") {
    return (
      <div
        className="feedback__backdrop"
        onClick={function () {
          if (onClose) {
            onClose();
          }
        }}
      >
        <div
          className={"feedback__panel feedback--" + safeTone}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          ref={panelRef}
          tabIndex={-1}
          onClick={function (event) {
            event.stopPropagation();
          }}
        >
          <div className="feedback__stripe" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>

          <button
            type="button"
            className="feedback__close"
            aria-label="Fermer"
            onClick={function () {
              if (onClose) {
                onClose();
              }
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="feedback__content">
            {icon}
            <div className="feedback__copy">
              <h2 className="feedback__title" id={titleId}>
                {heading}
              </h2>
              <p className="feedback__message" id={descriptionId}>
                {children}
              </p>
            </div>
          </div>

          <div className="feedback__actions">
            <button
              type="button"
              className="feedback__button feedback__button--cancel"
              data-feedback-cancel="true"
              onClick={function () {
                if (onClose) {
                  onClose();
                }
              }}
            >
              {dismissLabel}
            </button>
            <button
              type="button"
              className={"feedback__button feedback__button--confirm feedback__button--" + safeTone}
              onClick={function () {
                if (onConfirm) {
                  onConfirm();
                }
              }}
            >
              {acceptLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  let liveRole = "status";
  if (safeTone === "error") {
    liveRole = "alert";
  }

  let rootClass = "feedback feedback--" + layout + " feedback--" + safeTone;
  if (className) {
    rootClass = rootClass + " " + className;
  }

  let titleNode = null;
  if (title) {
    titleNode = <p className="feedback__title">{title}</p>;
  }

  return (
    <div className={rootClass} role={liveRole}>
      {icon}
      <div className="feedback__copy">
        {titleNode}
        <p className="feedback__message">{children}</p>
      </div>
    </div>
  );
}

export function FeedbackProvider({ children }) {
  const [request, setRequest] = useState(null);
  const resolverRef = useRef(null);

  const finish = useCallback(function (result) {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setRequest(null);

    if (resolve) {
      resolve(result);
    }
  }, []);

  const confirm = useCallback(function (options) {
    return new Promise(function (resolve) {
      if (resolverRef.current) {
        resolverRef.current(false);
      }

      resolverRef.current = resolve;

      let nextTone = "warning";
      if (options.tone) {
        nextTone = options.tone;
      }

      let nextConfirmLabel = "Confirmer";
      if (options.confirmLabel) {
        nextConfirmLabel = options.confirmLabel;
      }

      let nextCancelLabel = "Annuler";
      if (options.cancelLabel) {
        nextCancelLabel = options.cancelLabel;
      }

      setRequest({
        title: options.title,
        message: options.message,
        tone: nextTone,
        confirmLabel: nextConfirmLabel,
        cancelLabel: nextCancelLabel,
      });
    });
  }, []);

  const contextValue = { confirm };

  let dialog = null;
  if (request !== null) {
    dialog = (
      <Feedback
        variant="modal"
        tone={request.tone}
        title={request.title}
        open={true}
        confirmLabel={request.confirmLabel}
        cancelLabel={request.cancelLabel}
        onConfirm={function () {
          finish(true);
        }}
        onClose={function () {
          finish(false);
        }}
      >
        {request.message}
      </Feedback>
    );
  }

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}
      {dialog}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error("useFeedback doit être utilisé dans un FeedbackProvider");
  }

  return context;
}

export default Feedback;
