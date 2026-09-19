// ═══════════════════════════════════════════════════════════════════════════
// 📖 Trình đọc toàn văn — lớp phủ toàn màn hình cho tác phẩm dài
// ═══════════════════════════════════════════════════════════════════════════
//
// Khung đọc sẵn có trong `thuvien.ts` (`.lib-doc`) sống bên trong panel Thư
// viện, rộng 560–1100 px và KHÔNG modal. Với một bài thất ngôn tứ tuyệt thì
// vừa đủ. Với một chương sử thi vài nghìn dòng thì không: cột chữ chạy hết bề
// ngang panel, mục lục cuộn mất tăm, và mọi cú bấm ra ngoài đều là một lối
// thoát vô tình. Module này là khung đọc thứ hai, chỉ dành cho tác phẩm dài.
//
// ── Vì sao KHÔNG đi qua `panels.ts` ────────────────────────────────────────
// `registerPanel()` nhận `id: PanelId`, mà `PANEL_IDS` là một mảng `as const`
// đóng — thêm một panel là phải sửa `panels.ts`. Quan trọng hơn: `moPanel()`
// đặt thẳng `aria-modal="false"` và ghi rõ trong chú thích rằng các panel đó
// CỐ Ý không bẫy tiêu điểm, vì bản đồ phía sau vẫn phải bấm được. Trình đọc
// thì ngược lại — nó che kín màn hình, Tab không được chạy ra sau lưng nó.
// Hai giao kèo trái nhau, nên đây là LỚP PHỦ dựng trên `document.body`, đúng
// tiền lệ của phần «cầm tay chỉ việc» trong `huong-dan.ts`.
//
// ── Ba thứ mượn nguyên, không dựng lại ─────────────────────────────────────
//  · Token màu/cỡ/cột của `thuvien.css` (`--doc-*`) — đã đo tương phản WCAG.
//  · `escVanKho()` của `popup-noi-dung.ts` — escape + chú giải trẻ em + typo.
//  · Widget chú giải `.tk-boc/.tk-tu/.tk-nghia` của `tu-kho-tre-em.ts`, kể cả
//    handler bấm-mở uỷ nhiệm ở `document` (xem `danhDau()`).

import "./doc-sach.css";
import { esc } from "./util/html";
// escVan cho chữ NGẮN (tên, nhãn, dòng nguồn) · escVanKho cho KHỐI DÀI trẻ em
// phải đọc — đúng phân vai đã ghi trong popup-noi-dung.ts.
import { escVan, escVanKho, nhamNhay } from "./popup-noi-dung";
import { oneOf, rec } from "./types/parse";

// ═══════════════════════════════════════════════════════════════════════════
// 1. Kiểu dữ liệu — một tác phẩm đã chuẩn hoá để ĐỌC
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Một chương/khúc. `ban_dich` là bản dịch nghĩa của CHÍNH chương này — thơ
 * chữ Hán của Bác có `nguyen_van` là phiên âm Hán-Việt và `ban_dich` là bản
 * dịch thơ, hai khối dài KHÁC nhau (đo trên kho: 15 dòng phiên âm ↔ 12 dòng
 * dịch), nên ghép từng cặp dòng là ghép sai. Đặt cạnh nhau theo KHỐI.
 */
export interface ChuongDoc {
  tieu_de: string;
  dong: string[];
  ban_dich?: string[];
}

export interface SachDoc {
  id: string;
  ten: string;
  tacGia: string;
  /** Dòng phụ dưới tên: thời kỳ · thể loại · nhãn. Đã lọc phần rỗng. */
  meta: string;
  loiBinh?: string;
  /**
   * Khung video ĐÃ DỰNG SẴN và đã escape ở `thuvien.ts` — không phải dữ liệu
   * thô, trình đọc chèn thẳng vào DOM. Dựng ở bên kia chứ không dựng lại ở đây
   * để cổng nhúng (host `youtube-nocookie` của CSP · id đúng 11 ký tự · kênh
   * chính chủ) chỉ tồn tại ở MỘT chỗ. Xem `khungVideoHtml()` trong thuvien.ts.
   */
  videoHtml?: string;
  chuong: ChuongDoc[];
  /** Chú thích của người biên tập về chính văn bản — in ngay dưới thân bài. */
  ghiChu?: string;
  giaiNghia: Array<{ tu: string; nghia: string }>;
  /** "public-domain" | "cited-excerpt" — hoặc chuỗi tự do của dữ liệu cũ. */
  banQuyen: string;
  /** Nói rõ VÌ SAO được đăng toàn văn (tác giả/dịch giả mất năm nào…). */
  coSoBanQuyen?: string;
  nguoiDich?: string;
  banTheo?: string;
  /** URL trang đã mở để lấy CHỮ — khác `nguon` là nguồn của phần bình. */
  nguonToanVan?: string;
  nguon: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. Ngưỡng «đủ dài để mở trình đọc»
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 16 dòng thân bài.
 *
 * ⚠️ Bản đầu đặt 24 và giải thích rằng «vùng chữ cao ~600 px, mỗi dòng ~24 px».
 * Đo lại trên Chrome thật thì CẢ HAI con số đều sai: khung hẹp của panel rộng
 * 560 px, vùng cuộn cao **510 px**, cỡ chữ 14,14 px, giãn dòng **22,6 px** —
 * tức 22 dòng một màn ở 1280×800 (và 24 ở 390×844, nơi panel cao hơn).
 *
 * Nhưng «bao nhiêu dòng THƠ lọt một màn» không phải câu hỏi đúng. Câu hỏi
 * đúng là từ đâu thì CẢ MỤC không còn nằm gọn một màn — và mục còn có tên,
 * dòng phụ, lời bình, bảng từ khó, khối bản quyền, danh sách nguồn. Đo trên
 * «Bài ca ngất ngưởng»: 19 dòng thơ mà phải cuộn **2,8 màn**. Phần thơ chỉ
 * chiếm 0,84 màn; gần hai màn còn lại là những thứ vây quanh nó.
 *
 * 16 dòng chiếm 362 px, tức 71% của 510 px vùng cuộn — chừa lại chưa tới
 * 150 px cho mọi thứ khác, nên từ mốc này trở lên gần như không mục nào còn
 * lọt một màn. Chọn lệch về phía THẤP là có chủ ý: bày thừa một cái nút trên
 * tác phẩm vốn đã đọc được là phiền một chút (thẻ mục vẫn in nguyên văn như
 * cũ, không ép ai mở gì), còn giấu nút trên tác phẩm phải cuộn ba màn thì
 * đúng là hỏng.
 *
 * Đo trên kho ngày 2026-08-28: 35 mục vượt ngưỡng này (ở mốc 24 chỉ có 10).
 */
export const NGUONG_DONG = 16;

/** Tổng số dòng thân bài, kể cả bản dịch song song. */
export function soDongSach(s: SachDoc): number {
  return s.chuong.reduce((n, c) => n + c.dong.length + (c.ban_dich?.length ?? 0), 0);
}

/**
 * Có bày nút «Đọc toàn văn» cho tác phẩm này không.
 *
 * Ba vế, vế đầu là bất biến #3 của dự án chứ không phải chuyện giao diện:
 * văn bản không có nguồn thì KHÔNG hiển thị — và một trình đọc toàn màn hình
 * là chỗ hiển thị đậm nhất trang này có. (Đo 2026-08-28: 0/550 mục thiếu
 * nguồn, nên cổng này hôm nay không chặn mục nào; nó chặn mục sẽ nạp về sau.)
 *
 * Vế «≥ 2 chương» không phụ thuộc số dòng: nhảy chương là việc thứ hai của
 * trình đọc, và một tác phẩm chia chương thì cần nó ngay cả khi ngắn.
 */
export function dangDaiSach(s: SachDoc): boolean {
  return s.nguon.length > 0 && (soDongSach(s) >= NGUONG_DONG || s.chuong.length >= 2);
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. Tuỳ chỉnh đọc + vị trí, lưu trong localStorage
// ═══════════════════════════════════════════════════════════════════════════
//
// Theo đúng quy ước khoá `bkvn.thuvien.*` của thuvien.ts. KHÔNG dùng chung
// khoá với khung đọc trong panel: hai khung có bề rộng và bố cục khác hẳn nên
// cùng một tỉ lệ cuộn trỏ tới hai chỗ khác nhau trong bài.

const KHOA_TUY_CHINH = "bkvn.thuvien.doc-sach";
const KHOA_VI_TRI = "bkvn.thuvien.doc-sach-vi-tri";

interface TuyChinhDoc {
  coChu: "b1" | "b2" | "b3" | "b4" | "b5";
  giaiDong: "gon" | "vua" | "rong" | "rat-rong";
  nen: "sang" | "nga" | "toi";
  cot: "hep" | "vua" | "rong";
  phong: "co-chan" | "khong-chan";
  songNgu: "nguyen" | "dich" | "song";
  mucLuc: "hien" | "an";
}

/**
 * Mặc định của TRÌNH ĐỌC, cố ý khác mặc định của khung đọc trong panel:
 *  · `co-chan` — chữ có chân cho thân bài, thứ mọi máy đọc sách làm mặc định;
 *  · `rong` (1,9) — giãn dòng rộng, vì đây là chỗ để đọc hàng nghìn dòng;
 *  · `b3` — cỡ chữ nhích lên một bậc, màn hình đã rộng gấp đôi panel.
 */
const MAC_DINH: TuyChinhDoc = {
  coChu: "b3",
  giaiDong: "rong",
  nen: "sang",
  cot: "vua",
  phong: "co-chan",
  songNgu: "song",
  mucLuc: "hien",
};

const HOP_LE: { [K in keyof TuyChinhDoc]: readonly TuyChinhDoc[K][] } = {
  coChu: ["b1", "b2", "b3", "b4", "b5"],
  giaiDong: ["gon", "vua", "rong", "rat-rong"],
  nen: ["sang", "nga", "toi"],
  cot: ["hep", "vua", "rong"],
  phong: ["co-chan", "khong-chan"],
  songNgu: ["nguyen", "dich", "song"],
  mucLuc: ["hien", "an"],
};

/** Chế độ riêng tư ném lỗi ngay ở lượt ĐỌC đầu tiên, không đợi tới lượt ghi. */
function docTuyChinh(): TuyChinhDoc {
  const ra = { ...MAC_DINH };
  try {
    const raw = localStorage.getItem(KHOA_TUY_CHINH);
    if (!raw) return ra;
    const o = rec(JSON.parse(raw) as unknown);
    for (const k of Object.keys(HOP_LE) as Array<keyof TuyChinhDoc>)
      ra[k] = oneOf(o[k], HOP_LE[k], MAC_DINH[k]) as never;
  } catch {
    // JSON hỏng hoặc localStorage bị chặn — dùng mặc định.
  }
  return ra;
}

function ghiTuyChinh(t: TuyChinhDoc): void {
  try {
    localStorage.setItem(KHOA_TUY_CHINH, JSON.stringify({ v: 1, ...t }));
  } catch {
    // Không ghi được thì lựa chọn chỉ sống trong phiên này.
  }
}

function docViTri(): Record<string, number> {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(KHOA_VI_TRI) ?? "{}");
    return v && typeof v === "object" ? (v as Record<string, number>) : {};
  } catch {
    return {};
  }
}

/** Lưu TỈ LỆ, không lưu pixel: đổi cỡ chữ là chiều cao nội dung đổi hẳn. */
function ghiViTri(id: string, tiLe: number): void {
  try {
    const v = docViTri();
    // Đọc hết thì xoá chứ không lưu 100% — mở lại một tác phẩm đã đọc xong mà
    // bị ném thẳng xuống dòng cuối là hành vi khó hiểu. Cùng luật với thuvien.ts.
    if (tiLe >= 0.99 || tiLe <= 0.01) delete v[id];
    else v[id] = Math.round(tiLe * 1000) / 1000;
    localStorage.setItem(KHOA_VI_TRI, JSON.stringify(v));
  } catch {
    // như trên
  }
}

let tuyChinh = docTuyChinh();

// ═══════════════════════════════════════════════════════════════════════════
// 4. Dựng chữ — escape, chú giải, thơ hay văn xuôi
// ═══════════════════════════════════════════════════════════════════════════

const giamChuyenDong = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Markup chú giải, chép ĐÚNG khuôn `boc()` trong `tu-kho-tre-em.ts`.
 *
 * Không phải cơ chế thứ hai: handler bấm-mở là handler uỷ nhiệm ở `document`
 * do `initTuKho()` đăng ký, và nó tìm phần tử theo class chứ không theo nơi
 * sinh ra — nên nút dựng ở đây bấm được y hệt nút dựng trong popup bản đồ.
 * Chép khuôn vì `boc` không nằm trong danh sách export của file kia.
 */
const boc = (tu: string, nghia: string): string =>
  `<span class="tk-boc"><button type="button" class="tk-tu" aria-expanded="false">${esc(
    tu,
  )}</button><span class="tk-nghia" hidden>${esc(nghia)}</span></span>`;

const thoatRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Bảng từ khó RIÊNG của một tác phẩm, dựng một lần cho cả lượt vẽ. */
interface TuKhoRieng {
  mau: RegExp;
  nghia: Map<string, string>;
}

/**
 * Sắp DÀI TRƯỚC vì `|` của regex ăn nhánh khớp sớm nhất chứ không phải nhánh
 * dài nhất. Chặn hai đầu bằng lớp không-chữ-không-số thay vì `\b`: `\b` của JS
 * coi chữ có dấu là ranh giới từ nên khớp bậy giữa tiếng Việt. Cả hai luật
 * này lấy nguyên từ `layMau()` của `tu-kho-tre-em.ts`.
 */
function dungTuKho(gs: Array<{ tu: string; nghia: string }>): TuKhoRieng | null {
  const nghia = new Map<string, string>();
  for (const g of gs) if (g.tu && g.nghia) nghia.set(g.tu.toLowerCase(), g.nghia);
  if (!nghia.size) return null;
  const nhanh = [...nghia.keys()]
    .sort((a, b) => b.length - a.length)
    .map(thoatRegex)
    .join("|");
  return { mau: new RegExp(`(^|[^\\p{L}\\p{N}])(${nhanh})(?![\\p{L}\\p{N}])`, "giu"), nghia };
}

/**
 * Đánh dấu từ khó trên chuỗi THÔ rồi mới `esc()` từng đoạn — cùng thứ tự với
 * `escKho()`, và đó là thứ giữ cho một cụm không bao giờ khớp vào giữa một
 * thực thể HTML (`&amp;`) mà cắt vỡ nó.
 *
 * `daDung` reset theo TỪNG CHƯƠNG chứ không theo cả tác phẩm: đánh dấu một
 * lần cho cả nghìn dòng thì người đọc tới chương 20 không còn chú giải nào,
 * còn đánh dấu mọi lần xuất hiện thì đoạn văn thành rừng gạch chân.
 */
function danhDau(s: string, tk: TuKhoRieng, daDung: Set<string>): string {
  tk.mau.lastIndex = 0;
  let ra = "";
  let cuoi = 0;
  for (let m = tk.mau.exec(s); m; m = tk.mau.exec(s)) {
    const tu = m[2];
    const khoa = tu.toLowerCase();
    const nghia = tk.nghia.get(khoa);
    if (!nghia || daDung.has(khoa)) continue;
    daDung.add(khoa);
    const dau = m.index + m[1].length;
    ra += esc(s.slice(cuoi, dau)) + boc(tu, nghia);
    cuoi = dau + tu.length;
  }
  return ra + esc(s.slice(cuoi));
}

/**
 * Chữ đi vào HTML. Hai đường, không có đường thứ ba:
 *  · tác phẩm CÓ `giai_nghia` → chú giải riêng của bài (curated, đúng ngữ
 *    cảnh) và bỏ qua bảng chung của chế độ trẻ em, để một chữ không bị đánh
 *    dấu hai lần bằng hai lời giải khác nhau;
 *  · không có → `escVanKho()` nguyên bản.
 * `nhamNhay()` chạy sau cùng trên chuỗi đã escape — đúng thứ tự của
 * `escVanKho = nhamNhay(escKho(s))`, và docstring của nó nói rõ chạy đè lên
 * markup chú giải là an toàn.
 */
function chuHtml(s: string, tk: TuKhoRieng | null, daDung: Set<string>): string {
  return tk ? nhamNhay(danhDau(s, tk, daDung)) : escVanKho(s);
}

/**
 * Khối này là thơ hay văn xuôi.
 *
 * Đo trên toàn kho ngày 2026-08-28 (3.524 dòng): trung vị 31 ký tự, p75 là 35,
 * p95 là 70, dài nhất 881 — hai cụm tách hẳn nhau. Ngưỡng 56 rơi vào khoảng
 * trống giữa chúng. Thơ thì mỗi phần tử là một CÂU (không giãn cách giữa các
 * dòng, dòng tràn thụt vào); văn xuôi thì mỗi phần tử là một ĐOẠN.
 */
function laTho(dong: string[]): boolean {
  if (!dong.length) return false;
  const dai = dong.map((d) => d.length).sort((a, b) => a - b);
  return dai[Math.floor(dai.length / 2)] <= 56;
}

function khoiHtml(dong: string[], tk: TuKhoRieng | null, daDung: Set<string>): string {
  const kieu = laTho(dong) ? "tho" : "van";
  return `<div class="ds-khoi" data-kieu="${kieu}">${dong
    .map((d) => `<p class="ds-cau">${chuHtml(d, tk, daDung)}</p>`)
    .join("")}</div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. Dựng lớp phủ
// ═══════════════════════════════════════════════════════════════════════════

const ID_LOP = "ds-lop";

const NHAN_NEN: Record<TuyChinhDoc["nen"], string> = {
  sang: "Sáng",
  nga: "Ngà",
  toi: "Tối",
};

const NHOM_TC: Array<{
  khoa: keyof TuyChinhDoc;
  nhan: string;
  chon: Array<[string, string]>;
}> = [
  {
    khoa: "coChu",
    nhan: "Cỡ chữ",
    chon: [["b1", "Rất nhỏ"], ["b2", "Nhỏ"], ["b3", "Vừa"], ["b4", "Lớn"], ["b5", "Rất lớn"]],
  },
  {
    khoa: "giaiDong",
    nhan: "Giãn dòng",
    chon: [["gon", "Gọn"], ["vua", "Vừa"], ["rong", "Rộng"], ["rat-rong", "Rất rộng"]],
  },
  {
    khoa: "nen",
    nhan: "Nền đọc",
    chon: (Object.keys(NHAN_NEN) as Array<TuyChinhDoc["nen"]>).map((k) => [k, NHAN_NEN[k]]),
  },
  { khoa: "cot", nhan: "Bề rộng cột", chon: [["hep", "Hẹp"], ["vua", "Vừa"], ["rong", "Rộng"]] },
  {
    khoa: "phong",
    nhan: "Phông chữ",
    chon: [["co-chan", "Có chân"], ["khong-chan", "Không chân"]],
  },
];

function tcHtml(coSongNgu: boolean): string {
  const nhom = [...NHOM_TC];
  if (coSongNgu)
    nhom.push({
      khoa: "songNgu",
      nhan: "Bản dịch",
      chon: [["nguyen", "Nguyên văn"], ["dich", "Bản dịch"], ["song", "Song song"]],
    });
  return nhom
    .map(
      (n) => `<fieldset class="ds-tc-nhom">
        <legend>${esc(n.nhan)}</legend>
        <div class="ds-tc-nut">${n.chon
          .map(
            ([v, nhan]) =>
              `<button type="button" class="ds-nut ds-tc-btn${
                tuyChinh[n.khoa] === v ? " ds-chon" : ""
              }" data-tc="${esc(n.khoa)}" data-gia-tri="${esc(v)}"
                 aria-pressed="${tuyChinh[n.khoa] === v}">${esc(nhan)}</button>`,
          )
          .join("")}</div>
      </fieldset>`,
    )
    .join("");
}

const NHAN_BAN_QUYEN: Record<string, string> = {
  "public-domain": "Hết thời hạn bảo hộ — được chép nguyên văn.",
  "cited-excerpt":
    "Tác phẩm còn được bảo hộ — chỉ trích dẫn ngắn theo Điều 25 Luật Sở hữu trí tuệ.",
};

/**
 * Khối bản quyền & xuất xứ. KHÔNG gập lại được, và đứng ngay dưới thân bài:
 * với một tác phẩm cổ, câu hỏi thật không phải «tác giả mất chưa» mà «người
 * DỊCH mất chưa» — người đọc phải thấy được văn bản này lấy ở đâu và vì sao
 * được phép chép, không phải đi tìm.
 */
function banQuyenHtml(s: SachDoc): string {
  const hang: Array<[string, string]> = [];
  const nhan = NHAN_BAN_QUYEN[s.banQuyen] ?? s.banQuyen;
  if (nhan) hang.push(["Tình trạng", nhan]);
  if (s.coSoBanQuyen) hang.push(["Cơ sở đăng toàn văn", s.coSoBanQuyen]);
  if (s.nguoiDich) hang.push(["Người dịch / sưu tầm", s.nguoiDich]);
  if (s.banTheo) hang.push(["Theo bản", s.banTheo]);
  if (s.nguonToanVan) hang.push(["Văn bản lấy từ", s.nguonToanVan]);
  const dl = hang.length
    ? `<dl class="ds-bq-bang">${hang
        .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${escVanKho(v)}</dd>`)
        .join("")}</dl>`
    : "";
  return `<section class="ds-bq">
      <h3>Bản quyền &amp; xuất xứ</h3>
      ${dl}
      <h4>Nguồn</h4>
      <ul class="ds-nguon">${s.nguon.map((n) => `<li>${escVan(n)}</li>`).join("")}</ul>
    </section>`;
}

function giaiNghiaHtml(s: SachDoc): string {
  if (!s.giaiNghia.length) return "";
  return `<details class="ds-tudien">
      <summary>💡 Từ khó trong tác phẩm (${s.giaiNghia.length})</summary>
      <dl>${s.giaiNghia
        .map((g) => `<dt>${escVan(g.tu)}</dt><dd>${escVan(g.nghia)}</dd>`)
        .join("")}</dl>
    </details>`;
}

function mucLucHtml(s: SachDoc): string {
  if (s.chuong.length < 2) return "";
  return `<ol class="ds-ml-ds">${s.chuong
    .map(
      (c, i) =>
        `<li><button type="button" class="ds-ml-btn" data-chuong="${i}">${escVan(
          c.tieu_de || `Phần ${i + 1}`,
        )}</button></li>`,
    )
    .join("")}</ol>`;
}

function chuongHtml(s: SachDoc): string {
  return s.chuong
    .map((c, i) => {
      // daDung reset ở đây — mỗi chương được đánh dấu từ khó lại từ đầu.
      const tk = dungTuKho(s.giaiNghia);
      const daDung = new Set<string>();
      const nguyen = khoiHtml(c.dong, tk, daDung);
      const dich = c.ban_dich?.length ? khoiHtml(c.ban_dich, tk, daDung) : "";
      const than = dich
        ? `<div class="ds-song">
             <div class="ds-cot-nguyen"><p class="ds-nhan-khoi">Nguyên văn</p>${nguyen}</div>
             <div class="ds-cot-dich"><p class="ds-nhan-khoi">Bản dịch</p>${dich}</div>
           </div>`
        : nguyen;
      return `<section class="ds-chuong" id="ds-chuong-${i}" data-chuong="${i}">
          ${c.tieu_de ? `<h3 class="ds-chuong-ten">${escVan(c.tieu_de)}</h3>` : ""}
          ${than}
        </section>`;
    })
    .join("");
}

const MAN_RONG = "(min-width: 900px)";

/**
 * Mục lục có mở sẵn lúc vừa vào không.
 *
 * Lựa chọn đã lưu chỉ được tôn trọng trên màn RỘNG. Dưới 900px mục lục là một
 * NGĂN KÉO đè lên chữ, nên mở sẵn nghĩa là mở trình đọc ra và không thấy một
 * dòng nào của tác phẩm — đúng lỗi đã chụp được ở bề ngang 390px.
 */
function mucLucBanDau(): boolean {
  return tuyChinh.mucLuc === "hien" && window.matchMedia(MAN_RONG).matches;
}

function lopHtml(s: SachDoc): string {
  const coSongNgu = s.chuong.some((c) => c.ban_dich?.length);
  const coMucLuc = s.chuong.length >= 2;
  return `<div class="ds-hop" role="dialog" aria-modal="true"
       aria-label="Đọc toàn văn: ${esc(s.ten)}"
       data-nen="${esc(tuyChinh.nen)}" data-co-chu="${esc(tuyChinh.coChu)}"
       data-giai-dong="${esc(tuyChinh.giaiDong)}" data-cot="${esc(tuyChinh.cot)}"
       data-phong="${esc(tuyChinh.phong)}" data-song-ngu="${esc(tuyChinh.songNgu)}"
       data-co-dich="${coSongNgu ? "1" : "0"}"
       data-muc-luc="${coMucLuc && mucLucBanDau() ? "hien" : "an"}">
      <header class="ds-dau">
        <div class="ds-danh">
          <h2 class="ds-ten">${escVan(s.ten)}</h2>
          ${s.meta ? `<p class="ds-meta">${escVan(s.meta)}</p>` : ""}
        </div>
        <div class="ds-nut-dau">
          ${
            coMucLuc
              ? `<button type="button" class="ds-nut ds-ml-mo"
                   aria-expanded="${mucLucBanDau()}">☰ Mục lục</button>`
              : ""
          }
          <details class="ds-tc">
            <summary class="ds-nut">Aa Tuỳ chỉnh</summary>
            <div class="ds-tc-than">${tcHtml(!!coSongNgu)}</div>
          </details>
          <button type="button" class="ds-nut ds-dong" aria-label="Đóng trình đọc">×</button>
        </div>
      </header>
      <div class="ds-giua">
        ${
          coMucLuc
            ? `<nav class="ds-ml" aria-label="Mục lục tác phẩm">
                 <p class="ds-ml-nhan">${s.chuong.length} phần · ${soDongSach(s)} dòng</p>
                 ${mucLucHtml(s)}
               </nav>`
            : ""
        }
        <div class="ds-doc" tabindex="0">
          <article class="ds-trang">
            ${s.tacGia ? `<p class="ds-tac-gia">${escVan(s.tacGia)}</p>` : ""}
            ${s.videoHtml ? `<div class="ds-video">${s.videoHtml}</div>` : ""}
            ${s.loiBinh ? `<p class="ds-loi-binh">${escVanKho(s.loiBinh)}</p>` : ""}
            ${giaiNghiaHtml(s)}
            ${chuongHtml(s)}
            ${s.ghiChu ? `<p class="ds-ghi-chu">${escVanKho(s.ghiChu)}</p>` : ""}
            ${banQuyenHtml(s)}
          </article>
        </div>
      </div>
      <footer class="ds-chan">
        <div class="ds-tien-do" role="progressbar" aria-label="Tiến độ đọc"
             aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <span class="ds-ray"><span class="ds-thanh"></span></span>
          <span class="ds-phan-tram">0%</span>
        </div>
        <div class="ds-lat">
          <button type="button" class="ds-nut ds-truoc" aria-label="Trang trước">‹</button>
          <button type="button" class="ds-nut ds-sau" aria-label="Trang sau">›</button>
        </div>
        <p class="ds-phim">← → hoặc PageUp/PageDown lật trang · + − cỡ chữ · Esc đóng</p>
      </footer>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. Mở · đóng · bẫy tiêu điểm
// ═══════════════════════════════════════════════════════════════════════════

/** Phần tử đã mở trình đọc — tiêu điểm phải quay về đúng đó lúc đóng. */
let nutMoTruoc: HTMLElement | null = null;
/** Mọi việc phải dọn khi đóng: listener, observer, timer. */
let donDep: Array<() => void> = [];

const CHON_TIEU_DIEM =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]),' +
  ' textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

/** Chỉ phần tử ĐANG HIỆN mới nhận tiêu điểm — nội dung trong `<details>` đóng
 *  hay trong mục lục đang ẩn không có hình chữ nhật nào. */
function nhanTieuDiem(goc: HTMLElement): HTMLElement[] {
  return [...goc.querySelectorAll<HTMLElement>(CHON_TIEU_DIEM)].filter(
    (e) => e.tabIndex !== -1 && e.getClientRects().length > 0,
  );
}

export function dongTrinhDoc(): void {
  const lop = document.getElementById(ID_LOP);
  if (!lop) return;
  for (const f of donDep) f();
  donDep = [];
  lop.remove();
  document.documentElement.classList.remove("ds-khoa-cuon");
  nutMoTruoc?.focus({ preventScroll: true });
  nutMoTruoc = null;
}

/**
 * Mở trình đọc toàn màn hình.
 *
 * @param s     Tác phẩm đã chuẩn hoá.
 * @param nutMo Nút đã mở — tiêu điểm trả về đây khi đóng.
 */
export function moTrinhDoc(s: SachDoc, nutMo?: HTMLElement | null): void {
  dongTrinhDoc();
  nutMoTruoc = nutMo ?? (document.activeElement as HTMLElement | null);

  const lop = document.createElement("div");
  lop.id = ID_LOP;
  lop.className = "ds-lop";
  lop.innerHTML = lopHtml(s);
  document.body.appendChild(lop);
  document.documentElement.classList.add("ds-khoa-cuon");

  const hop = lop.querySelector<HTMLElement>(".ds-hop");
  const doc = lop.querySelector<HTMLElement>(".ds-doc");
  if (!hop || !doc) return;

  noiSuKien(lop, hop, doc);
  noiPhim(lop, hop, doc);
  noiTienDo(hop, doc, s);
  noiMucLuc(hop, doc, s);

  doc.focus({ preventScroll: true });
}

// ── Bấm ─────────────────────────────────────────────────────────────────────

function apTuyChinh(hop: HTMLElement): void {
  hop.dataset.nen = tuyChinh.nen;
  hop.dataset.coChu = tuyChinh.coChu;
  hop.dataset.giaiDong = tuyChinh.giaiDong;
  hop.dataset.cot = tuyChinh.cot;
  hop.dataset.phong = tuyChinh.phong;
  hop.dataset.songNgu = tuyChinh.songNgu;
  for (const b of hop.querySelectorAll<HTMLButtonElement>(".ds-tc-btn")) {
    const chon = tuyChinh[b.dataset.tc as keyof TuyChinhDoc] === b.dataset.giaTri;
    b.classList.toggle("ds-chon", chon);
    b.setAttribute("aria-pressed", String(chon));
  }
}

function datMucLuc(hop: HTMLElement, hien: boolean): void {
  tuyChinh.mucLuc = hien ? "hien" : "an";
  ghiTuyChinh(tuyChinh);
  hop.dataset.mucLuc = tuyChinh.mucLuc;
  hop.querySelector<HTMLElement>(".ds-ml-mo")?.setAttribute("aria-expanded", String(hien));
}

function noiSuKien(lop: HTMLElement, hop: HTMLElement, doc: HTMLElement): void {
  const khiBam = (e: MouseEvent): void => {
    const t = e.target as HTMLElement | null;
    if (!t) return;

    if (t.closest(".ds-dong")) {
      dongTrinhDoc();
      return;
    }
    // Bấm vào nền ngoài hộp = đóng. Chỉ nhận cú bấm rơi ĐÚNG lên lớp phủ, để
    // một cú kéo chọn chữ kết thúc ngoài mép không vô tình đóng cả trình đọc.
    if (t === lop) {
      dongTrinhDoc();
      return;
    }
    if (t.closest(".ds-ml-mo")) {
      datMucLuc(hop, hop.dataset.mucLuc !== "hien");
      return;
    }
    const ml = t.closest<HTMLElement>(".ds-ml-btn");
    if (ml?.dataset.chuong) {
      const i = Number(ml.dataset.chuong);
      hop.querySelector<HTMLElement>(`#ds-chuong-${i}`)?.scrollIntoView({
        behavior: giamChuyenDong() ? "auto" : "smooth",
        block: "start",
      });
      // Màn hẹp: mục lục là ngăn kéo đè lên chữ — chọn xong phải đóng lại,
      // nếu không người đọc nhảy tới chương rồi vẫn không nhìn thấy nó.
      if (!window.matchMedia(MAN_RONG).matches) datMucLuc(hop, false);
      return;
    }
    const tc = t.closest<HTMLElement>("[data-tc]");
    if (tc?.dataset.tc && tc.dataset.giaTri) {
      tuyChinh[tc.dataset.tc as keyof TuyChinhDoc] = tc.dataset.giaTri as never;
      ghiTuyChinh(tuyChinh);
      apTuyChinh(hop);
      return;
    }
    if (t.closest(".ds-truoc")) lat(doc, -1);
    else if (t.closest(".ds-sau")) lat(doc, 1);
  };
  lop.addEventListener("click", khiBam);
  donDep.push(() => lop.removeEventListener("click", khiBam));
}

// ── Lật trang ───────────────────────────────────────────────────────────────

/**
 * Lật một màn, chừa 3 dòng chồng lên nhau.
 *
 * Máy đọc sách nào cũng chừa: nhảy đúng một màn hình đầy làm mắt mất câu cuối
 * cùng vừa đọc dở. `scrollBy` chứ không phải vòng lặp rAF tự viết — luật
 * giảm-chuyển-động toàn cục chỉ bắt transition/animation CSS và
 * `scroll-behavior`, một tween tay sẽ lọt lưới.
 */
function lat(doc: HTMLElement, huong: 1 | -1): void {
  const chong = Math.min(96, doc.clientHeight * 0.12);
  doc.scrollBy({
    top: huong * (doc.clientHeight - chong),
    behavior: giamChuyenDong() ? "auto" : "smooth",
  });
}

// ── Bàn phím + bẫy tiêu điểm ────────────────────────────────────────────────

const NAC_CO: Array<TuyChinhDoc["coChu"]> = ["b1", "b2", "b3", "b4", "b5"];

function doiCoChu(hop: HTMLElement, buoc: 1 | -1): void {
  const i = NAC_CO.indexOf(tuyChinh.coChu) + buoc;
  if (i < 0 || i >= NAC_CO.length) return;
  tuyChinh.coChu = NAC_CO[i];
  ghiTuyChinh(tuyChinh);
  apTuyChinh(hop);
}

function noiPhim(lop: HTMLElement, hop: HTMLElement, doc: HTMLElement): void {
  const khiPhim = (e: KeyboardEvent): void => {
    const dich = e.target as HTMLElement | null;
    const trongO = !!dich?.closest("input, textarea, select");

    if (e.key === "Escape") {
      // 🔴 stopPropagation BẮT BUỘC: main.ts gắn một listener Escape ở
      // `document` gọi `hideAllPanels()`. Không chặn thì một cú Escape đóng
      // luôn cả panel Thư viện phía sau và người đọc mất chỗ đang duyệt.
      // Listener này nằm trên chính lớp phủ nên chạy TRƯỚC listener ở document.
      e.stopPropagation();
      e.preventDefault();
      dongTrinhDoc();
      return;
    }

    if (e.key === "Tab") {
      const ds = nhanTieuDiem(hop);
      if (!ds.length) return;
      const dau = ds[0];
      const cuoi = ds[ds.length - 1];
      const dang = document.activeElement as HTMLElement | null;
      // Bẫy tiêu điểm: Tab ở phần tử cuối quay về đầu, Shift+Tab ngược lại.
      // Cả hai nhánh đều kiểm `hop.contains(dang)` để tiêu điểm lỡ rơi ra
      // ngoài (bấm chuột vào trang sau lưng lớp phủ) vẫn được kéo về.
      if (e.shiftKey && (dang === dau || !hop.contains(dang))) {
        e.preventDefault();
        cuoi.focus();
      } else if (!e.shiftKey && (dang === cuoi || !hop.contains(dang))) {
        e.preventDefault();
        dau.focus();
      }
      return;
    }

    if (trongO) return;

    if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      lat(doc, -1);
    } else if (e.key === "ArrowRight" || e.key === "PageDown") {
      e.preventDefault();
      lat(doc, 1);
    } else if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      doiCoChu(hop, 1);
    } else if (e.key === "-") {
      e.preventDefault();
      doiCoChu(hop, -1);
    }
  };
  lop.addEventListener("keydown", khiPhim);
  donDep.push(() => lop.removeEventListener("keydown", khiPhim));
}

// ── Tiến độ + nhớ chỗ đang đọc ──────────────────────────────────────────────

function noiTienDo(hop: HTMLElement, doc: HTMLElement, s: SachDoc): void {
  const thanh = hop.querySelector<HTMLElement>(".ds-thanh");
  const so = hop.querySelector<HTMLElement>(".ds-phan-tram");
  const vach = hop.querySelector<HTMLElement>(".ds-tien-do");
  const truoc = hop.querySelector<HTMLButtonElement>(".ds-truoc");
  const sau = hop.querySelector<HTMLButtonElement>(".ds-sau");
  if (!thanh || !so || !vach || !truoc || !sau) return;

  let hen: number | undefined;
  const ve = (): void => {
    const tong = doc.scrollHeight - doc.clientHeight;
    // Nội dung ngắn hơn khung: không có gì để cuộn, phần trăm vô nghĩa.
    if (tong <= 4) {
      vach.hidden = true;
      truoc.disabled = true;
      sau.disabled = true;
      return;
    }
    vach.hidden = false;
    const t = Math.min(1, Math.max(0, doc.scrollTop / tong));
    const pct = Math.round(t * 100);
    thanh.style.width = `${pct}%`;
    so.textContent = `${pct}%`;
    vach.setAttribute("aria-valuenow", String(pct));
    truoc.disabled = doc.scrollTop <= 0;
    sau.disabled = doc.scrollTop >= tong - 1;
    window.clearTimeout(hen);
    hen = window.setTimeout(() => ghiViTri(s.id, t), 400);
  };

  doc.addEventListener("scroll", ve, { passive: true });
  const theoDoi = new ResizeObserver(ve);
  theoDoi.observe(doc);

  // Vẽ NGAY một lần trước khi chờ khung hình: tab ở nền thì Chrome dừng hẳn
  // requestAnimationFrame (đo được 2026-08-27) và vạch sẽ đứng ở 0% vĩnh viễn.
  ve();

  const luu = docViTri()[s.id];
  requestAnimationFrame(() => {
    const tong = doc.scrollHeight - doc.clientHeight;
    if (luu && luu > 0.01 && tong > 4) doc.scrollTop = luu * tong;
    ve();
  });

  donDep.push(() => {
    theoDoi.disconnect();
    doc.removeEventListener("scroll", ve);
    window.clearTimeout(hen);
  });
}

// ── Làm nổi chương đang đọc ─────────────────────────────────────────────────

/**
 * Chương đang đọc = chương cuối cùng có đầu chương đã trôi qua vạch 1/4 màn.
 *
 * Không dùng IntersectionObserver: một chương dài hơn khung nhìn thì KHÔNG có
 * ranh giới nào cắt qua trong suốt hàng nghìn pixel cuộn, nên observer im
 * lặng và nhãn «đang đọc» kẹt ở chương trước. So vị trí thì luôn có câu trả lời.
 */
function noiMucLuc(hop: HTMLElement, doc: HTMLElement, s: SachDoc): void {
  if (s.chuong.length < 2) return;
  const nut = [...hop.querySelectorAll<HTMLElement>(".ds-ml-btn")];
  const dau = [...hop.querySelectorAll<HTMLElement>(".ds-chuong")];
  if (!nut.length || nut.length !== dau.length) return;

  let daHien = -1;
  let cho = 0;
  const ve = (): void => {
    const moc = doc.scrollTop + doc.clientHeight * 0.25;
    let i = 0;
    for (let k = 0; k < dau.length; k++) if (dau[k].offsetTop <= moc) i = k;
    if (i === daHien) return;
    daHien = i;
    nut.forEach((b, k) => {
      b.classList.toggle("ds-ml-nay", k === i);
      // aria-current chứ không phải aria-selected: đây là danh sách liên kết
      // điều hướng, không phải tab.
      if (k === i) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
    });
  };
  const khiCuon = (): void => {
    if (cho) return;
    cho = requestAnimationFrame(() => {
      cho = 0;
      ve();
    });
  };

  doc.addEventListener("scroll", khiCuon, { passive: true });
  const theoDoi = new ResizeObserver(khiCuon);
  theoDoi.observe(doc);
  ve();

  donDep.push(() => {
    theoDoi.disconnect();
    doc.removeEventListener("scroll", khiCuon);
    if (cho) cancelAnimationFrame(cho);
  });
}
