import { useRef } from "react";

export default function Toolbar({ onAdd, onImport, onExport, exportDisabled }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onImport(file);
  };

  return (
    <div className="toolbar">
      <button type="button" onClick={onAdd}>
        Add route
      </button>
      <button type="button" onClick={() => fileInputRef.current?.click()}>
        Import CSV
      </button>
      <button type="button" onClick={onExport} disabled={exportDisabled}>
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
  );
}
