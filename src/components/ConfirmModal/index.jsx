"use client";
import { createPortal } from "react-dom";
import styles from "@/css/ConfirmModal.module.css";

const ConfirmModal = ({
  title = "Confirm Logout",
  message = "Are you sure you want to logout?",
  confirmText = "Logout",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isOpen,
}) => {
  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button
          className={styles.closeIcon}
          onClick={onCancel}
          aria-label="Close"
        >
          &#10006;
        </button>

        <h2 className={styles.modalTitle}>{title}</h2>
        <p className={styles.modalMessage}>{message}</p>

        <div className={styles.modalActions}>
          <button onClick={onCancel} className={styles.cancelBtn}>
            {cancelText}
          </button>
          <button onClick={onConfirm} className={styles.confirmBtn}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmModal;
