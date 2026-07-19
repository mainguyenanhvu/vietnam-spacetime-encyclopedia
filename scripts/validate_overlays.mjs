// Validate lớp phủ bản đồ (overlays) + dữ liệu Nam tiến.
// - Mỗi overlay: {items:[...]} với lon/lat trong bbox VN, có nguồn, id duy nhất.
// - Bảo vật quốc gia: mỗi mục có nguồn NGOÀI Wikipedia (rule dự án).
// - Nam tiến: 34 slug phủ đúng một lần, bước liên tục, mỗi mốc có nguồn ngoài Wikipedia.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const P = (...p) => join(ROOT, ...p);
const read = (p) => JSON.parse(readFileSync(p, "utf8"));

const errors = [];
const err = (m) => errors.push(m);

// bbox VN (rộng, gồm cả hải đảo — khớp với di-tich coverage 102–118 / 7–24)
const inBbox = (lon, lat) => lon >= 102 && lon <= 118 && lat >= 7 && lat <= 24;
const isWiki = (s) => /wikipedia\.org|wikimedia\.org/i.test(String(s));

// --- Overlays ---
const OVERLAY_DIR = P("public/data/overlays");
const STRICT_SOURCE = new Set([
  "bao-vat-quoc-gia.json",
  "huyen-su-khai-quoc.json",
  "khoi-nghia-bac-thuoc.json",
]); // yêu cầu nguồn ngoài Wiki mỗi mục
for (const file of readdirSync(OVERLAY_DIR).filter((f) => f.endsWith(".json"))) {
  const data = read(join(OVERLAY_DIR, file));
  if (!Array.isArray(data.items)) {
    err(`${file}: thiếu mảng items[]`);
    continue;
  }
  const topSource = data.sources || data.nguon_chinh || data.nguon_tong;
  const ids = new Set();
  data.items.forEach((it, i) => {
    const at = `${file}[${i}] (${it.ten ?? "?"})`;
    if (!it.ten) err(`${at}: thiếu 'ten'`);
    if (typeof it.lon !== "number" || typeof it.lat !== "number")
      err(`${at}: lon/lat phải là số`);
    else if (!inBbox(it.lon, it.lat)) err(`${at}: lon/lat ${it.lon},${it.lat} ngoài bbox VN`);
    if (it.id) {
      if (ids.has(it.id)) err(`${at}: id trùng '${it.id}'`);
      ids.add(it.id);
    }
    const itemSource = Array.isArray(it.nguon) && it.nguon.length ? it.nguon : null;
    if (!itemSource && !topSource) err(`${at}: không có nguồn (item hoặc file)`);
    if (STRICT_SOURCE.has(file)) {
      if (!itemSource) err(`${at}: bảo vật cần nguon[] riêng`);
      else if (!itemSource.some((s) => !isWiki(s)))
        err(`${at}: cần ít nhất 1 nguồn NGOÀI Wikipedia`);
    }
  });
}

// --- Nam tiến ---
const NT = P("public/data/journey/nam-tien.json");
if (existsSync(NT)) {
  const nt = read(NT);
  const provinceSlugs = new Set(
    readdirSync(P("public/data/provinces"))
      .filter((f) => f.endsWith(".json") && !f.includes("_index"))
      .map((f) => f.replace(".json", "")),
  );
  if (!Array.isArray(nt.moc) || !nt.moc.length) err("nam-tien: thiếu mảng moc[]");
  else {
    const buocs = nt.moc.map((m) => m.buoc).sort((a, b) => a - b);
    if (!buocs.every((b, i) => b === i)) err(`nam-tien: bước không liên tục 0..n-1 (${buocs})`);
    const seen = new Map();
    for (const m of nt.moc) {
      const at = `nam-tien mốc ${m.buoc} (${m.ten ?? "?"})`;
      for (const k of ["nam", "ten", "mo_ta"]) if (!m[k]) err(`${at}: thiếu '${k}'`);
      if (!Array.isArray(m.tinh_moi)) err(`${at}: tinh_moi phải là mảng`);
      else
        for (const s of m.tinh_moi) {
          if (!provinceSlugs.has(s)) err(`${at}: slug tỉnh không hợp lệ '${s}'`);
          if (seen.has(s)) err(`${at}: tỉnh '${s}' đã gán ở mốc ${seen.get(s)}`);
          seen.set(s, m.buoc);
        }
      if (!Array.isArray(m.nguon) || !m.nguon.length) err(`${at}: thiếu nguon[]`);
      else if (!m.nguon.some((s) => !isWiki(s))) err(`${at}: cần ≥1 nguồn ngoài Wikipedia`);
    }
    // phủ đúng 34 tỉnh
    if (seen.size !== provinceSlugs.size)
      err(
        `nam-tien: phủ ${seen.size}/${provinceSlugs.size} tỉnh; thiếu: ${[...provinceSlugs].filter((s) => !seen.has(s)).join(", ")}`,
      );
  }
}

if (errors.length) {
  console.error(`❌ validate_overlays: ${errors.length} lỗi`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log("✅ validate_overlays: overlays + Nam tiến hợp lệ");
