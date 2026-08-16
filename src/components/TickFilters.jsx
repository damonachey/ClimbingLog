const SELECTS = [
  { key: "style", label: "Style", valuesKey: "style" },
  { key: "sendStatus", label: "Send Status", valuesKey: "sendStatus" },
  { key: "routeType", label: "Route Type", valuesKey: "routeType" },
];

export default function TickFilters({ query, onQuery, filters, onFilters, options, years }) {
  const handleFilterChange = (key) => (e) => {
    const value = e.target.value;
    if (key === "style") {
      onFilters({ ...filters, style: value, sendStatus: "" });
    } else {
      onFilters({ ...filters, [key]: value });
    }
  };

  return (
    <div className="filters">
      <input
        className="search"
        type="search"
        placeholder="Search route, location, notes…"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
      />
      <label>
        Year
        <select value={filters.year} onChange={(e) => onFilters({ ...filters, year: e.target.value })}>
          <option value="">All</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </label>
      {SELECTS.map(({ key, label, valuesKey }) => (
        <label key={key}>
          {label}
          <select value={filters[key]} onChange={handleFilterChange(key)}>
            <option value="">All</option>
            {options[valuesKey].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>
      ))}
      {(query || Object.values(filters).some(Boolean)) && (
        <button
          className="reset"
          onClick={() => {
            onQuery("");
            onFilters({ style: "", sendStatus: "", routeType: "", year: "" });
          }}
        >
          Reset
        </button>
      )}
    </div>
  );
}
