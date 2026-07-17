// Ghép polygon Hoàng Sa & Trường Sa (từ Free-GIS-Data, nguyenduy1133)
// vào 2 lớp ranh giới web-ready của lqtue/LacaProvinceMap.
// Chạy: node merge_islands.mjs <scratchDir> <outDir>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [scratch, outDir] = process.argv.slice(2);

const round = (n) => Math.round(n * 1e4) / 1e4;
const roundCoords = (c) =>
  typeof c[0] === "number" ? [round(c[0]), round(c[1])] : c.map(roundCoords);

// --- 1. Nguồn quần đảo: file post-2025 của Free-GIS-Data (15 MB, đầy đủ đảo)
const src = JSON.parse(readFileSync(join(scratch, "post2025_raw.geojson"), "utf8"));
console.log("post2025 features:", src.features.length);
console.log("names:", src.features.map((f) => JSON.stringify(f.properties)).slice(0, 3));

// Tách các polygon nằm phía đông 110.5°E (Hoàng Sa ~111-113°E, Trường Sa ~111.5-117°E)
const eastOf = (ring) => ring.every((pt) => pt[0] > 110.5);
const islandFeatures = [];
for (const f of src.features) {
  const polys =
    f.geometry.type === "MultiPolygon" ? f.geometry.coordinates : [f.geometry.coordinates];
  const islands = polys.filter((poly) => eastOf(poly[0]));
  if (islands.length > 0) {
    const props = f.properties;
    const name = props.ten_tinh || props.Name || props.name || JSON.stringify(props);
    // Hoàng Sa: vĩ độ ~15.7-17.1°N; Trường Sa: ~6.5-12°N
    const hoangSa = islands.filter((p) => p[0][0][1] > 13);
    const truongSa = islands.filter((p) => p[0][0][1] <= 13);
    if (hoangSa.length)
      islandFeatures.push({ group: "hoang-sa", parent: name, polys: hoangSa });
    if (truongSa.length)
      islandFeatures.push({ group: "truong-sa", parent: name, polys: truongSa });
    console.log(`${name}: ${islands.length} island polys (HS ${hoangSa.length} / TS ${truongSa.length})`);
  }
}

const mkFeature = (group, nameVi, parent34, parent63, polys) => ({
  type: "Feature",
  properties: {
    ten: nameVi,
    loai: "quan-dao",
    thuoc_tinh_34: parent34,
    thuoc_tinh_63: parent63,
    chu_quyen: "Việt Nam",
  },
  geometry: { type: "MultiPolygon", coordinates: roundCoords(polys) },
});

const hs = islandFeatures.filter((i) => i.group === "hoang-sa").flatMap((i) => i.polys);
const ts = islandFeatures.filter((i) => i.group === "truong-sa").flatMap((i) => i.polys);
if (!hs.length || !ts.length) {
  console.error(`THIẾU ĐẢO trong nguồn post-2025: HS=${hs.length} TS=${ts.length} — thử nguồn pre-2025`);
  process.exit(1);
}
const hsFeat = mkFeature("hoang-sa", "Quần đảo Hoàng Sa", "Thành phố Đà Nẵng", "Thành phố Đà Nẵng", hs);
const tsFeat = mkFeature("truong-sa", "Quần đảo Trường Sa", "Khánh Hòa", "Khánh Hòa", ts);

// --- 2. Ghép vào 2 lớp lqtue
for (const [inFile, outFile] of [
  ["new.geojson", "vn-34-tinh-2025.geojson"],
  ["old.geojson", "vn-63-tinh-truoc-2025.geojson"],
]) {
  const layer = JSON.parse(readFileSync(join(scratch, inFile), "utf8"));
  const before = layer.features.length;
  layer.features.push(hsFeat, tsFeat);
  writeFileSync(join(outDir, outFile), JSON.stringify(layer));
  console.log(`${outFile}: ${before} -> ${layer.features.length} features`);
}
console.log("DONE");
