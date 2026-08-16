import { useEffect, useMemo, useState } from "react";
import { parseTicks, serializeTicks } from "./parseCsv.js";
import { loadTicks, saveTicks } from "./db.js";
import { SEND_STATUS_BY_STYLE } from "./climbingOptions.js";
import Toolbar from "./components/Toolbar.jsx";
import TickForm from "./components/TickForm.jsx";
import ImportHelpModal from "./components/ImportHelpModal.jsx";
import ConfirmModal from "./components/ConfirmModal.jsx";
import StatisticsModal from "./components/StatisticsModal.jsx";
import TickFilters from "./components/TickFilters.jsx";
import TickTable from "./components/TickTable.jsx";

const DEFAULT_FILTERS = { style: "", sendStatus: "", routeType: "", year: "" };

export default function App() {
  const [ticks, setTicks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    loadTicks().then(setTicks);
  }, []);

  const handleImport = async (file) => {
    const text = await file.text();
    const imported = parseTicks(text);
    await saveTicks(imported);
    setTicks(imported);
  };

  const handleExport = () => {
    const blob = new Blob([serializeTicks(ticks)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ticks.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddRoute = async (tick) => {
    const next = [tick, ...ticks];
    await saveTicks(next);
    setTicks(next);
    setShowAddForm(false);
  };

  const handleEditRoute = async (updated) => {
    const next = ticks.map((t) => (t === editTarget ? updated : t));
    await saveTicks(next);
    setTicks(next);
    setEditTarget(null);
  };

  const confirmClear = async () => {
    await saveTicks([]);
    setTicks([]);
    setShowClearConfirm(false);
  };

  const confirmDelete = async () => {
    const next = ticks.filter((t) => t !== deleteTarget);
    await saveTicks(next);
    setTicks(next);
    setDeleteTarget(null);
  };

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState({ key: "date", dir: "desc" });

  const options = useMemo(() => {
    const uniq = (list, key) =>
      [...new Set(list.map((t) => t[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const sendStatus = filters.style
      ? SEND_STATUS_BY_STYLE[filters.style] ?? []
      : [...new Set(Object.values(SEND_STATUS_BY_STYLE).flat())].sort((a, b) => a.localeCompare(b));
    return {
      style: uniq(ticks, "style"),
      sendStatus,
      routeType: uniq(ticks, "routeType"),
    };
  }, [ticks, filters.style]);

  const years = useMemo(
    () => [...new Set(ticks.map((t) => t.date?.slice(0, 4))).values()].sort().reverse(),
    [ticks]
  );

  const visibleTicks = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = ticks.filter((t) => {
      if (filters.style && t.style !== filters.style) return false;
      if (filters.sendStatus && t.sendStatus !== filters.sendStatus) return false;
      if (filters.routeType && t.routeType !== filters.routeType) return false;
      if (filters.year && t.date?.slice(0, 4) !== filters.year) return false;
      if (q && ![t.route, t.location, t.notes, t.rating].some((v) => v?.toLowerCase().includes(q))) return false;
      return true;
    });
    const { key, dir } = sort;
    const dirNum = dir === "asc" ? 1 : -1;
    return [...matches].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dirNum;
      return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dirNum;
    });
  }, [ticks, query, filters, sort]);

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  return (
    <main>
      <header>
        <h1>Climbing Ticks</h1>
        <p className="count">{visibleTicks.length} of {ticks.length} ticks</p>
      </header>
      <Toolbar
        onAdd={() => setShowAddForm(true)}
        onImport={handleImport}
        onExport={handleExport}
        onStatistics={() => setShowStatistics(true)}
        onClear={() => setShowClearConfirm(true)}
        onHelp={() => setShowHelp(true)}
        noTicks={ticks.length === 0}
      />
      <TickFilters query={query} onQuery={setQuery} filters={filters} onFilters={setFilters} options={options} years={years} />
      <TickTable
        ticks={visibleTicks}
        sort={sort}
        onSort={toggleSort}
        onEdit={setEditTarget}
        onDelete={setDeleteTarget}
        emptyMessage={ticks.length === 0 ? "No ticks yet. Import a CSV to get started." : "No ticks match the current filters."}
      />
      {showAddForm && (
        <TickForm options={options} onSubmit={handleAddRoute} onClose={() => setShowAddForm(false)} />
      )}
      {editTarget && (
        <TickForm
          options={options}
          initialTick={editTarget}
          onSubmit={handleEditRoute}
          onClose={() => setEditTarget(null)}
        />
      )}
      {showHelp && <ImportHelpModal onClose={() => setShowHelp(false)} />}
      {showStatistics && <StatisticsModal ticks={ticks} onClose={() => setShowStatistics(false)} />}
      {showClearConfirm && (
        <ConfirmModal
          title="Delete all ticks?"
          message={`This will permanently delete all ${ticks.length} ticks. This cannot be undone.`}
          confirmLabel="Delete All"
          onConfirm={confirmClear}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
      {deleteTarget && (
        <ConfirmModal
          title="Delete this tick?"
          message={`This will permanently delete "${deleteTarget.route || "this route"}" (${deleteTarget.date}). This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </main>
  );
}
