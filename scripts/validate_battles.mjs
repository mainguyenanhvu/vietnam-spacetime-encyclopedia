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
// `_index.json` (sinh bởi build_sado_index.mjs) là hạ tầng, không phải hồ sơ
// trận — soi nó bằng luật hồ sơ trận thì cổng đỏ vĩnh viễn.
const files = readdirSync(DIR).filter((f) => f.endsWith(".json") && !f.startsWith("_"));

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
  // Trích văn tịch (nếu có): đoạn trích phải nêu SÁCH (kỷ + quyển, không URL)
  // và NƠI LẤY đoạn trích — hai nguồn khác nhau, thiếu một là trích không kiểm
  // được. `buoc` (nếu khai) phải trỏ vào một bước có thật.
  if (b.trich_van_tich !== undefined) {
    if (!Array.isArray(b.trich_van_tich)) fail(w, "trich_van_tich phải là mảng");
    else {
      const buocIds = new Set((b.buoc ?? []).map((s) => s.id));
      b.trich_van_tich.forEach((t, i) => {
        const wi = `${w} trich[${i}]`;
        if (!t.sach) fail(wi, "thiếu sach");
        else if (/https?:\/\//i.test(t.sach))
          fail(wi, "sach không được kèm URL — mẫu «Tên sách — kỷ, quyển» (URL để ở nguon_trich)");
        if (!t.doan || String(t.doan).trim().length < 20)
          fail(wi, "doan trích phải ≥20 ký tự — trích cụt không kiểm được");
        if (!t.nguon_trich) fail(wi, "thiếu nguon_trich — nơi lấy được đoạn trích");
        for (const s of [t.sach, t.doan, t.nguon_trich])
          if (s && isWiki(String(s))) fail(wi, "dính nguồn wiki");
        if (t.buoc !== undefined && !buocIds.has(t.buoc))
          fail(wi, `buoc ${t.buoc} không có trong buoc[] của trận`);
      });
    }
  }
  if (!errors) console.log(`✅ ${file}: ${b.buoc.length} bước`);
}

if (errors) {
  console.error(`\n❌ ${errors} lỗi sa đồ chiến dịch.`);
  process.exit(1);
}
console.log(`\n✅ Sa đồ chiến dịch hợp lệ (đủ disclaimer + nguồn chính sử).`);
