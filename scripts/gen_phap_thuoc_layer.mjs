// Sinh lớp thời kỳ Pháp thuộc (1887–1945): gắn mỗi tỉnh (địa giới 63) vào
// Bắc Kỳ / Trung Kỳ / Nam Kỳ. Mapping đã kiểm chứng đa nguồn (docs/research).
// Hoàng Sa → Thừa Thiên/Trung Kỳ (Dụ số 10/1938, NĐ 156-S-V 15/6/1938);
// Trường Sa → Bà Rịa/Nam Kỳ (Nghị định 21/12/1933).
// Chạy: node scripts/gen_phap_thuoc_layer.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "data",
  "boundaries",
);

const NAM_KY = new Set([
  "Long An", "Tiền Giang", "Bến Tre", "Trà Vinh", "Vĩnh Long", "Đồng Tháp",
  "An Giang", "Kiên Giang", "Cần Thơ", "Hậu Giang", "Sóc Trăng", "Bạc Liêu",
  "Cà Mau", "TP HCM", "Bà Rịa - Vũng Tàu", "Đồng Nai", "Bình Dương",
  "Bình Phước", "Tây Ninh",
]);
const TRUNG_KY = new Set([
  "Thanh Hóa", "Thanh Hoá", "Nghệ An", "Hà Tĩnh", "Quảng Bình", "Quảng Trị",
  "Thừa Thiên Huế", "Huế", "Đà Nẵng", "Quảng Nam", "Quảng Ngãi", "Bình Định",
  "Phú Yên", "Khánh Hòa", "Ninh Thuận", "Bình Thuận", "Kon Tum", "Gia Lai",
  "Đắk Lắk", "Đắk Nông", "Lâm Đồng",
]);

const src = JSON.parse(
  readFileSync(join(DIR, "vn-63-tinh-truoc-2025.geojson"), "utf8"),
);

const counts = { "Bắc Kỳ": 0, "Trung Kỳ": 0, "Nam Kỳ": 0 };
const unmatchedNames = [];

const out = {
  type: "FeatureCollection",
  features: src.features.map((f) => {
    const p = { ...f.properties };
    if (p.loai) {
      // đảo/quần đảo: thuộc Kỳ theo văn bản thời thuộc địa
      if (p.ten === "Quần đảo Hoàng Sa") {
        p.ky = "Trung Kỳ";
        p.thuoc_tinh_thoi_ky = "Thừa Thiên (từ 1938; trước đó thuộc Nam Ngãi/Quảng Nam)";
        p.van_ban = "Dụ số 10 của vua Bảo Đại (3/1938); Nghị định 156-S-V của Toàn quyền Đông Dương (15/6/1938)";
      } else if (p.ten === "Quần đảo Trường Sa") {
        p.ky = "Nam Kỳ";
        p.thuoc_tinh_thoi_ky = "Bà Rịa (từ 1933)";
        p.van_ban = "Nghị định của Thống đốc Nam Kỳ ngày 21/12/1933";
      } else {
        const owner = p.thuoc_tinh_63 ?? "";
        p.ky = NAM_KY.has(owner) ? "Nam Kỳ" : TRUNG_KY.has(owner) ? "Trung Kỳ" : "Bắc Kỳ";
      }
    } else {
      const name = p["Tỉnh thành cũ"];
      p.ky = NAM_KY.has(name) ? "Nam Kỳ" : TRUNG_KY.has(name) ? "Trung Kỳ" : "Bắc Kỳ";
      if (!NAM_KY.has(name) && !TRUNG_KY.has(name)) {
        // mặc định Bắc Kỳ — ghi lại để rà soát
        unmatchedNames.push(name);
      }
      counts[p.ky]++;
    }
    return { type: "Feature", properties: p, geometry: f.geometry };
  }),
};

writeFileSync(join(DIR, "vn-phap-thuoc-1887-1945.geojson"), JSON.stringify(out));
console.log("Bắc Kỳ:", counts["Bắc Kỳ"], "| Trung Kỳ:", counts["Trung Kỳ"], "| Nam Kỳ:", counts["Nam Kỳ"]);
console.log("Gán Bắc Kỳ theo mặc định:", unmatchedNames.join(", "));
if (counts["Nam Kỳ"] !== 19 || counts["Trung Kỳ"] !== 19 || counts["Bắc Kỳ"] !== 25) {
  console.error("❌ Số tỉnh mỗi Kỳ không khớp 25/19/19 — kiểm tra tên!");
  process.exit(1);
}
console.log("✅ 25/19/19 đúng như kiểm chứng lịch sử.");
