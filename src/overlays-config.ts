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
import { dungPopup, escVan, escVanKho } from "./popup-noi-dung";
import { str, num, oneOf, rec, arr, strs } from "./types/parse";
import { esc, anhCommonsNho } from "./util/html";

/**
 * Dải cảnh báo khi toạ độ chưa được xác minh ở mức "cao".
 *
 * Trước đây lặp nguyên văn 9 lần trong các hàm dựng popup, khác nhau đúng một
 * cụm danh từ. `doiTuong` giữ lại chính cụm đó để chữ hiển thị không đổi: mỗi
 * lớp nói rõ toạ độ NÀO đang được cảnh báo (nơi thờ, quê, đền/đình…), và đó là
 * thông tin thật chứ không phải dị bản ngẫu nhiên.
 */
const canhBaoToaDo = (muc: string, doiTuong = "Toạ độ"): string =>
  muc && muc !== "cao" ? `⚠️ ${doiTuong} độ tin cậy ${mucTinCay(muc)} — đang soát` : "";

/**
 * Slug độ tin cậy → chữ đọc được.
 *
 * Dữ liệu ghi bốn cách cho hai mức: `trung` 2.205 · `thap` 827 · `trung-binh`
 * 101 · `thấp` 4 (đếm 2026-08-28, chưa kể 979 mục «cao» không hiện cảnh báo).
 * Ba cách đầu in thẳng ra là tiếng Việt mất dấu trên 3.133 popup. Bảng nằm ở
 * lớp trình bày chứ không sửa dữ liệu: bốn agent đang ghi sống vào
 * `public/data/overlays/`, và dù có chuẩn hoá dữ liệu thì việc gộp hai cách
 * viết của CÙNG một mức vẫn phải làm ở đây.
 *
 * Giá trị lạ giữ nguyên — mất chữ thì không ai biết là mất.
 */
const MUC_TIN_CAY: Record<string, string> = {
  trung: "trung bình",
  "trung-binh": "trung bình",
  thap: "thấp",
  thấp: "thấp",
};
const mucTinCay = (muc: string): string => MUC_TIN_CAY[muc] ?? muc;

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
  /**
   * `"tam-xa"`: toạ độ là tâm đơn vị cấp xã (`don_vi_neo`), không phải vị trí
   * thật — chủ dự án duyệt 2026-09-23 cho mục đủ nguồn mà thiếu toạ độ, BẮT
   * BUỘC kèm nhãn. Trường riêng chứ không dựa `do_tin_cay_toa_do: "thap"`:
   * 832 mục cũ mang «thap» với toạ độ thật, đổi kiểu theo nó là đổi nhầm.
   */
  phuong_phap_toa_do: string;
  don_vi_neo: string;
  // ── Trường nằm im trong dữ liệu, không lớp nào đọc tới (rà 2026-08-28) ────
  // 13 trường dưới đây có thật trong `public/data/overlays/*.json` nhưng `grep`
  // cả `src/` ra 0 lần nhắc tên chúng: không phải render sai, mà là chưa bao
  // giờ được dựng. Khai `string` kể cả `nam_sinh`/`nam_mat` vốn là SỐ trong
  // JSON — xem khối chú thích đầu `types/parse.ts`.
  /** Câu xếp hạng đầy đủ, thường kèm số quyết định. 410 mục / 6 lớp. */
  xep_hang: string;
  /** Cảnh báo tượng/tranh thờ là hình dung nghệ thuật, không phải chân dung. */
  nhan_hinh_dung: string;
  /** Đợt + số quyết định công nhận bảo vật quốc gia. */
  dot_cong_nhan: string;
  /** Diện tích, số mộ… của nghĩa trang liệt sĩ. */
  quy_mo: string;
  chien_cong: string;
  /** Slug `noi-chien` | `ngoai-xam`; tra chữ hiển thị qua TEN_XUNG_DOT. */
  loai_xung_dot: string;
  nam_sinh: string;
  nam_mat: string;
  /**
   * Ghi chú HIỂN THỊ (phạm vi di tích, tính chất sự kiện).
   * KHÔNG nhầm với `ghi_chu_bien_tap` — ghi chú nội bộ, cố ý không parse ở đây
   * để không hàm nào lỡ tay dựng nó ra HTML.
   */
  ghi_chu: string;
  /** Ca dao / câu trích nguyên văn; xuống dòng bằng `\n`. */
  loi_trich: string;
  /** Điều bản ghi còn phải tra — hiện thành dải cảnh báo riêng, không lẫn thân bài. */
  can_tra_them: string;
  /** Slug tỉnh bộ 34; tra tên đủ dấu qua TEN_TINH_34. */
  lien_quan_tinh: string[];
  /**
   * Hạng mục thành phần của một cụm di tích.
   *
   * `ghi_chu_diem_thanh_phan` ở cuối `di-tich-qgdb.json`: các hạng mục này
   * KHÔNG được xếp hạng riêng — số quyết định của mục cha áp cho cả cụm.
   */
  diem_thanh_phan: Array<{
    ten: string;
    dia_diem: string;
    /** Đã nối thành chuỗi: dữ liệu để mảng ở 55 hạng mục và chuỗi ở 59. */
    ten_khac: string;
    mo_ta: string;
    nam_hien_thi: string;
    trung_unesco: boolean;
    nguon: string[];
  }>;
  /**
   * Nguồn RIÊNG của từng mục.
   *
   * 2.584/2.599 mục lớp phủ có `sources[]` trong tệp dữ liệu, nhưng popup cũ
   * chỉ hiện nguồn cấp LỚP — tức là trích dẫn cụ thể nhất, thứ bất biến #3
   * đòi phải có, lại là thứ người đọc không bao giờ thấy.
   */
  nguon: string[];
  // Năm trường dưới đây chỉ lớp «ban-do-co» dùng. Khai Ở ĐÂY chứ không
  // `as OverlayItem & { ... }` tại chỗ dựng popup — chính lối khai rời rạc đó
  // là thứ đẻ ra 10 tập trường khác nhau và mấy sink XSS đã phải đi vá.
  dia_danh_xua: string;
  nhom_ban_do: string;
  /** Mọi tấm bản đồ cổ từng ghi tên địa điểm này, sắp theo năm. */
  ban_do_ghi: Array<{
    nam: string;
    ten_ban_do: string;
    dia_danh_xua: string;
    nhom: string;
    ghi_chu: string;
    do_tin_cay: string;
    /** Bản quét của chính tấm này. Rỗng = tấm chưa có ảnh dùng được. */
    anh: string;
    anh_nguon: string;
  }>;
}

/**
 * Gỡ một vòng serialize của MapLibre.
 *
 * Giá trị LỒNG trong `properties` bị MapLibre chuỗi hoá thành JSON khi trả về
 * từ sự kiện click. Nên cùng một trường `ban_do_ghi` đi qua hàm parse này ở
 * HAI trạng thái khác nhau: lúc nạp tệp nó là mảng thật, lúc dựng popup nó là
 * chuỗi. Không gỡ thì `arr()` trả mảng rỗng và popup hiện «0 tấm bản đồ» —
 * KHÔNG có lỗi nào trên console, `tsc` vẫn xanh, chỉ nhìn bản đồ thật mới thấy.
 */
const goSerialize = (v: unknown): unknown => {
  if (typeof v !== "string") return v;
  try {
    return JSON.parse(v);
  } catch {
    return [];
  }
};

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
    phuong_phap_toa_do: str(r.phuong_phap_toa_do),
    don_vi_neo: str(r.don_vi_neo),
    xep_hang: str(r.xep_hang),
    nhan_hinh_dung: str(r.nhan_hinh_dung),
    dot_cong_nhan: str(r.dot_cong_nhan),
    quy_mo: str(r.quy_mo),
    chien_cong: str(r.chien_cong),
    loai_xung_dot: str(r.loai_xung_dot),
    nam_sinh: str(r.nam_sinh),
    nam_mat: str(r.nam_mat),
    ghi_chu: str(r.ghi_chu),
    loi_trich: str(r.loi_trich),
    can_tra_them: str(r.can_tra_them),
    // Hai trường lồng dưới đây đi qua goSerialize vì cùng lý do với `ban_do_ghi`.
    lien_quan_tinh: strs(goSerialize(r.lien_quan_tinh)).filter(Boolean),
    diem_thanh_phan: arr(goSerialize(r.diem_thanh_phan), (x) => {
      const d = rec(x);
      return {
        ten: str(d.ten),
        dia_diem: str(d.dia_diem),
        ten_khac: Array.isArray(d.ten_khac)
          ? strs(d.ten_khac).filter(Boolean).join(" · ")
          : str(d.ten_khac),
        mo_ta: str(d.mo_ta),
        nam_hien_thi: str(d.nam_hien_thi),
        trung_unesco: d.trung_unesco === true,
        nguon: strs(d.nguon).filter(Boolean),
      };
    }),
    // `sources` hay `nguon` tuỳ tệp; và cũng phải qua goSerialize vì mảng lồng
    // trong properties bị MapLibre chuỗi hoá y như `ban_do_ghi`.
    nguon: arr(goSerialize(r.sources ?? r.nguon), (x) => str(x)).filter(Boolean),
    dia_danh_xua: str(r.dia_danh_xua),
    nhom_ban_do: str(r.nhom_ban_do),
    ban_do_ghi: arr(goSerialize(r.ban_do_ghi), (x) => {
      const g = rec(x);
      return {
        nam: str(g.nam),
        ten_ban_do: str(g.ten_ban_do),
        dia_danh_xua: str(g.dia_danh_xua),
        nhom: str(g.nhom),
        ghi_chu: str(g.ghi_chu),
        do_tin_cay: str(g.do_tin_cay),
        anh: str(g.anh),
        anh_nguon: str(g.anh_nguon),
      };
    }),
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
  /**
   * @param p        mục đã parse.
   * @param nguonLop nguồn cấp LỚP — chỉ dùng khi mục không có nguồn riêng.
   *                 Trước đây main.ts nối chuỗi này vào SAU popup mà KHÔNG
   *                 escape; nay nó đi vào đúng khối nguồn và có escape.
   */
  popup: (p: OverlayItem, nguonLop: string) => string;
}

// Chỉ nhận https:// — chặn javascript:/http: không mã hoá, tức chặn chèn script
// qua dữ liệu ảnh.
const anhHopLe = (o: OverlayItem): string =>
  o.anh && o.anh.startsWith("https://") ? o.anh : "";
const chuAnh = (o: OverlayItem): string =>
  anhHopLe(o) && o.anh_nguon
    ? `🖼️ ${o.anh_nguon}${o.anh_giay_phep ? " · " + o.anh_giay_phep : ""}`
    : "";

/**
 * Slug tỉnh bộ 34 → tên đủ dấu.
 *
 * `lien_quan_tinh` chứa slug («bac-ninh»). In thẳng slug lên màn hình là tên
 * tỉnh mất dấu, thứ dự án tính là lỗi dữ liệu. Bảng này lặp lại `TEN_TINH_34`
 * của thuvien.ts và `TINH_TEN` của quocgia.ts — cả hai đều khai `const` không
 * xuất, và hai tệp đó nằm ngoài phạm vi thay đổi này. Gom ba bản về một là
 * việc riêng, không phải việc của lượt sửa popup.
 */
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
  "thanh-hoa": "Thanh Hoá", "thanh-pho-ho-chi-minh": "TP Hồ Chí Minh",
  "tuyen-quang": "Tuyên Quang", "vinh-long": "Vĩnh Long",
};

/** Slug lạ giữ nguyên chứ không biến mất — mất chữ thì không ai biết là mất. */
const tenTinh = (ds: string[]): string =>
  ds.map((s) => TEN_TINH_34[s] ?? s).join(" · ");

/**
 * Hai giá trị duy nhất của `loai_xung_dot` (32 «noi-chien» + 31 «ngoai-xam»).
 *
 * Giữ đúng chữ của dữ liệu. Không đổi thành «chống ngoại xâm»: nhóm này có cả
 * những trận Đại Nam đánh ra ngoài (vây Oudong 1845) lẫn những trận bị đánh
 * vào, gọi chung là «chống» thì thêm một khẳng định dữ liệu không nói.
 */
const TEN_XUNG_DOT: Record<string, string> = {
  "noi-chien": "Nội chiến",
  "ngoai-xam": "Ngoại xâm",
};

/** Năm sinh – năm mất. Chỉ dùng khi `nam_hien_thi` trống, để khỏi nói hai lần. */
const khoangDoi = (o: OverlayItem): string =>
  o.nam_sinh && o.nam_mat
    ? `${o.nam_sinh} – ${o.nam_mat}`
    : o.nam_sinh
      ? `Sinh ${o.nam_sinh}`
      : o.nam_mat
        ? `Mất ${o.nam_mat}`
        : "";

/** Ghi chú hiển thị — dòng phụ nhỏ khép lại thân bài, nằm TRONG `<p class="pu-than">`. */
const dongGhiChu = (o: OverlayItem): string =>
  o.ghi_chu ? `<span class="pu-ghi-chu">${escVanKho(o.ghi_chu)}</span>` : "";

/**
 * Khối trích nguyên văn (ca dao, câu sử).
 *
 * `\n` trong dữ liệu là chỗ ngắt dòng của câu lục bát và phải giữ: HTML nuốt
 * xuống dòng thành dấu cách, hai câu dính lại thành một dòng văn xuôi. Đổi sau
 * khi escape nên `<br/>` không thể đến từ dữ liệu.
 */
const khoiTrich = (o: OverlayItem): string =>
  o.loi_trich
    ? `<blockquote class="pu-trich">${escVanKho(o.loi_trich).replace(/\n/g, "<br/>")}</blockquote>`
    : "";

/** Dải cảnh báo «chưa soát xong» — tách hẳn khỏi thân bài để không đọc nhầm thành nội dung. */
const khoiCanTra = (o: OverlayItem): string =>
  o.can_tra_them
    ? `<p class="pu-can-tra"><b>🔎 Bản ghi chưa soát xong.</b> ${escVanKho(o.can_tra_them)}</p>`
    : "";

/**
 * `xep_hang` mở đầu bằng phủ định = CHỖ TRỐNG, không phải một hạng.
 *
 * 43 mục ghi đúng chữ «chưa xác minh được» (danh-thang-thien-nhien 38,
 * to-nghe-danh-than 5). Đặt chúng vào hàng «🏅 Xếp hạng» thì đọc ra như một
 * danh hiệu, mà biểu tượng huy chương còn nói ngược thêm. Câu có hạng thật rồi
 * mới kèm dè dặt («Di tích quốc gia — …, chưa tra được số quyết định») KHÔNG
 * rơi vào đây: nó mở đầu bằng chính cái hạng.
 */
const laChoTrong = (v: string): boolean => /^(chưa|không rõ|không xác)/i.test(v.trim());

/**
 * Niên đại để hiện: giá trị THẬT đầu tiên, chỗ trống không tính.
 *
 * 87 mục ghi `nam_hien_thi: "chưa xác minh được"` (danh-thang-thien-nhien 51 ·
 * anh-hung-can-hien-dai 21 · to-nghe 5 · lễ hội 5 · thể thao 3 · công trình 2),
 * và dòng meta cũ hiện thẳng chuỗi đó ngay dưới tên — đọc như thể ĐÓ là niên
 * đại của mục. Không mục nào trong 87 có năm thật ở trường khác, nhưng chuỗi
 * dự phòng vẫn viết đúng thứ tự để mục nào có thì lấy.
 */
const nienDai = (o: OverlayItem): string =>
  [o.nam_hien_thi, khoangDoi(o), o.thoi_ky, o.nam].find((v) => v && !laChoTrong(v)) ?? "";

/**
 * Gom mọi chỗ trống vào MỘT dải mờ, bày như `can_tra_them`.
 *
 * Một mục có thể trống cả hai (Búng Bình Thiên trống cả xếp hạng lẫn niên đại);
 * hai dải mờ liền nhau nói cùng một chuyện thì thành tiếng ồn. Giữ nguyên văn
 * chữ trong dữ liệu chứ không viết lại thành «chưa rõ»: hai cách ghi khác nhau
 * là hai mức chắc chắn khác nhau của người nhập.
 */
const khoiChoTrong = (o: OverlayItem): string => {
  const nien = o.nam_hien_thi || o.thoi_ky || o.nam;
  const muc = [
    laChoTrong(o.xep_hang) ? `Cấp xếp hạng: ${o.xep_hang}` : "",
    laChoTrong(nien) && !nienDai(o) ? `Niên đại: ${nien}` : "",
  ].filter(Boolean);
  return muc.length ? `<p class="pu-can-tra">🔎 ${escVan(muc.join(" · "))}</p>` : "";
};

/**
 * Nút «Bạn có nhớ?» — một câu hỏi sinh từ chính mục vừa đọc, đáp án giấu sau
 * một cú bấm (`docs/research/trinh-bay-de-nho.md` B.1 và bảng D mục 2: hiệu
 * ứng kiểm tra `g = 0.499`, tự sinh `d = 0.40`).
 *
 * Ba ràng buộc, cả ba đều đo được chứ không phải ý thích:
 *  · Đáp án LẤY NGUYÊN từ một trường của mục, không sinh thêm dữ kiện nào.
 *  · Trường rỗng thì không có nút — thà thiếu nút còn hơn hỏi câu không đáp.
 *  · Chỉ hỏi CHIỀU tên → thuộc tính. B.3 dẫn [21]: kiểm tra khi học bản đồ
 *    giúp chiều xuôi (+1,68 nút) nhưng làm HỎNG chiều ngược (−0,85), nên không
 *    hỏi ngược «nơi này là mục nào».
 *
 * `<details>` chứ không phải nút chạy JS: popup dựng bằng `setHTML` sau mỗi cú
 * bấm bản đồ, nút gắn sự kiện lúc khởi tạo trang sẽ không tồn tại ở đây — đúng
 * lý do khối «Nguồn» và khối bản đồ cổ cũng là `<details>`.
 */
const khoiNho = (cauHoi: string, dapAn: string): string =>
  dapAn
    ? `<details class="pu-nho"><summary><span class="pu-nho-nhan">🧠 Bạn có nhớ?</span> ${escVan(
        cauHoi,
      )}</summary><p>${escVanKho(dapAn)}</p></details>`
    : "";

/**
 * Câu hỏi cho ~30 lớp dùng `popupChung`.
 *
 * Hỏi đúng thứ POPUP ĐANG HIỆN, theo cùng thứ tự dự phòng của hàng «Nơi»: hỏi
 * một trường không được bày ra thì người đọc không có cơ hội nhớ, chỉ còn cách
 * đoán mò.
 */
const nhoChung = (o: OverlayItem): string => {
  if (o.chien_cong) return khoiNho("Chiến công nào gắn với tên này?", o.chien_cong);
  // Ba nhánh nơi chốn hỏi ba câu khác nhau vì ba trường nói ba chuyện khác
  // nhau; gộp thành một câu «gắn với nơi nào» thì đúng nhưng nhạt, và với
  // `noi_luu_giu` còn sai trọng tâm — hiện vật không «gắn với» nơi lưu giữ.
  if (o.dia_diem) return khoiNho("Mục này gắn với nơi nào?", o.dia_diem);
  if (o.noi_tho) return khoiNho("Nơi thờ ở đâu?", o.noi_tho);
  if (o.noi_luu_giu) return khoiNho("Hiện vật này đang được lưu giữ ở đâu?", o.noi_luu_giu);
  return khoiNho("Mốc thời gian của mục này là gì?", o.nam_hien_thi || o.nam || o.thoi_ky);
};

/**
 * Khối gập «hạng mục thành phần» của một cụm di tích.
 *
 * Câu lưu ý ở đầu khối là bắt buộc, không phải trang trí: cả cụm xếp hạng bằng
 * MỘT quyết định, nên liệt kê hàng chục hạng mục mà không nói gì thì người đọc
 * tưởng mỗi hạng mục có quyết định riêng (`ghi_chu_diem_thanh_phan` trong
 * `di-tich-qgdb.json` nói đúng chỗ đó).
 */
const khoiDiemThanhPhan = (o: OverlayItem): string => {
  if (!o.diem_thanh_phan.length) return "";
  const muc = (d: OverlayItem["diem_thanh_phan"][number]): string => {
    const phu = [d.dia_diem && `📍 ${d.dia_diem}`, d.nam_hien_thi, d.ten_khac && `Tên khác: ${d.ten_khac}`]
      .filter(Boolean)
      .map(escVan)
      .join(" · ");
    return (
      `<li><b class="pu-tp-ten">${escVan(d.ten)}</b>` +
      (d.trung_unesco ? `<span class="pu-tp-co">🌏 Trùng danh mục UNESCO</span>` : "") +
      (phu ? `<span class="pu-ds-phu">${phu}</span>` : "") +
      (d.mo_ta ? `<span class="pu-tp-mo-ta">${escVanKho(d.mo_ta)}</span>` : "") +
      `</li>`
    );
  };
  return (
    `<details class="pu-ds pu-tp"><summary>🏛️ ${escVan(
      String(o.diem_thanh_phan.length),
    )} hạng mục thuộc cụm di tích này</summary>` +
    `<p class="pu-tp-luu-y">Cả cụm được xếp hạng bằng một quyết định chung. Các hạng mục dưới đây không có quyết định xếp hạng riêng.</p>` +
    `<ul>${o.diem_thanh_phan.map(muc).join("")}</ul></details>`
  );
};

/**
 * Nguồn của mục + nguồn riêng của từng hạng mục thành phần, bỏ trùng.
 *
 * Hạng mục thành phần mang nguồn riêng (11 hạng mục Cố đô Huế dẫn một trang hồ
 * sơ khác trang của mục cha). Hiện danh sách hạng mục mà bỏ nguồn của chúng là
 * giấu xuất xứ; khối «Nguồn» vốn gập lại nên gộp vào đó không làm popup dài ra.
 */
const gomNguon = (o: OverlayItem, nguonLop: string): string =>
  [...new Set([...o.nguon, ...o.diem_thanh_phan.flatMap((d) => d.nguon)])].join(" · ") ||
  nguonLop;

/**
 * Popup dùng chung cho gần hết lớp phủ.
 *
 * Ba hàm cũ (personOverlayPopup / universalPersonPopup / eventOverlayPopup) chỉ
 * khác nhau ở THỨ TỰ DỰ PHÒNG của mấy trường — một hàm lấy `nam_hien_thi`, hàm
 * kia lấy `nam_hien_thi || thoi_ky || nam`. Gộp về một chuỗi dự phòng đầy đủ
 * thì không lớp nào mất chữ, mà lại thêm được chữ cho lớp trước đây bỏ sót:
 * `chien-dich-tran-danh` có CẢ `mo_ta` lẫn `ket_qua` nhưng popup cũ chỉ hiện
 * `ket_qua`, nay hiện cả hai ở hai chỗ khác nhau.
 *
 * @param nhanToaDo cụm danh từ trong dải cảnh báo — mỗi lớp nói rõ toạ độ NÀO
 *                  đang bị nghi ngờ (nơi thờ, quê, đền/đình…).
 */
const popupChung = (o: OverlayItem, nguonLop: string, nhanToaDo = "Toạ độ"): string =>
  dungPopup({
    anh: anhHopLe(o),
    anh_chu: chuAnh(o),
    ten: o.ten,
    meta: [nienDai(o), o.chi_huy],
    hang: [
      { icon: "📍", nhan: "Nơi", gia_tri: o.dia_diem || o.noi_tho || o.noi_luu_giu },
      // Chỗ trống («chưa xác minh được») đi xuống dải mờ ở `them`, không đứng
      // sau huy chương như một hạng đã có.
      { icon: "🏅", nhan: "Xếp hạng", gia_tri: laChoTrong(o.xep_hang) ? "" : o.xep_hang },
      { icon: "💎", nhan: "Công nhận", gia_tri: o.dot_cong_nhan },
      // Nhãn để «Xung đột» chứ không «Loại xung đột»: cột nhãn rộng 5,4rem, đo
      // trên popup thật thì nhãn dài hơn bị bẻ thành «LOẠI XUNG / ĐỘT».
      { icon: "⚔️", nhan: "Xung đột", gia_tri: TEN_XUNG_DOT[o.loai_xung_dot] ?? o.loai_xung_dot },
      { icon: "🗺️", nhan: "Tỉnh liên quan", gia_tri: tenTinh(o.lien_quan_tinh) },
      { icon: "📐", nhan: "Quy mô", gia_tri: o.quy_mo },
      { icon: "🎖️", nhan: "Chiến công", gia_tri: o.chien_cong },
      { icon: "🏁", nhan: "Kết quả", gia_tri: o.ket_qua },
      { icon: "🎨", nhan: "Hình dung", gia_tri: o.nhan_hinh_dung },
    ],
    than: escVanKho(o.mo_ta || o.cong_trang) + dongGhiChu(o),
    canh_bao:
      o.phuong_phap_toa_do === "tam-xa"
        ? `📍 Vị trí gần đúng — đặt ở tâm ${o.don_vi_neo || "xã/phường"}, chưa có toạ độ chính xác`
        : canhBaoToaDo(o.do_tin_cay_toa_do, nhanToaDo),
    them: khoiTrich(o) + khoiCanTra(o) + khoiChoTrong(o) + nhoChung(o),
    nguon: o.nguon.join(" · ") || nguonLop,
  });

// Popup lớp «Bản đồ cổ». Tiêu đề là ĐỊA ĐIỂM NGÀY NAY, thân là danh sách mọi
// tấm bản đồ cổ từng ghi tên nơi đó — xem `scripts/build_ban_do_co_overlay.mjs`
// để hiểu vì sao gom theo địa điểm chứ không theo bản đồ.
//
// Hồ sơ đầy đủ của từng tấm (mô tả dài, ý nghĩa chủ quyền, nơi lưu giữ, nguồn)
// nằm ở Thư viện → Bản đồ cổ. Popup CỐ Ý không chép lại: ở điểm Hoàng Sa có 12
// tấm, chép đủ thì popup dài hơn màn hình.
const KY_HIEU_NHOM: Record<string, string> = {
  "viet-nam": "🇻🇳",
  "phuong-tay": "🌍",
  "trung-quoc": "📜",
};

/**
 * Bản quét của một tấm, hiện ngay dưới dòng liệt kê nó.
 *
 * VÌ SAO Ở ĐÂY chứ không cấp điểm: tư liệu chủ quyền vốn chỉ đọc được ở Thư
 * viện → 🗺️ Bản đồ cổ, tức người xem bản đồ không bao giờ thấy mặt giấy. Đặt
 * ảnh cạnh đúng dòng «năm — tên tấm» thì câu khẳng định và bằng chứng của nó
 * nằm kề nhau, đúng nguyên tắc đặt chữ kề hình của docs/research/trinh-bay-de-nho.md.
 *
 * `loading="lazy"` là bắt buộc: khối này nằm trong <details> đóng sẵn, không
 * lười thì mỗi popup kéo về vài MB ảnh người xem chưa hề mở ra.
 * `referrerpolicy="no-referrer"` theo đúng lối `pu-anh` của popup-noi-dung.ts.
 */
const anhTam = (g: OverlayItem["ban_do_ghi"][number]): string =>
  g.anh
    ? `<img class="pu-ds-anh" src="${esc(anhCommonsNho(g.anh, 960))}" alt="${escVan(g.ten_ban_do)}" loading="lazy" referrerpolicy="no-referrer"/>` +
      (g.anh_nguon ? `<span class="pu-ds-phu">${escVan(g.anh_nguon)}</span>` : "")
    : "";

const banDoCoPopup = (p: OverlayItem, nguonLop: string): string => {
  const o = p;
  const dong = (g: OverlayItem["ban_do_ghi"][number]): string =>
    `<li><span class="pu-ds-nam">${escVan(g.nam)}</span> ${escVan(
      `«${g.dia_danh_xua}»`,
    )} — ${escVan(g.ten_ban_do)} ${KY_HIEU_NHOM[g.nhom] ?? ""}<span class="pu-ds-phu">${escVanKho(
      g.ghi_chu,
    )}${
      // Cùng bốn slug với `do_tin_cay_toa_do` (đo: cao 27 · trung 4 · thap 3),
      // nên cùng đi qua bảng tra chứ không in slug ra màn hình.
      g.do_tin_cay !== "cao" ? ` ⚠️ Khớp vị trí độ tin cậy ${escVan(mucTinCay(g.do_tin_cay))}` : ""
    }</span>${anhTam(g)}</li>`;
  return dungPopup({
    ten: o.ten,
    meta: ["Bản đồ cổ", o.nam_hien_thi],
    hang: [{ icon: "🕰️", nhan: "Tên xưa", gia_tri: o.dia_danh_xua }],
    than: escVanKho(o.mo_ta),
    them:
      `<details class="pu-ds"><summary>🗺️ ${escVan(
        String(o.ban_do_ghi.length),
      )} tấm bản đồ từng ghi tên nơi này</summary>` +
      `<ul>${o.ban_do_ghi.map(dong).join("")}</ul>` +
      `<p>Hồ sơ đầy đủ từng tấm: Thư viện → 🗺️ Bản đồ cổ.</p></details>` +
      khoiNho("Nơi này trên bản đồ xưa gọi là gì?", o.dia_danh_xua),
    nguon: o.nguon.join(" · ") || nguonLop,
  });
};

/** Một mục kèm lớp phủ sinh ra nó — đơn vị của `dungPopupNhieuMuc`. */
export interface MucTaiDiem {
  muc: OverlayItem;
  conf: OverlayConf;
}

/**
 * Khoá gộp accordion, suy từ chính toạ độ điểm.
 *
 * `<details name="…">` chỉ đóng lẫn nhau trong CÙNG một tên. Lấy toạ độ làm tên
 * thì hai popup của hai điểm khác nhau (nếu cùng nằm trên trang) không đóng
 * nhầm của nhau, mà không cần sinh số ngẫu nhiên. Chuỗi ra từ `toFixed` chỉ có
 * chữ số, dấu chấm và dấu trừ.
 */
const khoaDiem = (o: OverlayItem): string =>
  `nh${o.lon.toFixed(5)}_${o.lat.toFixed(5)}`.replace(/[^\w.-]/g, "");

/**
 * Vì sao ngần này mục nằm chung một điểm — suy từ dữ liệu, không đoán.
 *
 * Hai chuyện khác nhau và phải nói khác nhau:
 *  · toàn `cao` → toạ độ đã xác minh, đây là CÙNG MỘT ĐỊA ĐIỂM thật (16 bảo vật
 *    ở Hoàng thành Thăng Long, 9 mục ở Côn Đảo). Không phải lỗi, đừng ai đi
 *    nhích toạ độ cho khỏi chồng: nhích là bịa vị trí.
 *  · có `trung`/`thap` → toạ độ mới ở mức xấp xỉ nên CHƯA TÁCH ĐƯỢC vị trí
 *    riêng. Câu này KHÔNG nói các mục ở khác chỗ nhau — 10 nữ liệt sĩ Lam Hạ
 *    mang cờ `trung` nhưng hy sinh cùng một trận địa. Nói đúng cái mình biết:
 *    độ chính xác của toạ độ, không phải sự thật lịch sử.
 */
const viSaoChungDiem = (ds: MucTaiDiem[]): string => {
  const n = ds.length;
  const noi = ds.map(({ muc }) => muc.dia_diem || muc.noi_tho || muc.noi_luu_giu);
  // Chỉ nói «cùng ghi một địa điểm» khi MỌI mục đều có chữ đó và giống hệt nhau.
  const chung = noi.every((v) => v && v === noi[0]) ? noi[0] : "";
  const cao = ds.filter(({ muc }) => muc.do_tin_cay_toa_do === "cao").length;
  const chuaGhi = ds.filter(({ muc }) => !muc.do_tin_cay_toa_do).length;
  const xapXi = n - cao - chuaGhi;
  const phan = [
    cao ? `${cao} mục đã xác minh` : "",
    xapXi ? `${xapXi} mục ở mức xấp xỉ` : "",
    chuaGhi ? `${chuaGhi} mục chưa ghi độ tin cậy` : "",
  ].filter(Boolean);
  const toaDo =
    cao === n
      ? `Toạ độ của cả ${n} mục đều đã xác minh ở mức cao — đây là cùng một địa điểm, không phải lỗi chồng điểm.`
      : xapXi === n
        ? `Toạ độ của cả ${n} mục mới ở mức xấp xỉ, đang soát — chưa tách được vị trí riêng của từng mục.`
        : chuaGhi === n
          ? `Cả ${n} mục chưa ghi độ tin cậy toạ độ.`
          : `Toạ độ trong nhóm này: ${phan.join(" · ")}.`;
  return chung ? `Cả ${n} mục cùng ghi một địa điểm: «${chung}». ${toaDo}` : toaDo;
};

/**
 * Popup cho NHIỀU mục nằm chồng khít một điểm.
 *
 * Vì sao cần: `bindOverlayInteractions()` lấy `e.features?.[0]` — đúng một mục.
 * Đo trên dữ liệu sống 2026-08-28: **526 mục cùng lớp tụ ở 185 điểm**, và gộp
 * mọi lớp lại là **988 mục ở 368 điểm** (232 điểm chứa mục của hơn một lớp).
 * Ở điểm 16 bảo vật Hoàng thành Thăng Long thì 15 mục không có cách nào bấm
 * tới. Đây là lỗi TRÌNH BÀY: toạ độ trùng nhau phần lớn là sự thật.
 *
 * Một mục thì trả nguyên popup cũ, không đổi một byte — nên `main.ts` gọi được
 * hàm này cho mọi cú bấm, khỏi rẽ nhánh.
 *
 * Thuần HTML + CSS, KHÔNG một dòng JS: popup dựng bằng `setHTML` sau mỗi cú
 * bấm bản đồ nên listener gắn lúc khởi tạo trang sẽ không tồn tại ở đây. Mở một
 * mục là `<details>`; `name` chung khiến mở mục này thì mục kia tự đóng (trình
 * duyệt cũ chưa hiểu `name` thì mở được nhiều mục — vẫn dùng được). Đường quay
 * lại danh sách là chính dòng `<summary>`: nó DÍNH ở mép trên khung cuộn
 * (`position: sticky`), nên đọc tới đâu vẫn thấy và bấm được để thu lại.
 */
export function dungPopupNhieuMuc(ds: MucTaiDiem[]): string {
  if (!ds.length) return "";
  if (ds.length === 1) return ds[0].conf.popup(ds[0].muc, ds[0].conf.nguon);
  const ten = khoaDiem(ds[0].muc);
  const dong = ({ muc, conf }: MucTaiDiem): string => {
    // Dòng phụ để phân biệt hai mục cùng điểm. `tinh_34` là chốt cuối vì lớp
    // bảo vật có mục không ghi `dia_diem` lẫn `noi_luu_giu`.
    const phu = [nienDai(muc), muc.dia_diem || muc.noi_tho || muc.noi_luu_giu || muc.tinh_34, muc.loai]
      .filter(Boolean)
      .map(escVan)
      .join(" · ");
    return (
      `<li><details class="pu-nh-muc" name="${ten}">` +
      `<summary><span class="pu-nh-icon" aria-hidden="true">${escVan(conf.icon)}</span>` +
      `<span class="pu-nh-chu"><b class="pu-nh-ten">${escVan(muc.ten)}</b>` +
      (phu ? `<span class="pu-nh-phu">${phu}</span>` : "") +
      `</span></summary>` +
      `<div class="pu-nh-day">${conf.popup(muc, conf.nguon)}</div></details></li>`
    );
  };
  return (
    `<article class="pu pu-nh">` +
    `<h3 class="pu-ten">${escVan(String(ds.length))} mục tại điểm này</h3>` +
    `<p class="pu-nh-vi-sao">${escVan(viSaoChungDiem(ds))}</p>` +
    `<ul class="pu-nh-ds">${ds.map(dong).join("")}</ul>` +
    `</article>`
  );
}

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
    popup: (p, nguonLop) =>
      dungPopup({
        anh: anhHopLe(p),
        anh_chu: chuAnh(p),
        ten: p.ten,
        meta: [p.hang_muc, p.nam ? `Ghi danh ${p.nam}` : ""],
        hang: [{ icon: "📍", nhan: "Tỉnh", gia_tri: p.tinh_34 }],
        than: escVanKho(p.mo_ta),
        them: khoiNho("Di sản này nằm ở tỉnh nào?", p.tinh_34),
        nguon: p.nguon.join(" · ") || nguonLop,
      }),
  },
  {
    id: "di-tich-qgdb",
    label: "🏯 Di tích quốc gia đặc biệt",
    icon: "🏯",
    file: "data/overlays/di-tich-qgdb.json",
    circleColor: "#b45309",
    nguon: "Cục Di sản văn hóa (dsvh.gov.vn) · Quyết định xếp hạng của Thủ tướng Chính phủ",
    popup: (p, nguonLop) =>
      dungPopup({
        anh: anhHopLe(p),
        anh_chu: chuAnh(p),
        ten: p.ten,
        meta: [p.loai || "di tích", p.nam ? `Xếp hạng ${p.nam}${p.dot ? ` · đợt ${p.dot}` : ""}` : ""],
        hang: [
          { icon: "📍", nhan: "Tỉnh", gia_tri: p.tinh_34 },
          // Lớp này vừa được nạp `xep_hang` cho cả 153 mục (đo 2026-08-28), mà
          // popup riêng của nó không đọc trường đó — đúng thứ bệnh lượt sửa này
          // đi chữa. Dòng meta ở trên chỉ có năm và đợt; câu này mang SỐ QUYẾT
          // ĐỊNH, thứ dòng meta không nói.
          { icon: "🏅", nhan: "Xếp hạng", gia_tri: laChoTrong(p.xep_hang) ? "" : p.xep_hang },
        ],
        than: escVanKho(p.mo_ta) + dongGhiChu(p),
        them:
          khoiDiemThanhPhan(p) +
          khoiChoTrong(p) +
          khoiNho("Di tích này nằm ở tỉnh nào?", p.tinh_34),
        nguon: gomNguon(p, nguonLop),
      }),
  },
  {
    id: "bao-vat-quoc-gia",
    label: "💎 Bảo vật quốc gia",
    icon: "💎",
    file: "data/overlays/bao-vat-quoc-gia.json",
    circleColor: "#d4af37",
    nguon: "Cục Di sản văn hóa (dsvh.gov.vn) · Bảo tàng Lịch sử Quốc gia (baotanglichsu.vn)",
    popup: (p, nguonLop) =>
      dungPopup({
        anh: anhHopLe(p),
        anh_chu: chuAnh(p),
        ten: p.ten,
        meta: [p.loai, p.dot ? `Công nhận đợt năm ${p.dot}` : ""],
        hang: [
          { icon: "🏛️", nhan: "Lưu giữ", gia_tri: p.noi_luu_giu },
          // `dot` (36 mục) và `dot_cong_nhan` (148 mục) không mục nào có cả
          // hai, nên dòng meta ở trên và hàng này không bao giờ nói trùng nhau.
          { icon: "💎", nhan: "Công nhận", gia_tri: p.dot_cong_nhan },
        ],
        than: escVanKho(p.mo_ta),
        them: khoiNho("Hiện vật này đang được lưu giữ ở đâu?", p.noi_luu_giu),
        nguon: p.nguon.join(" · ") || nguonLop,
      }),
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
    popup: (p, nguonLop) => popupChung(p, nguonLop, "Toạ độ nơi thờ"),
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
    popup: popupChung,
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
    popup: (p, nguonLop) => popupChung(p, nguonLop, "Toạ độ nơi thờ"),
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
    popup: (p, nguonLop) => popupChung(p, nguonLop, "Toạ độ địa điểm"),
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
      // Ba biến thể `ah-llvt` / `ahllvt` / `anh-hung-llvt` đã gộp về một
      // (2026-08-05) — cùng nghĩa «Anh hùng LLVTND», khác chuỗi nên bộ lọc
      // theo loai đếm thiếu. Màu không đổi: cả ba vốn đã rơi vào cùng giá trị
      // vì nhánh này trùng đúng màu mặc định ở cuối.
      "anh-hung-llvt", "#dc2626",
      // Nhanh "me-vnah" da go 2026-08-28: 94 muc Me VNAH chuyen sang lop
      // me-vnah rieng, lop nay khong con muc nao mang loai do.
      "ah-lao-dong", "#0d9488",
      "#dc2626",
    ],
    nguon:
      "Báo Quân đội Nhân dân (qdnd.vn) · Báo Nhân Dân (nhandan.vn) · Bảo tàng Lịch sử Quân sự Việt Nam · Cổng TTĐT Chính phủ (baochinhphu.vn)",
    popup: (p, nguonLop) => popupChung(p, nguonLop, "Toạ độ quê/khu lưu niệm"),
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
    popup: (p, nguonLop) => popupChung(p, nguonLop, "Toạ độ quê/khu lưu niệm"),
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
    popup: (p, nguonLop) => popupChung(p, nguonLop, "Toạ độ đền/đình"),
  },
  {
    id: "me-vnah",
    label: "🏵️ Mẹ Việt Nam Anh hùng",
    icon: "🏵️",
    file: "data/overlays/me-vnah.json",
    circleColor: "#db2777",
    nguon:
      "Báo Chính phủ · Báo QĐND · Bảo tàng Phụ nữ Nam Bộ · cổng tỉnh",
    popup: popupChung,
  },
  {
    id: "vua-hoang-de",
    label: "👑 Vua · Chúa · Hoàng tộc",
    icon: "👑",
    file: "data/overlays/vua-hoang-de.json",
    circleColor: "#a16207",
    nguon:
      "Trung tâm Bảo tồn Di tích Cố đô Huế · Cục Di sản văn hóa · cổng tỉnh · Báo Nhân Dân",
    popup: popupChung,
  },
  {
    id: "chi-si-cach-mang",
    label: "🔥 Chí sĩ cách mạng · Doanh nhân yêu nước",
    icon: "🔥",
    file: "data/overlays/chi-si-cach-mang.json",
    circleColor: "#b91c1c",
    nguon:
      "Báo điện tử Đảng Cộng sản · Bảo tàng Lịch sử Quốc gia · TTXVN · Báo Nhân Dân · cổng tỉnh",
    popup: popupChung,
  },
  {
    id: "to-nghe-danh-than",
    label: "🛠️ Tổ nghề · Nghệ nhân · Làng nghề truyền thống",
    icon: "🛠️",
    file: "data/overlays/to-nghe-danh-than.json",
    circleColor: "#0891b2",
    nguon:
      "Cục Di sản văn hóa · Sở VHTT các tỉnh · Cục Bản quyền tác giả · cổng tỉnh",
    popup: popupChung,
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
    popup: popupChung,
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
    popup: popupChung,
  },
  {
    id: "nghe-nhan-di-san",
    label: "🎭 Nghệ nhân · tổ nghệ thuật · di sản sống",
    icon: "🎭",
    file: "data/overlays/nghe-nhan-di-san.json",
    circleColor: "#7c3aed",
    nguon:
      "Cục Di sản văn hóa · Sở VHTT các tỉnh · Báo Nhân Dân · Cục Du lịch Quốc gia",
    popup: popupChung,
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
    popup: popupChung,
  },
  {
    // Lớp mở 2026-08-11 (quyết định chủ dự án, phương án A): di tích do UBND
    // tỉnh/thành phố ký QĐ xếp hạng — tầng dưới hai sổ đăng ký cấp quốc gia.
    // Giữ CÙNG ngôn ngữ màu theo loai với di-tich-quoc-gia, chỉ khác màu nền
    // mặc định (xám lam = tầng thấp hơn cyan) để phân bậc bằng mắt.
    id: "di-tich-cap-tinh",
    label: "🏘️ Di tích cấp tỉnh/thành phố",
    icon: "🏘️",
    file: "data/overlays/di-tich-cap-tinh.json",
    circleColor: [
      "match",
      ["get", "loai"],
      "danh-thang",
      "#16a34a",
      "khao-co",
      "#a16207",
      "cach-mang",
      "#dc2626",
      "#64748b",
    ],
    nguon:
      "Cổng TTĐT tỉnh/thành phố · Báo Đảng các tỉnh · Phòng VH&TT cấp huyện",
    popup: popupChung,
  },
  {
    id: "le-hoi-truyen-thong",
    label: "🎏 Lễ hội truyền thống (di sản phi vật thể)",
    icon: "🎏",
    file: "data/overlays/le-hoi-truyen-thong.json",
    circleColor: "#ea580c",
    nguon:
      "Cục Di sản văn hóa · Cục Du lịch Quốc gia · Sở VHTT các tỉnh · cổng tỉnh",
    popup: popupChung,
  },
  {
    id: "cong-trinh-ky-luc",
    label: "🌉 Công trình kỷ lục (cầu · hầm · cáp treo · thuỷ điện)",
    icon: "🌉",
    file: "data/overlays/cong-trinh-ky-luc.json",
    circleColor: "#d97706",
    nguon:
      "Cổng Chính phủ (chinhphu.vn) · TTXVN · Nhân Dân · báo Đảng các tỉnh · cổng bộ ngành",
    popup: popupChung,
  },
  {
    id: "truyen-thuyet-dan-gian",
    label: "🐉 Truyền thuyết · Sự tích địa danh · Ca dao vùng đất",
    icon: "🐉",
    file: "data/overlays/truyen-thuyet-dan-gian.json",
    circleColor: "#7c3aed",
    nguon:
      "Cổng TTĐT tỉnh/huyện · báo Đảng bộ tỉnh · Cục Di sản văn hoá · Sở VHTTDL · TTXVN",
    popup: popupChung,
  },
  {
    id: "danh-thang-thien-nhien",
    label: "🏞 Danh thắng thiên nhiên (đèo · thác · núi · hồ · biển đảo)",
    icon: "🏞",
    file: "data/overlays/danh-thang-thien-nhien.json",
    circleColor: "#059669",
    nguon:
      "Cục Du lịch Quốc gia (vietnamtourism.gov.vn) · Cục Di sản văn hóa (dsvh.gov.vn) · cổng TTĐT các tỉnh · báo Đảng",
    popup: popupChung,
  },
  {
    id: "bao-tang",
    label: "🏺 Bảo tàng lịch sử – văn hoá",
    icon: "🏺",
    file: "data/overlays/bao-tang.json",
    circleColor: "#0891b2",
    nguon:
      "Website chính thức các bảo tàng công lập · Cục Di sản văn hóa (dsvh.gov.vn)",
    popup: popupChung,
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
    popup: popupChung,
  },
  {
    id: "su-than-ngoai-giao",
    label: "🕊️ Sứ thần · nhà ngoại giao lịch sử",
    icon: "🕊️",
    file: "data/overlays/su-than-ngoai-giao.json",
    circleColor: "#4f46e5",
    nguon:
      "Bảo tàng Lịch sử Quốc gia · Giáo dục & Thời đại · Báo Nhân Dân · scov.gov.vn",
    popup: popupChung,
  },
  {
    id: "danh-y-luong-y",
    label: "⚕️ Danh y · lương y (y học cổ truyền)",
    icon: "⚕️",
    file: "data/overlays/danh-y-luong-y.json",
    circleColor: "#047857",
    nguon:
      "Sức khỏe & Đời sống · Viện Y dược học dân tộc · Bảo tàng Lịch sử Quốc gia · cổng tỉnh",
    popup: popupChung,
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
    popup: popupChung,
  },
  {
    id: "thieu-nien-anh-hung",
    label: "🎗️ Thiếu niên anh hùng",
    icon: "🎗️",
    file: "data/overlays/thieu-nien-anh-hung.json",
    circleColor: "#be123c",
    nguon:
      "Bảo tàng Lịch sử Quốc gia · Báo Thiếu niên Tiền phong · Báo Nhân Dân · cổng tỉnh",
    popup: popupChung,
  },
  {
    id: "thien-su-cao-tang",
    label: "🪷 Thiền sư · cao tăng lịch sử",
    icon: "🪷",
    file: "data/overlays/thien-su-cao-tang.json",
    circleColor: "#ca8a04",
    nguon:
      "Giác Ngộ · Phật giáo VN · Tạp chí NC Phật học · Báo Nhân Dân · dsvh.gov.vn",
    popup: popupChung,
  },
  {
    id: "danh-nhan-quan-su-co-trung-dai",
    label: "⚔️ Danh tướng · Võ tướng · Thủ lĩnh khởi nghĩa (cổ–trung đại)",
    icon: "⚔️",
    file: "data/overlays/danh-nhan-quan-su-co-trung-dai.json",
    circleColor: "#991b1b",
    nguon:
      "Bảo tàng Lịch sử Quốc gia · Khu di tích Lam Kinh · Báo Văn hoá · cổng tỉnh · Dân trí · Đại Việt Sử Ký Toàn Thư · Lĩnh Nam Chích Quái",
    popup: popupChung,
  },
  {
    id: "nha-the-thao-lich-su",
    label: "🏅 Nhà thể thao lịch sử (đã mất)",
    icon: "🏅",
    file: "data/overlays/nha-the-thao-lich-su.json",
    circleColor: "#166534",
    nguon:
      "Báo Nhân Dân · Thể thao & Văn hoá · CAND · Lao Động · Thanh Niên · Vovinam",
    popup: popupChung,
  },
  {
    id: "nghia-si-can-vuong",
    label: "⚔️ Cần Vương · Kháng Pháp thế kỷ 19",
    icon: "⚔️",
    file: "data/overlays/nghia-si-can-vuong.json",
    circleColor: "#881337",
    nguon:
      "Báo Nhân Dân · QĐND · cổng tỉnh · dsvh.gov.vn · bảo tàng · di tích",
    popup: popupChung,
  },
  {
    id: "tri-thuc-khoa-hoc-tk20",
    label: "🔬 Trí thức · Nhà khoa học · Giáo dục cận–hiện đại",
    icon: "🔬",
    file: "data/overlays/tri-thuc-khoa-hoc-tk20.json",
    circleColor: "#065f46",
    nguon:
      "Báo Nhân Dân · Viện Hàn lâm KHCN/KHXH VN · ĐHQG · MEDDOM · Tia Sáng",
    popup: popupChung,
  },
  {
    id: "ban-do-co",
    label: "🗺️ Bản đồ cổ — nơi này ngày xưa gọi là gì",
    icon: "🗺️",
    file: "data/overlays/ban-do-co.json",
    // Màu đọc thẳng thuộc tính feature: đỏ = chỉ bản đồ người Việt ghi, xanh =
    // chỉ bản đồ phương Tây, xám = chỉ bản đồ Trung Quốc, VÀNG = nơi có HƠN
    // MỘT phía cùng ghi tên. Vàng là tín hiệu mạnh nhất của cả vỉa dữ liệu nên
    // nó được màu nổi nhất.
    circleColor: [
      "match",
      ["get", "nhom_ban_do"],
      "viet-nam",
      "#c2410c",
      "phuong-tay",
      "#1d4ed8",
      "trung-quoc",
      "#57534e",
      "nhieu",
      "#d4af37",
      "#78716c",
    ],
    nguon:
      "Bộ Ngoại giao · Uỷ ban Biên giới quốc gia · Cục Di sản văn hoá · Báo Nhân Dân · Báo Chính phủ · VOV · Báo Đà Nẵng",
    popup: banDoCoPopup,
  },
  ];

// Gom 29 lớp phủ thành cụm chủ đề (accordion) để panel gọn (Phase 3 P3.4).
// Chỉ nhóm HIỂN THỊ — không đổi thứ tự/định nghĩa OVERLAYS. Lớp thiếu nhóm
// rơi vào "Khác" (guard chống sót khi thêm lớp mới).
// `id` dùng để tra tên gọi phiên bản trẻ em (tu-vung-tre-em.ts) — nhãn người
// lớn không làm khoá được vì nó chính là thứ bị thay.
export const OVERLAY_GROUPS: { id: string; nhan: string; icon: string; ids: string[] }[] = [
  { id: "di-san", nhan: "Di sản & Di tích", icon: "🏛️", ids: ["unesco", "di-tich-qgdb", "di-tich-quoc-gia", "di-tich-cap-tinh", "bao-vat-quoc-gia", "di-tich-cach-mang"] },
  { id: "quan-su", nhan: "Sự kiện & Quân sự", icon: "⚔️", ids: ["chien-dich-tran-danh", "danh-nhan-quan-su-co-trung-dai", "nghia-si-can-vuong"] },
  { id: "vua-khoa-bang", nhan: "Vua chúa · Khoa bảng · Ngoại giao", icon: "👑", ids: ["vua-hoang-de", "khoa-bang-danh-nhan", "su-than-ngoai-giao", "danh-nhan-cac-trieu"] },
  { id: "cong-dong-dan-toc", nhan: "Cộng đồng các dân tộc", icon: "🪶", ids: ["danh-nhan-dan-toc-thieu-so"] },
  { id: "tin-nguong", nhan: "Tín ngưỡng · Tôn giáo · Nghề", icon: "🙏", ids: ["thanh-hoang-danh-than", "thien-su-cao-tang", "to-nghe-danh-than", "le-hoi-truyen-thong", "danh-y-luong-y"] },
  { id: "van-hoa-khoa-hoc", nhan: "Văn hoá · Khoa học · Thể thao cận-hiện đại", icon: "📚", ids: ["danh-nhan-van-hoa-can-hien-dai", "tri-thuc-khoa-hoc-tk20", "nha-the-thao-lich-su", "nghe-nhan-di-san"] },
  { id: "cach-mang", nhan: "Cách mạng & Anh hùng", icon: "⭐", ids: ["anh-hung-can-hien-dai", "chi-si-cach-mang", "me-vnah", "thieu-nien-anh-hung", "nghia-trang-liet-si"] },
  { id: "huyen-su", nhan: "Huyền sử & Truyền thuyết", icon: "🐉", ids: ["huyen-su-khai-quoc", "truyen-thuyet-dan-gian"] },
  { id: "ban-do-co", nhan: "Bản đồ cổ qua các thời kỳ", icon: "🗺️", ids: ["ban-do-co"] },
];
