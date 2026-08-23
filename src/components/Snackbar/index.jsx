"use client";
import styles from "@/css/Snackbar.module.css";
import React, { createContext, useContext, useState, useEffect } from "react";

const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("error");
  const [duration, setDuration] = useState(3000);
  const [position, setPosition] = useState("top-right");
  const [animation, setAnimation] = useState("slide-left");

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (open) {
      const id = Date.now();
      const newToast = { id, message, type, duration, position, animation };
      setToasts((prev) => [...prev, newToast]);

      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        setOpen(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [open, message, type, duration, position, animation]);

  const showSnackbar = ({
    message,
    type = "error",
    duration = 3000,
    position = "top-right",
    animation = "slide-right",
  }) => {
    setMessage(message);
    setType(type);
    setDuration(duration);
    setPosition(position);
    setAnimation(animation);
    setOpen(true);
  };

  return (
    <SnackbarContext.Provider value={showSnackbar}>
      {children}

      {}
      {["top-right", "top-left", "bottom-right", "bottom-left"].map((pos) => (
        <div key={pos} className={`${styles.toastContainer} ${styles[pos]}`}>
          {toasts
            .filter((t) => t.position === pos)
            .map((toast) => (
              <div
                key={toast.id}
                className={`${styles.snackbar} ${styles[toast.type]} ${styles[toast.animation]}`}
              >
                <div className={styles.message}>
                  <span dangerouslySetInnerHTML={{ __html: toast.message }} />
                </div>
                <button
                  className={styles.close}
                  onClick={() =>
                    setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                  }
                >
                  &times;
                </button>
                <div
                  className={styles.progress}
                  style={{ animationDuration: `${toast.duration}ms` }}
                />
              </div>
            ))}
        </div>
      ))}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
