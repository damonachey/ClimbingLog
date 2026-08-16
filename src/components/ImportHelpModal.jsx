import { useEffect } from "react";

export default function ImportHelpModal({ onClose }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-help-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="import-help-title">Getting a CSV to import</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-content">
          <div className="modal-body">
            <ol>
              <li>Go to mountainproject.com and open your profile.</li>
              <li>Open your Tick List to view all your ticks.</li>
              <li>Click "Export" to download a CSV of your ticks.</li>
              <li>Come back here and click "Import CSV" to load that file in.</li>
            </ol>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
