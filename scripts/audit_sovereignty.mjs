// Kiểm toán chủ quyền biển đảo: mọi lớp ranh giới trong public/data/boundaries
// phải chứa polygon cho từng đảo/quần đảo trọng yếu dưới đây.
// CI fail nếu thiếu bất kỳ mục nào. Chạy: node scripts/audit_sovereignty.mjs
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BOUNDARY_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "data",
  "boundaries",
);

// [tên, lon, lat, bán kính chấp nhận (độ)]
// Toạ độ tham khảo từ bản đồ hành chính chính thức; bán kính nới cho dữ liệu simplified.
const REQUIRED_ISLANDS = [
  ["Quần đảo Hoàng Sa", 112.0, 16.5, 1.2],
  ["Quần đảo Trường Sa (Trường Sa Lớn)", 111.92, 8.64, 1.0],
  ["Quần đảo Trường Sa (cụm phía Đông)", 115.0, 10.0, 1.5],
  ["Phú Quốc", 103.96, 10.22, 0.3],
  ["Thổ Chu", 103.47, 9.3, 0.35],
  ["Côn Đảo", 106.6, 8.68, 0.3],
  ["Bạch Long Vĩ", 107.72, 20.13, 0.35],
  ["Cát Bà", 107.05, 20.73, 0.3],
  ["Cồn Cỏ", 107.34, 17.16, 0.35],
  ["Lý Sơn", 109.11, 15.38, 0.3],
  ["Phú Quý", 108.94, 10.52, 0.35],
  ["Hòn Khoai", 104.83, 8.43, 0.35],
];

const dist = (a, b, c, d) => Math.hypot(a - c, b - d);

function* rings(geom) {
  const polys = geom.type === "MultiPolygon" ? geom.coordinates : [geom.coordinates];
  for (const poly of polys) for (const ring of poly) yield ring;
}

let failed = false;
for (const file of readdirSync(BOUNDARY_DIR).filter((f) => f.endsWith(".geojson"))) {
  const gj = JSON.parse(readFileSync(join(BOUNDARY_DIR, file), "utf8"));
  console.log(`\n=== ${file} (${gj.features.length} features) ===`);
  for (const [name, lon, lat, radius] of REQUIRED_ISLANDS) {
    let best = Infinity;
    let owner = "";
    for (const f of gj.features) {
      for (const ring of rings(f.geometry)) {
        for (const [x, y] of ring) {
          const d = dist(x, y, lon, lat);
          if (d < best) {
            best = d;
            owner =
              f.properties["ten"] ??
              f.properties["Tỉnh thành mới"] ??
              f.properties["Tỉnh thành cũ"] ??
              "?";
          }
        }
      }
    }
    const ok = best <= radius;
    if (!ok) failed = true;
    console.log(
      `${ok ? "✅" : "❌"} ${name}: gần nhất ${best.toFixed(3)}° (${owner})${ok ? "" : ` — VƯỢT ngưỡng ${radius}°`}`,
    );
  }
}

if (failed) {
  console.error("\n❌ KIỂM TOÁN CHỦ QUYỀN THẤT BẠI — thiếu đảo trong dữ liệu ranh giới.");
  process.exit(1);
}
console.log("\n✅ Tất cả đảo/quần đảo trọng yếu đều có mặt trong mọi lớp.");
