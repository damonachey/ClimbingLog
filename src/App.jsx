import { useMemo, useState } from "react";
import TickFilters from "./components/TickFilters.jsx";
import TickTable from "./components/TickTable.jsx";

const DEFAULT_FILTERS = { style: "", leadStyle: "", routeType: "", year: "" };

export default function App() {
  const [ticks, setTicks] = useState([]);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState({ key: "date", dir: "desc" });

  const options = useMemo(() => {
    const uniq = (key) =>
      [...new Set(ticks.map((t) => t[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    return { style: uniq("style"), leadStyle: uniq("leadStyle"), routeType: uniq("routeType") };
  }, [ticks]);

  const years = useMemo(
    () => [...new Set(ticks.map((t) => t.date?.slice(0, 4))).values()].sort().reverse(),
    [ticks]
  );

  const visibleTicks = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = ticks.filter((t) => {
      if (filters.style && t.style !== filters.style) return false;
      if (filters.leadStyle && t.leadStyle !== filters.leadStyle) return false;
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
      <TickFilters query={query} onQuery={setQuery} filters={filters} onFilters={setFilters} options={options} years={years} />
      <TickTable ticks={visibleTicks} sort={sort} onSort={toggleSort} />
    </main>
  );
}
