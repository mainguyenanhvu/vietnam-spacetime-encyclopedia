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

if (errors) {
  console.error(`\n❌ ${errors} lỗi manifest ảnh.`);
  process.exit(1);
}
console.log(`\n✅ Manifest ảnh hợp lệ: ${items.length} asset (đủ license + nguồn).`);
