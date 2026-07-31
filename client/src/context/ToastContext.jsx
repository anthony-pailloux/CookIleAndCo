// Toasts global
import { createContext, useContext, useState } from "react";
import "../components/Toast.css";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  function showToast(message, type) {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);

    window.setTimeout(function () {
      setToastVisible(false);
    }, 3500);
  }

  let toastClassName = "toast";
  if (toastType === "success") {
    toastClassName = "toast toast--success";
  } else if (toastType === "error") {
    toastClassName = "toast toast--error";
  }

  const contextValue = { showToast };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toastVisible && (
        <div className={toastClassName} role="status">
          {toastMessage}
        </div>
      )}
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