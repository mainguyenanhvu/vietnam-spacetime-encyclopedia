// Validator nhân vật lịch sử 3D + CỔNG MINH BẠCH:
// - mỗi mục PHẢI có nhan_hinh_dung (nhãn «không phải chân dung xác thực»)
//   + tuong_dai_tham_chieu + nguon[] có >=1 nguồn chính sử ngoài wiki;
// - lien_quan_tinh khớp slug tỉnh; trang_thai ∈ {draft, reviewed};
// - id phải có builder tương ứng trong src/figures3d.ts (nếu file đã tồn tại).
// Chạy: node scripts/validate_figures.mjs
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIG = join(ROOT, "public", "data", "figures", "figures-3d.json");
const PROV = join(ROOT, "public", "data", "provinces");
const MODULE = join(ROOT, "src", "figures3d.ts");

let errors = 0;
const fail = (where, msg) => {
  console.error(`❌ ${where}: ${msg}`);
  errors++;
};
const isWiki = (s) => /wikipedia\.org|wikimedia\.org|\bwiki\b/i.test(s);

if (!existsSync(FIG)) {
  console.log("ℹ️ public/data/figures/figures-3d.json chưa có — bỏ qua.");
  process.exit(0);
}

const slugs = new Set(
  readdirSync(PROV)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", "")),
);
const moduleSrc = existsSync(MODULE) ? readFileSync(MODULE, "utf8") : null;

const { items } = JSON.parse(readFileSync(FIG, "utf8"));
const seen = new Set();
for (const it of items) {
  const w = `figure/${it.id ?? "(thiếu id)"}`;
  if (!it.id) fail(w, "thiếu id");
  if (it.id && seen.has(it.id)) fail(w, "id trùng");
  seen.add(it.id);
  if (!it.ten) fail(w, "thiếu ten");
  if (!it.cong_trang) fail(w, "thiếu cong_trang");
  if (!it.tuong_dai_tham_chieu) fail(w, "thiếu tuong_dai_tham_chieu");
  if (!it.nhan_hinh_dung || !/không phải chân dung/i.test(it.nhan_hinh_dung))
    fail(w, "nhan_hinh_dung phải nêu rõ «KHÔNG phải chân dung xác thực»");
  if (!Array.isArray(it.lien_quan_tinh) || it.lien_quan_tinh.length === 0)
    fail(w, "thiếu lien_quan_tinh[]");
  else
    for (const s of it.lien_quan_tinh)
      if (!slugs.has(s)) fail(w, `slug tỉnh "${s}" không tồn tại`);
  if (!["draft", "reviewed"].includes(it.trang_thai))
    fail(w, "trang_thai phải là draft|reviewed");
  if (!Array.isArray(it.nguon) || it.nguon.length === 0) fail(w, "thiếu nguon[]");
  else if (!it.nguon.some((s) => !isWiki(s)))
    fail(w, "TẤT CẢ nguồn đều là wiki — cần >=1 nguồn chính sử (ĐVSKTT/SGK/chính sử)");
  if (moduleSrc && it.id && !moduleSrc.includes(`"${it.id}"`))
    fail(w, `id "${it.id}" không có builder trong src/figures3d.ts`);
}

if (errors) {
  console.error(`\n❌ ${errors} lỗi nhân vật lịch sử.`);
  process.exit(1);
}
console.log(
  `\n✅ Nhân vật lịch sử hợp lệ: ${items.length} mục (đủ nhãn hình dung + nguồn chính sử).`,
);
