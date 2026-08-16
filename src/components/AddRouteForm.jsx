import { useEffect, useState } from "react";

const YDS_RATINGS = [
  ...Array.from({ length: 10 }, (_, i) => `5.${i}`),
  ...Array.from({ length: 6 }, (_, i) => 10 + i).flatMap((grade) =>
    ["a", "b", "c", "d"].map((letter) => `5.${grade}${letter}`)
  ),
];

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  route: "",
  rating: "",
  routeType: "",
  style: "",
  leadStyle: "",
  location: "",
  pitches: "",
  length: "",
  yourStars: "",
  notes: "",
  url: "",
};

export default function AddRouteForm({ options, onAdd, onClose }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.route.trim()) return;
    onAdd({
      ...form,
      route: form.route.trim(),
      pitches: form.pitches === "" ? "" : Number(form.pitches),
      length: form.length === "" ? "" : Number(form.length),
      yourStars: form.yourStars === "" ? "" : Number(form.yourStars),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-route-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="add-route-title">Add Route</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-grid">
            <label>
              Date
              <input type="date" value={form.date} onChange={update("date")} required />
            </label>
            <label className="span-2">
              Route
              <input type="text" value={form.route} onChange={update("route")} required autoFocus />
            </label>
            <label>
              Rating
              <select value={form.rating} onChange={update("rating")}>
                <option value="">Select…</option>
                {YDS_RATINGS.map((grade) => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </label>
            <label>
              Route Type
              <input type="text" list="routeType-options" value={form.routeType} onChange={update("routeType")} />
              <datalist id="routeType-options">
                {options.routeType.map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </label>
            <label>
              Style
              <input type="text" list="style-options" value={form.style} onChange={update("style")} />
              <datalist id="style-options">
                {options.style.map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </label>
            <label>
              Lead Style
              <input type="text" list="leadStyle-options" value={form.leadStyle} onChange={update("leadStyle")} />
              <datalist id="leadStyle-options">
                {options.leadStyle.map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </label>
            <label className="span-2">
              Location
              <input type="text" value={form.location} onChange={update("location")} />
            </label>
            <label>
              Pitches
              <input type="number" min="0" value={form.pitches} onChange={update("pitches")} />
            </label>
            <label>
              Length (m)
              <input type="number" min="0" value={form.length} onChange={update("length")} />
            </label>
            <label>
              Your ★
              <select value={form.yourStars} onChange={update("yourStars")}>
                <option value="">—</option>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </label>
            <label className="span-2">
              URL
              <input type="url" value={form.url} onChange={update("url")} placeholder="https://…" />
            </label>
            <label className="span-2">
              Notes
              <textarea value={form.notes} onChange={update("notes")} rows={3} />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Add Route</button>
          </div>
        </form>
      </div>
    </div>
  );
}
