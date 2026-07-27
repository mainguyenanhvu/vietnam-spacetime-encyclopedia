// Cổng nguồn bị bác — quét MỌI file JSON trong public/data.
//
// Các validator khác chỉ đòi "có ≥1 nguồn ngoài wiki", nên một nguồn không đạt
// chuẩn dự án vẫn lọt nếu nó không phải Wikipedia. Thực tế đã lọt: thivien.net
// (kho thơ cộng đồng, không ban biên tập) nằm 6 chỗ, và toàn bộ 146 niên hiệu
// từng dựng trên Wikipedia. Cổng này chặn theo DANH SÁCH BÁC, không theo suy
// đoán, để lần sau không phải bắt bằng mắt.
//
// Chỉ soi trường nguồn nội dung (`nguon`, `sources`). KHÔNG soi `anh_nguon` —
// đó là chuỗi ghi công giấy phép của Wikimedia Commons, bắt buộc phải giữ
// nguyên văn kể cả khi nó nhắc tới tài khoản người tải lên ở vi.wikipedia.org.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const GOC = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const DATA = join(GOC, "public", "data");

// Mỗi mục: [regex, lý do bác]. Lý do hiện ra trong thông báo lỗi để người sửa
// biết vì sao, khỏi phải tra lại lịch sử quyết định.
//
// BAC = đỏ cổng. Chỉ đưa vào đây thứ không có đường bào chữa: trang chống phá
// / ngoài luồng nhà nước, trang bán hàng, blog cá nhân, kho do cộng đồng chép.
const BAC = [
  [/\bwikipedia\.org/i, "Wikipedia — dự án cấm tuyệt đối, kể cả làm nguồn phụ"],
  [/\bthivien\.net/i, "thivien.net — kho thơ cộng đồng đóng góp, không có ban biên tập chịu trách nhiệm"],
  [/\bnguoikesu\.com/i, "nguoikesu.com — trang tư nhân, không thuộc danh sách nguồn cho phép"],
  [/\bkyluc\.vn/i, "kyluc.vn — Hội Kỷ lục gia, tổ chức tư nhân"],
  [/\bmythuatsong\.vn/i, "mythuatsong.vn — blog mỹ thuật"],
  [/\bdesilk\.com\.vn/i, "desilk.com.vn — trang doanh nghiệp, không phải nguồn sử liệu"],

  // Ngoài luồng nhà nước. Đây là lý do dự án cấm Wikipedia ngay từ đầu (nội
  // dung sai lệch/chống phá), nên cùng một thước đo phải áp cho các trang này.
  [/\btrithucvn2?\.net/i, "trithucvn2.net — ngoài luồng báo chí nhà nước, không đạt yêu cầu «theo pháp luật Việt Nam»"],
  [/\bsaigonweeklyonline\.com/i, "saigonweeklyonline.com — ấn phẩm hải ngoại, ngoài luồng nhà nước"],
  [/\bnamkyluctinh\.org/i, "namkyluctinh.org — kho tư liệu hải ngoại tự lập, không có cơ quan chịu trách nhiệm"],

  // Trang bán hàng / du lịch: viết để bán tour, không kiểm chứng sử liệu.
  [/\b(?:vinwonders\.com|sunworld\.vn|bestprice\.vn|ivivu\.com|traveloka\.com|luhanhvietnam\.com\.vn|vietgoing\.com|gody\.vn|63stravel\.com|mia\.vn|datviettour\.com\.vn|saigonstartravel\.com|itours\.vn|goldenlifetravel\.vn|travelviet\.net|timduongdi\.com|checkinnghean\.com|vietlandmarks\.com|quangbinhtravel\.vn|dulichhatinh\.com\.vn|langsontourism\.com\.vn|visitthanhhoa\.com|skydoor\.net|condao\.com\.vn)/i,
    "trang du lịch/bán tour — viết để bán hàng, không kiểm chứng sử liệu"],
  [/\b(?:fptshop\.com\.vn|bazaarvietnam\.vn|quansachmuathu\.vn|bongda24h\.vn)/i,
    "trang thương mại/giải trí lạc đề — không phải nguồn sử liệu"],

  // Blog và diễn đàn cá nhân: không có ban biên tập, không ai chịu trách nhiệm.
  [/\b(?:nghiencuulichsu\.com|tulieulichsu\.com|ditichlichsuvanhoa\.com|chonthieng\.com|hopamviet\.vn|bcdcnt\.net|clbvanchuong\.com)|wordpress\.com/i,
    "blog/diễn đàn cá nhân — không có ban biên tập chịu trách nhiệm"],
];

// CANH_BAO = đếm và in, KHÔNG đỏ cổng. Đây là những nguồn yếu nhưng CÓ đường
// bào chữa, nên để chủ dự án quyết chứ máy không tự xử:
//  - trang dòng họ: gia phả tự công bố, nhưng với nhiều nhân vật khoa bảng nhỏ
//    thì đó là ghi chép duy nhất còn lại;
//  - trang tổng hợp tin: nội dung gốc vốn của báo nhà nước, chỉ là đăng lại —
//    cách sửa đúng là truy về bài gốc chứ không phải xoá dữ kiện.
const CANH_BAO = [
  [/\b(?:honguyenvietnam|hophamvietnam|holevietnam|hoduongthanhhoa|hoduongvietnam|hodoanhanoi|hotovietnam|hohavietnam|hotakhuvucmiennam|hodovietnam|trinhtoc|truongtoc|nguoinamdinh|yyenonline|donghuongnamdinh)\./i,
    "trang dòng họ tự lập — gia phả tự công bố, nên truy về thần phả/văn bia/hồ sơ di tích"],
  [/\b(?:baomoi\.com|soha\.vn|znews\.vn|kienthuc\.net\.vn|nguoiduatin\.vn)/i,
    "trang đăng lại tin — nên truy về bài gốc trên báo nhà nước"],
];

// commons/upload.wikimedia.org là KHO MEDIA, đã được duyệt riêng: nó tách khỏi
// phần chữ của Wikipedia. Miễn trừ trước khi đối chiếu danh sách bác.
const MIEN_TRU = /(?:upload|commons)\.wikimedia\.org/i;

// Miễn trừ CÓ HỒ SƠ. Bốn bản ghi này đã qua một vòng tra thật (mỗi mục ≥4
// biến thể câu tìm, qua cổng nhà nước, ghi lại nơi đã tra trong
// `ghi_chu_bien_tap` của chính bản ghi) mà vẫn không có nguồn đạt chuẩn nào
// thay thế. Giữ dữ kiện còn hơn xoá, nhưng KHÔNG để cổng đỏ vĩnh viễn — cổng
// đỏ mãi thì lần thứ ba trở đi không ai đọc nữa, và vi phạm MỚI sẽ lẫn vào.
//
// Thêm mục vào đây là một quyết định biên tập, không phải cách làm cho cổng
// im. Điều kiện: đã tra và ghi lại nơi tra trong bản ghi. Khi nào tra được
// nguồn tốt thì xoá dòng tương ứng — cổng tự báo dòng thừa.
const MIEN_TRU_CO_HO_SO = [
  ["figures/danh-nhan.json", "can-tho-mai-van-bo", "Mai Văn Bộ — không có bài tiểu sử nào trên cổng/báo nhà nước (2026-07-27)"],
  ["overlays/danh-nhan-quan-su-co-trung-dai.json", "quy-lan-cong-chua", "Quý Lan công chúa — nhân vật hệ thần tích, không cơ quan nhà nước nào lưu/công bố (2026-07-27)"],
  ["overlays/su-than-ngoai-giao.json", "vu-huy-tan", "Vũ Huy Tấn — chỉ có tên trong đoàn sứ 1790, không bài tiểu sử nhà nước (2026-07-27)"],
  ["overlays/tri-thuc-khoa-hoc-tk20.json", "bui-ky", "Bùi Kỷ — không có bài tiểu sử nào trên cổng/báo nhà nước (2026-07-27)"],
];
// Đường dẫn lúc quét là repo-relative ("public/data/..."), còn danh sách trên
// viết gọn cho dễ đọc — cắt tiền tố để hai bên khớp.
const khoaMienTru = (file, id) => `${String(file).replace(/^public\/data\//, "")} :: ${id}`;
const conLai = new Set(MIEN_TRU_CO_HO_SO.map(([f, id]) => khoaMienTru(f, id)));
const lyDoMienTru = new Map(MIEN_TRU_CO_HO_SO.map(([f, id, ly]) => [khoaMienTru(f, id), ly]));

const TRUONG_NGUON = new Set(["nguon", "sources"]);

const loi = [];
const canh = [];
const thaHoSo = [];

// `id` là id của bản ghi gần nhất bao quanh nút đang xét — cần nó để đối chiếu
// danh sách miễn trừ, vì miễn trừ gắn với BẢN GHI chứ không gắn với tên miền.
function soi(nut, duong, file, id) {
  if (Array.isArray(nut)) {
    nut.forEach((v, i) => soi(v, `${duong}[${i}]`, file, id));
    return;
  }
  if (nut === null || typeof nut !== "object") return;
  const idHienTai = typeof nut.id === "string" ? nut.id : id;
  for (const [khoa, val] of Object.entries(nut)) {
    const duongCon = duong ? `${duong}.${khoa}` : khoa;
    if (TRUONG_NGUON.has(khoa)) {
      for (const s of [val].flat()) {
        if (typeof s !== "string") continue;
        if (MIEN_TRU.test(s)) continue;
        const hit = BAC.find(([re]) => re.test(s));
        if (hit) {
          const khoaMT = khoaMienTru(file, idHienTai);
          if (lyDoMienTru.has(khoaMT)) {
            conLai.delete(khoaMT);
            thaHoSo.push({ file, id: idHienTai, ly_do: lyDoMienTru.get(khoaMT) });
          } else {
            loi.push({ file, duong: duongCon, nguon: s, ly_do: hit[1] });
          }
          continue;
        }
        const nhac = CANH_BAO.find(([re]) => re.test(s));
        if (nhac) canh.push({ file, duong: duongCon, nguon: s, ly_do: nhac[1] });
      }
      continue; // nguồn là lá, không đi sâu thêm
    }
    soi(val, duongCon, file, idHienTai);
  }
}

function duyet(thuMuc) {
  for (const ten of readdirSync(thuMuc)) {
    const p = join(thuMuc, ten);
    if (statSync(p).isDirectory()) duyet(p);
    else if (ten.endsWith(".json")) {
      const rel = relative(GOC, p).replace(/\\/g, "/");
      let j;
      try {
        j = JSON.parse(readFileSync(p, "utf8"));
      } catch (e) {
        loi.push({ file: rel, duong: "(gốc)", nguon: "", ly_do: `JSON hỏng: ${e.message}` });
        continue;
      }
      soi(j, "", rel, null);
    }
  }
}

duyet(DATA);

// Miễn trừ có hồ sơ: in ra mỗi lần chạy, để nó không lặng lẽ thành vĩnh viễn.
if (thaHoSo.length) {
  const gom = new Map();
  for (const t of thaHoSo) gom.set(`${t.file} → ${t.id}`, t.ly_do);
  console.log(`🗂️  ${gom.size} bản ghi miễn trừ CÓ HỒ SƠ (đã tra, chưa có nguồn thay thế):`);
  for (const [k, ly] of gom) console.log(`      ${k}\n         ${ly}`);
  console.log("      Tra được nguồn tốt thì xoá dòng tương ứng trong MIEN_TRU_CO_HO_SO.\n");
}

// Dòng miễn trừ không còn khớp bản ghi nào = đã sửa xong hoặc gõ sai id.
// Báo để danh sách miễn trừ không phình ra rồi che mất vi phạm thật.
if (conLai.size) {
  console.log(`🧹 ${conLai.size} dòng MIEN_TRU_CO_HO_SO đã thừa (bản ghi không còn nguồn bị bác, hoặc sai id):`);
  for (const k of conLai) console.log(`      ${k}`);
  console.log("      Xoá khỏi danh sách trong scripts/validate_nguon_cam.mjs.\n");
}

// Cảnh báo in trước lỗi để nó không bị trôi mất khi danh sách lỗi dài.
if (canh.length) {
  const gom = new Map();
  for (const c of canh) gom.set(c.ly_do, (gom.get(c.ly_do) ?? 0) + 1);
  console.log(`⚠️  ${canh.length} nguồn thuộc diện YẾU (không đỏ cổng — chờ chủ dự án quyết):`);
  for (const [ly, n] of gom) console.log(`      ${String(n).padStart(3)} × ${ly}`);
  console.log(`      Xem chi tiết: node scripts/validate_nguon_cam.mjs --canh-bao\n`);
  if (process.argv.includes("--canh-bao")) {
    for (const c of canh) console.log(`  ${c.file} → ${c.duong}\n      "${c.nguon.slice(0, 110)}"`);
    console.log("");
  }
}

if (loi.length) {
  console.error(`❌ ${loi.length} nguồn thuộc danh sách bác:\n`);
  for (const l of loi) {
    console.error(`  ${l.file} → ${l.duong}`);
    if (l.nguon) console.error(`      "${l.nguon.slice(0, 110)}"`);
    console.error(`      ${l.ly_do}\n`);
  }
  console.error("Cách sửa: thay bằng nguồn chính thống (chính sử, NXB nhà nước,");
  console.error("cổng .gov.vn, viện nghiên cứu, báo nhà nước, bảo tàng), hoặc bỏ mục.");
  console.error("Bỏ nguồn xong phải kiểm mục đó còn ≥1 nguồn hợp lệ.");
  process.exit(1);
}

console.log("✅ Không nguồn nào thuộc danh sách bác (đã miễn trừ kho media Wikimedia Commons).");
