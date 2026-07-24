// Apply reviewed Commons photo matches from a dump JSON into overlay files.
// Deterministic (no network) — writes exactly the matches a human reviewed,
// minus a reject list, with cleaned attribution.
//   node scripts/apply_photos_from_dump.mjs <dump.json> <reject.json>
import fs from "node:fs";
import path from "node:path";

const [dumpPath, rejectPath] = process.argv.slice(2);
const OV = path.resolve("public/data/overlays");
const dump = JSON.parse(fs.readFileSync(dumpPath, "utf8"));
const reject = new Set(rejectPath ? JSON.parse(fs.readFileSync(rejectPath, "utf8")).map(String) : []);

// anh_nguon in the dump is "Wikimedia Commons — <artist…> · <url>"; the artist
// segment is occasionally a giant credit dump — keep first line, cap length.
function cleanNguon(s) {
  const i = s.lastIndexOf(" · http");
  const credit = i >= 0 ? s.slice(0, i) : s;
  const url = i >= 0 ? s.slice(i + 3) : "";
  let artist = credit.replace(/^Wikimedia Commons — /, "").split("\n")[0].trim();
  if (artist.length > 100) artist = artist.slice(0, 100).trim() + "…";
  if (!artist) artist = "không rõ tác giả";
  return `Wikimedia Commons — ${artist} · ${url}`;
}

const byFile = {};
for (const m of dump) {
  if (reject.has(m.id) || reject.has(m.ten)) continue;
  (byFile[m.file] = byFile[m.file] || []).push(m);
}

let grand = 0;
for (const [file, list] of Object.entries(byFile)) {
  const full = path.join(OV, file);
  const raw = fs.readFileSync(full, "utf8");
  const data = JSON.parse(raw);
  const items = Array.isArray(data) ? data : data.items;
  const rtOk = JSON.stringify(data, null, 2) + "\n" === raw;
  // Join by `ten` (always present + unique per file); some layers lack `id`.
  const byTen = new Map(list.map((m) => [m.ten, m]));
  let n = 0;
  for (const it of items) {
    const m = byTen.get(it.ten);
    if (!m || it.anh) continue;
    it.anh = m.fields.anh;
    it.anh_nguon = cleanNguon(m.fields.anh_nguon);
    it.anh_giay_phep = m.fields.anh_giay_phep;
    it.anh_muc = m.fields.anh_muc;
    n++;
  }
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
  grand += n;
  console.log(`${file}: applied ${n}${rtOk ? "" : "  (WARN: original not clean-formatted)"}`);
}
console.log(`TOTAL applied: ${grand}`);
