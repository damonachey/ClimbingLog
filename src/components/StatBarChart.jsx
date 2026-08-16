export default function StatBarChart({ title, data, seriesKeys, showLegend = true, rotateLabels = false }) {
  const maxTotal = Math.max(0, ...data.map((d) => seriesKeys.reduce((s, k) => s + (d.totals[k] || 0), 0)));

  return (
    <div className="chart-panel">
      <h3>{title}</h3>
      {data.length === 0 || maxTotal === 0 ? (
        <p className="chart-empty">No data</p>
      ) : (
        <>
          <div className={`bar-chart${rotateLabels ? " rotate-labels" : ""}`}>
            {data.map((d) => {
              let cumulative = 0;
              const segments = seriesKeys
                .map((key) => {
                  const value = d.totals[key] || 0;
                  const segment = { key, value, bottom: (cumulative / maxTotal) * 100, height: (value / maxTotal) * 100 };
                  cumulative += value;
                  return segment;
                })
                .filter((s) => s.value > 0);
              const total = cumulative;
              return (
                <div className="bar-col" key={d.label}>
                  <div className="bar-total">{total > 0 ? total.toLocaleString() : ""}</div>
                  <div className="bar-stack">
                    {segments.map((s, i) => (
                      <div
                        key={s.key}
                        className={`bar-seg bar-${s.key.toLowerCase()}${i === segments.length - 1 ? " bar-seg-top" : ""}${i > 0 ? " bar-seg-gap" : ""}`}
                        style={{ bottom: `${s.bottom}%`, height: `${s.height}%` }}
                        title={`${s.key}: ${s.value.toLocaleString()}`}
                      />
                    ))}
                  </div>
                  <div className="bar-label">{d.label}</div>
                </div>
              );
            })}
          </div>
          {showLegend && (
            <div className="chart-legend">
              {seriesKeys.map((key) => (
                <span key={key} className="legend-item">
                  <span className={`legend-swatch bar-${key.toLowerCase()}`} />
                  {key}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
