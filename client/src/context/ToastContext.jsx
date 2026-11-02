// Petit message a l ecran (succes ou erreur), rendu par Feedback.
import { createContext, useCallback, useContext, useState } from "react";
import Feedback from "../components/Feedback.jsx";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback(function (message, type) {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);

    window.setTimeout(function () {
      setToastVisible(false);
    }, 3500);
  }, []);

  let toastTone = "info";
  if (toastType === "success") {
    toastTone = "success";
  } else if (toastType === "error") {
    toastTone = "error";
  }

  const contextValue = { showToast };

  let toastNode = null;
  if (toastVisible) {
    toastNode = (
      <Feedback variant="toast" tone={toastTone}>
        {toastMessage}
      </Feedback>
    );
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toastNode}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast doit être utilisé dans un ToastProvider");
  }

  return context;
}
