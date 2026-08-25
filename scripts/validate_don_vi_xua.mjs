// Cổng dữ liệu «đơn vị hành chính qua các thời kỳ»
// (public/data/geo/don-vi-hanh-chinh-xua.json).
//
// Vì sao cần cổng riêng: đây là lớp thay chỗ các polygon cương vực phỏng dựng
// đã gỡ. Nếu để lọt một mục thiếu nguồn hoặc thiếu khai độ tin cậy thì nó lại
// trở thành đúng thứ vừa bị gỡ — một khẳng định địa lý không ai kiểm được.
//
// Cổng kiểm 4 điều:
//   1. Mọi mục có đủ trường bắt buộc và có nguon[] — bất biến «không nguồn thì
//      không xuất bản».
//   2. `ky_id` phải nằm trong danh sách thời kỳ THẬT của main.ts. Đọc thẳng từ
//      mã nguồn chứ không chép tay, để thêm/bớt thời kỳ là cổng biết ngay.
//   3. Toạ độ nằm trong khung Đông Dương — bắt lỗi gõ nhầm kinh/vĩ độ.
//   4. `do_tin_cay` phải khai rõ, và mục nào không phải "cao" thì ghi_chu phải
//      nói vì sao — không được im lặng bỏ qua chỗ yếu.
//
// Chạy: node scripts/validate_don_vi_xua.mjs
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEP = join(ROOT, "public", "data", "geo", "don-vi-hanh-chinh-xua.json");
const MAIN = join(ROOT, "src", "main.ts");

let loi = 0;
const hong = (w, m) => {
  console.error(`❌ ${w}: ${m}`);
  loi++;
};

if (!existsSync(TEP)) {
  console.log("⏭️  don-vi-hanh-chinh-xua.json chưa có — bỏ qua.");
  process.exit(0);
}

// --- Danh sách thời kỳ THẬT, đọc từ mã nguồn -------------------------------
// Chép tay sang đây thì hai nơi sẽ lệch nhau sau lần sửa PERIODS đầu tiên.
const nguon = readFileSync(MAIN, "utf8");
const KY = new Set([...nguon.matchAll(/^\s*\{ id: "([a-z0-9-]+)", ten_nuoc:/gmu)].map((m) => m[1]));
if (KY.size < 5) {
  hong("PERIODS", `chỉ đọc được ${KY.size} thời kỳ từ main.ts — mẫu dò đã lỗi thời, sửa cổng`);
}

const TIN_CAY = new Set(["cao", "trung", "thap"]);
const BAT_BUOC = ["id", "ten", "cap", "ky_id", "thoi_ky", "ly_so", "nay_la", "ghi_chu"];

const d = JSON.parse(readFileSync(TEP, "utf8"));
const items = d.items ?? [];
const daThay = new Set();
const demKy = {};

for (const it of items) {
  const w = `don-vi-xua/${it.id ?? "?"}`;
  for (const k of BAT_BUOC) if (!it[k]) hong(w, `thiếu ${k}`);

  if (it.id) {
    if (daThay.has(it.id)) hong(w, "id trùng");
    daThay.add(it.id);
  }

  if (!KY.has(it.ky_id)) hong(w, `ky_id "${it.ky_id}" không khớp thời kỳ nào trong PERIODS của main.ts`);
  else demKy[it.ky_id] = (demKy[it.ky_id] ?? 0) + 1;

  if (typeof it.lat !== "number" || typeof it.lon !== "number") hong(w, "lat/lon phải là số");
  else if (it.lat < 5 || it.lat > 26 || it.lon < 100 || it.lon > 120)
    hong(w, `toạ độ (${it.lat}, ${it.lon}) nằm ngoài khung Đông Dương — nhiều khả năng đảo kinh/vĩ độ`);

  if (!TIN_CAY.has(it.do_tin_cay))
    hong(w, `do_tin_cay "${it.do_tin_cay}" không thuộc {cao|trung|thap}`);
  // Chỗ yếu phải nói ra, không được để trống rồi hy vọng không ai hỏi.
  else if (
    it.do_tin_cay !== "cao" &&
    // Lời giải có thể nằm ở BẤT KỲ trường nào người đọc nhìn thấy: `ly_so` ghi
    // "Chưa tra được lỵ sở", `nay_la` ghi "Neo về ... ngày nay", hay `ghi_chu`
    // nói thẳng chỗ tranh cãi. Soi mỗi `ghi_chu` là bắt oan.
    !/⚠️|[Cc]hưa tra|[Nn]eo về|tranh cãi|tạm|ước lượng/.test(
      `${it.ghi_chu ?? ""} ${it.ly_so ?? ""} ${it.nay_la ?? ""}`,
    )
  )
    hong(w, `do_tin_cay "${it.do_tin_cay}" nhưng KHÔNG trường nào nói vì sao vị trí chưa chắc`);

  if (!Array.isArray(it.nguon) || !it.nguon.length) hong(w, "thiếu nguon[] — không nguồn thì không xuất bản");
}

if (loi) {
  console.error(`\n❌ validate_don_vi_xua: ${loi} lỗi.`);
  process.exit(1);
}

const tomTat = Object.entries(demKy)
  .map(([k, n]) => `${k}:${n}`)
  .join(" · ");
console.log(`✅ don-vi-hanh-chinh-xua.json: ${items.length} đơn vị qua ${Object.keys(demKy).length} thời kỳ (${tomTat})`);
