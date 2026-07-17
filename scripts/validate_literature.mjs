// Validator thư viện văn thơ & giai thoại + CHÍNH SÁCH NGUỒN:
// - sources[] không rỗng;
// - Wikipedia/wiki chỉ là nguồn bổ trợ: mỗi mục PHẢI có >=1 nguồn chính thống
//   ngoài wiki (chính sử, NXB, cổng .gov.vn, SGK...);
// - tác phẩm ban_quyen="cited-excerpt" không được vượt 8 dòng trích.
// Chạy: node scripts/validate_literature.mjs
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "data",
  "literature",
);

let errors = 0;
const fail = (where, msg) => {
  console.error(`❌ ${where}: ${msg}`);
  errors++;
};

const isWiki = (s) => /wikipedia\.org|wikimedia\.org|\bwiki\b/i.test(s);
const checkSources = (where, sources) => {
  if (!Array.isArray(sources) || sources.length === 0)
    return fail(where, "thiếu sources[]");
  if (!sources.some((s) => !isWiki(s)))
    fail(
      where,
      "TẤT CẢ nguồn đều là wiki — cần ít nhất 1 nguồn chính thống (chính sử/NXB/.gov.vn/SGK)",
    );
};

// --- Thơ yêu nước
const poemsPath = join(DIR, "tho-yeu-nuoc.json");
if (existsSync(poemsPath)) {
  const { items } = JSON.parse(readFileSync(poemsPath, "utf8"));
  for (const p of items) {
    const w = `tho-yeu-nuoc/${p.id}`;
    if (!p.ten || !p.tac_gia) fail(w, "thiếu ten/tac_gia");
    if (!["public-domain", "cited-excerpt"].includes(p.ban_quyen))
      fail(w, "ban_quyen phải là public-domain|cited-excerpt");
    if (!Array.isArray(p.nguyen_van) || p.nguyen_van.length === 0)
      fail(w, "thiếu nguyen_van");
    if (p.ban_quyen === "cited-excerpt" && p.nguyen_van.length > 8)
      fail(w, `trích ${p.nguyen_van.length} dòng — tác phẩm còn bản quyền chỉ được trích ngắn (≤8 dòng)`);
    if (!Array.isArray(p.lien_quan_tinh)) fail(w, "thiếu lien_quan_tinh[]");
    checkSources(w, p.sources);
  }
  console.log(`✅ tho-yeu-nuoc.json: ${items.length} bài`);
}

// --- Giai thoại khoa bảng
const anecPath = join(DIR, "giai-thoai-khoa-bang.json");
if (existsSync(anecPath)) {
  const { items } = JSON.parse(readFileSync(anecPath, "utf8"));
  for (const a of items) {
    const w = `giai-thoai/${a.id}`;
    if (!a.nhan_vat || !a.danh_hieu) fail(w, "thiếu nhan_vat/danh_hieu");
    if (!Array.isArray(a.giai_thoai) || a.giai_thoai.length === 0)
      fail(w, "thiếu giai_thoai[]");
    for (const g of a.giai_thoai)
      if (!g.ten || !g.noi_dung) fail(w, "giai_thoai thiếu ten/noi_dung");
    checkSources(w, a.sources);
  }
  console.log(`✅ giai-thoai-khoa-bang.json: ${items.length} nhân vật`);
}

// --- Lịch sử nước ta (HCM 1942)
const hcmPath = join(DIR, "lich-su-nuoc-ta.json");
if (existsSync(hcmPath)) {
  const h = JSON.parse(readFileSync(hcmPath, "utf8"));
  const w = "lich-su-nuoc-ta";
  if (!Array.isArray(h.cau_tho) || h.cau_tho.length < 100)
    fail(w, `cau_tho chỉ có ${h.cau_tho?.length ?? 0} dòng — toàn văn phải >200 dòng lục bát`);
  checkSources(w, h.sources);
  console.log(`✅ lich-su-nuoc-ta.json: ${h.cau_tho?.length ?? 0} câu thơ`);
} else {
  console.log("ℹ️ lich-su-nuoc-ta.json chưa có (đang chờ văn bản kiểm chứng).");
}

if (errors) {
  console.error(`\n❌ ${errors} lỗi thư viện văn học.`);
  process.exit(1);
}
console.log("\n✅ Thư viện văn học hợp lệ (đủ nguồn chính thống ngoài wiki).");
