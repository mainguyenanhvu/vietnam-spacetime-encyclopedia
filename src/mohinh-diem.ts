// Phân loại hình khối cho điểm lớp phủ trên bản đồ 3D.
//
// Tách khỏi landmarks3d.ts / mohinh-lop-phu.ts CÓ CHỦ Ý: hai file kia import
// Three.js (~600 KB) và được nạp lười ở lần bật 3D đầu tiên. main.ts cần gọi
// phanLoaiDiem() để gom điểm, mà import thẳng từ đó sẽ kéo cả Three.js vào
// bundle chính — mất sạch tác dụng của việc nạp lười, kể cả với người không bao
// giờ mở chế độ 3D.
//
// ── Vì sao bản này khác hẳn bản cũ ──────────────────────────────────────────
// Bản cũ chỉ có 5 kiểu và ĐOÁN THEO TÊN MỤC. Đo trên 2.363 mục thật của 33 lớp
// phủ: 1.715 mục (72,6%) rơi vào "bia", và 29/33 lớp có "bia" là kiểu áp đảo —
// tức là mở bản đồ 3D lên thì gần như mọi thứ là cùng một cái cột. Nguyên nhân
// là các lớp NHÂN VẬT (anh hùng, chí sĩ, trí thức, danh y…) có `ten` là tên
// người, không phải tên công trình, nên không luật tên nào khớp.
//
// Đoán theo tên còn bắt nhầm: "Nguyễn Thành Trung" khớp /thành/ → dựng một toà
// thành; "Khu di tích Chủ tịch Hồ Chí Minh" khớp /hồ / → dựng một ngọn núi.
//
// Bản này lấy LỚP PHỦ làm căn cứ chính (lớp đã nói rõ mục là gì), lấy `loai`
// làm căn cứ phụ, và chỉ dùng tên khi lớp đó thật sự chứa tên công trình.

export type KieuMoHinh =
  | "den" // đền · đình · miếu · nơi thờ thành hoàng
  | "chua" // chùa · thiền viện · tháp Phật
  | "thap" // tháp Chăm
  | "thanh" // thành · luỹ · cung điện · nhà tù · căn cứ
  | "bia-rua" // bia tiến sĩ trên lưng rùa — văn miếu, khoa bảng
  | "lang" // lăng mộ · nghĩa trang liệt sĩ · đài tưởng niệm
  | "tran" // trận đánh · chiến dịch · khởi nghĩa
  | "bao-tang" // bảo tàng · nơi lưu giữ bảo vật
  | "nui" // danh thắng thiên nhiên
  | "nghe" // làng nghề · nghệ nhân · di sản phi vật thể
  | "tuong" // tượng đài nhân vật
  | "cau"; // công trình kỷ lục — cầu · hầm · cáp treo · thuỷ điện

export interface DiemMoHinh {
  lon: number;
  lat: number;
  kieu: KieuMoHinh;
  /** Hệ số cỡ riêng của điểm này (loại hình × tầm quan trọng của lớp phủ). */
  co: number;
}

/**
 * Cỡ tương đối theo LOẠI đối tượng.
 *
 * Một ngọn núi và một bức tượng bán thân không thể cùng chiều cao biểu kiến:
 * núi thì phải trội lên khỏi mặt bản đồ, còn tượng nhân vật đứng dày đặc ở
 * đồng bằng sông Hồng nên phải nhỏ lại để không dính thành một mảng.
 */
const CO_THEO_KIEU: Record<KieuMoHinh, number> = {
  nui: 1.3,
  thanh: 1.2,
  chua: 1.15,
  cau: 1.15,
  thap: 1.1,
  den: 1.0,
  "bao-tang": 1.0,
  tran: 1.0,
  lang: 0.95,
  nghe: 0.9,
  "bia-rua": 0.85,
  tuong: 0.85,
};

interface LuatLop {
  /** Kiểu dùng khi không luật nào khác khớp. */
  macDinh: KieuMoHinh;
  /**
   * Cho phép đoán theo tên mục hay không.
   *
   * `false` cho các lớp NHÂN VẬT: ở đó `ten` là tên người và toạ độ là quê hoặc
   * khu lưu niệm, nên mọi luật kiến trúc theo tên đều là bắt nhầm.
   */
  theoTen: boolean;
  /** Ánh xạ `loai` → kiểu, xét TRƯỚC luật tên. */
  theoLoai?: Record<string, KieuMoHinh>;
  /** Trọng số tầm quan trọng của cả lớp (nhân vào cỡ). */
  trong?: number;
}

/**
 * Luật cho từng lớp phủ. Khoá là `id` trong OVERLAYS (src/overlays-config.ts).
 *
 * Lớp không có trong bảng rơi về `tuong` — hình trung tính nhất cho "một người
 * được tưởng niệm ở đây", và cũng là kiểu áp đảo của nhóm lớp nhân vật.
 */
const LUAT: Record<string, LuatLop> = {
  // ── Di sản & di tích: tên mục CHÍNH LÀ tên công trình ──
  unesco: {
    macDinh: "den",
    theoTen: true,
    theoLoai: { "cong-vien-dia-chat": "nui" },
    trong: 1.35,
  },
  "di-tich-qgdb": { macDinh: "den", theoTen: true, trong: 1.2 },
  "di-tich-quoc-gia": {
    macDinh: "den",
    theoTen: true,
    theoLoai: { "danh-thang": "nui", "cach-mang": "thanh" },
  },
  "di-tich-cach-mang": {
    macDinh: "thanh",
    theoTen: true,
    theoLoai: { "danh-thang": "nui", "vuon-quoc-gia": "nui" },
  },
  "bao-vat-quoc-gia": { macDinh: "bao-tang", theoTen: false, trong: 0.9 },
  "bao-tang": { macDinh: "bao-tang", theoTen: false },

  // ── Thiên nhiên & truyền thuyết gắn với địa danh ──
  "danh-thang-thien-nhien": { macDinh: "nui", theoTen: true },
  "truyen-thuyet-dan-gian": { macDinh: "nui", theoTen: true },
  "cong-trinh-ky-luc": { macDinh: "cau", theoTen: false },

  // ── Thờ tự & tín ngưỡng: toạ độ là đền/đình/chùa nơi thờ ──
  "huyen-su-khai-quoc": { macDinh: "den", theoTen: true },
  "thanh-hoang-danh-than": { macDinh: "den", theoTen: true },
  "le-hoi-truyen-thong": { macDinh: "den", theoTen: true },
  "thien-su-cao-tang": { macDinh: "chua", theoTen: true },

  // ── Khoa bảng: bia tiến sĩ trên lưng rùa ở Văn Miếu ──
  "khoa-bang-danh-nhan": {
    macDinh: "bia-rua",
    theoTen: false,
    theoLoai: {
      "quan-thanh-liem": "tuong",
      "quan-dai-than": "tuong",
      "danh-than": "tuong",
      "vo-quan": "tran",
      "danh-nhan-van-hoa": "tuong",
      "danh-si-van-hoa": "tuong",
      "nha-cai-cach": "tuong",
      "su-gia": "tuong",
      "danh-nhan": "tuong",
    },
  },

  // ── Vua chúa & cung điện ──
  "vua-hoang-de": {
    macDinh: "thanh",
    theoTen: false,
    theoLoai: { "danh-than": "tuong" },
    trong: 1.1,
  },
  "danh-nhan-cac-trieu": {
    macDinh: "tuong",
    theoTen: false,
    theoLoai: { vua: "thanh", "y-hoc": "tuong" },
  },

  // ── Quân sự ──
  // theoTen: false CÓ CHỦ Ý. Tên trận đánh nhắc tới nơi xảy ra («Bảo vệ cầu
  // Long Biên», «Đảo Cồn Cỏ chiến đấu…»), nên đoán theo tên dựng ra cây cầu và
  // hòn đảo thay vì trận đánh — đo được 30/189 mục sai theo kiểu này.
  "chien-dich-tran-danh": { macDinh: "tran", theoTen: false },
  "danh-nhan-quan-su-co-trung-dai": { macDinh: "tran", theoTen: false },
  "nghia-si-can-vuong": { macDinh: "tran", theoTen: false },

  // ── Tưởng niệm & an nghỉ ──
  "nghia-trang-liet-si": {
    macDinh: "lang",
    theoTen: false,
    theoLoai: {
      "tuong-dai-chien-thang": "tran",
      "den-tho-liet-si": "den",
    },
  },

  // ── Nghề & di sản sống ──
  "to-nghe-danh-than": { macDinh: "nghe", theoTen: false },
  "nghe-nhan-di-san": { macDinh: "nghe", theoTen: false },
  "di-san-phi-vat-the": { macDinh: "nghe", theoTen: false },

  // ── Nhân vật (toạ độ = quê / khu lưu niệm) ──
  "anh-hung-can-hien-dai": { macDinh: "tuong", theoTen: false },
  "danh-nhan-van-hoa-can-hien-dai": { macDinh: "tuong", theoTen: false },
  "me-vnah": { macDinh: "tuong", theoTen: false },
  "chi-si-cach-mang": { macDinh: "tuong", theoTen: false },
  "su-than-ngoai-giao": { macDinh: "tuong", theoTen: false },
  "danh-y-luong-y": { macDinh: "tuong", theoTen: false },
  "danh-nhan-dan-toc-thieu-so": { macDinh: "tuong", theoTen: false },
  "thieu-nien-anh-hung": { macDinh: "tuong", theoTen: false },
  "nha-the-thao-lich-su": { macDinh: "tuong", theoTen: false },
  "tri-thuc-khoa-hoc-tk20": { macDinh: "tuong", theoTen: false },
};

/**
 * Luật đoán theo tên công trình, xét theo THỨ TỰ.
 *
 * Chỉ chạy cho các lớp có `theoTen: true` — lớp mà `ten` thật sự là tên một
 * công trình. Thứ tự quan trọng:
 *   • Chăm đứng trước "tháp" vì «Tháp Bà Po Nagar» khớp cả hai.
 *   • "văn miếu" đứng trước "miếu" vì văn miếu không phải một ngôi miếu thờ.
 *   • "nghĩa trang/lăng/đài" đứng trước "đền" vì «Nghĩa trang … đền thờ» là
 *     nghĩa trang.
 *   • "hồ " loại trừ "Hồ Chí Minh" — bản cũ dựng núi cho mọi khu di tích mang
 *     tên Bác.
 */
const LUAT_TEN: Array<[RegExp, KieuMoHinh]> = [
  // Tháp Chăm là danh sách HỮU HẠN và đã biết, nên liệt kê thẳng tên đáng tin
  // hơn suy đoán. Không có nó thì mọi tháp Chăm rơi vào "chùa" — tháp gạch
  // Chăm và tháp Phật nhiều tầng mái là hai kiến trúc khác hẳn nhau.
  // "chàm" (không dấu mũ) bị bỏ có chủ ý: nó bắt nhầm «Cù Lao Chàm», một hòn đảo.
  [
    /chăm|champa|po ?nagar|pô ?nagar|mỹ sơn|po klong|pô klong|klong garai|po sah|pô sah|po dam|pô đam|po rome|pô rômê|hoà lai|hòa lai|bánh ít|dương long|cánh tiên|chiên đàn|khương mỹ|bằng an|yang prong|thủ thiện|bình lâm|phú lốc|phú diên|tháp đôi|hưng thạnh|tháp nhạn/,
    "thap",
  ],
  [/tháp nước/, "cau"], // tháp nước Hàng Đậu là hạ tầng, không phải chùa tháp
  [/bảo tàng|nhà trưng bày|nhà truyền thống/, "bao-tang"],
  [/văn miếu|văn chỉ|quốc tử giám|văn thánh/, "bia-rua"],
  [/chùa|thiền viện|tổ đình|tự viện|tháp/, "chua"],
  [/nghĩa trang|nghĩa trũng|lăng |lăng mộ|mộ |đài tưởng niệm|tượng đài|nhà bia/, "lang"],
  [/địa đạo|chiến khu|chiến thắng|chiến dịch|trận |khởi nghĩa|mặt trận|phòng tuyến/, "tran"],
  [/thành |thành cổ|cổ loa|hoàng thành|kinh thành|luỹ|lũy|đồn |pháo đài|nhà tù|nhà lao|nhà đày|nhà ngục|căn cứ|cung /, "thanh"],
  // "am " bị bỏ: nó cắt trúng giữa chữ, «Nam Bộ kháng chiến» hoá thành ngôi đền.
  // "điện " bị bỏ: «Điện Biên Phủ» cũng khớp.
  [/đền|đình |miếu|nghè |phủ /, "den"],
  // Lễ hội "cầu ngư", "cầu an", "cầu mưa" là cầu KHẤN, không phải cây cầu.
  [/cầu (?!ngư|an|siêu|mưa|hồn|phúc|tự)/, "cau"],
  [/làng nghề|làng gốm|làng lụa|làng đúc|nghề /, "nghe"],
  // "động " bị bỏ: «Biệt động Sài Gòn», «hoạt động» đều khớp. "đầm/bàu" bị bỏ:
  // «Vạn đầm Xương Lý» là một lễ hội. Lớp danh thắng vốn đã mặc định là núi nên
  // hai luật đó không mang lại gì ngoài lỗi.
  [/núi|hang |đèo |hòn |đảo|vịnh|thác|suối|rừng|hồ (?!chí minh)|bãi biển|vườn quốc gia|cù lao|mũi |ghềnh|non /, "nui"],
];

/** Đoán kiểu từ tên công trình. `null` = không luật nào khớp. */
function kieuTheoTen(ten: string): KieuMoHinh | null {
  const t = ten.toLowerCase();
  for (const [re, kieu] of LUAT_TEN) if (re.test(t)) return kieu;
  return null;
}

/**
 * Chọn mô hình 3D và cỡ cho một điểm lớp phủ.
 *
 * @param lopPhu `id` của lớp phủ (phần sau "overlay-" trong tên lớp MapLibre).
 * @param ten    Trường `ten` của mục.
 * @param loai   Trường `loai` của mục (có thể rỗng).
 */
export function phanLoaiDiem(
  lopPhu: string,
  ten: string,
  loai = "",
): { kieu: KieuMoHinh; co: number } {
  const luat = LUAT[lopPhu];
  let kieu: KieuMoHinh;
  if (!luat) {
    kieu = kieuTheoTen(ten) ?? "tuong";
  } else {
    kieu =
      luat.theoLoai?.[loai] ??
      (luat.theoTen ? kieuTheoTen(ten) : null) ??
      luat.macDinh;
  }
  return { kieu, co: CO_THEO_KIEU[kieu] * (luat?.trong ?? 1) };
}
