import { useRef } from "react";

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onImport(file);
  };

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
        <button type="button" onClick={onClear} disabled={noTicks}>
          Clear Data
        </button>
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
      </div>
    </div>
  );
}
