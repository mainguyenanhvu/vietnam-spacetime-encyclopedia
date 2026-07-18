// Validator sa đồ chiến dịch + CỔNG MINH BẠCH:
// - mỗi trận PHẢI có sa_do_ghi_chu nêu rõ «minh hoạ, không theo tỉ lệ»;
// - buoc[] không rỗng, mỗi bước có tieu_de + mo_ta + hien[];
// - nguon[] có >=1 nguồn chính sử ngoài wiki; trang_thai ∈ {draft, reviewed};
// - lien_quan_tinh khớp slug tỉnh; figure_id (nếu có) khớp builder figures3d.ts.
// Chạy: node scripts/validate_battles.mjs
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "public", "data", "battles");
const PROV = join(ROOT, "public", "data", "provinces");
const MODULE = join(ROOT, "src", "figures3d.ts");

let errors = 0;
const fail = (where, msg) => {
  console.error(`❌ ${where}: ${msg}`);
  errors++;
};
const isWiki = (s) => /wikipedia\.org|wikimedia\.org|\bwiki\b/i.test(s);

if (!existsSync(DIR)) {
  console.log("ℹ️ public/data/battles/ chưa có — bỏ qua.");
  process.exit(0);
}
const slugs = new Set(
  readdirSync(PROV).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", "")),
);
const moduleSrc = existsSync(MODULE) ? readFileSync(MODULE, "utf8") : null;
const files = readdirSync(DIR).filter((f) => f.endsWith(".json"));

for (const file of files) {
  const b = JSON.parse(readFileSync(join(DIR, file), "utf8"));
  const w = `battle/${file}`;
  if (!b.ten || !b.nam) fail(w, "thiếu ten/nam");
  if (!b.sa_do_ghi_chu || !/không theo tỉ lệ/i.test(b.sa_do_ghi_chu))
    fail(w, "sa_do_ghi_chu phải nêu rõ «minh hoạ, KHÔNG theo tỉ lệ địa lý»");
  if (!Array.isArray(b.buoc) || b.buoc.length === 0) fail(w, "thiếu buoc[]");
  else
    for (const s of b.buoc) {
      if (!s.tieu_de || !s.mo_ta) fail(w, `bước ${s.id}: thiếu tieu_de/mo_ta`);
      if (!Array.isArray(s.hien)) fail(w, `bước ${s.id}: thiếu hien[]`);
    }
  if (Array.isArray(b.lien_quan_tinh))
    for (const s of b.lien_quan_tinh)
      if (!slugs.has(s)) fail(w, `slug tỉnh "${s}" không tồn tại`);
  if (b.figure_id && moduleSrc && !moduleSrc.includes(`"${b.figure_id}"`))
    fail(w, `figure_id "${b.figure_id}" không có builder trong figures3d.ts`);
  if (!["draft", "reviewed"].includes(b.trang_thai))
    fail(w, "trang_thai phải là draft|reviewed");
  if (!Array.isArray(b.nguon) || b.nguon.length === 0) fail(w, "thiếu nguon[]");
  else if (!b.nguon.some((s) => !isWiki(s)))
    fail(w, "TẤT CẢ nguồn đều là wiki — cần >=1 nguồn chính sử");
  if (!errors) console.log(`✅ ${file}: ${b.buoc.length} bước`);
}

if (errors) {
  console.error(`\n❌ ${errors} lỗi sa đồ chiến dịch.`);
  process.exit(1);
}
console.log(`\n✅ Sa đồ chiến dịch hợp lệ (đủ disclaimer + nguồn chính sử).`);
