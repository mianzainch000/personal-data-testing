"use client";
import axios from "axios";
import { useState } from "react";
import { useSnackbar } from "@/components/Snackbar";
import handleAxiosError from "@/components/HandleAxiosError";
import styles from "@/css/DynamicDataCard.module.css";

const UnlockProtected = ({ onUnlocked }) => {
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
        showAlertMessage?.({
          message: "Unlocked! Protected categories ab dikhengi.",
          type: "success",
        });
        onUnlocked?.();
      } else {
        showAlertMessage?.({
          message: res?.data?.message || "Incorrect special code",
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
      <p
        onClick={() => setShowModal(true)}
        style={{
          textAlign: "center",
          cursor: "pointer",
          fontSize: "0.85rem",
          opacity: 0.75,
          margin: "0 0 1rem",
        }}
      >
        🔒 Kuch protected categories chupi hain — special code dalein
      </p>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h3 className={styles.modalTitle}>🔒 Enter Special Code</h3>
            <form onSubmit={submit} className={styles.modalForm}>
              <div className={styles.modalField}>
                <label>Special Code</label>
                <input
                  type="password"
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="••••"
                />
              </div>
              <button type="submit" className={styles.modalSubmit} disabled={loading}>
                {loading ? "Checking..." : "Unlock"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UnlockProtected;
