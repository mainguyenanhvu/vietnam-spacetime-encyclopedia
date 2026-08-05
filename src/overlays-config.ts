// Bảng khai báo các lớp phủ bản đồ + cách dựng popup cho từng lớp.
//
// THUẦN DỮ LIỆU: không đụng `map`, không đụng DOM, không đụng trạng thái toàn
// cục. Đó là lý do tách được khối này ra khỏi `main.ts` mà không chạm vào thứ
// tự khởi tạo — phần điều khiển (registerOverlayIcons, toggleOverlay,
// bindOverlayInteractions, buildLayerControl) vẫn ở lại main.ts vì chúng cần
// `map` hoặc DOM.
//
// Đây là bước DI CHUYỂN, không viết lại. Thay đổi thật duy nhất: gom 9 bản sao
// của dải cảnh báo toạ độ về `canhBaoToaDo()`.
import type { ExpressionSpecification } from "maplibre-gl";
import { esc } from "./util/html";
import { str, num, oneOf, rec } from "./types/parse";

/**
 * Dải cảnh báo khi toạ độ chưa được xác minh ở mức "cao".
 *
 * Trước đây lặp nguyên văn 9 lần trong các hàm dựng popup, khác nhau đúng một
 * cụm danh từ. `doiTuong` giữ lại chính cụm đó để chữ hiển thị không đổi: mỗi
 * lớp nói rõ toạ độ NÀO đang được cảnh báo (nơi thờ, quê, đền/đình…), và đó là
 * thông tin thật chứ không phải dị bản ngẫu nhiên.
 */
const canhBaoToaDo = (muc: string, doiTuong = "Toạ độ"): string =>
  muc && muc !== "cao"
    ? `<br/><span style="color:#b45309;font-size:0.72rem">⚠️ ${doiTuong} độ tin cậy ${esc(muc)} — đang soát</span>`
    : "";

/**
 * Một mục lớp phủ, SAU khi đã qua `parseOverlayItem`.
 *
 * Mọi trường hiển thị khai `string` — kể cả `nam` và `dot` vốn là số trong JSON.
 * Xem `types/parse.ts` để hiểu vì sao lời khai `number` là thứ đẻ ra sink XSS.
 * Trước đây interface này chỉ có 11 trường, còn 12 trường khác được khai lại
 * rời rạc ở 10 chỗ `as OverlayItem & { … }` trong các hàm dựng popup — mỗi chỗ
 * một tập khác nhau, không chỗ nào là nguồn sự thật.
 */
export interface OverlayItem {
  ten: string;
  lon: number;
  lat: number;
  loai: string;
  hang_muc: string;
  nam: string;
  dot: string;
  tinh_34: string;
  anh: string;
  anh_nguon: string;
  anh_giay_phep: string;
  anh_muc: "" | "chan-dung" | "tu-lieu" | "vi-tri";
  nam_hien_thi: string;
  thoi_ky: string;
  dia_diem: string;
  noi_tho: string;
  noi_luu_giu: string;
  mo_ta: string;
  cong_trang: string;
  ket_qua: string;
  chi_huy: string;
  trang_thai: string;
  do_tin_cay_toa_do: string;
}

/** Ranh giới JSON → OverlayItem. `lon`/`lat` giữ kiểu số vì đi vào hình học. */
export function parseOverlayItem(raw: unknown): OverlayItem {
  const r = rec(raw);
  return {
    ten: str(r.ten),
    lon: num(r.lon) ?? 0,
    lat: num(r.lat) ?? 0,
    loai: str(r.loai),
    hang_muc: str(r.hang_muc),
    nam: str(r.nam),
    dot: str(r.dot),
    tinh_34: str(r.tinh_34),
    anh: str(r.anh),
    anh_nguon: str(r.anh_nguon),
    anh_giay_phep: str(r.anh_giay_phep),
    anh_muc: oneOf(r.anh_muc, ["", "chan-dung", "tu-lieu", "vi-tri"] as const, ""),
    nam_hien_thi: str(r.nam_hien_thi),
    thoi_ky: str(r.thoi_ky),
    dia_diem: str(r.dia_diem),
    noi_tho: str(r.noi_tho),
    noi_luu_giu: str(r.noi_luu_giu),
    mo_ta: str(r.mo_ta),
    cong_trang: str(r.cong_trang),
    ket_qua: str(r.ket_qua),
    chi_huy: str(r.chi_huy),
    trang_thai: str(r.trang_thai),
    do_tin_cay_toa_do: str(r.do_tin_cay_toa_do),
  };
}

export interface OverlayConf {
  id: string;
  label: string;
  // Emoji dùng làm icon-image trên bản đồ (đăng ký 1 lần qua registerOverlayIcons(),
  // dùng chung giữa các lớp phủ cùng emoji để đỡ tốn ảnh sprite).
  icon: string;
  file: string;
  circleColor: ExpressionSpecification | string;
  nguon: string;
  popup: (p: OverlayItem) => string;
}

// Ảnh minh hoạ (chân dung/tư liệu) hiện trong popup nếu có URL hợp lệ — chỉ chấp nhận
// https:// (chặn javascript:/http: không mã hoá) để tránh chèn script qua dữ liệu.
const photoImgBlock = (o: OverlayItem): string =>
  o.anh && o.anh.startsWith("https://")
    ? `<img src="${esc(o.anh)}" alt="${esc(o.ten)}" loading="lazy" style="max-width:120px;max-height:120px;border-radius:6px;display:block;margin:0 0 4px" referrerpolicy="no-referrer"/>`
    : "";
const photoAttrBlock = (o: OverlayItem): string =>
  o.anh && o.anh.startsWith("https://") && o.anh_nguon
    ? `<br/><span style="color:#a8a29e;font-size:0.66rem">🖼️ ${esc(o.anh_nguon)}${o.anh_giay_phep ? " · " + esc(o.anh_giay_phep) : ""}</span>`
    : "";

// Popup dùng chung cho các lớp phủ "nhân vật" (tên · năm · quê/đền · mô tả · cảnh báo toạ độ).
const personOverlayPopup = (p: OverlayItem): string => {
  const o = p;
  const tc = canhBaoToaDo(o.do_tin_cay_toa_do);
  return `${photoImgBlock(o)}<strong>${esc(o.ten)}</strong><br/><span style="color:#78716c">${esc(o.nam_hien_thi ?? "")}</span><br/>📍 ${esc(o.dia_diem ?? "")}${o.mo_ta ? `<br/><span style="color:#57534e">${esc(o.mo_ta)}</span>` : ""}${photoAttrBlock(o)}${tc}`;
};

// Popup HỢP NHẤT cho lớp gộp nhiều schema (nhân vật + thờ tự + sự kiện) — dùng fallback
// nam_hien_thi ?? thoi_ky ?? nam · dia_diem ?? noi_tho · mo_ta ?? cong_trang. Không để trống dòng.
const universalPersonPopup = (p: OverlayItem): string => {
  const o = p;
  const nam = o.nam_hien_thi || o.thoi_ky || o.nam;
  const noi = o.dia_diem || o.noi_tho;
  const ta = o.mo_ta || o.cong_trang;
  const tc = canhBaoToaDo(o.do_tin_cay_toa_do);
  return `${photoImgBlock(o)}<strong>${esc(o.ten)}</strong>${nam ? `<br/><span style="color:#78716c">${esc(nam)}</span>` : ""}${noi ? `<br/>📍 ${esc(noi)}` : ""}${ta ? `<br/><span style="color:#57534e">${esc(ta)}</span>` : ""}${photoAttrBlock(o)}${tc}`;
};

// Popup dùng chung cho lớp phủ "sự kiện/trận đánh" (ưu tiên nam_hien_thi rồi nam).
const eventOverlayPopup = (p: OverlayItem): string => {
  const o = p;
  const tc = canhBaoToaDo(o.do_tin_cay_toa_do);
  return `${photoImgBlock(o)}<strong>${esc(o.ten)}</strong><br/><span style="color:#78716c">${esc(o.nam_hien_thi || o.nam)}</span><br/>📍 ${esc(o.dia_diem ?? "")}${o.mo_ta ? `<br/><span style="color:#57534e">${esc(o.mo_ta)}</span>` : ""}${photoAttrBlock(o)}${tc}`;
};

export const OVERLAYS: OverlayConf[] = [
  {
    id: "unesco",
    label: "🏛️ Di sản thế giới & Công viên địa chất UNESCO",
    icon: "🏛️",
    file: "data/overlays/unesco.json",
    circleColor: [
      "match",
      ["get", "loai"],
      "di-san-the-gioi",
      "#7c3aed",
      "cong-vien-dia-chat",
      "#0d9488",
      "#7c3aed",
    ],
    nguon: "UNESCO (whc.unesco.org) · Cục Di sản văn hóa",
    popup: (p) =>
      `<strong>${esc(p.ten)}</strong><br/>${esc(p.hang_muc ?? "")} · Ghi danh ${esc(p.nam ?? "")}<br/><span style="color:#78716c">${esc(p.tinh_34 ?? "")}</span>`,
  },
  {
    id: "di-tich-qgdb",
    label: "🏯 Di tích quốc gia đặc biệt",
    icon: "🏯",
    file: "data/overlays/di-tich-qgdb.json",
    circleColor: "#b45309",
    nguon: "Cục Di sản văn hóa (dsvh.gov.vn) · Quyết định xếp hạng của Thủ tướng Chính phủ",
    popup: (p) =>
      `<strong>${esc(p.ten)}</strong><br/>${esc(p.loai ?? "di tích")} · Xếp hạng ${esc(p.nam ?? "")}${p.dot ? ` (đợt ${esc(p.dot)})` : ""}<br/><span style="color:#78716c">${esc(p.tinh_34 ?? "")}</span>`,
  },
  {
    id: "bao-vat-quoc-gia",
    label: "💎 Bảo vật quốc gia",
    icon: "💎",
    file: "data/overlays/bao-vat-quoc-gia.json",
    circleColor: "#d4af37",
    nguon: "Cục Di sản văn hóa (dsvh.gov.vn) · Bảo tàng Lịch sử Quốc gia (baotanglichsu.vn)",
    popup: (p) => {
      const o = p;
      return `<strong>${esc(o.ten)}</strong><br/>${esc(o.loai ?? "")}${o.dot ? ` · công nhận đợt năm ${esc(o.dot)}` : ""}<br/>📍 ${esc(o.noi_luu_giu ?? "")}${o.mo_ta ? `<br/><span style="color:#57534e">${esc(o.mo_ta)}</span>` : ""}`;
    },
  },
  {
    id: "huyen-su-khai-quoc",
    label: "🐉 Huyền sử khai quốc · Tứ bất tử · Hải đội Hoàng Sa",
    icon: "🐉",
    file: "data/overlays/huyen-su-khai-quoc.json",
    circleColor: [
      "match",
      ["get", "loai"],
      "huyen-su-khai-quoc",
      "#b91c1c",
      "tu-bat-tu",
      "#7c3aed",
      "chu-quyen",
      "#dc2626",
      "#b91c1c",
    ],
    nguon:
      "Đại Việt Sử Ký Toàn Thư · Lĩnh Nam Chích Quái · Việt Điện U Linh · Phủ Biên Tạp Lục · Cục Di sản Văn hoá (dsvh.gov.vn)",
    popup: (p) => {
      const o = p;
      const tc = canhBaoToaDo(o.do_tin_cay_toa_do, "Toạ độ nơi thờ");
      return `<strong>${esc(o.ten)}</strong><br/><span style="color:#78716c">${esc(o.thoi_ky ?? "")}</span><br/>📍 ${esc(o.noi_tho ?? "")}${o.cong_trang ? `<br/><span style="color:#57534e">${esc(o.cong_trang)}</span>` : ""}${tc}`;
    },
  },
  {
    id: "khoa-bang-danh-nhan",
    label: "📜 Khoa bảng · Trạng nguyên · Tiến sĩ · Quan lại",
    icon: "📜",
    file: "data/overlays/khoa-bang-danh-nhan.json",
    circleColor: [
      "match",
      ["get", "loai"],
      "khoa-bang",
      "#2563eb",
      "thay-giao",
      "#0d9488",
      "danh-nhan-van-hoa",
      "#6366f1",
      "quan-thanh-liem",
      "#15803d",
      "#2563eb",
    ],
    nguon:
      "Đại Việt Sử Ký Toàn Thư · Đại Nam Thực Lục · Phủ Biên Tạp Lục · Cục Di sản Văn hoá (dsvh.gov.vn) · vanmieu.gov.vn",
    popup: universalPersonPopup,
  },
  {
    id: "danh-nhan-cac-trieu",
    label: "🏛️ Danh nhân các triều · văn hoá · y học",
    icon: "🏛️",
    file: "data/overlays/danh-nhan-cac-trieu.json",
    circleColor: [
      "match",
      ["get", "loai"],
      "vua", "#b91c1c",
      "van-hoc", "#7c3aed",
      "y-hoc", "#0d9488",
      "khai-pha", "#ca8a04",
      "#7c3aed",
    ],
    nguon:
      "Đại Việt Sử Ký Toàn Thư · Đại Nam Thực Lục · Đại Nam Liệt Truyện · Hải Thượng Y Tông Tâm Lĩnh · Cục Di sản Văn hoá (dsvh.gov.vn)",
    popup: (p) => {
      const o = p;
      const tc = canhBaoToaDo(o.do_tin_cay_toa_do, "Toạ độ nơi thờ");
      return `<strong>${esc(o.ten)}</strong><br/><span style="color:#78716c">${esc(o.thoi_ky ?? "")}</span><br/>📍 ${esc(o.noi_tho ?? "")}${o.cong_trang ? `<br/><span style="color:#57534e">${esc(o.cong_trang)}</span>` : ""}${tc}`;
    },
  },
  {
    id: "chien-dich-tran-danh",
    label: "⚔️ Chiến dịch · Trận đánh · Khởi nghĩa (938–1988)",
    icon: "⚔️",
    file: "data/overlays/chien-dich-tran-danh.json",
    circleColor: [
      "match",
      ["get", "loai"],
      "giu-nuoc", "#dc2626",
      "can-dai", "#ca8a04",
      "hien-dai", "#b91c1c",
      "#dc2626",
    ],
    nguon:
      "Đại Việt Sử Ký Toàn Thư · Hoàng Lê nhất thống chí · Lịch sử Việt Nam (Viện Sử học) · Cục Di sản Văn hoá (dsvh.gov.vn)",
    popup: (p) => {
      const o = p;
      const tc = canhBaoToaDo(o.do_tin_cay_toa_do, "Toạ độ địa điểm");
      return `<strong>${esc(o.ten)}</strong><br/><span style="color:#78716c">${esc(o.nam_hien_thi || o.nam)}${o.chi_huy ? " · " + esc(o.chi_huy) : ""}</span><br/>📍 ${esc(o.dia_diem ?? "")}${o.ket_qua ? `<br/><span style="color:#57534e">${esc(o.ket_qua)}</span>` : ""}${tc}`;
    },
  },
  {
    id: "anh-hung-can-hien-dai",
    label: "🎖️ Anh hùng LLVT · Liệt sĩ · Tướng lĩnh hiện đại",
    icon: "🎖️",
    file: "data/overlays/anh-hung-can-hien-dai.json",
    circleColor: [
      "match",
      ["get", "loai"],
      "dai-tuong", "#b91c1c",
      "ah-llvt", "#dc2626",
      "me-vnah", "#db2777",
      "ah-lao-dong", "#0d9488",
      "#dc2626",
    ],
    nguon:
      "Báo Quân đội Nhân dân (qdnd.vn) · Báo Nhân Dân (nhandan.vn) · Bảo tàng Lịch sử Quân sự Việt Nam · Cổng TTĐT Chính phủ (baochinhphu.vn)",
    popup: (p) => {
      const o = p;
      const tc = canhBaoToaDo(o.do_tin_cay_toa_do, "Toạ độ quê/khu lưu niệm");
      return `<strong>${esc(o.ten)}</strong><br/><span style="color:#78716c">${esc(o.nam_hien_thi ?? "")}</span><br/>📍 ${esc(o.dia_diem ?? "")}${o.mo_ta ? `<br/><span style="color:#57534e">${esc(o.mo_ta)}</span>` : ""}${tc}`;
    },
  },
  {
    id: "danh-nhan-van-hoa-can-hien-dai",
    label: "📚 Văn nghệ sĩ · Báo chí · Danh nhân văn hoá",
    icon: "📚",
    file: "data/overlays/danh-nhan-van-hoa-can-hien-dai.json",
    circleColor: [
      "match",
      ["get", "loai"],
      "chi-si", "#b91c1c",
      "khoa-hoc-y", "#0d9488",
      "van-nghe", "#7c3aed",
      "hoc-gia", "#ca8a04",
      "#b91c1c",
    ],
    nguon:
      "Báo Nhân Dân · Cổng TTĐT Chính phủ · Cục Di sản Văn hoá · Bảo tàng Lịch sử Quốc gia · Sức khoẻ & Đời sống (Bộ Y tế)",
    popup: (p) => {
      const o = p;
      const tc = canhBaoToaDo(o.do_tin_cay_toa_do, "Toạ độ quê/khu lưu niệm");
      return `<strong>${esc(o.ten)}</strong><br/><span style="color:#78716c">${esc(o.nam_hien_thi ?? "")}</span><br/>📍 ${esc(o.dia_diem ?? "")}${o.mo_ta ? `<br/><span style="color:#57534e">${esc(o.mo_ta)}</span>` : ""}${tc}`;
    },
  },
  {
    id: "thanh-hoang-danh-than",
    label: "🏯 Thành hoàng · Danh thần · Tín ngưỡng vùng miền",
    icon: "🏯",
    file: "data/overlays/thanh-hoang-danh-than.json",
    circleColor: [
      "match",
      ["get", "loai"],
      "thanh-hoang", "#9333ea",
      "#9333ea",
    ],
    nguon:
      "Cục Du lịch Quốc gia · Cổng TTĐT tỉnh Quảng Ninh · Bảo tàng Lịch sử Quốc gia · Sở Du lịch Ninh Bình · Báo An Giang · Cổng du lịch Bắc Ninh",
    popup: (p) => {
      const o = p;
      const tc = canhBaoToaDo(o.do_tin_cay_toa_do, "Toạ độ đền/đình");
      return `<strong>${esc(o.ten)}</strong><br/><span style="color:#78716c">${esc(o.nam_hien_thi ?? "")}</span><br/>📍 ${esc(o.dia_diem ?? "")}${o.mo_ta ? `<br/><span style="color:#57534e">${esc(o.mo_ta)}</span>` : ""}${tc}`;
    },
  },
  {
    id: "me-vnah",
    label: "🏵️ Mẹ Việt Nam Anh hùng",
    icon: "🏵️",
    file: "data/overlays/me-vnah.json",
    circleColor: "#db2777",
    nguon:
      "Báo Chính phủ · Báo QĐND · Bảo tàng Phụ nữ Nam Bộ · cổng tỉnh",
    popup: personOverlayPopup,
  },
  {
    id: "vua-hoang-de",
    label: "👑 Vua · Chúa · Hoàng tộc",
    icon: "👑",
    file: "data/overlays/vua-hoang-de.json",
    circleColor: "#a16207",
    nguon:
      "Trung tâm Bảo tồn Di tích Cố đô Huế · Cục Di sản văn hóa · cổng tỉnh · Báo Nhân Dân",
    popup: personOverlayPopup,
  },
  {
    id: "chi-si-cach-mang",
    label: "🔥 Chí sĩ cách mạng · Doanh nhân yêu nước",
    icon: "🔥",
    file: "data/overlays/chi-si-cach-mang.json",
    circleColor: "#b91c1c",
    nguon:
      "Báo điện tử Đảng Cộng sản · Bảo tàng Lịch sử Quốc gia · TTXVN · Báo Nhân Dân · cổng tỉnh",
    popup: personOverlayPopup,
  },
  {
    id: "to-nghe-danh-than",
    label: "🛠️ Tổ nghề · Nghệ nhân · Làng nghề truyền thống",
    icon: "🛠️",
    file: "data/overlays/to-nghe-danh-than.json",
    circleColor: "#0891b2",
    nguon:
      "Cục Di sản văn hóa · Sở VHTT các tỉnh · Cục Bản quyền tác giả · cổng tỉnh",
    popup: personOverlayPopup,
  },
  {
    id: "di-tich-cach-mang",
    label: "🚩 Di tích cách mạng · Nhà tù · Căn cứ kháng chiến",
    icon: "🚩",
    file: "data/overlays/di-tich-cach-mang.json",
    circleColor: [
      "match",
      ["get", "loai"],
      "danh-thang",
      "#16a34a",
      "vuon-quoc-gia",
      "#16a34a",
      "#dc2626",
    ],
    nguon:
      "Cục Di sản văn hóa · Báo điện tử Đảng Cộng sản · Bảo tàng Lịch sử Quốc gia · Cục Du lịch Quốc gia (vietnamtourism.vn) · cổng tỉnh",
    popup: eventOverlayPopup,
  },
  {
    id: "nghia-trang-liet-si",
    label: "🕯️ Nghĩa trang liệt sĩ · Đài tưởng niệm · Đền thờ liệt sĩ",
    icon: "🕯️",
    file: "data/overlays/nghia-trang-liet-si.json",
    // Nghĩa trang tách khỏi tượng đài/chứng tích để đọc được mật độ ngay trên
    // bản đồ: đỏ sẫm = nơi an nghỉ, cam = tượng đài chiến thắng, xám = nơi
    // tưởng niệm nạn nhân thảm sát.
    circleColor: [
      "match",
      ["get", "loai"],
      "nghia-trang-quoc-gia",
      "#7f1d1d",
      "nghia-trang-tinh",
      "#b91c1c",
      "tuong-dai-chien-thang",
      "#ea580c",
      "khu-tuong-niem-nan-nhan",
      "#57534e",
      "#a16207",
    ],
    nguon:
      "Cục Người có công (Bộ Nội vụ) · Báo Quân đội nhân dân · Báo Nhân Dân · Báo điện tử Đảng Cộng sản · cổng TTĐT tỉnh/huyện",
    popup: eventOverlayPopup,
  },
  {
    id: "nghe-nhan-di-san",
    label: "🎭 Nghệ nhân · tổ nghệ thuật · di sản sống",
    icon: "🎭",
    file: "data/overlays/nghe-nhan-di-san.json",
    circleColor: "#7c3aed",
    nguon:
      "Cục Di sản văn hóa · Sở VHTT các tỉnh · Báo Nhân Dân · Cục Du lịch Quốc gia",
    popup: personOverlayPopup,
  },
  {
    id: "di-tich-quoc-gia",
    label: "🏛️ Di tích quốc gia (đền · chùa · thành · hang · khảo cổ)",
    icon: "🏛️",
    file: "data/overlays/di-tich-quoc-gia.json",
    circleColor: [
      "match",
      ["get", "loai"],
      "danh-thang",
      "#16a34a",
      "khao-co",
      "#a16207",
      "cach-mang",
      "#dc2626",
      "#0e7490",
    ],
    nguon:
      "Cục Di sản văn hóa (dsvh.gov.vn) · Báo Đảng các tỉnh · Cổng TTĐT tỉnh",
    popup: eventOverlayPopup,
  },
  {
    id: "le-hoi-truyen-thong",
    label: "🎏 Lễ hội truyền thống (di sản phi vật thể)",
    icon: "🎏",
    file: "data/overlays/le-hoi-truyen-thong.json",
    circleColor: "#ea580c",
    nguon:
      "Cục Di sản văn hóa · Cục Du lịch Quốc gia · Sở VHTT các tỉnh · cổng tỉnh",
    popup: personOverlayPopup,
  },
  {
    id: "cong-trinh-ky-luc",
    label: "🌉 Công trình kỷ lục (cầu · hầm · cáp treo · thuỷ điện)",
    icon: "🌉",
    file: "data/overlays/cong-trinh-ky-luc.json",
    circleColor: "#d97706",
    nguon:
      "Cổng Chính phủ (chinhphu.vn) · TTXVN · Nhân Dân · báo Đảng các tỉnh · cổng bộ ngành",
    popup: personOverlayPopup,
  },
  {
    id: "truyen-thuyet-dan-gian",
    label: "🐉 Truyền thuyết · Sự tích địa danh · Ca dao vùng đất",
    icon: "🐉",
    file: "data/overlays/truyen-thuyet-dan-gian.json",
    circleColor: "#7c3aed",
    nguon:
      "Cổng TTĐT tỉnh/huyện · báo Đảng bộ tỉnh · Cục Di sản văn hoá · Sở VHTTDL · TTXVN",
    popup: eventOverlayPopup,
  },
  {
    id: "danh-thang-thien-nhien",
    label: "🏞 Danh thắng thiên nhiên (đèo · thác · núi · hồ · biển đảo)",
    icon: "🏞",
    file: "data/overlays/danh-thang-thien-nhien.json",
    circleColor: "#059669",
    nguon:
      "Cục Du lịch Quốc gia (vietnamtourism.gov.vn) · Cục Di sản văn hóa (dsvh.gov.vn) · cổng TTĐT các tỉnh · báo Đảng",
    popup: personOverlayPopup,
  },
  {
    id: "bao-tang",
    label: "🏺 Bảo tàng lịch sử – văn hoá",
    icon: "🏺",
    file: "data/overlays/bao-tang.json",
    circleColor: "#0891b2",
    nguon:
      "Website chính thức các bảo tàng công lập · Cục Di sản văn hóa (dsvh.gov.vn)",
    popup: personOverlayPopup,
  },
  {
    id: "di-san-phi-vat-the",
    label: "🎶 Di sản văn hoá phi vật thể (UNESCO · quốc gia)",
    icon: "🎶",
    file: "data/overlays/di-san-phi-vat-the.json",
    circleColor: [
      "match",
      ["get", "loai"],
      "unesco-phi-vat-the",
      "#7c3aed",
      "#db2777",
    ],
    nguon:
      "UNESCO (ich.unesco.org) · Cục Di sản văn hóa (dsvh.gov.vn) · báo Đảng các tỉnh",
    popup: personOverlayPopup,
  },
  {
    id: "su-than-ngoai-giao",
    label: "🕊️ Sứ thần · nhà ngoại giao lịch sử",
    icon: "🕊️",
    file: "data/overlays/su-than-ngoai-giao.json",
    circleColor: "#4f46e5",
    nguon:
      "Bảo tàng Lịch sử Quốc gia · Giáo dục & Thời đại · Báo Nhân Dân · scov.gov.vn",
    popup: personOverlayPopup,
  },
  {
    id: "danh-y-luong-y",
    label: "⚕️ Danh y · lương y (y học cổ truyền)",
    icon: "⚕️",
    file: "data/overlays/danh-y-luong-y.json",
    circleColor: "#047857",
    nguon:
      "Sức khỏe & Đời sống · Viện Y dược học dân tộc · Bảo tàng Lịch sử Quốc gia · cổng tỉnh",
    popup: personOverlayPopup,
  },
  // Lớp `nu-danh-nhan-lich-su` đã GIẢI THỂ 2026-08-05 (chỉ thị #10: chia theo
  // lĩnh vực / chủ đề / giai đoạn, KHÔNG theo giới tính). 38 mục về 8 lớp lĩnh
  // vực. Đừng dựng lại lớp này. Thông tin ai là phụ nữ vẫn đọc được từ tên và
  // `mo_ta` — thứ bị bỏ là cách CHIA, không phải thông tin.
  {
    id: "danh-nhan-dan-toc-thieu-so",
    label: "🪶 Danh nhân dân tộc thiểu số · Miền núi phía Bắc",
    icon: "🪶",
    file: "data/overlays/danh-nhan-dan-toc-thieu-so.json",
    circleColor: "#0f766e",
    nguon:
      "Báo Dân tộc & Phát triển · Ủy ban Dân tộc · Báo QĐND · Báo Nhân Dân · cổng tỉnh",
    popup: personOverlayPopup,
  },
  {
    id: "thieu-nien-anh-hung",
    label: "🎗️ Thiếu niên anh hùng",
    icon: "🎗️",
    file: "data/overlays/thieu-nien-anh-hung.json",
    circleColor: "#be123c",
    nguon:
      "Bảo tàng Lịch sử Quốc gia · Báo Thiếu niên Tiền phong · Báo Nhân Dân · cổng tỉnh",
    popup: personOverlayPopup,
  },
  {
    id: "thien-su-cao-tang",
    label: "🪷 Thiền sư · cao tăng lịch sử",
    icon: "🪷",
    file: "data/overlays/thien-su-cao-tang.json",
    circleColor: "#ca8a04",
    nguon:
      "Giác Ngộ · Phật giáo VN · Tạp chí NC Phật học · Báo Nhân Dân · dsvh.gov.vn",
    popup: personOverlayPopup,
  },
  {
    id: "danh-nhan-quan-su-co-trung-dai",
    label: "⚔️ Danh tướng · Võ tướng · Thủ lĩnh khởi nghĩa (cổ–trung đại)",
    icon: "⚔️",
    file: "data/overlays/danh-nhan-quan-su-co-trung-dai.json",
    circleColor: "#991b1b",
    nguon:
      "Bảo tàng Lịch sử Quốc gia · Khu di tích Lam Kinh · Báo Văn hoá · cổng tỉnh · Dân trí · Đại Việt Sử Ký Toàn Thư · Lĩnh Nam Chích Quái",
    popup: universalPersonPopup,
  },
  {
    id: "nha-the-thao-lich-su",
    label: "🏅 Nhà thể thao lịch sử (đã mất)",
    icon: "🏅",
    file: "data/overlays/nha-the-thao-lich-su.json",
    circleColor: "#166534",
    nguon:
      "Báo Nhân Dân · Thể thao & Văn hoá · CAND · Lao Động · Thanh Niên · Vovinam",
    popup: personOverlayPopup,
  },
  {
    id: "nghia-si-can-vuong",
    label: "⚔️ Cần Vương · Kháng Pháp thế kỷ 19",
    icon: "⚔️",
    file: "data/overlays/nghia-si-can-vuong.json",
    circleColor: "#881337",
    nguon:
      "Báo Nhân Dân · QĐND · cổng tỉnh · dsvh.gov.vn · bảo tàng · di tích",
    popup: personOverlayPopup,
  },
  {
    id: "tri-thuc-khoa-hoc-tk20",
    label: "🔬 Trí thức · Nhà khoa học · Giáo dục cận–hiện đại",
    icon: "🔬",
    file: "data/overlays/tri-thuc-khoa-hoc-tk20.json",
    circleColor: "#065f46",
    nguon:
      "Báo Nhân Dân · Viện Hàn lâm KHCN/KHXH VN · ĐHQG · MEDDOM · Tia Sáng",
    popup: personOverlayPopup,
  },
  ];

// Gom 29 lớp phủ thành cụm chủ đề (accordion) để panel gọn (Phase 3 P3.4).
// Chỉ nhóm HIỂN THỊ — không đổi thứ tự/định nghĩa OVERLAYS. Lớp thiếu nhóm
// rơi vào "Khác" (guard chống sót khi thêm lớp mới).
// `id` dùng để tra tên gọi phiên bản trẻ em (tu-vung-tre-em.ts) — nhãn người
// lớn không làm khoá được vì nó chính là thứ bị thay.
export const OVERLAY_GROUPS: { id: string; nhan: string; icon: string; ids: string[] }[] = [
  { id: "di-san", nhan: "Di sản & Di tích", icon: "🏛️", ids: ["unesco", "di-tich-qgdb", "di-tich-quoc-gia", "bao-vat-quoc-gia", "di-tich-cach-mang"] },
  { id: "quan-su", nhan: "Sự kiện & Quân sự", icon: "⚔️", ids: ["chien-dich-tran-danh", "danh-nhan-quan-su-co-trung-dai", "nghia-si-can-vuong"] },
  { id: "vua-khoa-bang", nhan: "Vua chúa · Khoa bảng · Ngoại giao", icon: "👑", ids: ["vua-hoang-de", "khoa-bang-danh-nhan", "su-than-ngoai-giao", "danh-nhan-cac-trieu"] },
  { id: "cong-dong-dan-toc", nhan: "Cộng đồng các dân tộc", icon: "🪶", ids: ["danh-nhan-dan-toc-thieu-so"] },
  { id: "tin-nguong", nhan: "Tín ngưỡng · Tôn giáo · Nghề", icon: "🙏", ids: ["thanh-hoang-danh-than", "thien-su-cao-tang", "to-nghe-danh-than", "le-hoi-truyen-thong", "danh-y-luong-y"] },
  { id: "van-hoa-khoa-hoc", nhan: "Văn hoá · Khoa học · Thể thao cận-hiện đại", icon: "📚", ids: ["danh-nhan-van-hoa-can-hien-dai", "tri-thuc-khoa-hoc-tk20", "nha-the-thao-lich-su", "nghe-nhan-di-san"] },
  { id: "cach-mang", nhan: "Cách mạng & Anh hùng", icon: "⭐", ids: ["anh-hung-can-hien-dai", "chi-si-cach-mang", "me-vnah", "thieu-nien-anh-hung", "nghia-trang-liet-si"] },
  { id: "huyen-su", nhan: "Huyền sử & Truyền thuyết", icon: "🐉", ids: ["huyen-su-khai-quoc", "truyen-thuyet-dan-gian"] },
];
