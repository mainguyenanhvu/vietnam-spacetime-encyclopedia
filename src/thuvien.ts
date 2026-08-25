// ═══════════════════════════════════════════════════════════════════════════
// 📚 Thư viện — duyệt theo chủ đề, sắp xếp do người dùng chọn, khung đọc riêng
// ═══════════════════════════════════════════════════════════════════════════
//
// Tách khỏi main.ts (2026-08-05). Trước đây toàn bộ ~600 tác phẩm bị đổ vào
// MỘT lần `content.innerHTML` thành accordion lồng accordion trong panel rộng
// 520 px, không sắp xếp được, không có khung đọc, và không có lối nhảy sang
// trang tỉnh dù dữ liệu `lien_quan_tinh` đã có từ lâu.
//
// Module này giữ CẢ lớp dữ liệu văn thơ (kiểu + parser + loadLiterature) vì
// trang tỉnh cũng đọc chung bộ đó — main.ts nay chỉ gọi `loadLiterature()` và
// `htmlVanThoTinh()` thay vì tự dựng HTML từ 5 renderer riêng.
//
// Ba màn con dùng chung `#library-content`:
//   .lib-list    — danh sách theo chủ đề (mặc định)
//   .lib-doc     — khung đọc MỘT tác phẩm, phóng to được, có bộ tuỳ chỉnh
//   .lib-cong-cu — tra cứu niên hiệu (không phải tác phẩm, không sắp xếp)

import { esc } from "./util/html";
import { escVan } from "./popup-noi-dung";
import { fetchJson } from "./util/fetch";
import { str, num, strs, oneOf, rec, arr, itemsOf } from "./types/parse";
import { showOnly } from "./panels";

// ═══════════════════════════════════════════════════════════════════════════
// 1. Kiểu dữ liệu nguồn + parser (chuyển nguyên từ main.ts)
// ═══════════════════════════════════════════════════════════════════════════

interface Poem {
  id: string;
  ten: string;
  tac_gia: string;
  thoi_ky: string;
  the_loai: string;
  ban_quyen: "public-domain" | "cited-excerpt";
  lien_quan_tinh: string[];
  chu_de: string;
  loi_binh?: string;
  vi_sao_hay?: string;
  xep_hang?: number;
  /**
   * Số bài trong Ngục trung nhật ký theo bản NXB Chính trị quốc gia Sự thật
   * (dãy 1–134) — thứ tự của chính tập thơ, tức thứ tự thời gian Bác viết
   * trong tù. Dùng làm khoá phụ khi sắp theo thời gian: cả tập cùng ghi
   * "1942–1943" nên khoá năm một mình không phân biệt được bài nào trước.
   */
  so_bai?: number;
  nguyen_van: string[];
  ban_dich?: string[];
  ghi_chu_dich?: string;
  /** CỐ Ý KHÔNG render — chữ dặn người sửa dữ liệu, không phải chữ cho bạn đọc. */
  ghi_chu_bien_tap?: string;
  nhom?: "nktt" | "chuc-tet" | "trung-thu" | "tho" | "van" | "ton-nghi";
  /** Bộ sách học ngày xưa đã in bài này (Quốc văn giáo khoa thư, Quốc văn
   *  trích diễm, Việt Nam thi văn hợp tuyển…). Chỉ chủ đề `sach-hoc-xua` dùng. */
  sach_xua?: string;
  /**
   * Từ khó → nghĩa, để bấm vào chữ lạ là hiện lời giải ngay tại chỗ. Sinh ra
   * cho chế độ trẻ em: thơ cổ đầy chữ Hán-Việt («thái hư», «lữ thứ»), không
   * giải nghĩa thì đứa trẻ đọc hết bài vẫn không hiểu gì.
   */
  giai_nghia?: Array<{ tu: string; nghia: string }>;
  sources: string[];
}

const parsePoem = (raw: unknown): Poem => {
  const r = rec(raw);
  return {
    id: str(r.id),
    ten: str(r.ten),
    tac_gia: str(r.tac_gia),
    thoi_ky: str(r.thoi_ky),
    the_loai: str(r.the_loai),
    ban_quyen: oneOf(r.ban_quyen, ["public-domain", "cited-excerpt"] as const, "cited-excerpt"),
    lien_quan_tinh: strs(r.lien_quan_tinh),
    chu_de: str(r.chu_de),
    loi_binh: str(r.loi_binh),
    vi_sao_hay: str(r.vi_sao_hay),
    xep_hang: num(r.xep_hang) ?? undefined,
    so_bai: num(r.so_bai) ?? undefined,
    nguyen_van: strs(r.nguyen_van),
    ban_dich: strs(r.ban_dich),
    ghi_chu_dich: str(r.ghi_chu_dich),
    ghi_chu_bien_tap: str(r.ghi_chu_bien_tap),
    nhom: oneOf(r.nhom, ["nktt", "chuc-tet", "trung-thu", "tho", "van", "ton-nghi"] as const, "tho"),
    sach_xua: str(r.sach_xua),
    giai_nghia: arr(r.giai_nghia, (x) => {
      const g = rec(x);
      return { tu: str(g.tu), nghia: str(g.nghia) };
    }).filter((g) => g.tu && g.nghia),
    sources: strs(r.sources),
  };
};

/** Giới thiệu tác phẩm — có `tom_tat`/`gioi_thieu`, CỐ Ý không có nguyên văn. */
interface VanXuoi {
  id: string;
  ten: string;
  tac_gia: string;
  nam: string;
  the_loai: string;
  tom_tat: string;
  gioi_thieu: string;
  loi_binh: string;
  ghi_chu: string;
  thoi_ky: string;
  ban_quyen: string;
  lien_quan_tinh: string[];
  chu_de: string;
  sources: string[];
}

const parseVanXuoi = (raw: unknown): VanXuoi => {
  const r = rec(raw);
  return {
    id: str(r.id),
    ten: str(r.ten),
    tac_gia: str(r.tac_gia),
    nam: str(r.nam),
    the_loai: str(r.the_loai),
    tom_tat: str(r.tom_tat),
    gioi_thieu: str(r.gioi_thieu),
    loi_binh: str(r.loi_binh),
    ghi_chu: str(r.ghi_chu),
    thoi_ky: str(r.thoi_ky),
    ban_quyen: str(r.ban_quyen),
    lien_quan_tinh: strs(r.lien_quan_tinh),
    chu_de: str(r.chu_de),
    sources: strs(r.sources),
  };
};

interface Anecdote {
  id: string;
  nhan_vat: string;
  danh_hieu: string;
  que_quan: string;
  lien_quan_tinh: string[];
  chu_de: string;
  giai_thoai: Array<{ ten: string; noi_dung: string }>;
  y_nghia: string;
  sources: string[];
}

const parseAnecdote = (raw: unknown): Anecdote => {
  const r = rec(raw);
  return {
    id: str(r.id),
    nhan_vat: str(r.nhan_vat),
    danh_hieu: str(r.danh_hieu),
    que_quan: str(r.que_quan),
    lien_quan_tinh: strs(r.lien_quan_tinh),
    chu_de: str(r.chu_de),
    giai_thoai: arr(r.giai_thoai, (x) => {
      const g = rec(x);
      return { ten: str(g.ten), noi_dung: str(g.noi_dung) };
    }),
    y_nghia: str(r.y_nghia),
    sources: strs(r.sources),
  };
};

interface HcmPoem {
  ten: string;
  tac_gia: string;
  nam: string;
  ban_quyen: string;
  gioi_thieu: string;
  cau_tho: string[];
  nhung_nam_quan_trong?: string[];
  chu_thich?: string;
  sources: string[];
}

const parseHcmPoem = (raw: unknown): HcmPoem => {
  const r = rec(raw);
  return {
    ten: str(r.ten),
    tac_gia: str(r.tac_gia),
    nam: str(r.nam),
    ban_quyen: str(r.ban_quyen),
    gioi_thieu: str(r.gioi_thieu),
    cau_tho: strs(r.cau_tho),
    nhung_nam_quan_trong: strs(r.nhung_nam_quan_trong),
    chu_thich: str(r.chu_thich),
    sources: strs(r.sources),
  };
};

interface CaDao {
  /** Chữ khó trong câu — dùng chung khuôn với thơ SGK xưa. */
  giai_nghia?: Array<{ tu: string; nghia: string }>;
  id: string;
  /** vè (kể chuyện có vần) và sấm (lời tiên tri) là hai thể riêng, không gộp. */
  loai: "ca-dao" | "tuc-ngu" | "ve" | "sam" | "thanh-ngu";
  noi_dung: string[];
  lien_quan_tinh: string[];
  chu_de: string;
  y_nghia?: string;
  nguon: string[];
}

const parseCaDao = (raw: unknown): CaDao => {
  const r = rec(raw);
  return {
    id: str(r.id),
    loai: oneOf(r.loai, ["ca-dao", "tuc-ngu", "ve", "sam", "thanh-ngu"] as const, "ca-dao"),
    giai_nghia: arr(r.giai_nghia, (x) => {
      const g = rec(x);
      return { tu: str(g.tu), nghia: str(g.nghia) };
    }),
    noi_dung: strs(r.noi_dung),
    lien_quan_tinh: strs(r.lien_quan_tinh),
    chu_de: str(r.chu_de),
    y_nghia: str(r.y_nghia),
    nguon: strs(r.nguon),
  };
};

interface BaiHat {
  id: string;
  ten: string;
  tac_gia_nhac?: string;
  tac_gia_loi?: string;
  nam?: string;
  the_loai?: string;
  lien_quan_tinh: string[];
  chu_de: string;
  youtube_id: string;
  kenh_youtube?: string;
  gioi_thieu?: string;
  ban_quyen?: string;
  nguon: string[];
}

const parseBaiHat = (raw: unknown): BaiHat => {
  const r = rec(raw);
  return {
    id: str(r.id),
    ten: str(r.ten),
    tac_gia_nhac: str(r.tac_gia_nhac),
    tac_gia_loi: str(r.tac_gia_loi),
    nam: str(r.nam),
    the_loai: str(r.the_loai),
    lien_quan_tinh: strs(r.lien_quan_tinh),
    chu_de: str(r.chu_de),
    youtube_id: str(r.youtube_id),
    kenh_youtube: str(r.kenh_youtube),
    gioi_thieu: str(r.gioi_thieu),
    ban_quyen: str(r.ban_quyen),
    nguon: strs(r.nguon),
  };
};

// Bản đồ cổ chứng minh chủ quyền. `anh` bắt buộc host upload.wikimedia.org:
// CSP của trang chặn mọi host ảnh khác.
interface BanDoCo {
  id: string;
  ten: string;
  tac_gia: string;
  nam_hien_thi: string;
  nhom: "viet-nam" | "phuong-tay" | "trung-quoc";
  mo_ta: string;
  y_nghia_chu_quyen?: string;
  noi_luu_giu?: string;
  anh?: string;
  anh_nguon?: string;
  anh_giay_phep?: string;
  anh_ghi_chu?: string;
  nguon: string[];
}

const parseBanDoCo = (raw: unknown): BanDoCo => {
  const r = rec(raw);
  return {
    id: str(r.id),
    ten: str(r.ten),
    tac_gia: str(r.tac_gia),
    nam_hien_thi: str(r.nam_hien_thi),
    nhom: oneOf(r.nhom, ["viet-nam", "phuong-tay", "trung-quoc"] as const, "viet-nam"),
    mo_ta: str(r.mo_ta),
    y_nghia_chu_quyen: str(r.y_nghia_chu_quyen),
    noi_luu_giu: str(r.noi_luu_giu),
    anh: str(r.anh),
    anh_nguon: str(r.anh_nguon),
    anh_giay_phep: str(r.anh_giay_phep),
    anh_ghi_chu: str(r.anh_ghi_chu),
    nguon: strs(r.nguon),
  };
};

interface ChuDe {
  id: string;
  ten: string;
  mo_ta: string;
}

const parseChuDe = (raw: unknown): ChuDe => {
  const r = rec(raw);
  return { id: str(r.id), ten: str(r.ten), mo_ta: str(r.mo_ta) };
};

// ═══════════════════════════════════════════════════════════════════════════
// 2. Nạp dữ liệu
// ═══════════════════════════════════════════════════════════════════════════

export interface ThuVienData {
  chuDe: ChuDe[];
  poems: Poem[];
  hcmWorks: Poem[];
  aboutHcm: Poem[];
  vanXuoiHcm: VanXuoi[];
  gioiThieu: VanXuoi[];
  suKy: VanXuoi[];
  vanXuoiVungMien: VanXuoi[];
  thoMoi: VanXuoi[];
  anecdotes: Anecdote[];
  hcm: HcmPoem | null;
  caDao: CaDao[];
  baiHat: BaiHat[];
  tuLieu: Poem[];
  /** Thơ trong các bộ sách học ngày xưa — chủ đề `sach-hoc-xua`. */
  thoSgkXua: Poem[];
  /** Chính các bộ sách học ngày xưa, dạng giới thiệu — cùng chủ đề. */
  sachHocXua: VanXuoi[];
  banDoCo: BanDoCo[];
}

let literatureCache: ThuVienData | null = null;

/**
 * Nạp toàn bộ kho văn thơ (13 file). Kết quả cache một lần cho cả phiên —
 * trang tỉnh và thư viện dùng chung.
 *
 * Ba file `gioi-thieu-tac-pham` · `su-ky-dia-chi` · `van-xuoi-hien-thuc-vung-mien`
 * (25 mục) TRƯỚC ĐÂY KHÔNG được nạp ở đâu cả — chúng nằm trong repo nhưng
 * chưa từng lên màn hình. Hai chủ đề `su-ky-dia-chi` và
 * `van-xuoi-hien-thuc-vung-mien` trong `_chu-de.json` tồn tại chính vì chúng.
 */
export async function loadLiterature(): Promise<ThuVienData> {
  if (literatureCache) return literatureCache;
  const [
    chuDe, poems, hcmWorks, aboutHcm, vanXuoiHcm, anecdotes, hcm,
    caDao, baiHat, tuLieu, banDoCo, gioiThieu, suKy, vanXuoiVungMien, thoMoi,
    thoSgkXua, sachHocXua,
  ] = await Promise.all([
    fetchJson("data/literature/_chu-de.json", itemsOf(parseChuDe)),
    fetchJson("data/literature/tho-yeu-nuoc.json", itemsOf(parsePoem)),
    fetchJson("data/literature/tac-pham-ho-chi-minh.json", itemsOf(parsePoem)),
    fetchJson("data/literature/tho-ve-bac.json", itemsOf(parsePoem)),
    fetchJson("data/literature/van-xuoi-ve-bac.json", itemsOf(parseVanXuoi)),
    fetchJson("data/literature/giai-thoai-khoa-bang.json", itemsOf(parseAnecdote)),
    fetchJson("data/literature/lich-su-nuoc-ta.json", parseHcmPoem),
    fetchJson("data/literature/ca-dao-tuc-ngu.json", itemsOf(parseCaDao)),
    fetchJson("data/literature/bai-hat-que-huong.json", itemsOf(parseBaiHat)),
    fetchJson("data/literature/nhat-ky-thu-chien-tranh.json", itemsOf(parsePoem)),
    fetchJson("data/media/ban-do-co.json", itemsOf(parseBanDoCo)),
    fetchJson("data/literature/gioi-thieu-tac-pham.json", itemsOf(parseVanXuoi)),
    fetchJson("data/literature/su-ky-dia-chi.json", itemsOf(parseVanXuoi)),
    fetchJson("data/literature/van-xuoi-hien-thuc-vung-mien.json", itemsOf(parseVanXuoi)),
    // Thêm sau khi nhánh này tách ra: 11 tác phẩm Thơ mới, chủ đề `tho-moi`.
    // Thiếu dòng này thì tab «Thơ mới» không bao giờ hiện dù dữ liệu đã có.
    fetchJson("data/literature/tho-moi-lang-man.json", itemsOf(parseVanXuoi)),
    // Chủ đề «Sách học ngày xưa»: thơ trích ra khỏi sách, và chính các bộ sách.
    fetchJson("data/literature/sgk-xua-tho.json", itemsOf(parsePoem)),
    fetchJson("data/literature/sach-hoc-xua.json", itemsOf(parseVanXuoi)),
  ]);
  literatureCache = {
    chuDe: chuDe?.items ?? [],
    poems: poems?.items ?? [],
    hcmWorks: hcmWorks?.items ?? [],
    aboutHcm: (aboutHcm?.items ?? []).sort((a, b) => (a.xep_hang ?? 99) - (b.xep_hang ?? 99)),
    vanXuoiHcm: vanXuoiHcm?.items ?? [],
    gioiThieu: gioiThieu?.items ?? [],
    suKy: suKy?.items ?? [],
    vanXuoiVungMien: vanXuoiVungMien?.items ?? [],
    thoMoi: thoMoi?.items ?? [],
    anecdotes: anecdotes?.items ?? [],
    hcm,
    caDao: caDao?.items ?? [],
    baiHat: baiHat?.items ?? [],
    tuLieu: tuLieu?.items ?? [],
    thoSgkXua: thoSgkXua?.items ?? [],
    sachHocXua: sachHocXua?.items ?? [],
    banDoCo: banDoCo?.items ?? [],
  };
  return literatureCache;
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. Chuẩn hoá mọi lược đồ về MỘT mục thư viện
// ═══════════════════════════════════════════════════════════════════════════

interface Muc {
  id: string;
  chuDe: string;
  /** Tên hiển thị. Ca dao không có `ten` — lấy dòng đầu của `noi_dung`. */
  ten: string;
  /** Rỗng nghĩa là khuyết danh (ca dao, giai thoại) — không phải thiếu dữ liệu. */
  tacGia: string;
  /** Khoá sắp xếp theo thời gian; null = không suy được. */
  namKhoa: number | null;
  /** Khoá phụ trong cùng năm (số bài Ngục trung nhật ký). */
  namPhu: number;
  /** Chuỗi thời gian NGUYÊN VĂN của dữ liệu — hiện ra, không phải khoá sắp xếp. */
  namNhan: string;
  theLoai: string;
  nhan: string;
  /** Slug tỉnh đã đối chiếu về bộ 34 (2025). */
  tinh: string[];
  xepHang?: number;
  nguon: string[];
  /** Dựng lười: 605 thân bài dựng sẵn là ~1 MB chuỗi cho thứ đọc từng cái một. */
  than: () => string;
}

// ── Suy khoá năm ────────────────────────────────────────────────────────────
// Đo trên dữ liệu thật 2026-08-05: 391/605 mục suy được năm.
//   ca-dao-tuc-ngu (127) và giai-thoai-khoa-bang (30) KHÔNG có trường năm nào —
//   ca dao vô danh và giai thoại khoa bảng vốn không gắn niên đại sáng tác.
//   bai-hat-que-huong chỉ 14/32 có `nam`.
// Trường năm là VĂN XUÔI TỰ DO, không phải số: "1942–1943 — bài 22 trong Ngục
// trung nhật ký…", "Cuối thế kỷ XVIII – đầu thế kỷ XIX", "Kháng chiến chống
// Pháp". Sắp chuỗi thô cho ra thứ tự sai hoàn toàn.
const LA_MA: Record<string, number> = {
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10,
  xi: 11, xii: 12, xiii: 13, xiv: 14, xv: 15, xvi: 16, xvii: 17, xviii: 18,
  xix: 19, xx: 20, xxi: 21,
};

/**
 * Rút một năm dùng làm KHOÁ SẮP XẾP từ các trường thời gian dạng văn xuôi.
 * Không bao giờ ghi ngược vào JSON nguồn và không hiển thị như dữ liệu chính
 * xác — mốc thế kỷ chỉ là xấp xỉ để xếp đúng thứ tự tương đối.
 */
function suyNam(...truong: Array<string | undefined>): number | null {
  const s = truong.filter(Boolean).join(" | ");
  if (!s) return null;
  const nam = /\b(1[0-9]{3}|20[0-2][0-9])\b/.exec(s);
  if (nam) return Number(nam[1]);
  const tk = /th[eế]\s*k[yỷ]\s+([ivxIVX]+)/.exec(s);
  const so = tk ? LA_MA[tk[1].toLowerCase()] : undefined;
  return so === undefined ? null : (so - 1) * 100;
}

// ── Đối chiếu slug tỉnh về bộ 34 (2025) ─────────────────────────────────────
// `lien_quan_tinh` chứa SLUG, không phải tên tỉnh. Đo 2026-08-05: 46 slug khác
// nhau, trong đó 34 khớp bộ 34 tỉnh và 12 KHÔNG khớp:
//   · `tp-hcm` — cách viết thứ hai của chính TP HCM (dữ liệu dùng cả hai);
//   · 11 slug còn lại là tên tỉnh thời 63, đã hợp nhất từ 1/7/2025.
// Bảng dưới suy TRỰC TIẾP từ thuộc tính "Tỉnh thành cũ" của
// public/data/boundaries/vn-34-tinh-2025.geojson — không phải phán đoán.
// Nút vẫn hiện TÊN MỚI, vì đó là tỉnh mà trang hồ sơ đang mô tả.
const SLUG_63_SANG_34: Record<string, string> = {
  "tp-hcm": "thanh-pho-ho-chi-minh",
  "bac-kan": "thai-nguyen",
  "ben-tre": "vinh-long",
  "binh-dinh": "gia-lai",
  "binh-thuan": "lam-dong",
  "ha-giang": "tuyen-quang",
  "hai-duong": "hai-phong",
  "long-an": "tay-ninh",
  "phu-yen": "dak-lak",
  "quang-binh": "quang-tri",
  "quang-nam": "da-nang",
  "thai-binh": "hung-yen",
};

/** slug bộ 34 → tên hiển thị. Suy từ chính geojson 34 tỉnh, giữ đủ dấu. */
const TEN_TINH_34: Record<string, string> = {
  "an-giang": "An Giang", "bac-ninh": "Bắc Ninh", "ca-mau": "Cà Mau",
  "can-tho": "Cần Thơ", "cao-bang": "Cao Bằng", "da-nang": "Đà Nẵng",
  "dak-lak": "Đắk Lắk", "dien-bien": "Điện Biên", "dong-nai": "Đồng Nai",
  "dong-thap": "Đồng Tháp", "gia-lai": "Gia Lai", "ha-noi": "Hà Nội",
  "ha-tinh": "Hà Tĩnh", "hai-phong": "Hải Phòng", hue: "Huế",
  "hung-yen": "Hưng Yên", "khanh-hoa": "Khánh Hòa", "lai-chau": "Lai Châu",
  "lam-dong": "Lâm Đồng", "lang-son": "Lạng Sơn", "lao-cai": "Lào Cai",
  "nghe-an": "Nghệ An", "ninh-binh": "Ninh Bình", "phu-tho": "Phú Thọ",
  "quang-ngai": "Quảng Ngãi", "quang-ninh": "Quảng Ninh", "quang-tri": "Quảng Trị",
  "son-la": "Sơn La", "tay-ninh": "Tây Ninh", "thai-nguyen": "Thái Nguyên",
  "thanh-hoa": "Thanh Hoá", "thanh-pho-ho-chi-minh": "TP HCM",
  "tuyen-quang": "Tuyên Quang", "vinh-long": "Vĩnh Long",
};

/** Đưa danh sách slug về bộ 34, bỏ trùng, bỏ slug không nhận ra. */
function chuanHoaTinh(ds: string[]): string[] {
  const ra = new Set<string>();
  for (const s of ds) {
    const chuan = SLUG_63_SANG_34[s] ?? s;
    if (TEN_TINH_34[chuan]) ra.add(chuan);
  }
  return [...ra];
}

// ── Nhãn ────────────────────────────────────────────────────────────────────
const NHAN_NHOM_HCM: Record<NonNullable<Poem["nhom"]>, string> = {
  nktt: "Ngục trung nhật ký",
  tho: "Thơ",
  "chuc-tet": "Thơ chúc Tết",
  "trung-thu": "Thư & thơ Trung thu",
  van: "Văn chính luận",
  "ton-nghi": "Tồn nghi — chưa xác định tác giả",
};

const CANH_BAO_TON_NGHI =
  "Bài này đăng trên báo Việt Nam Độc Lập — tờ báo do Nguyễn Ái Quốc sáng lập " +
  "và trực tiếp phụ trách — nhưng nguồn ký «Khuyết danh» và danh sách bút danh " +
  "chính thức của Người không có mục nào gắn với chúng. Xếp riêng để giữ lại tư " +
  "liệu mà không nhận nhầm là tác phẩm của Bác.";

const NHAN_LOAI_CA_DAO: Record<CaDao["loai"], string> = {
  "ca-dao": "Ca dao",
  "tuc-ngu": "Tục ngữ",
  ve: "Vè",
  sam: "Sấm",
  // Thành ngữ là CỤM cố định chưa thành câu («ba chìm bảy nổi»); tục ngữ là
  // câu trọn vẹn đúc kết bài học. Khác thể loại thật, không phải hai tên gọi
  // của cùng một thứ — nên đứng riêng chứ không dồn vào «Tục ngữ» cho gọn.
  "thanh-ngu": "Thành ngữ",
};

const NHAN_NHOM_BAN_DO: Record<BanDoCo["nhom"], string> = {
  "viet-nam": "Do người Việt vẽ",
  "phuong-tay": "Do phương Tây vẽ",
  "trung-quoc": "Bản đồ Trung Quốc cổ — cực nam dừng ở đảo Hải Nam",
};

// Hai «chủ đề» KHÔNG có trong _chu-de.json và cố ý như vậy:
//   · ban-do-co.json nằm ở data/media/ (tư liệu chủ quyền, không phải văn học)
//     và không mục nào mang `chu_de`;
//   · tra cứu niên hiệu là một CÔNG CỤ (ô nhập + bảng), không phải tác phẩm.
const CHU_DE_BAN_DO = "tu-lieu-chu-quyen";
const CHU_DE_CONG_CU = "cong-cu-tra-cuu";

/**
 * `lich-su-nuoc-ta.json` là tác phẩm của Bác nhưng file đó KHÔNG có trường
 * `chu_de` (nó là một object đơn, không phải `{items:[]}`). Gán ở lớp giao diện
 * thay vì sửa dữ liệu — quy tắc dự án cấm agent giao diện đụng public/data/.
 */
const CHU_DE_LICH_SU_NUOC_TA = "tac-pham-ho-chi-minh";

// ── Mảnh HTML dùng lại ──────────────────────────────────────────────────────
const dong = (ds: string[]): string => ds.map(esc).join("<br/>");

const nguonHtml = (ds: string[]): string =>
  ds.length
    ? `<div class="lib-nguon"><h4>Nguồn</h4><ul>${ds.map((n) => `<li>${esc(n)}</li>`).join("")}</ul></div>`
    : "";

const canhBaoHtml = (s: string): string => `<p class="lib-canh-bao">${esc(s)}</p>`;

/**
 * Bảng từ khó. Dùng `<details>` chứ không phải tooltip: tooltip đòi hover nên
 * trên điện thoại — thiết bị chính của trẻ con — nó không tồn tại.
 */
const giaiNghiaHtml = (gs?: Array<{ tu: string; nghia: string }>): string =>
  gs?.length
    ? `<details class="lib-giai-nghia"><summary>💡 Từ khó trong bài (${gs.length})</summary>
       <dl>${gs
         .map((g) => `<dt>${esc(g.tu)}</dt><dd>${esc(g.nghia)}</dd>`)
         .join("")}</dl></details>`
    : "";

const banQuyenHtml = (bq: string, dai = false): string =>
  bq === "cited-excerpt"
    ? `<p class="lib-ban-quyen">Bản quyền: tác phẩm còn được bảo hộ — ${
        dai
          ? "mục này chỉ giới thiệu, không chép nội dung. Tìm bản đầy đủ theo nguồn dưới đây."
          : "chỉ trích dẫn ngắn theo Điều 25 Luật Sở hữu trí tuệ."
      }</p>`
    : "";

// ── Chuyển từng lược đồ sang Muc ────────────────────────────────────────────

function mucTuPoem(p: Poem, chuDeMacDinh?: string): Muc {
  return {
    id: p.id,
    chuDe: p.chu_de || chuDeMacDinh || "",
    ten: p.ten,
    tacGia: p.tac_gia,
    namKhoa: suyNam(p.thoi_ky),
    namPhu: p.so_bai ?? 0,
    namNhan: p.thoi_ky,
    theLoai: p.the_loai,
    nhan: p.nhom && p.nhom !== "tho" ? NHAN_NHOM_HCM[p.nhom] : "",
    tinh: chuanHoaTinh(p.lien_quan_tinh),
    xepHang: p.xep_hang,
    nguon: p.sources,
    than: () => `
      ${p.nhom === "ton-nghi" ? canhBaoHtml(CANH_BAO_TON_NGHI) : ""}
      ${p.sach_xua ? `<p class="lib-sach-xua">📕 In trong: ${esc(p.sach_xua)}</p>` : ""}
      ${p.loi_binh ? `<p class="lib-loi-binh">${esc(p.loi_binh)}</p>` : ""}
      ${p.vi_sao_hay ? `<p class="lib-loi-binh"><b>Vì sao được xếp hạng cao:</b> ${esc(p.vi_sao_hay)}</p>` : ""}
      ${p.nguyen_van.length ? `<blockquote class="lib-tho">${dong(p.nguyen_van)}</blockquote>` : ""}
      ${
        p.ban_dich?.length
          ? `<p class="lib-phu">Dịch thơ:</p><blockquote class="lib-tho">${dong(p.ban_dich)}</blockquote>`
          : ""
      }
      ${p.ghi_chu_dich ? `<p class="lib-phu">${esc(p.ghi_chu_dich)}</p>` : ""}
      ${giaiNghiaHtml(p.giai_nghia)}
      ${banQuyenHtml(p.ban_quyen)}`,
  };
}

/** Nhật ký · thư · hồi ký dùng chung lược đồ Poem nhưng `nguyen_van` có thể
 *  rỗng: nhiều hồi ký chỉ tra được nội dung, không tra được nguyên văn trên
 *  nguồn nhà nước. Nói thẳng ra thay vì hiện khối trích rỗng. */
function mucTuTuLieu(t: Poem): Muc {
  const m = mucTuPoem(t);
  m.than = () => `
    ${t.loi_binh ? `<p class="lib-loi-binh">${esc(t.loi_binh)}</p>` : ""}
    ${
      t.nguyen_van.length
        ? `<blockquote class="lib-tho">${dong(t.nguyen_van)}</blockquote>`
        : `<p class="lib-phu">Chưa tra được nguyên văn trên nguồn chính thống — mục này giới thiệu tác phẩm, không trích lời tác giả.</p>`
    }
    ${banQuyenHtml(t.ban_quyen)}`;
  return m;
}

function mucTuVanXuoi(v: VanXuoi): Muc {
  const mo = v.tom_tat || v.gioi_thieu;
  return {
    id: v.id,
    chuDe: v.chu_de,
    ten: v.ten,
    tacGia: v.tac_gia,
    namKhoa: suyNam(v.nam, v.thoi_ky),
    namPhu: 0,
    namNhan: v.nam || v.thoi_ky,
    theLoai: v.the_loai,
    nhan: "",
    tinh: chuanHoaTinh(v.lien_quan_tinh),
    nguon: v.sources,
    than: () => `
      ${v.loi_binh ? `<p class="lib-loi-binh">${esc(v.loi_binh)}</p>` : ""}
      ${mo ? `<p>${esc(mo)}</p>` : ""}
      ${v.ghi_chu ? `<p class="lib-phu">${esc(v.ghi_chu)}</p>` : ""}
      ${banQuyenHtml(v.ban_quyen || "cited-excerpt", true)}`,
  };
}

function mucTuAnecdote(a: Anecdote): Muc {
  return {
    id: a.id,
    chuDe: a.chu_de,
    ten: a.nhan_vat,
    // Giai thoại khoa bảng KHÔNG có tác giả — chúng là chuyện kể dân gian về
    // nhân vật. Để rỗng chứ không mượn `nhan_vat` làm tác giả: đó là hai vai
    // khác nhau, và sắp theo "tác giả" sẽ nói dối người đọc.
    tacGia: "",
    namKhoa: suyNam(a.danh_hieu),
    namPhu: 0,
    namNhan: a.danh_hieu,
    theLoai: "Giai thoại khoa bảng",
    nhan: "",
    tinh: chuanHoaTinh(a.lien_quan_tinh),
    nguon: a.sources,
    than: () => `
      <p class="lib-phu">Quê: ${esc(a.que_quan)}</p>
      ${a.giai_thoai.map((g) => `<p><b>${esc(g.ten)}.</b> ${esc(g.noi_dung)}</p>`).join("")}
      ${a.y_nghia ? `<p class="lib-loi-binh">${esc(a.y_nghia)}</p>` : ""}`,
  };
}

function mucTuCaDao(c: CaDao): Muc {
  const dauDong = c.noi_dung[0] ?? "";
  return {
    id: c.id,
    chuDe: c.chu_de,
    ten: dauDong + (c.noi_dung.length > 1 ? "…" : ""),
    tacGia: "",
    namKhoa: null,
    namPhu: 0,
    namNhan: "",
    theLoai: NHAN_LOAI_CA_DAO[c.loai],
    nhan: "",
    tinh: chuanHoaTinh(c.lien_quan_tinh),
    nguon: c.nguon,
    than: () => `
      <blockquote class="lib-tho">${dong(c.noi_dung)}</blockquote>
      ${
        // Nhãn «Ý nghĩa» chứ không để một đoạn in nghiêng trơ ra: với ca dao,
        // tục ngữ, thành ngữ thì LỜI GIẢI mới là thứ người ta mở mục để đọc,
        // còn câu chữ thì hầu hết đã thuộc. Bỏ in nghiêng vì một đoạn dài in
        // nghiêng tiếng Việt có dấu đọc mỏi mắt.
        c.y_nghia ? `<p class="lib-y-nghia"><b>Ý nghĩa.</b> ${escVan(c.y_nghia)}</p>` : ""
      }
      ${giaiNghiaHtml(c.giai_nghia)}`,
  };
}

function mucTuBaiHat(b: BaiHat): Muc {
  const tacGia = [
    b.tac_gia_nhac ? `Nhạc: ${b.tac_gia_nhac}` : "",
    b.tac_gia_loi && b.tac_gia_loi !== b.tac_gia_nhac ? `Lời: ${b.tac_gia_loi}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  // Chỉ nhúng khi youtube_id đúng dạng 11 ký tự hợp lệ (chặn placeholder
  // "chưa xác thực"). youtube-nocookie để bảo vệ quyền riêng tư.
  const nhungDuoc = /^[A-Za-z0-9_-]{11}$/.test(b.youtube_id);
  return {
    id: b.id,
    chuDe: b.chu_de,
    ten: b.ten,
    tacGia: b.tac_gia_nhac ?? "",
    namKhoa: suyNam(b.nam),
    namPhu: 0,
    namNhan: b.nam ?? "",
    theLoai: b.the_loai ?? "Ca khúc",
    nhan: "",
    tinh: chuanHoaTinh(b.lien_quan_tinh),
    nguon: b.nguon,
    than: () => `
      ${tacGia ? `<p class="lib-phu">${esc(tacGia)}${b.kenh_youtube ? ` · Kênh: ${esc(b.kenh_youtube)}` : ""}</p>` : ""}
      ${b.gioi_thieu ? `<p class="lib-loi-binh">${esc(b.gioi_thieu)}</p>` : ""}
      ${
        nhungDuoc
          ? `<div class="lib-yt"><iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(
              b.youtube_id,
            )}" title="${esc(
              b.ten,
            )}" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`
          : canhBaoHtml(
              "Chưa xác thực video từ kênh chính chủ — chưa nhúng để tránh vi phạm bản quyền.",
            )
      }
      ${b.ban_quyen ? `<p class="lib-ban-quyen">Bản quyền: ${esc(b.ban_quyen)} — chỉ nhúng, không chép lời.</p>` : ""}`,
  };
}

function mucTuBanDo(b: BanDoCo): Muc {
  return {
    id: b.id,
    chuDe: CHU_DE_BAN_DO,
    ten: b.ten,
    tacGia: b.tac_gia,
    namKhoa: suyNam(b.nam_hien_thi),
    namPhu: 0,
    namNhan: b.nam_hien_thi,
    theLoai: "Bản đồ cổ",
    nhan: NHAN_NHOM_BAN_DO[b.nhom],
    tinh: [],
    nguon: b.nguon,
    than: () => `
      <p>${esc(b.mo_ta)}</p>
      ${b.y_nghia_chu_quyen ? `<p class="lib-loi-binh"><b>Ý nghĩa chủ quyền:</b> ${esc(b.y_nghia_chu_quyen)}</p>` : ""}
      ${
        b.anh
          ? `<img class="lib-ban-do-anh" loading="lazy" alt="${esc(b.ten)}" src="${esc(b.anh)}" />
             <p class="lib-phu">${esc(b.anh_giay_phep ?? "")}${b.anh_nguon ? ` · ${esc(b.anh_nguon)}` : ""}</p>`
          : `<p class="lib-phu">Chưa có bản scan dùng được.${b.anh_ghi_chu ? ` ${esc(b.anh_ghi_chu)}` : ""}</p>`
      }
      ${b.noi_luu_giu ? `<p class="lib-phu">Lưu giữ tại: ${esc(b.noi_luu_giu)}</p>` : ""}`,
  };
}

function mucTuHcmPoem(h: HcmPoem): Muc {
  return {
    id: "lich-su-nuoc-ta",
    chuDe: CHU_DE_LICH_SU_NUOC_TA,
    ten: h.ten,
    tacGia: h.tac_gia,
    namKhoa: suyNam(h.nam),
    namPhu: 0,
    namNhan: h.nam,
    theLoai: "Diễn ca lịch sử",
    nhan: "",
    tinh: [],
    nguon: h.sources,
    than: () => `
      <p class="lib-loi-binh">${esc(h.gioi_thieu)}</p>
      <blockquote class="lib-tho">${dong(h.cau_tho)}</blockquote>
      ${
        h.nhung_nam_quan_trong?.length
          ? `<h4>Những năm quan trọng (phụ lục nguyên bản)</h4>
             <blockquote class="lib-tho">${dong(h.nhung_nam_quan_trong)}</blockquote>
             ${h.chu_thich ? `<p class="lib-phu">${esc(h.chu_thich)}</p>` : ""}`
          : ""
      }`,
  };
}

/** Gộp mọi nguồn về một danh sách phẳng đã chuẩn hoá. */
function gomMuc(lib: ThuVienData): Muc[] {
  return [
    ...lib.poems.map((p) => mucTuPoem(p)),
    ...lib.hcmWorks.map((p) => mucTuPoem(p)),
    ...lib.aboutHcm.map((p) => mucTuPoem(p)),
    ...lib.tuLieu.map(mucTuTuLieu),
    ...lib.vanXuoiHcm.map(mucTuVanXuoi),
    ...lib.gioiThieu.map(mucTuVanXuoi),
    ...lib.suKy.map(mucTuVanXuoi),
    ...lib.vanXuoiVungMien.map(mucTuVanXuoi),
    ...lib.thoMoi.map(mucTuVanXuoi),
    ...lib.thoSgkXua.map((p) => mucTuPoem(p)),
    ...lib.sachHocXua.map(mucTuVanXuoi),
    ...lib.anecdotes.map(mucTuAnecdote),
    ...lib.caDao.map(mucTuCaDao),
    ...lib.baiHat.map(mucTuBaiHat),
    ...lib.banDoCo.map(mucTuBanDo),
    ...(lib.hcm ? [mucTuHcmPoem(lib.hcm)] : []),
  ].filter((m) => m.chuDe);
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. Sắp xếp
// ═══════════════════════════════════════════════════════════════════════════

type BoSapXep = "thoi-gian" | "tac-gia" | "ten";

const soSanhChu = (a: string, b: string): number => a.localeCompare(b, "vi");

/**
 * Mục không suy được năm xếp CUỐI chủ đề — 213/605 mục rơi vào nhóm này (ca
 * dao và giai thoại khoa bảng vốn không có niên đại), nên đẩy chúng lên đầu
 * bằng giá trị 0 sẽ làm hỏng cả danh sách.
 */
function sapXep(ds: Muc[], bo: BoSapXep): Muc[] {
  const ra = [...ds];
  if (bo === "ten") {
    ra.sort((a, b) => soSanhChu(a.ten, b.ten));
  } else if (bo === "tac-gia") {
    ra.sort(
      (a, b) =>
        Number(!a.tacGia) - Number(!b.tacGia) ||
        soSanhChu(a.tacGia, b.tacGia) ||
        soSanhChu(a.ten, b.ten),
    );
  } else {
    ra.sort(
      (a, b) =>
        Number(a.namKhoa === null) - Number(b.namKhoa === null) ||
        (a.namKhoa ?? 0) - (b.namKhoa ?? 0) ||
        a.namPhu - b.namPhu ||
        soSanhChu(a.ten, b.ten),
    );
  }
  return ra;
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. Tuỳ chỉnh đọc + localStorage
// ═══════════════════════════════════════════════════════════════════════════

const KHOA_DOC = "bkvn.thuvien.doc";
const KHOA_SAP_XEP = "bkvn.thuvien.sap-xep";

interface TuyChinh {
  coChu: "b1" | "b2" | "b3" | "b4" | "b5";
  giaiDong: "gon" | "vua" | "rong" | "rat-rong";
  nen: "mac-dinh" | "nga" | "toi";
  phong: "khong-chan" | "co-chan";
  cotRong: "hep" | "vua" | "rong";
  coCuaSo: "chuan" | "rong" | "toan";
  cheDoDoc: "cuon" | "lat";
}

const MAC_DINH: TuyChinh = {
  coChu: "b2",
  giaiDong: "vua",
  nen: "mac-dinh",
  phong: "khong-chan",
  cotRong: "vua",
  coCuaSo: "chuan",
  cheDoDoc: "cuon",
};

const HOP_LE: { [K in keyof TuyChinh]: readonly TuyChinh[K][] } = {
  coChu: ["b1", "b2", "b3", "b4", "b5"],
  giaiDong: ["gon", "vua", "rong", "rat-rong"],
  nen: ["mac-dinh", "nga", "toi"],
  phong: ["khong-chan", "co-chan"],
  cotRong: ["hep", "vua", "rong"],
  coCuaSo: ["chuan", "rong", "toan"],
  cheDoDoc: ["cuon", "lat"],
};

/** Đọc/ghi theo đúng khuôn phòng thủ của chedo.ts: hỏng thì dùng mặc định,
 *  không bao giờ throw (localStorage bị chặn ở chế độ riêng tư là chuyện
 *  bình thường, không phải lỗi). */
function docTuyChinh(): TuyChinh {
  const ra = { ...MAC_DINH };
  try {
    const raw = localStorage.getItem(KHOA_DOC);
    if (!raw) return ra;
    const o = rec(JSON.parse(raw) as unknown);
    for (const k of Object.keys(HOP_LE) as Array<keyof TuyChinh>)
      ra[k] = oneOf(o[k], HOP_LE[k], MAC_DINH[k]) as never;
  } catch {
    // JSON hỏng hoặc localStorage bị chặn — dùng mặc định.
  }
  return ra;
}

function ghiTuyChinh(t: TuyChinh): void {
  try {
    localStorage.setItem(KHOA_DOC, JSON.stringify({ v: 1, ...t }));
  } catch {
    // Không ghi được thì lựa chọn chỉ sống trong phiên này.
  }
}

function docSapXep(): BoSapXep {
  try {
    return oneOf(localStorage.getItem(KHOA_SAP_XEP), ["thoi-gian", "tac-gia", "ten"] as const, "thoi-gian");
  } catch {
    return "thoi-gian";
  }
}

function ghiSapXep(b: BoSapXep): void {
  try {
    localStorage.setItem(KHOA_SAP_XEP, b);
  } catch {
    // như trên
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. Tra cứu niên hiệu (công cụ, không phải tác phẩm)
// ═══════════════════════════════════════════════════════════════════════════

interface NienHieuItem {
  trieu_dai: string;
  vua?: string;
  nien_hieu: string | null;
  tu_nam: number;
  den_nam: number;
  ghi_chu?: string;
}

/** `tu_nam`/`den_nam` giữ SỐ: dùng để so khoảng năm, không hiển thị thô. */
const parseNienHieuItem = (raw: unknown): NienHieuItem => {
  const r = rec(raw);
  return {
    trieu_dai: str(r.trieu_dai),
    vua: str(r.vua),
    nien_hieu: typeof r.nien_hieu === "string" ? r.nien_hieu : null,
    tu_nam: num(r.tu_nam) ?? 0,
    den_nam: num(r.den_nam) ?? 0,
    ghi_chu: str(r.ghi_chu),
  };
};

let nienHieuCache: { items: NienHieuItem[]; nguon?: string[] } | null | undefined;

function congCuHtml(): string {
  return `
    <h3>Tra cứu niên hiệu theo năm</h3>
    <p class="lib-phu">Nhập một năm dương lịch để xem niên hiệu, triều đại và vị vua đương thời.</p>
    <div class="lib-nh-box">
      <label for="nh-year">Năm dương lịch (năm âm = trước Công nguyên, ví dụ −200; tới 1945)</label>
      <div class="lib-nh-hang">
        <input id="nh-year" type="number" min="-2879" max="1945" inputmode="numeric" />
        <button id="nh-btn" type="button">Tra cứu</button>
      </div>
      <div id="nh-result" aria-live="polite"></div>
    </div>`;
}

function noiCongCu(goc: HTMLElement): void {
  const btn = goc.querySelector<HTMLButtonElement>("#nh-btn");
  const result = goc.querySelector<HTMLElement>("#nh-result");
  if (!btn || !result) return;
  const tra = async (): Promise<void> => {
    const input = goc.querySelector<HTMLInputElement>("#nh-year");
    const year = Number(input?.value);
    if (!Number.isInteger(year) || year === 0 || year < -2879 || year > 1945) {
      result.innerHTML = `<p class="lib-phu">Vui lòng nhập một năm từ −2879 (2879 TCN) đến 1945 (không có năm 0).</p>`;
      return;
    }
    if (nienHieuCache === undefined)
      nienHieuCache = await fetchJson("data/timeline/nien-hieu.json", (raw) => ({
        items: arr(rec(raw).items, parseNienHieuItem),
        nguon: strs(rec(raw).nguon),
      }));
    if (!nienHieuCache) {
      result.innerHTML = canhBaoHtml("Chưa tải được dữ liệu niên hiệu — vui lòng thử lại sau.");
      return;
    }
    const all = nienHieuCache.items.filter((i) => year >= i.tu_nam && year <= i.den_nam);
    // Mục "thời kỳ" (không niên hiệu) chỉ hiện khi năm đó không có niên hiệu thật.
    const named = all.filter((i) => i.nien_hieu);
    const hits = named.length ? named : all;
    const nam = (y: number): string => (y < 0 ? `${-y} TCN` : String(y));
    result.innerHTML = hits.length
      ? `<table class="lib-bang">${hits
          .map(
            (i) =>
              `<tr><th>${esc(i.nien_hieu ?? "(không niên hiệu)")}</th><td>${esc(i.trieu_dai)}${
                i.vua ? ` · ${esc(i.vua)}` : ""
              } · ${nam(i.tu_nam)}–${nam(i.den_nam)}${
                i.ghi_chu ? `<br/><span class="lib-phu">${esc(i.ghi_chu)}</span>` : ""
              }</td></tr>`,
          )
          .join("")}</table>
        <p class="lib-phu">Nguồn: ${(nienHieuCache.nguon ?? []).map(esc).join(" · ")}</p>`
      : `<p class="lib-phu">Không tìm thấy niên hiệu cho năm ${nam(year)}.</p>`;
  };
  btn.addEventListener("click", () => void tra());
  goc.querySelector<HTMLInputElement>("#nh-year")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") void tra();
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. Khối «văn thơ gắn với vùng đất» của TRANG TỈNH
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Trang tỉnh dùng lại đúng bộ renderer của thư viện. Trước đây main.ts gọi
 * thẳng 4 hàm `poemHtml`/`anecdoteHtml`/`caDaoHtml`/`baiHatHtml`; giờ chỉ còn
 * một lời gọi và main.ts không phải biết lược đồ văn thơ nữa.
 *
 * @param lib  kết quả `loadLiterature()` (đã cache).
 * @param slug slug tỉnh trong bộ 34.
 */
export function htmlVanThoTinh(lib: ThuVienData, slug: string): string {
  const muc = gomMuc(lib).filter((m) => m.chuDe !== CHU_DE_BAN_DO && m.tinh.includes(slug));
  if (!muc.length) return "";
  return `<details class="profile-section" open><summary>📖 Văn thơ, ca dao & bài hát gắn với vùng đất này (${muc.length})</summary>
    <div class="lib-tinh-ds">${sapXep(muc, "thoi-gian")
      .map(
        (m) => `<article class="lib-tinh-muc">
          <h4>${esc(m.ten)}</h4>
          <p class="lib-phu">${[m.tacGia, m.namNhan, m.theLoai].filter(Boolean).map(esc).join(" · ")}</p>
          ${m.than()}
          ${nguonHtml(m.nguon)}
        </article>`,
      )
      .join("")}</div>
  </details>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. Màn thư viện
// ═══════════════════════════════════════════════════════════════════════════

interface KhoiChuDe {
  id: string;
  ten: string;
  moTa: string;
  muc: Muc[];
  /** Bật ô «sắp theo tác giả». Ca dao và giai thoại khoa bảng khuyết danh
   *  toàn bộ (đo: 0/127 và 0/30 mục có tác giả) — bày ô đó ra là mời người
   *  dùng bấm vào một bộ sắp xếp không sắp gì cả. */
  coTacGia: boolean;
}

let khoiChuDe: KhoiChuDe[] = [];
let chuDeDangXem = "";
let tuyChinh = docTuyChinh();
let boSapXep = docSapXep();
let mucDangDoc: Muc | null = null;
let goJumpTinh: ((slug: string) => void) | null = null;
/** Huỷ listener của khung lật trang trước khi dựng lại khung đọc. */
let doNhipTrang: (() => void) | null = null;

const giamChuyenDong = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function dungKhoiChuDe(lib: ThuVienData): KhoiChuDe[] {
  const muc = gomMuc(lib);
  const theoChuDe = new Map<string, Muc[]>();
  for (const m of muc) {
    const ds = theoChuDe.get(m.chuDe);
    if (ds) ds.push(m);
    else theoChuDe.set(m.chuDe, [m]);
  }
  // Thứ tự tab theo _chu-de.json (thứ tự biên tập), rồi tới hai tab phụ.
  const ra: KhoiChuDe[] = [];
  for (const cd of lib.chuDe) {
    const ds = theoChuDe.get(cd.id);
    // Chủ đề rỗng KHÔNG dựng tab: `tho-moi` hiện chưa có mục nào (đo
    // 2026-08-05), và một tab bấm vào ra danh sách trắng là lỗi giao diện.
    // Khi dữ liệu có mục đầu tiên, tab tự xuất hiện — không phải sửa mã.
    if (ds?.length) ra.push({ id: cd.id, ten: cd.ten, moTa: cd.mo_ta, muc: ds, coTacGia: ds.some((m) => m.tacGia) });
  }
  const banDo = theoChuDe.get(CHU_DE_BAN_DO);
  if (banDo?.length)
    ra.push({
      id: CHU_DE_BAN_DO,
      ten: "Tư liệu chủ quyền — bản đồ cổ",
      moTa: "Bản đồ cổ do người Việt, phương Tây và chính Trung Quốc vẽ — ba tuyến chứng cứ độc lập về chủ quyền Hoàng Sa – Trường Sa.",
      muc: banDo,
      coTacGia: true,
    });
  return ra;
}

// ── Danh sách ───────────────────────────────────────────────────────────────

function hangHtml(m: Muc, i: number): string {
  const tinh = m.tinh
    .map(
      (s) =>
        `<button type="button" class="lib-tp-tinh" data-jump-tinh="${esc(s)}">${esc(
          TEN_TINH_34[s] ?? s,
        )}</button>`,
    )
    .join("");
  const phu = [
    m.tacGia,
    m.namNhan ? m.namNhan.split(/\s+[—–-]\s+/)[0] : "",
    m.theLoai,
    m.nhan,
  ]
    .filter(Boolean)
    .map(esc);
  return `<li class="lib-hang">
    <button type="button" class="lib-hang-mo" data-muc="${esc(m.id)}">
      <span class="lib-hang-so">${i + 1}</span>
      <span class="lib-hang-chinh">
        <span class="lib-hang-ten">${
          m.xepHang ? `<span class="lib-hang-hang">Hạng ${esc(String(m.xepHang))}</span> ` : ""
        }${esc(m.ten)}</span>
        <span class="lib-hang-phu">${phu.join(" · ")}${
          boSapXep === "thoi-gian" && m.namKhoa === null
            ? `<span class="lib-hang-thieu">chưa xác định năm</span>`
            : ""
        }</span>
      </span>
    </button>
    ${tinh ? `<span class="lib-hang-tinh"><span class="lib-hang-tinh-nhan">Vùng đất:</span>${tinh}</span>` : ""}
  </li>`;
}

function danhSachHtml(): string {
  const khoi = khoiChuDe.find((k) => k.id === chuDeDangXem);
  const tong = khoiChuDe.reduce((n, k) => n + k.muc.length, 0);
  const tabs = [
    ...khoiChuDe.map(
      (k) =>
        `<button type="button" class="lib-tab${k.id === chuDeDangXem ? " lib-tab-chon" : ""}"
           data-chu-de="${esc(k.id)}" aria-pressed="${k.id === chuDeDangXem}">${esc(k.ten)}
           <span class="lib-tab-so">${k.muc.length}</span></button>`,
    ),
    `<button type="button" class="lib-tab${chuDeDangXem === CHU_DE_CONG_CU ? " lib-tab-chon" : ""}"
       data-chu-de="${CHU_DE_CONG_CU}" aria-pressed="${chuDeDangXem === CHU_DE_CONG_CU}">Công cụ tra cứu</button>`,
  ].join("");

  // Bộ sắp xếp THẬT SỰ đang áp dụng. Chủ đề khuyết danh toàn bộ mà lựa chọn
  // đã lưu là «tác giả» thì phải rơi về «thời gian» — và ô chọn cũng phải hiện
  // đúng «thời gian», nếu không giao diện nói một đằng, danh sách xếp một nẻo.
  const boThat: BoSapXep =
    boSapXep === "tac-gia" && khoi && !khoi.coTacGia ? "thoi-gian" : boSapXep;

  const than =
    chuDeDangXem === CHU_DE_CONG_CU
      ? `<div class="lib-cong-cu">${congCuHtml()}</div>`
      : khoi
        ? `<p class="lib-chu-de-mo-ta">${esc(khoi.moTa)}</p>
           <ol class="lib-ds">${sapXep(khoi.muc, boThat).map(hangHtml).join("")}</ol>`
        : `<p class="lib-phu">Chưa có tác phẩm nào trong chủ đề này.</p>`;

  const anSapXep = chuDeDangXem === CHU_DE_CONG_CU;
  return `
    <div class="lib-list">
      <header class="lib-head">
        <div>
          <h2>Thư viện</h2>
          <p class="lib-phu">${tong} tác phẩm · ${khoiChuDe.length} chủ đề</p>
        </div>
        ${
          anSapXep
            ? ""
            : `<label class="lib-sap-xep">Sắp theo
                 <select id="lib-sap-xep">
                   <option value="thoi-gian"${boThat === "thoi-gian" ? " selected" : ""}>Thời gian</option>
                   <option value="tac-gia"${boThat === "tac-gia" ? " selected" : ""}${
                     khoi?.coTacGia ? "" : " disabled"
                   }>Tác giả${khoi?.coTacGia ? "" : " (chủ đề này khuyết danh)"}</option>
                   <option value="ten"${boThat === "ten" ? " selected" : ""}>Tên tác phẩm</option>
                 </select>
               </label>`
        }
      </header>
      <nav class="lib-tabs" aria-label="Chủ đề">${tabs}</nav>
      ${than}
    </div>`;
}

// ── Khung đọc ───────────────────────────────────────────────────────────────

const NHOM_TUY_CHINH: Array<{
  khoa: keyof TuyChinh;
  nhan: string;
  chon: Array<[string, string]>;
}> = [
  { khoa: "coChu", nhan: "Cỡ chữ", chon: [["b1", "Rất nhỏ"], ["b2", "Nhỏ"], ["b3", "Vừa"], ["b4", "Lớn"], ["b5", "Rất lớn"]] },
  { khoa: "giaiDong", nhan: "Giãn dòng", chon: [["gon", "Gọn"], ["vua", "Vừa"], ["rong", "Rộng"], ["rat-rong", "Rất rộng"]] },
  { khoa: "nen", nhan: "Nền đọc", chon: [["mac-dinh", "Mặc định"], ["nga", "Ngà"], ["toi", "Tối"]] },
  { khoa: "phong", nhan: "Phông chữ", chon: [["khong-chan", "Không chân"], ["co-chan", "Có chân"]] },
  { khoa: "cotRong", nhan: "Bề rộng cột", chon: [["hep", "Hẹp"], ["vua", "Vừa"], ["rong", "Rộng"]] },
  { khoa: "coCuaSo", nhan: "Kích cỡ cửa sổ", chon: [["chuan", "Chuẩn"], ["rong", "Rộng"], ["toan", "Toàn màn hình"]] },
];

function tuyChinhHtml(): string {
  return NHOM_TUY_CHINH.map(
    (n) => `<fieldset class="lib-tc-nhom">
      <legend>${esc(n.nhan)}</legend>
      <div class="lib-tc-nut">${n.chon
        .map(
          ([v, nhan]) =>
            `<button type="button" class="lib-tc-btn${tuyChinh[n.khoa] === v ? " lib-tc-chon" : ""}"
               data-tc="${esc(n.khoa)}" data-gia-tri="${esc(v)}"
               aria-pressed="${tuyChinh[n.khoa] === v}">${esc(nhan)}</button>`,
        )
        .join("")}</div>
    </fieldset>`,
  ).join("");
}

function khungDocHtml(m: Muc): string {
  const tinh = m.tinh
    .map(
      (s) =>
        `<button type="button" class="lib-tp-tinh" data-jump-tinh="${esc(s)}">${esc(
          TEN_TINH_34[s] ?? s,
        )}</button>`,
    )
    .join("");
  const meta = [m.tacGia, m.namNhan, m.theLoai, m.nhan].filter(Boolean).map(esc).join(" · ");
  return `
    <div class="lib-doc" data-nen="${esc(tuyChinh.nen)}" data-phong="${esc(tuyChinh.phong)}"
         data-co-chu="${esc(tuyChinh.coChu)}" data-giai-dong="${esc(tuyChinh.giaiDong)}"
         data-cot="${esc(tuyChinh.cotRong)}" data-che-do-doc="${esc(tuyChinh.cheDoDoc)}">
      <header class="lib-doc-dau">
        <button type="button" class="lib-doc-ve">← Quay lại danh sách</button>
        <div class="lib-doc-mode" role="group" aria-label="Chế độ đọc">
          <button type="button" class="lib-mode-btn${tuyChinh.cheDoDoc === "cuon" ? " lib-mode-chon" : ""}"
            data-mode="cuon" aria-pressed="${tuyChinh.cheDoDoc === "cuon"}">Cuộn</button>
          <button type="button" class="lib-mode-btn${tuyChinh.cheDoDoc === "lat" ? " lib-mode-chon" : ""}"
            data-mode="lat" aria-pressed="${tuyChinh.cheDoDoc === "lat"}">Lật trang</button>
        </div>
        <details class="lib-tc">
          <summary>Tuỳ chỉnh</summary>
          <div class="lib-tc-than">${tuyChinhHtml()}</div>
        </details>
      </header>
      <div class="lib-doc-than">
        <h3 class="lib-doc-ten">${esc(m.ten)}</h3>
        ${meta ? `<p class="lib-doc-meta">${meta}</p>` : ""}
        <div class="lib-doc-khung">
          <div class="lib-doc-chu">
            ${m.than()}
            ${tinh ? `<p class="lib-doc-tinh"><span class="lib-hang-tinh-nhan">Vùng đất liên quan:</span>${tinh}</p>` : ""}
            ${nguonHtml(m.nguon)}
          </div>
        </div>
      </div>
      <nav class="lib-doc-trang" aria-label="Điều hướng trang"${tuyChinh.cheDoDoc === "lat" ? "" : " hidden"}>
        <button type="button" class="lib-trang-truoc" aria-label="Trang trước">‹</button>
        <span class="lib-trang-so" aria-live="polite">Trang 1/1</span>
        <button type="button" class="lib-trang-sau" aria-label="Trang sau">›</button>
      </nav>
    </div>`;
}

// ── Chế độ lật trang: cột CSS + cuộn ngang ──────────────────────────────────
//
// 🔴 `column-fill` mặc định là `balance` — nó cân đều độ dài toàn văn bản qua
// mọi cột, cho ra một khối thấp thay vì các trang đầy. Phải đặt `auto` KÈM
// chiều cao cố định cho khung (cả hai nằm ở thuvien.css).
//
// KHÔNG chia nội dung thành `<div class="trang-N">`: cột CSS chạy trên MỘT
// khối liên tục, chia bằng DOM là vỡ thứ tự đọc của trình đọc màn hình.
//
// ⚠️ Cột CSS không tạo được điểm neo cho `scroll-snap`: các column box không
// phải phần tử DOM nên không gắn `scroll-snap-align` được. Đặc tả gốc đề xuất
// snap — đo lại thì không khả thi mà không chia DOM (điều chính đặc tả cấm).
// Dùng `scrollTo` tường minh thay thế; vuốt/cuộn ngang tự nhiên vẫn chạy và
// bộ đếm trang bám theo.
function noiLatTrang(goc: HTMLElement): void {
  const khung = goc.querySelector<HTMLElement>(".lib-doc-khung");
  const chu = goc.querySelector<HTMLElement>(".lib-doc-chu");
  const truoc = goc.querySelector<HTMLButtonElement>(".lib-trang-truoc");
  const sau = goc.querySelector<HTMLButtonElement>(".lib-trang-sau");
  const nhanSo = goc.querySelector<HTMLElement>(".lib-trang-so");
  if (!khung || !chu || !truoc || !sau || !nhanSo) return;

  // Bước cuộn CHÍNH XÁC. Với n cột lọt trong khung: W = n·cột + (n−1)·khe, nên
  // n·(cột + khe) = W + khe. Bước là W + khe bất kể n — không cần biết bề rộng
  // cột thật (trình duyệt tự tính từ `column-width`).
  const khe = (): number => {
    const v = parseFloat(getComputedStyle(chu).columnGap);
    return Number.isFinite(v) ? v : 0;
  };
  const buoc = (): number => khung.clientWidth + khe();
  const soTrang = (): number => Math.max(1, Math.ceil((khung.scrollWidth + khe()) / buoc()));

  /**
   * Trang ĐANG CUỘN TỚI; null khi khung đã đứng yên.
   *
   * Cuộn mượt mất vài trăm ms. Nếu Trước/Sau tính trang từ `scrollLeft` tức
   * thời thì cú bấm thứ hai đọc được vị trí giữa đường và nhảy sai — bấm Sau
   * hai lần liền chỉ sang một trang. Giữ đích tường minh, rồi để sự kiện
   * scroll xác nhận lại khi tới nơi.
   */
  let trangDich: number | null = null;

  const trangTheoScroll = (): number =>
    Math.min(soTrang() - 1, Math.max(0, Math.round(khung.scrollLeft / buoc())));
  const trangHienTai = (): number => trangDich ?? trangTheoScroll();

  let daHien = -1;
  const veNhan = (): void => {
    const t = trangHienTai();
    const n = soTrang();
    truoc.disabled = t <= 0;
    sau.disabled = t >= n - 1;
    // aria-live chỉ được đọc lại khi SỐ TRANG đổi — cập nhật theo từng tick
    // scroll sẽ khiến trình đọc màn hình nói liên tục.
    if (t === daHien) return;
    daHien = t;
    nhanSo.textContent = `Trang ${t + 1}/${n}`;
  };

  const den = (t: number): void => {
    const dich = Math.min(soTrang() - 1, Math.max(0, t));
    trangDich = dich;
    // 🔴 Cuộn THẬT, không tween tay bằng rAF: luật giảm-chuyển-động toàn cục
    // chỉ bắt transition/animation CSS, một vòng lặp rAF tự viết sẽ lọt lưới.
    khung.scrollTo({ left: dich * buoc(), behavior: giamChuyenDong() ? "auto" : "smooth" });
    veNhan();
  };

  let cho = 0;
  const khiCuon = (): void => {
    if (cho) return;
    cho = requestAnimationFrame(() => {
      cho = 0;
      // Tới đích (hoặc chạm biên cuộn) thì nhả quyền lại cho vị trí thật —
      // người dùng vuốt tay hay lăn chuột ngang cũng phải cập nhật được số trang.
      if (trangDich !== null) {
        const conLai = Math.abs(khung.scrollLeft - trangDich * buoc());
        const chamBien = khung.scrollLeft >= khung.scrollWidth - khung.clientWidth - 1;
        if (conLai < 2 || chamBien) trangDich = null;
      }
      veNhan();
    });
  };

  const khiPhim = (e: KeyboardEvent): void => {
    if (goc.dataset.cheDoDoc !== "lat") return;
    // Không cướp phím của ô nhập (công cụ tra niên hiệu nằm ở màn khác nhưng
    // khung đọc vẫn có thể chứa iframe/nút).
    const dich = e.target as HTMLElement | null;
    if (dich?.closest("input, textarea, select")) return;
    if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      den(trangHienTai() - 1);
    } else if (e.key === "ArrowRight" || e.key === "PageDown") {
      e.preventDefault();
      den(trangHienTai() + 1);
    }
  };

  truoc.addEventListener("click", () => den(trangHienTai() - 1));
  sau.addEventListener("click", () => den(trangHienTai() + 1));
  khung.addEventListener("scroll", khiCuon, { passive: true });
  goc.addEventListener("keydown", khiPhim);

  // Đổi cỡ chữ / bề rộng cột / kích cỡ cửa sổ đều làm số trang đổi.
  const theoDoi = new ResizeObserver(() => {
    trangDich = null;
    daHien = -1;
    veNhan();
  });
  theoDoi.observe(khung);
  theoDoi.observe(chu);

  doNhipTrang = () => {
    theoDoi.disconnect();
    khung.removeEventListener("scroll", khiCuon);
    goc.removeEventListener("keydown", khiPhim);
    if (cho) cancelAnimationFrame(cho);
  };
  veNhan();
}

// ── Vẽ ──────────────────────────────────────────────────────────────────────

function apCoCuaSo(): void {
  const panel = document.getElementById("library-panel");
  if (panel) panel.dataset.coCuaSo = tuyChinh.coCuaSo;
}

function veDanhSach(): void {
  const goc = document.getElementById("library-content");
  if (!goc) return;
  doNhipTrang?.();
  doNhipTrang = null;
  mucDangDoc = null;
  goc.innerHTML = danhSachHtml();
  if (chuDeDangXem === CHU_DE_CONG_CU) noiCongCu(goc);
  goc.querySelector<HTMLSelectElement>("#lib-sap-xep")?.addEventListener("change", (e) => {
    boSapXep = oneOf(
      (e.target as HTMLSelectElement).value,
      ["thoi-gian", "tac-gia", "ten"] as const,
      "thoi-gian",
    );
    ghiSapXep(boSapXep);
    veDanhSach();
  });
}

function veKhungDoc(m: Muc): void {
  const goc = document.getElementById("library-content");
  if (!goc) return;
  doNhipTrang?.();
  doNhipTrang = null;
  mucDangDoc = m;
  goc.innerHTML = khungDocHtml(m);
  const doc = goc.querySelector<HTMLElement>(".lib-doc");
  if (!doc) return;
  doc.tabIndex = -1;
  doc.focus({ preventScroll: true });
  if (tuyChinh.cheDoDoc === "lat") noiLatTrang(doc);
}

/** Áp lại tuỳ chỉnh mà KHÔNG dựng lại DOM — giữ nguyên vị trí đọc. */
function apTuyChinh(): void {
  const doc = document.querySelector<HTMLElement>(".lib-doc");
  apCoCuaSo();
  if (!doc) return;
  doc.dataset.nen = tuyChinh.nen;
  doc.dataset.phong = tuyChinh.phong;
  doc.dataset.coChu = tuyChinh.coChu;
  doc.dataset.giaiDong = tuyChinh.giaiDong;
  doc.dataset.cot = tuyChinh.cotRong;
  doc
    .querySelectorAll<HTMLButtonElement>(".lib-tc-btn")
    .forEach((b) => {
      const chon = tuyChinh[b.dataset.tc as keyof TuyChinh] === b.dataset.giaTri;
      b.classList.toggle("lib-tc-chon", chon);
      b.setAttribute("aria-pressed", String(chon));
    });
}

function doiCheDoDoc(moi: TuyChinh["cheDoDoc"]): void {
  tuyChinh.cheDoDoc = moi;
  ghiTuyChinh(tuyChinh);
  // Dựng lại khung đọc: đổi giữa cuộn dọc và cột ngang là đổi hẳn hộp bố cục,
  // không phải đổi một thuộc tính.
  if (mucDangDoc) veKhungDoc(mucDangDoc);
}

// ── Uỷ quyền sự kiện ────────────────────────────────────────────────────────

function noiSuKien(goc: HTMLElement): void {
  goc.addEventListener("click", (e) => {
    const t = e.target as HTMLElement | null;
    if (!t) return;

    const tinh = t.closest<HTMLElement>("[data-jump-tinh]");
    if (tinh?.dataset.jumpTinh) {
      goJumpTinh?.(tinh.dataset.jumpTinh);
      return;
    }

    const tab = t.closest<HTMLElement>("[data-chu-de]");
    if (tab?.dataset.chuDe) {
      chuDeDangXem = tab.dataset.chuDe;
      veDanhSach();
      return;
    }

    const mo = t.closest<HTMLElement>("[data-muc]");
    if (mo?.dataset.muc) {
      const m = khoiChuDe.flatMap((k) => k.muc).find((x) => x.id === mo.dataset.muc);
      if (m) veKhungDoc(m);
      return;
    }

    if (t.closest(".lib-doc-ve")) {
      veDanhSach();
      return;
    }

    const mode = t.closest<HTMLElement>("[data-mode]");
    if (mode?.dataset.mode) {
      doiCheDoDoc(mode.dataset.mode === "lat" ? "lat" : "cuon");
      return;
    }

    const tc = t.closest<HTMLElement>("[data-tc]");
    if (tc?.dataset.tc && tc.dataset.giaTri) {
      const khoa = tc.dataset.tc as keyof TuyChinh;
      tuyChinh[khoa] = tc.dataset.giaTri as never;
      ghiTuyChinh(tuyChinh);
      apTuyChinh();
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. Khởi tạo
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @param moTinh Mở hồ sơ một tỉnh trong bộ 34 theo slug. main.ts giữ hàm này
 *   vì nó cần `map`, `ERAS` và `showProvincePanel` — thư viện chỉ phát tín hiệu.
 */
export function initThuVien(moTinh: (slug: string) => void): void {
  goJumpTinh = moTinh;
  const goc = document.getElementById("library-content");
  if (goc) noiSuKien(goc);

  document.getElementById("library-btn")?.addEventListener("click", () => void moThuVien());
  document.getElementById("library-close")?.addEventListener("click", () => {
    const panel = document.getElementById("library-panel");
    if (panel) panel.hidden = true;
  });
}

async function moThuVien(): Promise<void> {
  const panel = document.getElementById("library-panel");
  const goc = document.getElementById("library-content");
  if (!panel || !goc) return;
  // showOnly() ẩn cả 11 panel đã đăng ký — mở Thư viện khi đang mở Nam tiến
  // hay Sa đồ trước đây là hai panel chồng nhau.
  showOnly("library-panel");
  apCoCuaSo();
  if (khoiChuDe.length) return; // đã dựng: giữ nguyên chỗ người dùng đang đọc
  goc.innerHTML = `<p class="lib-phu">Đang tải thư viện…</p>`;
  const lib = await loadLiterature();
  khoiChuDe = dungKhoiChuDe(lib);
  chuDeDangXem = khoiChuDe[0]?.id ?? CHU_DE_CONG_CU;
  veDanhSach();
}
