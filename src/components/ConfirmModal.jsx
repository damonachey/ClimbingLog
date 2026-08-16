import { useEffect } from "react";

export default function ConfirmModal({ title, message, confirmLabel = "Confirm", onConfirm, onCancel }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="confirm-title">{title}</h2>
          <button type="button" className="modal-close" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-content">
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-actions">
            <button type="button" className="danger" onClick={onConfirm}>
              {confirmLabel}
            </button>
            <button type="button" className="secondary" autoFocus onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
