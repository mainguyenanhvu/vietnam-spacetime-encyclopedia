// Dựng bản đồ định vị mini — public/data/geo/vn-minimap.json
//
// Dùng cho khối «Vị trí trận đánh» trong sa đồ chiến dịch (src/battle.ts):
// silhouette 34 tỉnh (nhóm theo «Tỉnh thành mới» của vn-63-tinh-truoc-2025)
// + 5 đảo/quần đảo chủ quyền, đã CHIẾU SẴN sang không gian vẽ WxH để client
// chỉ việc nhét vào <path d>.
//
// 🔴 Bất biến #1: 5 feature `chu_quyen` (Hoàng Sa, Trường Sa, Thổ Chu,
// Bạch Long Vĩ, Phú Quý) LUÔN nằm trong nhóm `dao` — script ném lỗi nếu
// thiếu, và bbox chiếu phải phủ đủ kinh độ Trường Sa.
//
// Chạy: node scripts/build_minimap_vn.mjs
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TINH_63 = join(ROOT, "public", "data", "boundaries", "vn-63-tinh-truoc-2025.geojson");
const PROV = join(ROOT, "public", "data", "provinces");
const RA = join(ROOT, "public", "data", "geo", "vn-minimap.json");

// Khung chiếu: đủ phủ đất liền + Hoàng Sa + Trường Sa (kinh độ ~114,4°).
const LON_MIN = 101.8;
const LON_MAX = 117.6;
const LAT_MIN = 4.6;
const LAT_MAX = 23.7;
const H = 560; // px không gian vẽ
const K = H / (LAT_MAX - LAT_MIN);
const CO_LAT = Math.cos(((LAT_MIN + LAT_MAX) / 2) * (Math.PI / 180));
const W = Math.round((LON_MAX - LON_MIN) * K * CO_LAT);

const chieu = ([lon, lat]) => [
  Math.round((lon - LON_MIN) * K * CO_LAT * 10) / 10,
  Math.round((LAT_MAX - lat) * K * 10) / 10,
];

/** Douglas–Peucker trên toạ độ độ — đủ cho minimap, không cần thư viện. */
function donGian(diem, eps) {
  if (diem.length < 3) return diem;
  const kc = (p, a, b) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l2 = dx * dx + dy * dy;
    if (!l2) return Math.hypot(p[0] - a[0], p[1] - a[1]);
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
    return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
  };
  let iMax = 0;
  let dMax = 0;
  for (let i = 1; i < diem.length - 1; i++) {
    const d = kc(diem[i], diem[0], diem[diem.length - 1]);
    if (d > dMax) {
      dMax = d;
      iMax = i;
    }
  }
  if (dMax <= eps) return [diem[0], diem[diem.length - 1]];
  const trai = donGian(diem.slice(0, iMax + 1), eps);
  const phai = donGian(diem.slice(iMax), eps);
  return trai.slice(0, -1).concat(phai);
}

/** Mọi vành NGOÀI của một geometry (bỏ lỗ — minimap không cần). */
function vanhNgoai(geom) {
  if (geom.type === "Polygon") return [geom.coordinates[0]];
  if (geom.type === "MultiPolygon") return geom.coordinates.map((p) => p[0]);
  return [];
}

const khoaSlug = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Tên trong geojson → tên file provinces/ khi slug hoá thẳng KHÔNG ra.
const SLUG_DAC_BIET = { "tp-hcm": "thanh-pho-ho-chi-minh" };

function duongDan(rings, eps, toiThieu) {
  const parts = [];
  for (const ring of rings) {
    const gon = donGian(ring, eps);
    if (gon.length < toiThieu) continue;
    const px = gon.map(chieu);
    parts.push(`M${px.map((p) => `${p[0]},${p[1]}`).join(" L")} Z`);
  }
  return parts.join(" ");
}

const gj = JSON.parse(readFileSync(TINH_63, "utf8"));
const slugsThat = new Set(
  readdirSync(PROV).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", "")),
);

const theoTinhMoi = new Map();
const dao = [];
for (const f of gj.features) {
  if (f.properties?.chu_quyen) {
    // Đảo/quần đảo: KHÔNG đơn giản hoá tới mức biến mất — eps nhỏ, giữ mọi vành.
    const rings = vanhNgoai(f.geometry);
    const d = duongDan(rings, 0.002, 3);
    // Tâm nhãn: trung bình các đỉnh vành đầu.
    const r0 = rings[0] ?? [];
    const cx = r0.reduce((s, p) => s + p[0], 0) / (r0.length || 1);
    const cy = r0.reduce((s, p) => s + p[1], 0) / (r0.length || 1);
    const [x, y] = chieu([cx, cy]);
    dao.push({ ten: f.properties.ten, loai: f.properties.loai, d, x, y });
    continue;
  }
  const tenMoi = f.properties?.["Tỉnh thành mới"];
  if (!tenMoi) continue;
  if (!theoTinhMoi.has(tenMoi)) theoTinhMoi.set(tenMoi, []);
  theoTinhMoi.get(tenMoi).push(...vanhNgoai(f.geometry));
}

const quanDao = dao.filter((x) => x.loai === "quan-dao").map((x) => x.ten);
for (const can of ["Quần đảo Hoàng Sa", "Quần đảo Trường Sa"])
  if (!quanDao.includes(can)) {
    console.error(`❌ Thiếu "${can}" trong nguồn — bất biến #1, không được xuất.`);
    process.exit(1);
  }

const tinh = [];
for (const [tenMoi, rings] of theoTinhMoi) {
  let slug = khoaSlug(tenMoi);
  slug = SLUG_DAC_BIET[slug] ?? slug;
  if (!slugsThat.has(slug)) {
    console.error(`❌ Slug "${slug}" (từ «${tenMoi}») không có trong provinces/ — sửa SLUG_DAC_BIET.`);
    process.exit(1);
  }
  tinh.push({ slug, ten: tenMoi, d: duongDan(rings, 0.02, 4) });
}
tinh.sort((a, b) => a.slug.localeCompare(b.slug));

const out = {
  ghi_chu:
    "TỆP SINH RA từ scripts/build_minimap_vn.mjs — đừng sửa tay. Silhouette 34 tỉnh " +
    "(đơn giản hoá Douglas–Peucker 0,02°) + 5 đảo/quần đảo chủ quyền, đã chiếu " +
    "equirectangular sang không gian vẽ w×h. Chỉ dùng ĐỊNH VỊ minh hoạ, không dùng " +
    "làm ranh giới.",
  nguon: ["Dẫn xuất từ public/data/boundaries/vn-63-tinh-truoc-2025.geojson (nhóm theo «Tỉnh thành mới»)"],
  w: W,
  h: H,
  tinh,
  dao: dao.map(({ ten, d, x, y }) => ({ ten, d, x, y })),
};
writeFileSync(RA, JSON.stringify(out) + "\n", "utf8");
const kb = (Buffer.byteLength(JSON.stringify(out)) / 1024).toFixed(1);
console.log(`✅ vn-minimap.json — ${tinh.length} tỉnh, ${dao.length} đảo/quần đảo, ${W}×${H}, ${kb} KB`);
