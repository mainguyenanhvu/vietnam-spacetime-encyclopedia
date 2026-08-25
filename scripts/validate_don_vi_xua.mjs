// Cổng dữ liệu «đơn vị hành chính qua các thời kỳ»
// (public/data/geo/don-vi-hanh-chinh-xua.json).
//
// Vì sao cần cổng riêng: đây là lớp thay chỗ các polygon cương vực phỏng dựng
// đã gỡ. Nếu để lọt một mục thiếu nguồn hoặc thiếu khai độ tin cậy thì nó lại
// trở thành đúng thứ vừa bị gỡ — một khẳng định địa lý không ai kiểm được.
//
// Cổng kiểm 5 điều:
//   1. Mọi mục có đủ trường bắt buộc và có nguon[] — bất biến «không nguồn thì
//      không xuất bản».
//   2. `ky_id` phải nằm trong danh sách thời kỳ THẬT của main.ts. Đọc thẳng từ
//      mã nguồn chứ không chép tay, để thêm/bớt thời kỳ là cổng biết ngay.
//   3. Toạ độ nằm trong khung Đông Dương — bắt lỗi gõ nhầm kinh/vĩ độ.
//   4. `do_tin_cay` phải khai rõ, và mục nào không phải "cao" thì ghi_chu phải
//      nói vì sao — không được im lặng bỏ qua chỗ yếu.
//   5. ÁNH XẠ sang tỉnh ngày nay (`tinh_nay[]`) phải có `nguon_anh_xa[]` RIÊNG
//      và `khop` hợp lệ. Đây là chỗ dễ tuột nhất: nguồn của mục chỉ chứng minh
//      đơn vị CÓ THẬT, còn ánh xạ là khẳng định đơn vị đó phủ lên đất tỉnh nào
//      — mượn nguồn của mục để đỡ cho ánh xạ là bịa có chú thích. Tệp dẫn xuất
//      vung-don-vi-xua.geojson cũng phải khớp byte với kết quả dựng lại.
//
// Chạy: node scripts/validate_don_vi_xua.mjs
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { khoaTinh, dungVung } from "./build_vung_don_vi_xua.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEP = join(ROOT, "public", "data", "geo", "don-vi-hanh-chinh-xua.json");
const MAIN = join(ROOT, "src", "main.ts");
const TINH_63_TEP = join(ROOT, "public", "data", "boundaries", "vn-63-tinh-truoc-2025.geojson");
const VUNG = join(ROOT, "public", "data", "geo", "vung-don-vi-xua.geojson");

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
const KHOP = new Set(["gan-dung", "mot-phan", "toi-thieu"]);
const BAT_BUOC = ["id", "ten", "cap", "ky_id", "thoi_ky", "ly_so", "nay_la", "ghi_chu"];

const d = JSON.parse(readFileSync(TEP, "utf8"));
const items = d.items ?? [];
const daThay = new Set();
const demKy = {};
let demAnhXa = 0;

// Danh sách tỉnh THẬT, đọc thẳng từ tệp ranh giới. Chép tay sang đây thì hai
// nơi lệch nhau ngay lần sửa ranh giới đầu tiên. Dùng chung `khoaTinh` với
// script dựng để không có hai luật bỏ dấu khác nhau.
const TINH_63 = new Set(
  JSON.parse(readFileSync(TINH_63_TEP, "utf8"))
    .features.map((f) => f.properties?.["Tỉnh thành cũ"])
    .filter(Boolean)
    .map(khoaTinh),
);

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

  // --- Ánh xạ sang tỉnh ngày nay -------------------------------------------
  const coAnhXa = Array.isArray(it.tinh_nay) && it.tinh_nay.length > 0;
  if (coAnhXa) {
    demAnhXa++;
    if (!Array.isArray(it.nguon_anh_xa) || !it.nguon_anh_xa.length)
      hong(w, "có tinh_nay[] nhưng thiếu nguon_anh_xa[] — ánh xạ phải có nguồn RIÊNG");
    if (!KHOP.has(it.khop))
      hong(w, `khop "${it.khop}" không thuộc {gan-dung|mot-phan|toi-thieu}`);
    for (const t of it.tinh_nay)
      if (!TINH_63.has(khoaTinh(t)))
        hong(w, `tinh_nay "${t}" không có trong vn-63-tinh-truoc-2025.geojson`);
  } else if (it.nguon_anh_xa || it.khop) {
    hong(w, "khai nguon_anh_xa/khop mà không có tinh_nay[] — thừa, dễ hiểu nhầm là đã tra xong");
  }
}

// --- Cổng TƯƠI MỚI của tệp dẫn xuất ----------------------------------------
// Sửa ánh xạ mà quên chạy lại build là bản đồ tô theo dữ liệu cũ — không lỗi
// nào nổ ra, chỉ sai âm thầm. So byte là cách duy nhất bắt được.
if (existsSync(VUNG)) {
  try {
    const mong = JSON.stringify(dungVung()) + "\n";
    if (readFileSync(VUNG, "utf8") !== mong)
      hong(
        "vung-don-vi-xua.geojson",
        "lệch với kết quả dựng lại — chạy `node scripts/build_vung_don_vi_xua.mjs`",
      );
  } catch (e) {
    // dungVung() ném khi ánh xạ hỏng. Để nó nổ ra thành stack trace thì cổng
    // báo lỗi bằng ngôn ngữ của Node chứ không phải của người soát dữ liệu.
    hong("vung-don-vi-xua.geojson", `không dựng lại được: ${e.message}`);
  }
} else {
  hong("vung-don-vi-xua.geojson", "chưa dựng — chạy `node scripts/build_vung_don_vi_xua.mjs`");
}

if (loi) {
  console.error(`\n❌ validate_don_vi_xua: ${loi} lỗi.`);
  process.exit(1);
}

const tomTat = Object.entries(demKy)
  .map(([k, n]) => `${k}:${n}`)
  .join(" · ");
console.log(
  `✅ don-vi-hanh-chinh-xua.json: ${items.length} đơn vị qua ${Object.keys(demKy).length} thời kỳ (${tomTat})`,
);
console.log(
  `   ↳ ánh xạ sang tỉnh nay: ${demAnhXa}/${items.length} đơn vị có nguồn riêng; ` +
    `${items.length - demAnhXa} đơn vị CHƯA tra được — cố ý để trống, xem ghi_chu_anh_xa.`,
);
