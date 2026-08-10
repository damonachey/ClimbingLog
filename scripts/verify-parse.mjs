import { readFileSync } from "node:fs";
import { parseTicks } from "../src/parseCsv.js";

const text = readFileSync("ticks.csv", "utf8");
const ticks = parseTicks(text);
console.log("rows:", ticks.length);
console.log("sample:", JSON.stringify(ticks[0]));
const note = ticks.find((t) => t.notes && t.notes.includes("5'6"));
console.log("escaped quote:", JSON.stringify(note?.notes));
console.log("keys:", Object.keys(ticks[0]).join(", "));
const bad = ticks.filter((t) => typeof t.avgStars !== "number" || typeof t.yourStars !== "number");
console.log("non-numeric star fields:", bad.length);
