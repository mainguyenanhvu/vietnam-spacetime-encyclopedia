// Bổ sung các đảo bị simplify mất (Thổ Chu, Bạch Long Vĩ, Phú Quý…)
// từ nguồn full-res Free-GIS-Data vào 2 lớp ranh giới đã publish.
// Chạy: node scripts/add_missing_islands.mjs <đường-dẫn-post2025_raw.geojson>
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rawPath = process.argv[2];
const BOUNDARY_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "data",
  "boundaries",
);

// [tên, lon, lat, bán_kính, thuộc tỉnh (34), thuộc tỉnh (63)]
const TARGETS = [
  ["Đảo Thổ Chu", 103.47, 9.3, 0.25, "An Giang", "Kiên Giang"],
  ["Đảo Bạch Long Vĩ", 107.72, 20.13, 0.2, "Thành phố Hải Phòng", "Thành phố Hải Phòng"],
  ["Đảo Phú Quý", 108.94, 10.52, 0.25, "Lâm Đồng", "Bình Thuận"],
];

const round = (n) => Math.round(n * 1e4) / 1e4;
const roundCoords = (c) =>
  typeof c[0] === "number" ? [round(c[0]), round(c[1])] : c.map(roundCoords);

const src = JSON.parse(readFileSync(rawPath, "utf8"));

const found = [];
for (const [name, lon, lat, radius, owner34, owner63] of TARGETS) {
  const polys = [];
  for (const f of src.features) {
    const geoms =
      f.geometry.type === "MultiPolygon" ? f.geometry.coordinates : [f.geometry.coordinates];
    for (const poly of geoms) {
      const inside = poly[0].every(
        ([x, y]) => Math.hypot(x - lon, y - lat) <= radius,
      );
      if (inside) polys.push(poly);
    }
  }
  if (!polys.length) {
    console.error(`❌ Không tìm thấy ${name} trong nguồn full-res!`);
    process.exit(1);
  }
  console.log(`✅ ${name}: ${polys.length} polygon`);
  found.push({ name, owner34, owner63, polys });
}

for (const [file, ownerKey] of [
  ["vn-34-tinh-2025.geojson", "owner34"],
  ["vn-63-tinh-truoc-2025.geojson", "owner63"],
]) {
  const path = join(BOUNDARY_DIR, file);
  const layer = JSON.parse(readFileSync(path, "utf8"));
  // idempotent: bỏ bản cũ nếu chạy lại
  layer.features = layer.features.filter(
    (f) => !(f.properties.loai === "dao" && found.some((i) => i.name === f.properties.ten)),
  );
  for (const island of found) {
    layer.features.push({
      type: "Feature",
      properties: {
        ten: island.name,
        loai: "dao",
        thuoc_tinh_34: island.owner34,
        thuoc_tinh_63: island.owner63,
        chu_quyen: "Việt Nam",
      },
      geometry: { type: "MultiPolygon", coordinates: roundCoords(island.polys) },
    });
  }
  writeFileSync(path, JSON.stringify(layer));
  console.log(`${file}: -> ${layer.features.length} features (${ownerKey})`);
}
console.log("DONE");
