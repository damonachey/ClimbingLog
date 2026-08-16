import { useRef } from "react";

export default function Toolbar({ onAdd, onImport, onExport, onStatistics, onClear, onHelp, noTicks }) {
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
        <button type="button" onClick={onStatistics} disabled={noTicks}>
          Statistics
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={handleFileChange}
        />
      </div>
      <div className="toolbar-group">
        <button type="button" onClick={onClear} disabled={noTicks}>
          Clear Data
        </button>
        <button type="button" onClick={onHelp}>
          Help ?
        </button>
      </div>
    </div>
  );
}
