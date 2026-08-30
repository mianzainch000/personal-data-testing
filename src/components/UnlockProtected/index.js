"use client";
import axios from "axios";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useSnackbar } from "@/components/Snackbar";
import handleAxiosError from "@/components/HandleAxiosError";
import styles from "@/css/DynamicDataCard.module.css";

// Always rendered the same way whether or not any category is actually
// protected/hidden, so its presence never hints that secret content exists.
const UnlockProtected = () => {
  const showAlertMessage = useSnackbar();
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post("/categories/verifySpecialCode/api", {
        specialCode: code,
      });
      if (res?.data?.success) {
        setShowModal(false);
        setCode("");
        window.location.reload();
      } else {
        showAlertMessage?.({
          message: res?.data?.message || "Incorrect code",
          type: "error",
        });
      }
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage?.({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <span
        onClick={() => setShowModal(true)}
        title="Unlock"
        style={{
          display: "inline-block",
          cursor: "pointer",
          fontSize: "0.9rem",
          opacity: 0.35,
          padding: "0.4rem",
        }}
      >
        🔓
      </span>

      {showModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={styles.modalOverlay}
            onClick={() => setShowModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
              <h3 className={styles.modalTitle}>Enter Code</h3>
              <form onSubmit={submit} className={styles.modalForm}>
                <div className={styles.modalField}>
                  <input
                    type="password"
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="••••"
                  />
                </div>
                <button
                  type="submit"
                  className={styles.modalSubmit}
                  disabled={loading}
                >
                  {loading ? "..." : "Submit"}
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default UnlockProtected;
