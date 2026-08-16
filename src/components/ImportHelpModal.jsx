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
              <li>
                Go to{" "}
                <a
                  href="https://www.mountainproject.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="https://mountainproject.com (opens in new tab)"
                >
                  https://mountainproject.com
                  <svg
                    className="external-icon"
                    viewBox="0 0 24 24"
                    width="12"
                    height="12"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      d="M14 3h7v7M10 14 21 3M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>{" "}
                and open "Your Profile".
              </li>
              <li>Click "View All Ticks".</li>
              <li>Click "Export CSV" to download a CSV of your ticks.</li>
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
