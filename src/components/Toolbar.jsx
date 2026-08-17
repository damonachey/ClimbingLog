import { useEffect, useRef, useState } from "react";

const SYNC_STATUS_LABEL = {
  syncing: "Syncing…",
  synced: "Synced",
  offline: "Offline — will sync",
};

export default function Toolbar({
  onAdd,
  onImport,
  onExport,
  onStatistics,
  onClear,
  onHelp,
  noTicks,
  signedIn,
  syncStatus,
  syncError,
  authError,
  onSignIn,
  onSignOut,
}) {
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onImport(file);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button type="button" onClick={onAdd}>
          Add Tick
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          Import CSV
        </button>
        <button type="button" onClick={onExport} disabled={noTicks}>
          Export CSV
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={handleFileChange}
        />
      </div>
      <div className="toolbar-group toolbar-group-center">
        <button type="button" onClick={onStatistics} disabled={noTicks}>
          Statistics
        </button>
      </div>
      <div className="toolbar-group toolbar-group-right">
        {signedIn ? (
          <>
            {syncStatus && (
              <span className={`sync-status${syncStatus === "offline" ? " sync-status-error" : ""}`}>
                {syncStatus === "offline" && syncError ? syncError : SYNC_STATUS_LABEL[syncStatus]}
              </span>
            )}
            <button type="button" onClick={onSignOut}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            {authError && <span className="sync-status sync-status-error">{authError}</span>}
            <button type="button" onClick={onSignIn}>
              Sign in with Google
            </button>
          </>
        )}
        <button type="button" onClick={onHelp}>
          Help ?
        </button>
        <div className="toolbar-menu" ref={menuRef}>
          <button
            type="button"
            className="toolbar-gear"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            aria-label="Settings"
            title="Settings"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
              <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {menuOpen && (
            <div className="toolbar-menu-list" role="menu">
              <button
                type="button"
                role="menuitem"
                disabled={noTicks}
                onClick={() => {
                  setMenuOpen(false);
                  onClear();
                }}
              >
                Clear Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
