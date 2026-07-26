// Validator manifest ảnh + CỔNG LICENSE MEDIA (plan §9):
// - mỗi asset PHẢI có url https + nguon + giay_phep hợp lệ;
// - CHỈ chấp nhận ảnh tự do (public-domain/CC0/CC-BY/CC-BY-SA) hoặc ảnh minh
//   hoạ AI gốc (ai-generated). TUYỆT ĐỐI không chấp nhận ảnh có bản quyền
//   thương mại (kể cả "tái sinh" — đó là phái sinh, vi phạm SHTT);
// - ảnh CC-BY / CC-BY-SA bắt buộc có attribution (tác giả);
// - slug tỉnh phải khớp file trong public/data/provinces/.
// Chạy: node scripts/validate_media.mjs
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MEDIA = join(ROOT, "public", "data", "media", "images.json");
const PROV = join(ROOT, "public", "data", "provinces");

const LICENSES = new Set([
  "public-domain",
  "cc0",
  "cc-by",
  "cc-by-sa",
  "ai-generated",
]);
const ATTRIBUTION_REQUIRED = new Set(["cc-by", "cc-by-sa"]);
const MUC = new Set([
  "dac-san",
  "kien-truc",
  "trang-phuc",
  "danh-thang",
  "le-hoi",
  "san-vat",
]);

let errors = 0;
const fail = (where, msg) => {
  console.error(`❌ ${where}: ${msg}`);
  errors++;
};

if (!existsSync(MEDIA)) {
  console.log("ℹ️ public/data/media/images.json chưa có — bỏ qua.");
  process.exit(0);
}

const slugs = new Set(
  readdirSync(PROV)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", "")),
);

const { items } = JSON.parse(readFileSync(MEDIA, "utf8"));
const seen = new Set();
for (const it of items) {
  const w = `media/${it.id ?? "(thiếu id)"}`;
  if (!it.id) fail(w, "thiếu id");
  if (it.id && seen.has(it.id)) fail(w, "id trùng");
  seen.add(it.id);
  if (!MUC.has(it.muc)) fail(w, `muc "${it.muc}" không hợp lệ`);
  if (!slugs.has(it.slug)) fail(w, `slug tỉnh "${it.slug}" không tồn tại`);
  if (!it.ten) fail(w, "thiếu ten");
  if (typeof it.url !== "string" || !/^https:\/\//.test(it.url))
    fail(w, "url phải là https://…");
  if (!LICENSES.has(it.giay_phep))
    fail(w, `giay_phep "${it.giay_phep}" không thuộc {${[...LICENSES].join("|")}}`);
  if (ATTRIBUTION_REQUIRED.has(it.giay_phep) && !it.tac_gia)
    fail(w, `giấy phép ${it.giay_phep} bắt buộc ghi tác giả (tac_gia)`);
  if (it.giay_phep !== "ai-generated" && (!it.nguon || !it.nguon.length))
    fail(w, "thiếu nguon[] (trừ ảnh ai-generated)");
}

// --- Bản đồ cổ chứng minh chủ quyền (public/data/media/ban-do-co.json)
// Đây là nội dung chủ quyền, sẽ bị soi kỹ nhất trong dự án — cổng chặt hơn:
// mỗi mục phải có nguồn NGOÀI wiki, và ảnh (nếu có) phải nằm trên
// upload.wikimedia.org vì CSP của trang chặn mọi host ảnh khác. Mục không có
// ảnh vẫn hợp lệ nhưng phải nói rõ bản gốc đang ở đâu, để không ai tưởng là
// quên mà đi tìm lại từ đầu.
const BAN_DO = join(ROOT, "public", "data", "media", "ban-do-co.json");
if (existsSync(BAN_DO)) {
  const NHOM = new Set(["viet-nam", "phuong-tay", "trung-quoc"]);
  const isWiki = (s) => /wikipedia\.org|wikimedia\.org/i.test(String(s));
  const bd = JSON.parse(readFileSync(BAN_DO, "utf8")).items ?? [];
  const idSeen = new Set();
  for (const b of bd) {
    const w = `ban-do-co/${b.id ?? "?"}`;
    if (!b.id) fail(w, "thiếu id");
    else if (idSeen.has(b.id)) fail(w, "id trùng");
    else idSeen.add(b.id);
    if (!b.ten || !b.tac_gia) fail(w, "thiếu ten/tac_gia");
    if (!b.mo_ta) fail(w, "thiếu mo_ta");
    if (!NHOM.has(b.nhom)) fail(w, `nhom "${b.nhom}" không thuộc {${[...NHOM].join("|")}}`);
    if (b.anh && !/^https:\/\/upload\.wikimedia\.org\//.test(b.anh))
      fail(w, "ảnh phải nằm trên upload.wikimedia.org (CSP chặn host khác)");
    if (!b.anh && !b.anh_ghi_chu)
      fail(w, "không có ảnh thì phải ghi anh_ghi_chu nói rõ bản gốc ở đâu");
    if (!Array.isArray(b.nguon) || !b.nguon.length) fail(w, "thiếu nguon[]");
    else if (!b.nguon.some((s) => !isWiki(s)))
      fail(w, "cần ít nhất 1 nguồn NGOÀI Wikipedia");
  }
  console.log(`✅ ban-do-co.json: ${bd.length} bản đồ (${bd.filter((b) => b.anh).length} có ảnh)`);
}

if (errors) {
  console.error(`\n❌ ${errors} lỗi manifest ảnh.`);
  process.exit(1);
}
console.log(`\n✅ Manifest ảnh hợp lệ: ${items.length} asset (đủ license + nguồn).`);
