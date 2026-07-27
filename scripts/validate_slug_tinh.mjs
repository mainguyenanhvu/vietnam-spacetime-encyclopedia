// Validator slug tỉnh: mọi bản ghi có gắn lien_quan_tinh phải tới được ít nhất
// MỘT trang tỉnh đang tồn tại. CI fail nếu vi phạm.
// Chạy: node scripts/validate_slug_tinh.mjs
//
// Vì sao cần cổng riêng: trang tỉnh lọc bằng `lien_quan_tinh.includes(slug)`
// với slug lấy từ tên file trong provinces/ (đúng 34 đơn vị sau sáp nhập 2025).
// Slug không khớp file nào thì không sinh lỗi, không cảnh báo — bản ghi chỉ
// lặng lẽ biến mất khỏi mọi trang tỉnh. Dạng hỏng im lặng này đã xảy ra hai
// lần (tên hiển thị lọt vào chỗ đợi slug; slug tỉnh trước sáp nhập), nên phải
// có cổng chặn thay vì trông vào việc soát tay.
//
// Slug tỉnh CŨ không bị coi là lỗi khi bản ghi còn kèm ít nhất một slug sống:
// đó là cách cố ý giữ đúng địa danh trong lời văn ("Ai về Bình Định mà coi")
// trong khi vẫn hiện được ở trang Gia Lai. Chỉ báo đỏ khi KHÔNG còn slug nào
// sống — lúc đó bản ghi thật sự vô hình.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "data");
const DIR_TINH = join(ROOT, "provinces");

if (!existsSync(DIR_TINH)) {
  console.log("Chưa có hồ sơ tỉnh nào — bỏ qua.");
  process.exit(0);
}

const TINH = new Set(
  readdirSync(DIR_TINH)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, "")),
);

const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (entry.endsWith(".json")) files.push(p);
  }
})(ROOT);

let errors = 0;
let checked = 0;
let giuTenCu = 0;

for (const p of files) {
  const ten = relative(ROOT, p).replace(/\\/g, "/");
  let doc;
  try {
    doc = JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    console.error(`❌ ${ten}: không parse được JSON — ${e.message}`);
    errors++;
    continue;
  }
  const items = Array.isArray(doc) ? doc : (doc.items ?? []);
  if (!Array.isArray(items)) continue;

  for (const it of items) {
    const tinh = it?.lien_quan_tinh;
    if (!Array.isArray(tinh) || tinh.length === 0) continue;
    checked++;
    const song = tinh.filter((s) => TINH.has(s));
    const cu = tinh.filter((s) => !TINH.has(s));
    if (song.length === 0) {
      console.error(
        `❌ ${ten} :: ${it.id ?? "(không id)"} — [${tinh.join(", ")}] không khớp trang tỉnh nào, bản ghi vô hình`,
      );
      errors++;
    } else if (cu.length) {
      giuTenCu++;
    }
  }
}

console.log(
  `Đã soát ${checked} bản ghi có gắn tỉnh trong ${files.length} tệp (bộ ${TINH.size} trang tỉnh).`,
);
if (giuTenCu)
  console.log(`   ${giuTenCu} bản ghi giữ thêm tên tỉnh trước sáp nhập — hợp lệ, không phải lỗi.`);
if (errors) {
  console.error(`\n❌ ${errors} bản ghi rơi khỏi mọi trang tỉnh.`);
  process.exit(1);
}
console.log("\n✅ Mọi bản ghi có gắn tỉnh đều tới được ít nhất một trang tỉnh.");
