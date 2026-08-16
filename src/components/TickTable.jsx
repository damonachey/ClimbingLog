const COLUMNS = [
  { key: "date", label: "Date" },
  { key: "route", label: "Route" },
  { key: "rating", label: "Rating" },
  { key: "routeType", label: "Type" },
  { key: "style", label: "Style" },
  { key: "sendStatus", label: "Send Status" },
  { key: "location", label: "Location" },
  { key: "pitches", label: "Pitches" },
  { key: "length", label: "Length (m)" },
  { key: "yourStars", label: "Your ★" },
  { key: "avgStars", label: "Avg ★" },
  { key: "notes", label: "Notes" },
];

export default function TickTable({ ticks, sort, onSort, onEdit, onDelete, emptyMessage = "No ticks match the current filters." }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {COLUMNS.map((col) => {
              const active = sort.key === col.key;
              return (
                <th key={col.key}>
                  <button className={`sortable${active ? " active" : ""}`} onClick={() => onSort(col.key)}>
                    {col.label}
                    {active && <span className="arrow">{sort.dir === "asc" ? "▲" : "▼"}</span>}
                  </button>
                </th>
              );
            })}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {ticks.map((t, i) => (
            <tr key={i}>
              <td className="date">{t.date}</td>
              <td>
                {t.url ? <a href={t.url} target="_blank" rel="noreferrer">{t.route}</a> : t.route}
              </td>
              <td>{t.rating}</td>
              <td>{t.routeType}</td>
              <td>{t.style}</td>
              <td>{t.sendStatus}</td>
              <td className="loc">{t.location}</td>
              <td>{t.pitches ?? ""}</td>
              <td>{t.length ?? ""}</td>
              <td>{t.yourStars === -1 ? "" : t.yourStars}</td>
              <td>{t.avgStars ?? ""}</td>
              <td className="notes">{t.notes}</td>
              <td className="row-actions">
                <button
                  type="button"
                  className="row-edit"
                  onClick={() => onEdit(t)}
                  aria-label={`Edit tick: ${t.route || "unnamed route"}`}
                  title="Edit"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
                    <path
                      d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="row-delete"
                  onClick={() => onDelete(t)}
                  aria-label={`Delete tick: ${t.route || "unnamed route"}`}
                  title="Delete"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
                    <path
                      d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
          {ticks.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length + 1} className="empty">{emptyMessage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
