// ═══════════════════════════════════════════════════════════════════════════
// 📜 Chế độ DÒNG THỜI GIAN — 201 mốc lịch sử đọc thành một mạch
// ═══════════════════════════════════════════════════════════════════════════
//
// `public/data/timeline/moc-lich-su.json` có 201 mốc, nhưng cho tới nay chúng
// chỉ tồn tại dưới dạng vạch nhỏ trên thanh trượt đáy màn hình (moc-lich-su.ts).
// Vạch là BỘ CHỌN: xem được một mốc mỗi lần, không thấy quan hệ trước–sau.
// Module này là cách ĐỌC: lớp phủ toàn màn hình, cuộn dọc từ xưa tới nay.
//
// ── Mật độ mốc: đo ba cách rồi mới chọn ────────────────────────────────────
// 201 mốc trải từ 2879 TCN đến 2025, nhưng chúng dồn cục: thế kỷ XX có 42 mốc,
// 27/50 thế kỷ trong khoảng KHÔNG có mốc nào, và 45 cặp mốc trùng đúng một năm.
// Đo trên trục dọc, coi 120px là chiều cao tối thiểu của một thẻ:
//
//   A. tỉ lệ tuyến tính theo năm  · trục 200.000px → 106/200 thẻ vẫn chồng nhau,
//                                   khoảng trống lớn nhất 48.940px (~24 màn hình)
//   B. log(số năm cách nay)       · trục 200.000px →  82/200 thẻ chồng nhau,
//                                   khoảng trống lớn nhất 59.002px
//   C. thứ tự (mỗi mốc một thẻ)   · trục ~30.000px →   0/200 chồng, trống ≤ 150px
//
// Chọn C. A và B đều KHÔNG cứu được bằng cách kéo dài trục — 45 cặp trùng năm
// thì tỉ lệ nào cũng chồng, và trục càng dài thì khoảng trống càng khổng lồ.
//
// Cái giá của C: trục không còn tỉ lệ với thời gian. Trả lại bằng hai thứ:
//  · giữa hai mốc cách nhau ≥ 50 năm (16 chỗ) chèn một vạch ghi rõ số năm trống;
//  · dải mật độ theo thế kỷ ở đầu trang cho thấy đúng hình dạng lệch của kho.
//
// ── Triều đại: đọc từ nien-hieu.json, KHÔNG đọc từ nấc thanh trượt ─────────
// Thanh trượt có 13 nấc, kho có 201 mốc, nên 83 mốc rơi chung nấc «Đại Việt» và
// nhãn nói SAI triều đại (moc-lich-su.ts đã phải đi chữa lỗi này). Ở đây triều
// đại của một mốc luôn tra thẳng từ `nien-hieu.json` theo NĂM của mốc.
// Mã phải viết lại chứ không import được: `moc-lich-su.ts` chỉ xuất
// `initMocLichSu`/`capNhatMoc`, và đợt này tôi bị cấm ghi file đó.
//
// Một năm có thể thuộc NHIỀU triều — 37/201 mốc rơi vào khoảng Mạc ↔ Lê Trung
// Hưng hay Lê Trung Hưng ↔ Tây Sơn. Hiện đủ cả hai; chọn một triều cho gọn là
// đúng cái bất biến #4 của dự án cấm.
//
// ── Vì sao KHÔNG đi qua panels.ts ──────────────────────────────────────────
// `moPanel()` đặt cứng `aria-modal="false"` và cố ý không bẫy tiêu điểm, vì bản
// đồ sau lưng panel vẫn phải bấm được. Lớp phủ toàn màn hình thì ngược lại: Tab
// không được chạy ra sau lưng nó. Hai giao kèo trái nhau — đây là lớp phủ dựng
// trên `document.body`, đúng tiền lệ của `doc-sach.ts` và phần «cầm tay chỉ
// việc» trong `huong-dan.ts`.

import "./dong-thoi-gian.css";
import { esc } from "./util/html";
import { escVan, escVanKho } from "./popup-noi-dung";
import { fetchJson } from "./util/fetch";
import { str, num, strs, oneOf, rec, itemsOf } from "./types/parse";
import { hideAllPanels } from "./panels";

const ID_LOP = "dtg-lop";
const ID_NUT = "dtg-btn";

// ── Kiểu dữ liệu ───────────────────────────────────────────────────────────

const LOAI = [
  "trieu-dai",
  "khoi-nghia",
  "khang-chien",
  "tran-danh",
  "tac-pham",
  "su-kien",
] as const;
type LoaiMoc = (typeof LOAI)[number];

const NHAN_LOAI: Record<LoaiMoc, string> = {
  "trieu-dai": "Triều đại",
  "khoi-nghia": "Khởi nghĩa",
  "khang-chien": "Kháng chiến",
  "tran-danh": "Trận đánh",
  "tac-pham": "Tác phẩm",
  "su-kien": "Sự kiện",
};

interface Moc {
  id: string;
  nam: number;
  nam_hien_thi: string;
  ten: string;
  loai: LoaiMoc;
  mo_ta: string;
  ghi_chu: string;
  tinh: string;
  nguon: string[];
  lon: number | null;
  lat: number | null;
}

const parseMoc = (raw: unknown): Moc => {
  const r = rec(raw);
  return {
    id: str(r.id),
    nam: num(r.nam) ?? 0,
    // Chuỗi vì dữ liệu có "179 TCN", "~2879 TCN (theo truyền thuyết)" và cả
    // một câu dài 60 ký tự — đừng ép về số.
    nam_hien_thi: str(r.nam_hien_thi) || str(r.nam),
    ten: str(r.ten),
    loai: oneOf(r.loai, LOAI, "su-kien"),
    mo_ta: str(r.mo_ta),
    ghi_chu: str(r.ghi_chu),
    tinh: str(r.tinh_34),
    nguon: strs(r.nguon),
    lon: num(r.lon),
    lat: num(r.lat),
  };
};

interface NienHieu {
  trieu_dai: string;
  tu_nam: number;
  den_nam: number;
}

const parseNienHieu = (raw: unknown): NienHieu => {
  const r = rec(raw);
  return {
    trieu_dai: str(r.trieu_dai),
    tu_nam: num(r.tu_nam) ?? 0,
    den_nam: num(r.den_nam) ?? 0,
  };
};

export interface CauHinhDongThoiGian {
  /** Năm mở đầu đoạn rãnh của từng thời kỳ — cùng bảng `NAM_MOC_KY` của main.ts. */
  namKy: number[];
  /** Nhãn từng thời kỳ (PERIODS[i].nhan) — dùng cho bộ lọc «thời kỳ». */
  tenKy: string[];
  /** Kéo thanh thời gian về một thời kỳ. */
  datPeriod: (i: number) => void;
  /** Bay bản đồ tới một toạ độ. `tucThi` = true khi người dùng tắt hiệu ứng. */
  bayToi: (lon: number, lat: number, tucThi: boolean) => void;
}

// ── Trạng thái module ──────────────────────────────────────────────────────

let CFG: CauHinhDongThoiGian | null = null;
let DS: Moc[] = [];
let NH: NienHieu[] = [];
/** Thứ hạng triều đại theo năm bắt đầu sớm nhất — giữ chữ ký nhóm ổn định. */
let hangTrieu = new Map<string, number>();
/** Năm cuối cùng bảng niên hiệu phủ tới. */
let namHetNienHieu = 0;
/** id sa đồ ứng với từng mốc; chuỗi rỗng = không có sa đồ. */
let saDoCuaMoc: string[] = [];
let daNap = false;

/**
 * Chế độ «đoán năm»: che năm của mọi thẻ, bấm mới hiện.
 *
 * Cơ sở: hiệu ứng hỏi-trước — đoán một câu trả lời TRƯỚC khi thấy nó làm nhớ
 * lâu hơn là đọc thẳng. Nhưng độ lớn chỉ áp cho ĐÚNG PHẦN ĐÃ HỎI (g = 0,54),
 * gần như bằng không cho phần còn lại (g = 0,04). Nên chỗ đặt câu hỏi phải là
 * chỗ đáng nhớ nhất — ở một dòng thời gian, đó là NĂM và thứ tự trước–sau,
 * chứ không phải mô tả.
 *
 * Che theo TỪNG THẺ chứ không theo cụm: hỏi một câu cho mỗi cụm thì 26 câu
 * phủ 26 mốc, còn 175 mốc kia không được gì. Che năm thì cả 201 mốc đều là
 * một lượt đoán, mà không cần soạn thêm một chữ nội dung nào.
 *
 * Mặc định TẮT: đọc một mạch vẫn là việc chính của chế độ này.
 *
 * ⚠️ Che không kín tuyệt đối — tiêu đề nhóm vẫn ghi đoạn năm của triều đại
 * («Nhà Trần · 1225–1400»). Đó là gợi ý ở mức thế kỷ, không phải đáp án; giấu
 * nốt nó thì mất luôn dải triều đại, thứ mà brief đòi phải luôn nhìn thấy.
 */
let anNam = false;

/** Bộ lọc đang bật. */
const loc = {
  loai: new Set<LoaiMoc>(LOAI),
  /** Chỉ số thời kỳ, -1 = mọi thời kỳ. */
  ky: -1,
  /** Tên tỉnh bộ 34, chuỗi rỗng = mọi tỉnh. */
  tinh: "",
};

let nutMoTruoc: HTMLElement | null = null;
let donDep: Array<() => void> = [];

// ── Tiện ích nhỏ ───────────────────────────────────────────────────────────

const giamChuyenDong = (): boolean =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Năm → nhãn đọc được. Năm KHÔNG nhóm hàng nghìn: «1.225» không phải một năm. */
const nhanNam = (n: number): string => (n < 0 ? `${-n} TCN` : String(n));

/** Số lượng có nhóm hàng nghìn kiểu Việt Nam: 1200 → «1.200». */
const soVN = (n: number): string => n.toLocaleString("vi-VN");

/** Năm → chỉ số thời kỳ trên thanh trượt. Cùng phép chia đoạn của main.ts. */
function kyChuaNam(nam: number): number {
  const namKy = CFG?.namKy ?? [];
  for (let i = namKy.length - 1; i >= 0; i--) if (nam >= namKy[i]) return i;
  return 0;
}

/**
 * Mọi triều đại phủ năm `nam`, sắp theo thứ hạng cố định.
 *
 * Sắp xếp là BẮT BUỘC chứ không phải cho đẹp: `nien-hieu.json` xếp xen kẽ hai
 * triều song song, nên giữ nguyên thứ tự file thì năm 1533 ra «Mạc + Lê Trung
 * Hưng» còn năm 1545 ra «Lê Trung Hưng + Mạc». Hai chữ ký khác nhau cho cùng
 * một cặp triều sẽ cắt vụn dải triều đại thành 5 nhóm rời ở chỗ đáng lẽ là 1.
 */
function trieuTaiNam(nam: number): string[] {
  const ra: string[] = [];
  for (const x of NH)
    if (nam >= x.tu_nam && nam <= x.den_nam && !ra.includes(x.trieu_dai)) ra.push(x.trieu_dai);
  return ra.sort((a, b) => (hangTrieu.get(a) ?? 0) - (hangTrieu.get(b) ?? 0));
}

/** Đoạn năm của một triều đại, gộp mọi lát niên hiệu của nó. */
function doanNamTrieu(ten: string): [number, number] | null {
  let tu = Infinity;
  let den = -Infinity;
  for (const x of NH)
    if (x.trieu_dai === ten) {
      tu = Math.min(tu, x.tu_nam);
      den = Math.max(den, x.den_nam);
    }
  return Number.isFinite(tu) ? [tu, den] : null;
}

/**
 * id mốc → id sa đồ, hoặc chuỗi rỗng.
 *
 * Ba luật, xếp từ chắc tới lỏng, và luật lỏng nhất chỉ nhận khi có ĐÚNG MỘT
 * ứng viên. Cố ý không đoán mò thêm: một liên kết sai sẽ mở nhầm trận đánh,
 * mà đó là lỗi nội dung chứ không phải lỗi giao diện.
 *
 * Đo trên dữ liệu thật (201 mốc × 290 sa đồ): khớp 53 mốc, trong đó 27/31 mốc
 * loại «trận đánh». 4 mốc trận đánh còn lại không khớp vì hai kho đặt slug khác
 * hẳn nhau (`chien-dich-ho-chi-minh-1975` ↔ `chien-dich-hcm-1975`) — chúng rơi
 * về nút mở danh sách sa đồ, không bịa liên kết.
 */
function khopSaDo(idMoc: string, dsSaDo: string[]): string {
  if (dsSaDo.includes(idMoc)) return idMoc;
  const boTran = idMoc.replace(/^tran-/, "");
  if (boTran !== idMoc && dsSaDo.includes(boTran)) return boTran;

  const t = new Set(idMoc.split("-").filter(Boolean));
  const chua = (a: Set<string>, b: Set<string>): boolean => [...a].every((x) => b.has(x));
  let trung = "";
  let dem = 0;
  for (const sid of dsSaDo) {
    const u = new Set(sid.split("-").filter(Boolean));
    if (chua(u, t) || chua(t, u)) {
      trung = sid;
      if (++dem > 1) return "";
    }
  }
  return dem === 1 ? trung : "";
}

// ── Nạp dữ liệu ────────────────────────────────────────────────────────────

async function nap(): Promise<void> {
  if (daNap) return;
  const [dMoc, dNien, dSaDo] = await Promise.all([
    fetchJson("data/timeline/moc-lich-su.json", itemsOf(parseMoc)),
    fetchJson("data/timeline/nien-hieu.json", itemsOf(parseNienHieu)),
    // Chỉ mục sa đồ hỏng chỉ làm mất nút «xem sa đồ», không được kéo sập cả
    // dòng thời gian.
    fetchJson("data/battles/_index.json", (raw) => strs(rec(raw).ids)),
  ]);
  if (!dMoc) return;
  daNap = true;

  DS = dMoc.items.filter((m) => m.id && m.ten).sort((a, b) => a.nam - b.nam);
  NH = dNien?.items.filter((x) => x.trieu_dai) ?? [];

  hangTrieu = new Map();
  for (const x of [...NH].sort((a, b) => a.tu_nam - b.tu_nam))
    if (!hangTrieu.has(x.trieu_dai)) hangTrieu.set(x.trieu_dai, hangTrieu.size);
  namHetNienHieu = NH.reduce((m, x) => Math.max(m, x.den_nam), 0);

  const ids = dSaDo ?? [];
  saDoCuaMoc = DS.map((m) => khopSaDo(m.id, ids));
}

// ── Dựng HTML ──────────────────────────────────────────────────────────────

/** Mốc còn lại sau bộ lọc, dạng chỉ số vào `DS`. */
function locMoc(): number[] {
  const ra: number[] = [];
  for (let i = 0; i < DS.length; i++) {
    const m = DS[i];
    if (!loc.loai.has(m.loai)) continue;
    if (loc.ky >= 0 && kyChuaNam(m.nam) !== loc.ky) continue;
    if (loc.tinh && m.tinh !== loc.tinh) continue;
    ra.push(i);
  }
  return ra;
}

/** Danh sách tỉnh có mặt trong kho, kèm số mốc. */
function dsTinh(): Array<[string, number]> {
  const d = new Map<string, number>();
  for (const m of DS) if (m.tinh) d.set(m.tinh, (d.get(m.tinh) ?? 0) + 1);
  return [...d.entries()].sort((a, b) => a[0].localeCompare(b[0], "vi"));
}

function htmlLoc(): string {
  const dem = new Map<LoaiMoc, number>();
  for (const m of DS) dem.set(m.loai, (dem.get(m.loai) ?? 0) + 1);

  const chip = LOAI.map((l) => {
    const bat = loc.loai.has(l);
    const n = dem.get(l) ?? 0;
    // Con số là TỔNG TRONG KHO, không phải số đang hiện — nó đứng yên khi lọc
    // theo tỉnh hay thời kỳ. Số đang hiện nằm ở ô đếm «Hiện N/201» trên đầu;
    // `title` nói rõ để hai con số cạnh nhau không đọc thành mâu thuẫn.
    return `<button type="button" class="dtg-chip-loc" data-loai="${l}" aria-pressed="${bat}"
      title="${esc(`${bat ? "Đang hiện" : "Đang ẩn"} loại ${NHAN_LOAI[l]} — ${n} mốc trong kho`)}">
      <span class="dtg-hinh" data-loai="${l}" aria-hidden="true"></span>
      ${esc(NHAN_LOAI[l])}
      <span class="dtg-chip-dem">${n}</span>
    </button>`;
  }).join("");

  // `esc` chứ không phải `escVan` bên trong <option>: `escVan` chèn thẻ <i> cho
  // dấu « », mà <option> không chứa được thẻ con.
  const oKy = (CFG?.tenKy ?? [])
    .map((t, i) => `<option value="${i}"${i === loc.ky ? " selected" : ""}>${esc(t)}</option>`)
    .join("");
  const oTinh = dsTinh()
    .map(
      ([t, n]) =>
        `<option value="${esc(t)}"${t === loc.tinh ? " selected" : ""}>${esc(t)} (${n})</option>`,
    )
    .join("");

  return `<div class="dtg-loc">
    <div class="dtg-loc-loai" role="group" aria-label="Lọc theo loại sự kiện">${chip}</div>
    <div class="dtg-loc-o">
      <label class="dtg-nhan-o">Thời kỳ
        <select class="dtg-o" id="dtg-o-ky">
          <option value="-1"${loc.ky < 0 ? " selected" : ""}>Mọi thời kỳ</option>${oKy}
        </select>
      </label>
      <label class="dtg-nhan-o">Tỉnh
        <select class="dtg-o" id="dtg-o-tinh">
          <option value=""${loc.tinh ? "" : " selected"}>Mọi tỉnh</option>${oTinh}
        </select>
      </label>
      <button type="button" class="dtg-nut-phu dtg-xoa-loc">Bỏ lọc</button>
      <button type="button" class="dtg-nut-phu dtg-doan-bat" aria-pressed="${anNam}"
        title="Che năm của mọi thẻ; bấm vào ô trống để hiện — đoán trước khi xem thì nhớ lâu hơn">${
          anNam ? "🙉 Hiện lại năm" : "🙈 Ẩn năm — đoán trước"
        }</button>
    </div>
  </div>`;
}

/**
 * Dải mật độ theo thế kỷ.
 *
 * Đây là lời khai thẳng cho cái giá của bố cục theo thứ tự: trục không còn tỉ
 * lệ với thời gian, nên hình dạng thật của kho phải hiện ra ở đâu đó. Cột cao
 * nhất 42 mốc (thế kỷ XX), thấp nhất 1, và 27/50 thế kỷ trống trơn.
 *
 * `aria-hidden` và KHÔNG bấm được: nó là đồ hoạ, không phải bộ điều khiển. Muốn
 * nhảy tới một quãng thời gian thì dùng ô «Thời kỳ» ngay bên trên — bàn phím và
 * trình đọc màn hình đi đường đó, không phải đi qua 50 cột 6px.
 */
function htmlMatDo(): string {
  if (!DS.length) return "";
  const dau = Math.floor(DS[0].nam / 100) * 100;
  const cuoi = Math.floor(DS[DS.length - 1].nam / 100) * 100;
  const dem = new Map<number, number>();
  for (const m of DS) {
    const c = Math.floor(m.nam / 100) * 100;
    dem.set(c, (dem.get(c) ?? 0) + 1);
  }
  const dinh = Math.max(...dem.values());
  const cot: string[] = [];
  for (let c = dau; c <= cuoi; c += 100) {
    const n = dem.get(c) ?? 0;
    cot.push(`<span class="dtg-cot" style="--cao:${Math.round((n / dinh) * 100)}%"></span>`);
  }
  return `<div class="dtg-matdo" aria-hidden="true">
    <span class="dtg-matdo-nhan">${esc(nhanNam(dau))}</span>
    <span class="dtg-matdo-cot">${cot.join("")}</span>
    <span class="dtg-matdo-nhan">${esc(nhanNam(cuoi))}</span>
  </div>`;
}

function htmlNguon(nguon: string[]): string {
  if (!nguon.length) return "";
  // Không dùng `sourcesHtml()` của util/html: nó escape bằng `esc()` trần nên
  // 2/269 nguồn của kho này hiện nguyên dấu « » ra màn hình. Ở đây `escVan`
  // đổi chúng thành chữ nghiêng, đúng luật trình bày của dự án.
  return `<details class="dtg-nguon"><summary tabindex="-1">📚 Nguồn (${nguon.length})</summary>
    <ul>${nguon.map((n) => `<li>${escVan(n)}</li>`).join("")}</ul></details>`;
}

function htmlNut(i: number): string {
  const m = DS[i];
  const nut: string[] = [];
  const saDo = saDoCuaMoc[i];
  if (saDo)
    nut.push(
      `<button type="button" class="dtg-nut" data-lam="sado" data-sado="${esc(saDo)}" tabindex="-1">⚔️ Xem sa đồ</button>`,
    );
  else if (m.loai === "tran-danh" || m.loai === "khang-chien")
    nut.push(
      `<button type="button" class="dtg-nut" data-lam="sado" data-sado="" tabindex="-1">⚔️ Danh sách sa đồ</button>`,
    );
  if (m.loai === "tac-pham")
    nut.push(
      `<button type="button" class="dtg-nut" data-lam="thuvien" tabindex="-1">📖 Mở Thư viện</button>`,
    );
  if (m.lon !== null && m.lat !== null)
    nut.push(
      `<button type="button" class="dtg-nut" data-lam="bando" tabindex="-1">🗺️ Xem trên bản đồ</button>`,
    );
  return nut.length ? `<div class="dtg-hang-nut">${nut.join("")}</div>` : "";
}

function htmlThe(i: number): string {
  const m = DS[i];
  // `nam_hien_thi` chỉ hiện thêm khi nó nói nhiều hơn con số — dữ liệu có cả
  // "179 TCN" (trùng nhãn năm) lẫn "7/1786 (Trịnh Bồng còn danh nghĩa tới 1787)".
  const nam = nhanNam(m.nam);
  const chiTietNam = m.nam_hien_thi && m.nam_hien_thi !== nam && m.nam_hien_thi !== String(m.nam);
  // KHÔNG đặt aria-label cho <li>: tiêu điểm nhảy thẳng vào thẻ, và một nhãn
  // ngắn sẽ THAY cho toàn bộ nội dung được đọc lên thay vì tóm tắt nó. Thẻ đã
  // mở đầu bằng năm · loại · tên — đúng thứ tự một bản tóm tắt cần.
  return `<li class="dtg-muc" id="dtg-m-${i}" data-i="${i}" tabindex="-1">
    <span class="dtg-neo" aria-hidden="true"><span class="dtg-hinh" data-loai="${esc(m.loai)}"></span></span>
    <article class="dtg-the">
      <p class="dtg-the-dau">
        ${
          anNam
            ? `<button type="button" class="dtg-nam dtg-doan" data-lam="hien-nam"
                 data-nam="${esc(nam)}" tabindex="-1"
                 aria-label="Đoán xong rồi bấm để hiện năm">năm ?</button>`
            : `<span class="dtg-nam">${esc(nam)}</span>`
        }
        <span class="dtg-chip" data-loai="${esc(m.loai)}">
          <span class="dtg-hinh" data-loai="${esc(m.loai)}" aria-hidden="true"></span>${esc(NHAN_LOAI[m.loai])}
        </span>
        ${m.tinh ? `<span class="dtg-tinh">📍 ${escVan(m.tinh)}</span>` : ""}
      </p>
      <h4 class="dtg-ten">${escVan(m.ten)}</h4>
      ${
        // Che năm thì phải che luôn dòng này — `nam_hien_thi` chứa cả ngày
        // tháng («25/8/1945»), giấu con số ở trên mà để lộ ở đây là vô nghĩa.
        chiTietNam && !anNam ? `<p class="dtg-nam-day">${escVan(m.nam_hien_thi)}</p>` : ""
      }
      ${m.mo_ta ? `<p class="dtg-mo-ta">${escVanKho(m.mo_ta)}</p>` : ""}
      ${
        // `ghi_chu` là chỗ ghi hai nguồn chính thống vênh nhau — nội dung phải
        // HIỆN RA, không phải ghi chú nội bộ (bất biến #4).
        m.ghi_chu ? `<p class="dtg-venh">⚠️ ${escVanKho(m.ghi_chu)}</p>` : ""
      }
      ${htmlNut(i)}
      ${htmlNguon(m.nguon)}
    </article>
  </li>`;
}

/** Vạch «khoảng trống thời gian» giữa hai mốc cách nhau xa. */
const NGUONG_TRONG = 50;

function htmlThan(): string {
  const ds = locMoc();
  if (!ds.length)
    return `<p class="dtg-rong">Không mốc nào khớp bộ lọc. Bấm <b>Bỏ lọc</b> để xem lại cả ${DS.length} mốc.</p>`;

  const khoi: string[] = [];
  let chuKy = " ";
  let mo = false;

  for (let k = 0; k < ds.length; k++) {
    const i = ds[k];
    const m = DS[i];
    const trieu = trieuTaiNam(m.nam);
    const ky = trieu.join(" + ") || "ngoai-bang";

    if (ky !== chuKy) {
      if (mo) khoi.push("</ol></section>");
      chuKy = ky;
      mo = true;
      khoi.push(`<section class="dtg-nhom">${htmlNhomDau(trieu)}<ol class="dtg-ds">`);
    } else if (k > 0) {
      const cach = m.nam - DS[ds[k - 1]].nam;
      if (cach >= NGUONG_TRONG)
        khoi.push(
          `<li class="dtg-trong"><span>⋮ ${soVN(cach)} năm không có mốc nào trong kho</span></li>`,
        );
    }
    khoi.push(htmlThe(i));
  }
  if (mo) khoi.push("</ol></section>");
  return khoi.join("");
}

function htmlNhomDau(trieu: string[]): string {
  if (!trieu.length)
    return `<h3 class="dtg-nhom-dau"><span class="dtg-nhom-ten">🏛️ Sau ${namHetNienHieu}</span>
      <span class="dtg-nhom-nam">ngoài bảng niên hiệu</span></h3>`;
  const doan = trieu.map(doanNamTrieu).filter((d): d is [number, number] => d !== null);
  const tu = Math.min(...doan.map((d) => d[0]));
  const den = Math.max(...doan.map((d) => d[1]));
  const song =
    trieu.length > 1 ? `<span class="dtg-nhom-song">⚠️ ${trieu.length} triều song song</span>` : "";
  return `<h3 class="dtg-nhom-dau">
    <span class="dtg-nhom-ten">🏛️ ${trieu.map(escVan).join(" · ")}</span>
    <span class="dtg-nhom-nam">${esc(nhanNam(tu))} – ${esc(nhanNam(den))}</span>${song}
  </h3>`;
}

// ── Vẽ lại ─────────────────────────────────────────────────────────────────

/** Vẽ lại phần danh sách + số đếm. */
function veThan(lop: HTMLElement): void {
  const than = lop.querySelector<HTMLElement>(".dtg-than");
  const dem = lop.querySelector<HTMLElement>(".dtg-dem");
  if (!than) return;
  const t0 = performance.now();
  than.innerHTML = htmlThan();
  // Mọi nút trong thẻ ra khỏi thứ tự Tab. Đánh dấu sẵn trong chuỗi HTML không
  // đủ: chế độ trẻ em chèn thêm nút chú giải từ khó (`escKho` → `.tk-tu`) mà
  // module này không dựng, nên phải quét lại DOM sau khi ghi.
  for (const n of than.querySelectorAll<HTMLElement>(".dtg-muc button, .dtg-muc summary"))
    n.tabIndex = -1;
  const ms = performance.now() - t0;
  const hien = than.querySelectorAll(".dtg-muc").length;
  if (dem) dem.textContent = `Hiện ${hien}/${DS.length} mốc`;
  // Con số đo được để lại ngay trên DOM: kiểm hiệu năng bằng thước, không bằng
  // cảm nhận, và không phải mở console giữa lúc đang xem.
  than.dataset.dungMs = ms.toFixed(1);
}

function veLoc(lop: HTMLElement): void {
  const o = lop.querySelector<HTMLElement>(".dtg-loc");
  if (!o) return;
  o.outerHTML = htmlLoc();
}

// ── Điều hướng bàn phím ────────────────────────────────────────────────────

/**
 * Đưa tiêu điểm tới một mốc.
 *
 * Nút bấm trong thẻ mang `tabindex="-1"` sẵn từ lúc dựng: 201 thẻ × 3 nút là
 * 600 nấc Tab, đúng thứ mà chú thích trong `moc-lich-su.ts` gọi là cực hình.
 * Chỉ thẻ ĐANG có tiêu điểm mới mở nút của nó vào thứ tự Tab.
 */
function toiMoc(than: HTMLElement, li: HTMLElement | null): void {
  if (!li) return;
  for (const cu of than.querySelectorAll<HTMLElement>(".dtg-muc.dang-chon")) {
    cu.classList.remove("dang-chon");
    for (const n of cu.querySelectorAll<HTMLElement>("button, summary")) n.tabIndex = -1;
  }
  li.classList.add("dang-chon");
  for (const n of li.querySelectorAll<HTMLElement>("button, summary")) n.tabIndex = 0;
  li.focus({ preventScroll: true });
  li.scrollIntoView({ block: "center", behavior: giamChuyenDong() ? "auto" : "smooth" });
}

function chuyenMoc(than: HTMLElement, buoc: number): void {
  const ds = [...than.querySelectorAll<HTMLElement>(".dtg-muc")];
  if (!ds.length) return;
  const dang = than.querySelector<HTMLElement>(".dtg-muc.dang-chon");
  const i = dang ? ds.indexOf(dang) : -1;
  const j = i < 0 ? (buoc > 0 ? 0 : ds.length - 1) : Math.min(ds.length - 1, Math.max(0, i + buoc));
  toiMoc(than, ds[j]);
}

const CHON_TIEU_DIEM =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]),' +
  ' textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

/** Chỉ phần tử ĐANG HIỆN mới nhận tiêu điểm — thẻ trong `<details>` đóng thì không. */
function nhanTieuDiem(goc: HTMLElement): HTMLElement[] {
  return [...goc.querySelectorAll<HTMLElement>(CHON_TIEU_DIEM)].filter(
    (e) => e.tabIndex !== -1 && e.getClientRects().length > 0,
  );
}

// ── Hành động nối sang phần khác ───────────────────────────────────────────

function lamHanhDong(lam: string, i: number, saDo: string): void {
  const m = DS[i];
  dongDongThoiGian();
  if (lam === "sado") {
    // battle.ts lắng nghe sự kiện này: có id thì nhảy thẳng Màn B, không có thì
    // mở Màn A. journey.ts đã đi đúng đường này từ 2026-08-26.
    window.dispatchEvent(new CustomEvent("sado:mo-tran", { detail: { id: saDo || undefined } }));
    return;
  }
  if (lam === "thuvien") {
    // Thư viện chưa có lối mở thẳng một tác phẩm — `initThuVien()` chỉ gắn
    // handler vào #library-btn. Nhãn nút vì thế nói «Mở Thư viện», không hứa
    // mở đúng tác phẩm này.
    document.getElementById("library-btn")?.click();
    return;
  }
  if (lam === "bando" && m.lon !== null && m.lat !== null) {
    CFG?.datPeriod(kyChuaNam(m.nam));
    CFG?.bayToi(m.lon, m.lat, giamChuyenDong());
  }
}

// ── Mở / đóng ──────────────────────────────────────────────────────────────

function dongDongThoiGian(): void {
  const lop = document.getElementById(ID_LOP);
  if (!lop) return;
  for (const f of donDep) f();
  donDep = [];
  lop.remove();
  document.documentElement.classList.remove("dtg-khoa-cuon");
  // Nút mở nằm trong menu «Khám phá» (một <details>). Menu đóng thì `focus()`
  // lên nút là lệnh rỗng và tiêu điểm rơi về <body> — người dùng bàn phím phải
  // Tab lại từ đầu trang.
  //
  // 🔴 KHÔNG đoán bằng `getClientRects()`: đo trên Chrome 2026-08-28, nút nằm
  // trong <details> ĐANG ĐÓNG vẫn trả về 1 hình chữ nhật, nên phép thử «có hiện
  // không» nói dối. Cách duy nhất đúng là GỌI rồi KIỂM: focus xong mà
  // `activeElement` không phải nó thì nút không nhận được tiêu điểm.
  nutMoTruoc?.focus({ preventScroll: true });
  if (!nutMoTruoc || document.activeElement !== nutMoTruoc)
    document.getElementById("map")?.focus({ preventScroll: true });
  nutMoTruoc = null;
}

function lopHtml(): string {
  return `<div class="dtg-hop" role="dialog" aria-modal="true" aria-label="Dòng thời gian lịch sử Việt Nam">
    <header class="dtg-dau">
      <div class="dtg-dau-hang">
        <h2 class="dtg-tieu-de">📜 ${DS.length} mốc lịch sử</h2>
        <p class="dtg-dem" role="status">Hiện ${DS.length}/${DS.length} mốc</p>
        <button type="button" class="dtg-dong" aria-label="Đóng dòng thời gian">×</button>
      </div>
      <p class="dtg-phim">Cuộn để đọc · <kbd>↑</kbd> <kbd>↓</kbd> chuyển mốc · <kbd>Home</kbd> <kbd>End</kbd> đầu–cuối · <kbd>Esc</kbd> đóng</p>
      ${htmlMatDo()}
      ${htmlLoc()}
    </header>
    <div class="dtg-than" tabindex="0" role="region"
         aria-label="Danh sách mốc lịch sử theo thứ tự thời gian"></div>
  </div>`;
}

/** Đang trong lượt mở đầu tiên (còn chờ fetch) — chặn mở chồng hai lớp phủ. */
let dangMo = false;

async function moDongThoiGian(nutMo?: HTMLElement | null): Promise<void> {
  // Lượt mở đầu chờ 3 lượt fetch (đo được 2,2 giây). Không có cờ này thì bấm
  // nút hai lần trong lúc chờ sẽ dựng HAI lớp phủ chồng nhau, và cái dưới không
  // còn ai đóng được.
  if (dangMo || document.getElementById(ID_LOP)) return;
  dangMo = true;
  try {
    await moThat(nutMo);
  } finally {
    dangMo = false;
  }
}

async function moThat(nutMo?: HTMLElement | null): Promise<void> {
  nutMoTruoc = nutMo ?? (document.activeElement as HTMLElement | null);

  // Panel đang mở phía sau lớp phủ thì vô hình mà vẫn tốn tài nguyên (mô hình
  // 3D của Hành trình vẫn quay). Đóng qua sổ đăng ký để hàm dọn của chúng chạy.
  hideAllPanels();

  await nap();
  if (!DS.length) return;

  const lop = document.createElement("div");
  lop.id = ID_LOP;
  lop.className = "dtg-lop";
  lop.innerHTML = lopHtml();
  document.body.appendChild(lop);
  document.documentElement.classList.add("dtg-khoa-cuon");

  const than = lop.querySelector<HTMLElement>(".dtg-than");
  const hop = lop.querySelector<HTMLElement>(".dtg-hop");
  if (!than || !hop) return;
  veThan(lop);
  noiSuKien(lop, hop, than);
  than.focus({ preventScroll: true });
}

function noiSuKien(lop: HTMLElement, hop: HTMLElement, than: HTMLElement): void {
  const khiBam = (e: MouseEvent): void => {
    const t = e.target as HTMLElement;
    if (t.closest(".dtg-dong")) {
      dongDongThoiGian();
      return;
    }

    const chip = t.closest<HTMLElement>(".dtg-chip-loc");
    if (chip) {
      const l = chip.dataset.loai as LoaiMoc | undefined;
      if (!l) return;
      // Bỏ chọn nốt loại cuối cùng thì màn hình trống trơn mà không ai bảo vì
      // sao — bấm lại loại duy nhất đang bật sẽ bật lại CẢ SÁU.
      if (!loc.loai.has(l)) loc.loai.add(l);
      else if (loc.loai.size > 1) loc.loai.delete(l);
      else for (const x of LOAI) loc.loai.add(x);
      veLoc(lop);
      veThan(lop);
      // veLoc() thay cả khối lọc, nên nút vừa bấm không còn tồn tại. Không trả
      // tiêu điểm thì người dùng bàn phím rơi về <body> — ngoài bẫy tiêu điểm.
      lop.querySelector<HTMLElement>(`.dtg-chip-loc[data-loai="${l}"]`)?.focus();
      return;
    }

    if (t.closest(".dtg-doan-bat")) {
      anNam = !anNam;
      veLoc(lop);
      veThan(lop);
      lop.querySelector<HTMLElement>(".dtg-doan-bat")?.focus();
      return;
    }

    const doan = t.closest<HTMLElement>('[data-lam="hien-nam"]');
    if (doan) {
      const li = doan.closest<HTMLElement>(".dtg-muc");
      const nam = document.createElement("span");
      nam.className = "dtg-nam";
      nam.textContent = doan.dataset.nam ?? "";
      doan.replaceWith(nam);
      // Nút vừa biến mất mang theo tiêu điểm — kéo về chính thẻ vừa mở.
      toiMoc(than, li);
      return;
    }

    if (t.closest(".dtg-xoa-loc")) {
      for (const x of LOAI) loc.loai.add(x);
      loc.ky = -1;
      loc.tinh = "";
      veLoc(lop);
      veThan(lop);
      lop.querySelector<HTMLElement>(".dtg-xoa-loc")?.focus();
      return;
    }

    const nut = t.closest<HTMLElement>(".dtg-nut");
    if (nut) {
      const li = nut.closest<HTMLElement>(".dtg-muc");
      const i = Number(li?.dataset.i);
      if (Number.isFinite(i) && DS[i]) lamHanhDong(nut.dataset.lam ?? "", i, nut.dataset.sado ?? "");
      return;
    }

    const li = t.closest<HTMLElement>(".dtg-muc");
    if (li && !t.closest("summary")) toiMoc(than, li);
  };
  lop.addEventListener("click", khiBam);
  donDep.push(() => lop.removeEventListener("click", khiBam));

  const khiDoi = (e: Event): void => {
    const o = e.target as HTMLElement;
    if (o.id === "dtg-o-ky") loc.ky = Number((o as HTMLSelectElement).value);
    else if (o.id === "dtg-o-tinh") loc.tinh = (o as HTMLSelectElement).value;
    else return;
    veThan(lop);
  };
  lop.addEventListener("change", khiDoi);
  donDep.push(() => lop.removeEventListener("change", khiDoi));

  const khiPhim = (e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      // 🔴 stopPropagation BẮT BUỘC: main.ts gắn một listener Escape ở
      // `document` gọi `hideAllPanels()`. Listener này nằm trên chính lớp phủ
      // nên chạy TRƯỚC, và không chặn thì một cú Escape đi tiếp xuống dưới.
      e.stopPropagation();
      e.preventDefault();
      dongDongThoiGian();
      return;
    }
    if (e.key === "Tab") {
      const ds = nhanTieuDiem(hop);
      if (!ds.length) return;
      const dau = ds[0];
      const cuoi = ds[ds.length - 1];
      const dang = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (dang === dau || !hop.contains(dang))) {
        e.preventDefault();
        cuoi.focus();
      } else if (!e.shiftKey && (dang === cuoi || !hop.contains(dang))) {
        e.preventDefault();
        dau.focus();
      }
      return;
    }
    // Trong ô chọn thì ↑ ↓ là việc của ô chọn, không phải của danh sách.
    if ((e.target as HTMLElement)?.closest("select, input, textarea")) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      chuyenMoc(than, 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      chuyenMoc(than, -1);
    } else if (e.key === "Home") {
      e.preventDefault();
      toiMoc(than, than.querySelector<HTMLElement>(".dtg-muc"));
    } else if (e.key === "End") {
      e.preventDefault();
      const ds = than.querySelectorAll<HTMLElement>(".dtg-muc");
      toiMoc(than, ds[ds.length - 1] ?? null);
    }
  };
  lop.addEventListener("keydown", khiPhim);
  donDep.push(() => lop.removeEventListener("keydown", khiPhim));
}

// ── Khởi tạo ───────────────────────────────────────────────────────────────

export function initDongThoiGian(cfg: CauHinhDongThoiGian): void {
  CFG = cfg;
  if (document.getElementById(ID_NUT)) return; // chống khởi tạo 2 lần

  const nav = document.getElementById("topbar-nav") ?? document.body;
  const btn = document.createElement("button");
  btn.id = ID_NUT;
  btn.type = "button";
  btn.textContent = "📜 Mốc lịch sử";
  btn.title = "Đọc 201 mốc lịch sử theo dòng thời gian dọc";
  nav.appendChild(btn);
  btn.addEventListener("click", () => void moDongThoiGian(btn));
}
