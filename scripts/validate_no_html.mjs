// CỔNG AN TOÀN DỮ LIỆU — chặn tận gốc lớp lỗi XSS qua dữ liệu do agent sinh.
// Quét TOÀN BỘ public/data/** nên tự động phủ cả file/sóng dữ liệu thêm sau.
//
// Ba nhóm luật:
//   1. (CHÍNH) Không chuỗi nào được chứa thẻ HTML, scheme thực thi
//      (javascript:/vbscript:/data:), thuộc tính sự kiện, hay HTML entity.
//      Đây là luật BẤT BIẾN: mọi trường đều hiển thị dưới dạng text.
//   2. (PHỤ, phòng thủ nhiều lớp) Vài trường ĐANG được nội suy thô vào HTML
//      phải đúng kiểu số. Danh sách này CỐ Ý HẸP và gắn với từng file —
//      KHÔNG ép theo tên khoá toàn cục, vì cùng một tên khoá mang nghĩa khác
//      nhau giữa các bộ dữ liệu:
//        · `nam` hợp lệ là chuỗi ở journey/literature ("1258 – 1288").
//        · `xep_hang` ở overlays là câu mô tả, ở literature là số thứ hạng.
//        · `buoc` ở battles là mảng bước, ở nam-tien là số thứ tự.
//   3. Trường URL tài nguyên (anh, url) chỉ được https://.
//
// Chạy: node scripts/validate_no_html.mjs
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "public", "data");

const errors = [];
const err = (m) => errors.push(m);

// Thẻ HTML thật (`<a `, `</p>`, `<img `) — KHÔNG bắt dấu nhỏ hơn thường gặp
// trong văn bản tiếng Việt ("nhiệt độ < 20°C") để tránh báo động giả.
const HTML_TAG = /<\s*\/?\s*[A-Za-z][A-Za-z0-9-]*[\s/>]/;
const BAD_SCHEME = /\b(?:javascript|vbscript|data)\s*:/i;
const EVENT_ATTR = /\bon(?:error|load|click|mouseover|focus|animationstart|toggle)\s*=/i;
const HTML_ENTITY = /&#x?[0-9a-fA-F]+;/;

// Trường URL tài nguyên → render thành <img src> / <a href>.
const URL_FIELDS = new Set(["anh", "url"]);

// Luật số HẸP: "đường dẫn tương đối trong file" → danh sách khoá phải là số.
// Mỗi mục dưới đây tương ứng một chỗ mã nguồn nội suy giá trị vào HTML.
const NUMERIC_RULES = [
  { file: "public/data/overlays/di-tich-qgdb.json", path: "items[].dot" },
  { file: "public/data/overlays/bao-vat-quoc-gia.json", path: "items[].dot" },
  { file: "public/data/battles/bach-dang-938.json", path: "nam" },
  { file: "public/data/battles/bach-dang-938.json", path: "buoc[].id" },
  { file: "public/data/games/olympia-questions.json", path: "khoi_dong[].do_kho" },
  { file: "public/data/games/olympia-questions.json", path: "tang_toc[].do_kho" },
  { file: "public/data/games/olympia-questions.json", path: "ve_dich[].do_kho" },
  { file: "public/data/literature/tho-ve-bac.json", path: "items[].xep_hang" },
  { file: "public/data/literature/tho-yeu-nuoc.json", path: "items[].xep_hang" },
  { file: "public/data/literature/tac-pham-ho-chi-minh.json", path: "items[].xep_hang" },
];

function files(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...files(p));
    else if (/\.(json|geojson)$/.test(name)) out.push(p);
  }
  return out;
}

// --- Luật 1 + 3: quét mọi chuỗi ---
function walk(node, at, key = null) {
  if (node === null || node === undefined) return;
  if (typeof node === "string") {
    if (HTML_TAG.test(node)) err(`${at}: chứa thẻ HTML → ${JSON.stringify(node.slice(0, 80))}`);
    else if (BAD_SCHEME.test(node)) err(`${at}: chứa scheme thực thi → ${JSON.stringify(node.slice(0, 80))}`);
    else if (EVENT_ATTR.test(node)) err(`${at}: chứa thuộc tính sự kiện → ${JSON.stringify(node.slice(0, 80))}`);
    else if (HTML_ENTITY.test(node)) err(`${at}: chứa HTML entity → ${JSON.stringify(node.slice(0, 80))}`);
    if (key && URL_FIELDS.has(key) && !/^https:\/\//.test(node))
      err(`${at}: '${key}' phải là https:// → ${JSON.stringify(node.slice(0, 80))}`);
    return;
  }
  if (typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, `${at}[${i}]`, key));
    return;
  }
  for (const [k, v] of Object.entries(node)) walk(v, `${at}.${k}`, k);
}

// --- Luật 2: đi theo đường dẫn hẹp, ép kiểu số ---
function checkNumericPath(data, segments, at) {
  if (!segments.length) return;
  const [seg, ...rest] = segments;
  const isArr = seg.endsWith("[]");
  const key = isArr ? seg.slice(0, -2) : seg;
  const next = data?.[key];
  if (next === undefined || next === null) return;
  if (isArr) {
    if (!Array.isArray(next)) return;
    next.forEach((el, i) => {
      if (!rest.length) return;
      checkNumericPath(el, rest, `${at}.${key}[${i}]`);
    });
    return;
  }
  if (rest.length) { checkNumericPath(next, rest, `${at}.${key}`); return; }
  if (typeof next !== "number")
    err(`${at}.${key}: phải là SỐ (được nội suy vào HTML), đang là ${typeof next} → ${JSON.stringify(String(next).slice(0, 60))}`);
}

const list = files(DATA);
for (const f of list) {
  const at = relative(ROOT, f).replace(/\\/g, "/");
  let data;
  try {
    data = JSON.parse(readFileSync(f, "utf8"));
  } catch (e) {
    err(`${at}: JSON hỏng — ${e.message}`);
    continue;
  }
  walk(data, at);
}

for (const rule of NUMERIC_RULES) {
  const full = join(ROOT, rule.file);
  if (!existsSync(full)) continue; // file có thể chưa tồn tại / đã đổi tên
  let data;
  try {
    data = JSON.parse(readFileSync(full, "utf8"));
  } catch {
    continue; // JSON hỏng đã được báo ở vòng quét trên
  }
  checkNumericPath(data, rule.path.split("."), rule.file);
}

if (errors.length) {
  console.error(`❌ validate_no_html: ${errors.length} lỗi trên ${list.length} file`);
  for (const e of errors.slice(0, 60)) console.error("  - " + e);
  if (errors.length > 60) console.error(`  … và ${errors.length - 60} lỗi nữa`);
  process.exit(1);
}
console.log(`✅ validate_no_html: ${list.length} file dữ liệu sạch (không HTML/scheme thực thi; trường số nội suy đúng kiểu; anh/url là https)`);
