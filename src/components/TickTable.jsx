const COLUMNS = [
  { key: "date", label: "Date" },
  { key: "route", label: "Route" },
  { key: "rating", label: "Rating" },
  { key: "routeType", label: "Type" },
  { key: "style", label: "Style" },
  { key: "leadStyle", label: "Lead" },
  { key: "location", label: "Location" },
  { key: "pitches", label: "Pitches" },
  { key: "length", label: "Length (m)" },
  { key: "yourStars", label: "Your ★" },
  { key: "avgStars", label: "Avg ★" },
  { key: "notes", label: "Notes" },
];

export default function TickTable({ ticks, sort, onSort }) {
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
          </tr>
        </thead>
        <tbody>
          {ticks.map((t, i) => (
            <tr key={i}>
              <td>{t.date}</td>
              <td>
                {t.url ? <a href={t.url} target="_blank" rel="noreferrer">{t.route}</a> : t.route}
              </td>
              <td>{t.rating}</td>
              <td>{t.routeType}</td>
              <td>{t.style}</td>
              <td>{t.leadStyle}</td>
              <td className="loc">{t.location}</td>
              <td>{t.pitches ?? ""}</td>
              <td>{t.length ?? ""}</td>
              <td>{t.yourStars === -1 ? "" : t.yourStars}</td>
              <td>{t.avgStars ?? ""}</td>
              <td className="notes">{t.notes}</td>
            </tr>
          ))}
          {ticks.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length} className="empty">No ticks match the current filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
