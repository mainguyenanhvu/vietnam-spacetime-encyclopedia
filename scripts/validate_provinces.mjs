// Validator hồ sơ tỉnh: public/data/provinces/*.json phải đúng cấu trúc
// và MỌI hồ sơ phải có sources[] không rỗng. CI fail nếu vi phạm.
// Chạy: node scripts/validate_provinces.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "data",
  "provinces",
);

if (!existsSync(DIR)) {
  console.log("Chưa có hồ sơ tỉnh nào — bỏ qua.");
  process.exit(0);
}

const REQUIRED_STR = ["slug", "ten", "giai_nghia_ten", "tong_quan", "trang_thai"];
const REQUIRED_ARR = ["ten_thoi_ky", "lich_su", "danh_nhan", "sources"];

let errors = 0;
const fail = (file, msg) => {
  console.error(`❌ ${file}: ${msg}`);
  errors++;
};

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".json"))) {
  const p = JSON.parse(readFileSync(join(DIR, file), "utf8"));
  for (const k of REQUIRED_STR)
    if (typeof p[k] !== "string" || !p[k].trim()) fail(file, `thiếu chuỗi '${k}'`);
  for (const k of REQUIRED_ARR)
    if (!Array.isArray(p[k]) || p[k].length === 0) fail(file, `thiếu mảng '${k}'`);
  if (p.slug !== basename(file, ".json"))
    fail(file, `slug '${p.slug}' không khớp tên file`);
  if (!["draft", "reviewed"].includes(p.trang_thai))
    fail(file, `trang_thai phải là draft|reviewed`);
  for (const t of p.ten_thoi_ky ?? [])
    if (!t.ten || !t.thoi_ky) fail(file, `ten_thoi_ky thiếu 'ten'/'thoi_ky'`);
  if (typeof p.van_hoa !== "object" || !Array.isArray(p.van_hoa?.dac_san))
    fail(file, `van_hoa.dac_san bắt buộc là mảng`);
  console.log(`${errors ? "…" : "✅"} ${file} (${p.trang_thai})`);
}
if (errors) {
  console.error(`\n❌ ${errors} lỗi schema hồ sơ tỉnh.`);
  process.exit(1);
}
console.log("\n✅ Tất cả hồ sơ tỉnh hợp lệ.");
