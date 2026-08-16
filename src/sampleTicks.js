// Obviously-fake data for demoing the app with an empty log.
const SAMPLE_TICKS = [
  { date: "2026-01-05", route: "Crimson Crimper", rating: "5.9", routeType: "Sport", style: "Lead", sendStatus: "Onsight", location: "Mock Rock", pitches: 1, length: 20, yourStars: 4, avgStars: 3.5, notes: "" },
  { date: "2026-01-12", route: "Sandbagger's Delight", rating: "5.10a", routeType: "Trad", style: "Lead", sendStatus: "Redpoint", location: "Fictional Falls", pitches: 2, length: 40, yourStars: 3, avgStars: 4, notes: "Way harder than the guidebook says. My partner still owes me a beer." },
  { date: "2026-01-19", route: "Send Train Departing", rating: "V4", routeType: "Boulder", style: "Solo", sendStatus: "Clean", location: "Sample Summit", pitches: 1, length: 4, yourStars: 5, avgStars: 4.5, notes: "" },
  { date: "2026-01-26", route: "Ope, Wrong Beta", rating: "5.11b", routeType: "Sport", style: "Lead", sendStatus: "Fell/Hung", location: "Placeholder Point", pitches: 1, length: 25, yourStars: 2, avgStars: 3, notes: "" },
  { date: "2026-02-02", route: "Gumby's First Lead", rating: "5.6", routeType: "Trad", style: "Lead", sendStatus: "Onsight", location: "Testcrag Towers", pitches: 1, length: 18, yourStars: 3, avgStars: 2.5, notes: "" },
  { date: "2026-02-09", route: "Chalk Bag Confessions", rating: "5.10c", routeType: "Sport", style: "TR", sendStatus: "Clean", location: "Notional Notch", pitches: 1, length: 22, yourStars: 4, avgStars: 3.5, notes: "" },
  { date: "2026-02-16", route: "Death by a Thousand Crimps", rating: "5.12a", routeType: "Sport", style: "Lead", sendStatus: "Redpoint", location: "Imaginary Ridge", pitches: 1, length: 30, yourStars: 5, avgStars: 4, notes: "" },
  { date: "2026-02-23", route: "Flash in the Pan", rating: "5.9", routeType: "Sport", style: "Lead", sendStatus: "Flash", location: "Demo Dome", pitches: 1, length: 20, yourStars: 4, avgStars: 3, notes: "" },
  { date: "2026-03-02", route: "Beta Sprayer's Nightmare", rating: "V2", routeType: "Boulder", style: "Follow", sendStatus: "Clean", location: "Sample Slabs", pitches: 1, length: 5, yourStars: 3, avgStars: 3, notes: "" },
  { date: "2026-03-09", route: "The Whipper Zipper", rating: "5.10d", routeType: "Trad", style: "Solo", sendStatus: "Bailed", location: "Faux Face", pitches: 3, length: 60, yourStars: 1, avgStars: 2, notes: "Got spooked by a marmot at the crux. Bailed off a single nut." },
].map((t) => ({ ...t, url: "" }));

export function generateSampleTicks() {
  return SAMPLE_TICKS.map((t) => ({ ...t }));
}
