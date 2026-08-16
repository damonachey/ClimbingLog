import { useEffect, useState } from "react";

const PLAIN_GRADES = Array.from({ length: 7 }, (_, i) => `5.${i}`); // 5.0 - 5.6
const MODIFIED_GRADES = [7, 8, 9].flatMap((n) => [`5.${n}-`, `5.${n}`, `5.${n}+`]);
const LETTERED_GRADES = Array.from({ length: 6 }, (_, i) => 10 + i).flatMap((n) => [
  `5.${n}a`, `5.${n}-`, `5.${n}a/b`, `5.${n}b`, `5.${n}`,
  `5.${n}b/c`, `5.${n}c`, `5.${n}+`, `5.${n}c/d`, `5.${n}d`,
]);
const YDS_RATINGS = [...PLAIN_GRADES, ...MODIFIED_GRADES, ...LETTERED_GRADES];

const STYLES = ["Solo", "TR", "Follow", "Lead"];

const SEND_STATUS_BY_STYLE = {
  Lead: ["Onsight", "Flash", "Redpoint", "Fell/Hung"],
  TR: ["Clean", "Fell/Hung"],
  Follow: ["Clean", "Fell/Hung"],
  Solo: ["Clean", "Bailed"],
};

function todayLocal() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

const emptyForm = {
  date: todayLocal(),
  route: "",
  rating: "",
  routeType: "",
  style: "",
  leadStyle: "",
  location: "",
  pitches: 1,
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

  const handleStyleChange = (e) => setForm((f) => ({ ...f, style: e.target.value, leadStyle: "" }));

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
          <h2 id="add-route-title">Add Tick</h2>
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
              <select value={form.style} onChange={handleStyleChange}>
                <option value="">Select…</option>
                {STYLES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Send Status
              <select value={form.leadStyle} onChange={update("leadStyle")} disabled={!form.style}>
                <option value="">{form.style ? "Select…" : "Select a style first"}</option>
                {(SEND_STATUS_BY_STYLE[form.style] ?? []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
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
            <button type="submit">Add Tick</button>
          </div>
        </form>
      </div>
    </div>
  );
}
