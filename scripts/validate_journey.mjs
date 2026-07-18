// Validator «Hành trình lịch sử» (chế độ hoá thân):
// - mỗi chặng có tieu_de + loi_dan + figure_id (khớp builder figures3d.ts);
// - battle_id (nếu có) phải trỏ tới file trong public/data/battles/;
// - lien_quan_tinh khớp slug tỉnh; nguon[] có >=1 nguồn chính sử ngoài wiki;
// - trang_thai ∈ {draft, reviewed}.
// Chạy: node scripts/validate_journey.mjs
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILE = join(ROOT, "public", "data", "journey", "hanh-trinh.json");
const PROV = join(ROOT, "public", "data", "provinces");
const BATTLES = join(ROOT, "public", "data", "battles");
const MODULE = join(ROOT, "src", "figures3d.ts");

let errors = 0;
const fail = (where, msg) => {
  console.error(`❌ ${where}: ${msg}`);
  errors++;
};
const isWiki = (s) => /wikipedia\.org|wikimedia\.org|\bwiki\b/i.test(s);

if (!existsSync(FILE)) {
  console.log("ℹ️ public/data/journey/hanh-trinh.json chưa có — bỏ qua.");
  process.exit(0);
}
const slugs = new Set(
  readdirSync(PROV).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", "")),
);
const moduleSrc = existsSync(MODULE) ? readFileSync(MODULE, "utf8") : null;

const { items } = JSON.parse(readFileSync(FILE, "utf8"));
const seen = new Set();
for (const it of items) {
  const w = `journey/${it.id ?? "(thiếu id)"}`;
  if (!it.id) fail(w, "thiếu id");
  if (it.id && seen.has(it.id)) fail(w, "id trùng");
  seen.add(it.id);
  if (!it.tieu_de) fail(w, "thiếu tieu_de");
  if (!it.loi_dan) fail(w, "thiếu loi_dan");
  if (!it.figure_id) fail(w, "thiếu figure_id");
  else if (moduleSrc && !moduleSrc.includes(`"${it.figure_id}"`))
    fail(w, `figure_id "${it.figure_id}" không có builder trong figures3d.ts`);
  if (it.battle_id && !existsSync(join(BATTLES, `${it.battle_id}.json`)))
    fail(w, `battle_id "${it.battle_id}" không có file trong public/data/battles/`);
  if (Array.isArray(it.lien_quan_tinh))
    for (const s of it.lien_quan_tinh)
      if (!slugs.has(s)) fail(w, `slug tỉnh "${s}" không tồn tại`);
  if (!["draft", "reviewed"].includes(it.trang_thai))
    fail(w, "trang_thai phải là draft|reviewed");
  if (!Array.isArray(it.nguon) || it.nguon.length === 0) fail(w, "thiếu nguon[]");
  else if (!it.nguon.some((s) => !isWiki(s)))
    fail(w, "TẤT CẢ nguồn đều là wiki — cần >=1 nguồn chính sử");
}

if (errors) {
  console.error(`\n❌ ${errors} lỗi hành trình lịch sử.`);
  process.exit(1);
}
console.log(`\n✅ Hành trình lịch sử hợp lệ: ${items.length} chặng.`);
