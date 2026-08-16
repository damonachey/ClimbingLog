import { useEffect, useMemo, useState } from "react";
import {
  DISCIPLINE_ORDER,
  PERIODS,
  classifyDiscipline,
  periodStats,
  pitchesByYear,
  pitchesByMonth,
  routesByGrade,
  bouldersByGrade,
} from "../statistics.js";
import StatBarChart from "./StatBarChart.jsx";

const TOGGLEABLE_DISCIPLINES = DISCIPLINE_ORDER.filter((d) => d !== "Other");

export default function StatisticsModal({ ticks, onClose }) {
  const [enabled, setEnabled] = useState(() => new Set(DISCIPLINE_ORDER));

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const toggleDiscipline = (discipline) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(discipline)) next.delete(discipline);
      else next.add(discipline);
      return next;
    });
  };

  const filteredTicks = useMemo(
    () => ticks.filter((t) => enabled.has(classifyDiscipline(t.routeType))),
    [ticks, enabled]
  );

  const yearData = useMemo(() => pitchesByYear(filteredTicks), [filteredTicks]);
  const monthData = useMemo(() => pitchesByMonth(filteredTicks), [filteredTicks]);
  const gradeData = useMemo(() => routesByGrade(filteredTicks), [filteredTicks]);
  const boulderData = useMemo(() => bouldersByGrade(filteredTicks), [filteredTicks]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="stats-title">Tick Breakdown</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-content">
          <div className="stats-toggles">
            {TOGGLEABLE_DISCIPLINES.map((discipline) => (
              <button
                key={discipline}
                type="button"
                className={`discipline-toggle bar-${discipline.toLowerCase()}${enabled.has(discipline) ? " active" : ""}`}
                onClick={() => toggleDiscipline(discipline)}
                aria-pressed={enabled.has(discipline)}
              >
                {discipline}
              </button>
            ))}
          </div>
          <div className="stats-grid">
            <div className="chart-panel stats-kpi">
              <h3>Summary</h3>
              <table className="stats-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Pitches</th>
                    <th>Routes</th>
                    <th>Days Out</th>
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map(({ label, days }) => {
                    const s = periodStats(filteredTicks, days);
                    return (
                      <tr key={label}>
                        <th scope="row">{label}</th>
                        <td>{s.pitches.toLocaleString()}</td>
                        <td>{s.routes.toLocaleString()}</td>
                        <td>{s.daysOut.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="stats-year">
              <StatBarChart title="Pitches By Year" data={yearData} seriesKeys={DISCIPLINE_ORDER} />
            </div>
            <div className="stats-month">
              <StatBarChart title="Pitches By Month" data={monthData} seriesKeys={DISCIPLINE_ORDER} rotateLabels />
            </div>
            <div className="stats-grade">
              <StatBarChart title="Rock Routes By Grade" data={gradeData} seriesKeys={DISCIPLINE_ORDER} rotateLabels />
            </div>
            <div className="stats-boulder">
              <StatBarChart
                title="Boulders By Grade"
                data={boulderData}
                seriesKeys={["Boulder"]}
                showLegend={false}
                rotateLabels
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
