import { useEffect, useMemo, useRef, useState } from "react";
import { parseTicks, serializeTicks } from "./parseCsv.js";
import { loadTicks, saveTicks } from "./db.js";
import { generateSampleTicks } from "./sampleTicks.js";
import { SEND_STATUS_BY_STYLE } from "./climbingOptions.js";
import { signIn, signOut, trySilentSignIn, getValidToken } from "./googleAuth.js";
import { pullFromDrive, pushToDrive, isPendingSync, markPendingSync, clearPendingSync } from "./driveSync.js";
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

  const [signedIn, setSignedIn] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [authError, setAuthError] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const ticksRef = useRef(ticks);
  useEffect(() => {
    ticksRef.current = ticks;
  }, [ticks]);

  const reconcile = async (token) => {
    setSyncStatus("syncing");
    try {
      if (isPendingSync()) {
        await pushToDrive(token, ticksRef.current);
        clearPendingSync();
      } else {
        const remote = await pullFromDrive(token);
        if (remote.length === 0 && ticksRef.current.length > 0) {
          // Freshly-created empty Drive file: push existing local data up rather
          // than wiping it with an empty pull.
          await pushToDrive(token, ticksRef.current);
        } else {
          await saveTicks(remote);
          ticksRef.current = remote;
          setTicks(remote);
        }
      }
      setSyncStatus("synced");
      setSyncError(null);
    } catch (err) {
      console.error("Drive reconcile failed:", err);
      markPendingSync();
      setSyncStatus("offline");
      setSyncError(err.message || "Sync failed");
    }
  };

  useEffect(() => {
    (async () => {
      const cached = await loadTicks();
      ticksRef.current = cached;
      setTicks(cached);
      const token = await trySilentSignIn();
      if (!token) return;
      setSignedIn(true);
      await reconcile(token);
    })();
  }, []);

  useEffect(() => {
    const handleOnline = async () => {
      if (!signedIn || !isPendingSync()) return;
      try {
        const token = await getValidToken();
        await pushToDrive(token, ticksRef.current);
        clearPendingSync();
        setSyncStatus("synced");
        setSyncError(null);
      } catch (err) {
        console.error("Drive sync failed:", err);
        markPendingSync();
        setSyncStatus("offline");
        setSyncError(err.message || "Sync failed");
      }
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [signedIn]);

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      const token = await signIn();
      setSignedIn(true);
      await reconcile(token);
    } catch (err) {
      console.error("Google sign-in failed:", err);
      setAuthError(err.message || "Sign-in failed");
    }
  };

  const handleSignOut = () => {
    signOut();
    setSignedIn(false);
    setSyncStatus("idle");
    setAuthError(null);
  };

  const persist = async (next) => {
    await saveTicks(next);
    setTicks(next);
    if (!signedIn) return;
    setSyncStatus("syncing");
    try {
      const token = await getValidToken();
      await pushToDrive(token, next);
      clearPendingSync();
      setSyncStatus("synced");
      setSyncError(null);
    } catch (err) {
      console.error("Drive sync failed:", err);
      markPendingSync();
      setSyncStatus("offline");
      setSyncError(err.message || "Sync failed");
    }
  };

  const handleImport = async (file) => {
    const text = await file.text();
    const imported = parseTicks(text);
    await persist(imported);
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

  const handleLoadSample = async () => {
    const sample = generateSampleTicks();
    await persist(sample);
  };

  const handleAddRoute = async (tick) => {
    const next = [tick, ...ticks];
    await persist(next);
    setShowAddForm(false);
  };

  const handleEditRoute = async (updated) => {
    const next = ticks.map((t) => (t === editTarget ? updated : t));
    await persist(next);
    setEditTarget(null);
  };

  const confirmClear = async () => {
    await persist([]);
    setShowClearConfirm(false);
  };

  const confirmDelete = async () => {
    const next = ticks.filter((t) => t !== deleteTarget);
    await persist(next);
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
        signedIn={signedIn}
        syncStatus={syncStatus}
        syncError={syncError}
        authError={authError}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />
      <TickFilters query={query} onQuery={setQuery} filters={filters} onFilters={setFilters} options={options} years={years} />
      <TickTable
        ticks={visibleTicks}
        sort={sort}
        onSort={toggleSort}
        onEdit={setEditTarget}
        onDelete={setDeleteTarget}
        emptyMessage={
          ticks.length === 0 ? (
            <>
              No ticks yet. Import a CSV to get started.{" "}
              <button type="button" className="load-sample" onClick={handleLoadSample}>
                Load Sample Ticks
              </button>
            </>
          ) : (
            "No ticks match the current filters."
          )
        }
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
