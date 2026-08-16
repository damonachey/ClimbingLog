const NUMERIC = new Set(["pitches", "avgStars", "yourStars", "length", "ratingCode"]);

const HEADER_LABELS = {
  date: "Date",
  route: "Route",
  rating: "Rating",
  notes: "Notes",
  url: "URL",
  pitches: "Pitches",
  location: "Location",
  avgStars: "Avg Stars",
  yourStars: "Your Stars",
  style: "Style",
  sendStatus: "Lead Style",
  routeType: "Route Type",
  yourRating: "Your Rating",
  length: "Length",
  ratingCode: "Rating Code",
};

const HEADER_KEY_ALIASES = { "Lead Style": "sendStatus" };

function camelCase(header) {
  const parts = header.trim().split(/[^a-zA-Z0-9]+/).filter(Boolean);
  return parts
    .map((part, i) => (i === 0 ? part.toLowerCase() : part[0].toUpperCase() + part.slice(1).toLowerCase()))
    .join("");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function parseTicks(text) {
  const rows = parseCsv(text);
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => HEADER_KEY_ALIASES[h.trim()] ?? camelCase(h));
  return rows
    .slice(1)
    .map((values) =>
      Object.fromEntries(
        headers.map((key, i) => {
          const value = (values[i] ?? "").trim();
          return [key, NUMERIC.has(key) && value !== "" ? Number(value) : value];
        })
      )
    );
}

function escapeCsvField(value) {
  const str = value == null ? "" : String(value);
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function serializeTicks(ticks) {
  const keys = Object.keys(HEADER_LABELS);
  const lines = [keys.map((key) => escapeCsvField(HEADER_LABELS[key]))]
    .concat(ticks.map((tick) => keys.map((key) => escapeCsvField(tick[key]))))
    .map((fields) => fields.join(","));
  return lines.join("\r\n") + "\r\n";
}
