// Sinh public/data/timeline/events.json (đồ thị kế thừa tỉnh) từ bảng
// crosswalk "Tỉnh thành cũ" trong lớp 34 tỉnh. Nguồn pháp lý: NQ 202/2025/QH15.
// Chạy: node scripts/gen_timeline_events.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const gj = JSON.parse(
  readFileSync(join(ROOT, "public", "data", "boundaries", "vn-34-tinh-2025.geojson"), "utf8"),
);

const events = [];
for (const f of gj.features) {
  const p = f.properties;
  if (p.loai) continue; // bỏ feature đảo
  const to = p["Tỉnh thành mới"];
  const from = String(p["Tỉnh thành cũ"] || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  events.push({
    date: "2025-07-01",
    type: from.length > 1 ? "hop-nhat" : "giu-nguyen",
    to,
    from,
    phap_ly: "Nghị quyết 202/2025/QH15",
    nguon: "https://xaydungchinhsach.chinhphu.vn/chi-tiet-34-don-vi-hanh-chinh-cap-tinh-tu-12-6-2025-119250612141845533.htm",
  });
}

const outDir = join(ROOT, "public", "data", "timeline");
mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, "events.json"),
  JSON.stringify({ generated_by: "scripts/gen_timeline_events.mjs", events }, null, 2),
);
const merged = events.filter((e) => e.type === "hop-nhat").length;
console.log(`events.json: ${events.length} tỉnh (${merged} hợp nhất, ${events.length - merged} giữ nguyên)`);
