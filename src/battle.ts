// Sa đồ chiến dịch — Màn A (danh sách 168 trận/chiến dịch) + Màn B (chi tiết).
//
// Trước: nút topbar nhảy thẳng vào Bạch Đằng 938 — trận DUY NHẤT có file
// buoc[] trong public/data/battles/, trong khi public/data/overlays/
// chien-dich-tran-danh.json đã có 168 trận. Giờ: Màn A đọc đủ 168 mục, nhóm
// theo thời kỳ; trận có sa đồ diễn biến (file trong battles/) mở Màn B đầy
// đủ, trận còn lại vẫn mở Màn B ở chế độ rút gọn (thông tin cơ bản từ chính
// mục overlay) — không khoá hẳn, không giả vờ đầy đủ.
//
// Tự chứa: initBattle() tạo nút mở + panel, không đụng vào main.ts.

import { registerPanel, showOnly, hidePanel } from "./panels";
import { esc, sourcesHtml } from "./util/html";

type TideDir = "len" | "xuong";
type XungDot = "ngoai-xam" | "noi-chien";

// Khoá nhóm phần tử SVG bật/tắt theo bước. KHÔNG còn là union cứng: với sa đồ
// `sa_do_kieu: "tong-quat"` khoá chính là `phan_tu[].id` do dữ liệu quyết định,
// nên soạn một sa đồ mới chỉ còn là viết JSON. 240/240 hồ sơ trận nay đều là
// tong-quat — bản vẽ tay riêng của Bạch Đằng 938 đã gỡ ngày 2026-08-26.
type LayerKey = string;

// Animation stroke-dashoffset tốn paint (không compositor-only) — giới hạn
// số mũi tên chạy đồng thời trong một lần chuyển bước.
const ARROW_BUDGET_PER_TRANSITION = 2;

// ── Hợp đồng dữ liệu sa đồ tổng quát ─────────────────────────────────────
// Toạ độ là toạ độ KHUNG VẼ 1000×600, không phải kinh/vĩ độ — sa đồ là hình
// minh hoạ, không theo tỉ lệ địa lý.

type Diem = [number, number];
type DiaHinhKieu = "nui" | "song" | "bien" | "duong" | "rung";
type PhanTuKieu = "quan" | "mui-ten" | "thanh" | "cong-su" | "co" | "dia-danh" | "thuyen";
/** `ta` = quân ta · `dich` = quân đối phương · vắng mặt = trung tính. */
type Ben = "ta" | "dich";

/** Phông nền — LUÔN hiện ở mọi bước, không nằm trong `hien`. */
interface DiaHinh {
  kieu: DiaHinhKieu;
  diem: Diem[];
  nhan?: string;
}

/** Phần tử bật/tắt theo bước; `id` chính là khoá dùng trong `buoc[].hien`. */
interface PhanTu {
  id: string;
  kieu: PhanTuKieu;
  ben?: Ben;
  x?: number;
  y?: number;
  tu?: Diem;
  den?: Diem;
  nhan?: string;
  /** Nhãn phụ dưới nhãn chính — «Đại đoàn 312», «3 vạn quân». Vẽ thành tspan
   *  dòng thứ hai CỦA CHÍNH nhãn chính, không phải một nhãn rời: chỉ như vậy
   *  thuật toán gỡ chồng mới không tách nó khỏi thứ nó chú thích. */
  quy_mo?: string;
}

/**
 * Một con số có thể vênh nhau giữa các nguồn.
 *
 * Bất biến #4 của dự án: nguồn mâu thuẫn thì NÊU CẢ HAI. Chuỗi đơn dùng cho ca
 * mọi nguồn đã thống nhất; mảng `{so, nguon}` dùng cho ca hai nguồn nhà nước
 * chép hai con số — ép về một con số là lặng lẽ chọn bản gọn hơn.
 */
type SoLieu = string | { so: string; nguon?: string }[];

interface LucLuongBen {
  quan_so?: SoLieu;
  don_vi?: string[];
  vu_khi?: string[];
}

/** Tương quan lực lượng hai bên. `nguon` BẮT BUỘC — khối không nguồn không hiện. */
interface LucLuong {
  ta?: LucLuongBen;
  doi_thu?: LucLuongBen;
  nguon?: string[];
}

/** Tổn thất hai bên. `nguon` BẮT BUỘC — số liệu về người chết không nguồn thì không hiện. */
interface TonThat {
  ta?: SoLieu;
  doi_thu?: SoLieu;
  nguon?: string[];
}

interface BattleStep {
  id: number;
  tieu_de: string;
  mo_ta: string;
  /** Chỉ sa đồ sông nước mới dùng; vắng mặt thì không hiện chỉ báo thuỷ triều. */
  thuy_trieu?: TideDir;
  hien: LayerKey[];
  /** Mốc thời gian của riêng bước — «13–17/3/1954». Có ít nhất một bước khai
   *  trường này thì dải bước chuyển thành DÒNG THỜI GIAN có mốc thật. */
  thoi_gian?: string;
  /** Địa danh của riêng bước — «Him Lam · Độc Lập · Bản Kéo». */
  dia_danh?: string;
  /** Nguồn RIÊNG của bước. Trước đây chỉ có nguồn cấp TRẬN, nên câu cụ thể
   *  nhất trên màn hình lại là câu không truy được về đâu. */
  nguon?: string[];
}

/** Trích dẫn nguyên văn từ văn tịch/chính sử — hiển thị ở khối «Văn tịch chép».
 *  `sach` ghi theo mẫu đã chốt: «Đại Việt sử ký toàn thư — Bản kỷ, quyển V»
 *  (kỷ + quyển, KHÔNG URL); `nguon_trich` là nơi lấy được ĐOẠN trích (cổng nhà
 *  nước / bản in) — hai nguồn này khác nhau và validator đòi cả hai. */
interface TrichVanTich {
  sach: string;
  doan: string;
  nguon_trich: string;
  /** Gắn với bước diễn biến nào thì nêu id bước — khối trích sẽ sáng lên khi
   *  người xem đứng ở bước đó. Vắng mặt = trích chung cho cả trận. */
  buoc?: number;
}

interface Battle {
  ghi_chu?: string;
  id: string;
  ten: string;
  nam: number;
  chi_huy: string;
  doi_thu: string;
  dia_diem: string;
  sa_do_ghi_chu: string;
  buoc: BattleStep[];
  ket_qua: string;
  y_nghia: string;
  trang_thai: string;
  nguon: string[];
  lien_quan_tinh?: string[];
  trich_van_tich?: TrichVanTich[];
  // Nội chiến (Trịnh–Nguyễn, 1954–1975…) không dùng cặp màu "đúng/sai" —
  // xem token --sd-ta-*/--sd-doi-* trong sado.css. Vắng mặt = "ngoai-xam",
  // đúng với bach-dang-938.json hiện tại (chưa có trường này).
  loai_xung_dot?: XungDot;
  /** Vắng mặt = sa đồ vẽ tay riêng (chỉ còn bach-dang-938). */
  sa_do_kieu?: "tong-quat";
  dia_hinh?: DiaHinh[];
  phan_tu?: PhanTu[];
  /** Khoảng thời gian toàn trận — «13/3/1954 – 7/5/1954». Có trường này thì ô
   *  «Năm» trong khối thông tin nhường chỗ cho nó. */
  thoi_gian?: string;
  luc_luong?: LucLuong;
  ton_that?: TonThat;
}

/** Một mục trong kho 168 trận — dùng cho Màn A và Màn B rút gọn (chưa có sa đồ). */
interface BattleIndexItem {
  id: string;
  ten: string;
  nam: number;
  nam_hien_thi?: string;
  dia_diem?: string;
  chi_huy?: string;
  mo_ta?: string;
  ket_qua?: string;
  trang_thai?: string;
  nguon?: string[];
  /** Toạ độ từ lớp phủ chien-dich-tran-danh — nguồn định vị duy nhất của sa đồ. */
  lat?: number;
  lon?: number;
  do_tin_cay_toa_do?: string;
}

const INDEX_URL = `${import.meta.env.BASE_URL}data/overlays/chien-dich-tran-danh.json`;
// Danh sách trận đã có sa đồ diễn biến — SINH TỰ ĐỘNG từ chính thư mục
// public/data/battles/ bởi scripts/build_sado_index.mjs, không chép cứng nữa.
// Thả một file JSON vào thư mục đó là trận hiện lên «✓ Có sa đồ diễn biến».
const SA_DO_INDEX_URL = `${import.meta.env.BASE_URL}data/battles/_index.json`;
const battleDetailUrl = (id: string): string =>
  `${import.meta.env.BASE_URL}data/battles/${id}.json`;

let saDoIds: ReadonlySet<string> = new Set<string>();
const battleReady = (id: string): boolean => saDoIds.has(id);

// ── Bản đồ định vị mini — «sa đồ phải đi kèm bản đồ» ─────────────────────
// Silhouette 34 tỉnh + 5 đảo/quần đảo chủ quyền, sinh sẵn bởi
// scripts/build_minimap_vn.mjs từ ranh giới thật. Sa đồ vẫn là hình minh hoạ
// không tỉ lệ; minimap trả lời câu «trận này ở ĐÂU trên đất nước» bằng toạ độ
// đã soát của lớp phủ chien-dich-tran-danh — không bịa thêm hình học nào.
const MINIMAP_URL = `${import.meta.env.BASE_URL}data/geo/vn-minimap.json`;

interface MiniMap {
  w: number;
  h: number;
  tinh: { slug: string; ten: string; d: string }[];
  dao: { ten: string; d: string; x: number; y: number }[];
}

// Hằng chiếu PHẢI khớp scripts/build_minimap_vn.mjs: silhouette được chiếu
// lúc build, còn chấm vị trí trận chiếu lúc chạy — hai phép chiếu lệch nhau
// là chấm rơi sai tỉnh mà không lỗi nào nổ ra.
const MM_LON_MIN = 101.8;
const MM_LAT_MIN = 4.6;
const MM_LAT_MAX = 23.7;
const MM_K = 560 / (MM_LAT_MAX - MM_LAT_MIN);
const MM_CO_LAT = Math.cos((((MM_LAT_MIN + MM_LAT_MAX) / 2) * Math.PI) / 180);

let miniMap: MiniMap | null | undefined; // undefined = chưa thử · null = nạp hỏng
async function ensureMiniMap(): Promise<MiniMap | null> {
  if (miniMap !== undefined) return miniMap;
  try {
    const res = await fetch(MINIMAP_URL);
    if (!res.ok) throw new Error(String(res.status));
    miniMap = (await res.json()) as MiniMap;
  } catch {
    miniMap = null; // minimap hỏng KHÔNG được kéo sập sa đồ
  }
  return miniMap;
}

function miniMapSvg(mm: MiniMap, item: BattleIndexItem | undefined, tinhLienQuan: string[]): string {
  const lienQuan = new Set(tinhLienQuan);
  const tinh = mm.tinh
    .map(
      (t) =>
        `<path class="sd-mm-tinh${lienQuan.has(t.slug) ? " sd-mm-lien-quan" : ""}" d="${t.d}"><title>${esc(t.ten)}</title></path>`,
    )
    .join("");
  // 🔴 Bất biến #1: đảo/quần đảo chủ quyền vẽ ở MỌI bản đồ — kể cả bản đồ
  // định vị bé. Hai quần đảo mang nhãn chữ, ba đảo còn lại có chấm khuếch đại
  // vì hình học thật ở cỡ này nhỏ hơn 1px.
  const dao = mm.dao
    .map((dv) => {
      const nhan = dv.ten.startsWith("Quần đảo")
        ? `<text class="sd-mm-nhan-dao" x="${dv.x}" y="${dv.y + 16}" text-anchor="middle">${esc(dv.ten.replace("Quần đảo ", "QĐ. "))}</text>`
        : "";
      return `<path class="sd-mm-dao" d="${dv.d}"/><circle class="sd-mm-dao-cham" cx="${dv.x}" cy="${dv.y}" r="3.5"/>${nhan}`;
    })
    .join("");
  let diem = "";
  if (item && typeof item.lat === "number" && typeof item.lon === "number") {
    const x = Math.round((item.lon - MM_LON_MIN) * MM_K * MM_CO_LAT * 10) / 10;
    const y = Math.round((MM_LAT_MAX - item.lat) * MM_K * 10) / 10;
    // r tính theo viewBox 449×560 nhưng minimap chỉ hiện ~148px — chấm nhỏ hơn
    // r=10 là biến mất trên màn hình thật (đã soi ảnh chụp).
    diem = `<circle class="sd-mm-diem-quang" cx="${x}" cy="${y}" r="22"/><circle class="sd-mm-diem" cx="${x}" cy="${y}" r="10"/>`;
  }
  return `<svg class="sd-mm-svg" viewBox="0 0 ${mm.w} ${mm.h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Vị trí trận đánh trên bản đồ Việt Nam">${tinh}${dao}${diem}</svg>`;
}

/** Điền khối «vị trí» sau khi minimap nạp xong. Panel có thể đã chuyển sang
 *  trận khác trong lúc chờ fetch — kiểm `data-battle` sau await, điền nhầm
 *  trận là bản đồ nói dối mà console vẫn sạch. */
async function dienViTri(battleId: string, tinhLienQuan: string[]): Promise<void> {
  const mm = await ensureMiniMap();
  if (!mm) return;
  const host = document.getElementById("sd-vi-tri");
  if (!host || host.dataset["battle"] !== battleId) return;
  const item = (indexItems ?? []).find((it) => it.id === battleId);
  const coDiem = item && typeof item.lat === "number" && typeof item.lon === "number";
  if (!coDiem && tinhLienQuan.length === 0) return; // không có gì để chỉ — đừng hiện khung rỗng
  const tinCay =
    item?.do_tin_cay_toa_do && item.do_tin_cay_toa_do !== "cao"
      ? " · vị trí ước theo nguồn"
      : "";
  host.innerHTML = `${miniMapSvg(mm, coDiem ? item : undefined, tinhLienQuan)}<p class="sd-mm-chu-thich muted">Vị trí trên bản đồ Việt Nam hôm nay${tinCay}</p>`;
  host.hidden = false;
}

let indexItems: BattleIndexItem[] | null = null;
let currentBattle: Battle | null = null;
let stepIdx = 0;
let eraFilter = "all";
// Nhớ layer mũi tên nào đã chạy animation "đang vẽ" trong phiên xem trận
// hiện tại — chỉ chạy lần đầu hiện, tránh nhấp nháy khi bấm tới-lui nhiều lần.
let arrowsAnimated = new Set<string>();
// Bộ khoá mũi tên của trận đang mở, đặt một lần lúc dựng Màn B.
let muiTenKeys: ReadonlySet<string> = new Set();
// ── Trạng thái hiệu ứng «như phim/game» ──────────────────────────────────
// Hẹn giờ tự phát các bước (nút ▶ Phát). Mọi thao tác tay đều dừng nó.
let playTimer: number | null = null;
// Camera thu phóng theo bước — tắt được bằng nút 🎬.
let camTheoBuoc = true;
// Khoá phần tử đã hiện ở bước trước — để biết ai MỚI xuất trận mà pop-in.
let hienTruoc = new Set<string>();

// ── Phân kỳ cho Màn A ────────────────────────────────────────────────────
// Dữ liệu 168 mục không có trường thời-kỳ riêng, chỉ có `nam` (số) — suy ra
// nhóm từ mốc năm theo phân kỳ phổ thông lịch sử Việt Nam.

const ERAS = [
  { id: "dung-nuoc", ten: "Dựng nước & chống Bắc thuộc", toi: 937 },
  { id: "dai-viet", ten: "Độc lập – Đại Việt", toi: 1857 },
  { id: "phap-thuoc", ten: "Cận đại — Pháp thuộc", toi: 1944 },
  { id: "khang-chien", ten: "Kháng chiến giữ nước 1945–1975", toi: 1975 },
  { id: "sau-1975", ten: "Sau 1975 — bảo vệ biên giới & biển đảo", toi: Infinity },
] as const;

function eraOf(nam: number): (typeof ERAS)[number] {
  return ERAS.find((e) => nam <= e.toi) ?? ERAS[ERAS.length - 1];
}

// ── Màn A — danh sách 168 trận ───────────────────────────────────────────

function cardHtml(item: BattleIndexItem): string {
  const ready = battleReady(item.id);
  const nam = item.nam_hien_thi ?? String(item.nam);
  const tag = ready
    ? `<span class="sd-card-tag sd-card-tag-ready">✓ Có sa đồ diễn biến</span>`
    : `<span class="sd-card-tag sd-card-tag-soon">○ Chưa có sa đồ</span>`;
  const place = item.dia_diem
    ? `<span class="sd-card-place muted">${esc(item.dia_diem)}</span>`
    : "";
  return `<li>
    <button type="button" class="sd-card ${ready ? "sd-card-ready" : "sd-card-soon"}" data-battle-id="${esc(item.id)}">
      <span class="sd-card-year">${esc(nam)}</span>
      <span class="sd-card-name">${esc(item.ten)}</span>
      ${place}
      ${tag}
    </button>
  </li>`;
}

function renderIndex(content: HTMLElement): void {
  const items = indexItems ?? [];
  const readyCount = items.filter((it) => battleReady(it.id)).length;

  const chipDefs: { id: string; ten: string }[] = [
    { id: "all", ten: "Tất cả" },
    ...ERAS.map((e) => ({ id: e.id, ten: e.ten })),
  ];
  const chipsHtml = chipDefs
    .map(
      (c) =>
        `<button type="button" class="sd-era-chip${eraFilter === c.id ? " active" : ""}" data-era="${c.id}">${esc(c.ten)}</button>`,
    )
    .join("");

  const groups = ERAS.map((era) => ({
    era,
    items: items.filter((it) => eraOf(it.nam).id === era.id),
  })).filter((g) => eraFilter === "all" || eraFilter === g.era.id);

  const groupsHtml = groups.length
    ? groups
        .map(
          (g, i) => `<div class="sd-era-group">
            <h3 class="sd-era-heading the-${(i % 6) + 1}">${esc(g.era.ten)} <span class="sd-era-count muted">(${g.items.length})</span></h3>
            <ul class="sd-card-list">${g.items.map(cardHtml).join("")}</ul>
          </div>`,
        )
        .join("")
    : `<p class="muted">Không có trận nào trong thời kỳ này.</p>`;

  content.innerHTML = `<div class="sd-index" id="sd-index">
    <h2 class="sd-index-title">⚔️ Sa đồ chiến dịch — 4000 năm dựng nước &amp; giữ nước</h2>
    <p class="sd-index-note muted">${readyCount}/${items.length} trận đã có sa đồ diễn biến từng bước. Các trận còn lại vẫn xem được thông tin cơ bản — đang biên soạn dần diễn biến chi tiết, không giả vờ đầy đủ.</p>
    <div class="sd-era-filters" role="group" aria-label="Lọc theo thời kỳ">${chipsHtml}</div>
    ${groupsHtml}
  </div>`;

  content.querySelectorAll<HTMLButtonElement>(".sd-era-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      eraFilter = chip.dataset["era"] ?? "all";
      renderIndex(content);
    });
  });
  content.querySelectorAll<HTMLButtonElement>(".sd-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset["battleId"];
      if (id) void openDetail(content, id);
    });
  });
}

// ── Màn B, chế độ rút gọn — trận chưa có sa đồ diễn biến ────────────────

function renderBasicDetail(content: HTMLElement, item: BattleIndexItem): void {
  const draftBadge =
    item.trang_thai === "draft"
      ? `<span class="draft-badge">Bản nháp (chờ kiểm sử)</span>`
      : "";
  content.innerHTML = `<div class="sd-detail sd-detail-basic">
    <button type="button" class="sd-back" id="sd-back">◀ Quay lại danh sách trận đánh</button>
    <header class="sd-head">
      <h2 class="sd-title">⚔️ ${esc(item.ten)} ${draftBadge}</h2>
      <p class="sd-index-note muted">Chưa có sa đồ diễn biến từng bước cho trận này — đang biên soạn dần. Dưới đây là thông tin cơ bản đã có.</p>
      <div class="sd-meta-hang">
        <dl class="sd-meta">
          ${item.chi_huy ? `<div><dt>Chỉ huy</dt><dd>${esc(item.chi_huy)}</dd></div>` : ""}
          ${item.dia_diem ? `<div><dt>Địa điểm</dt><dd>${esc(item.dia_diem)}</dd></div>` : ""}
          <div><dt>Năm</dt><dd>${esc(item.nam_hien_thi ?? String(item.nam))}</dd></div>
        </dl>
        <div class="sd-vi-tri" id="sd-vi-tri" data-battle="${esc(item.id)}" hidden></div>
      </div>
    </header>
    ${item.mo_ta ? `<div class="sd-narrative"><p>${esc(item.mo_ta)}</p></div>` : ""}
    ${item.ket_qua ? `<div class="sd-outcome"><p><b>🏁 Kết quả:</b> ${esc(item.ket_qua)}</p></div>` : ""}
    ${sourcesHtml(item.nguon)}
  </div>`;

  document.getElementById("sd-back")?.addEventListener("click", () => renderIndex(content));
  void dienViTri(item.id, []);
}

// ── Khối «Văn tịch chép» — trích nguyên văn chính sử ─────────────────────

function vanTichHtml(b: Battle): string {
  const ds = b.trich_van_tich ?? [];
  if (ds.length === 0) return "";
  const items = ds
    .map(
      (t) => `<figure class="sd-vt-item"${typeof t.buoc === "number" ? ` data-buoc="${t.buoc}"` : ""}>
      <blockquote class="sd-vt-doan">${nhamNhayVt(t.doan)}</blockquote>
      <figcaption class="sd-vt-nguon">— ${esc(t.sach)}${typeof t.buoc === "number" ? ` <span class="sd-vt-buoc">bước ${t.buoc}</span>` : ""}
        <span class="sd-vt-xuat-xu muted">Dẫn theo: ${esc(t.nguon_trich)}</span>
      </figcaption>
    </figure>`,
    )
    .join("");
  return `<div class="sd-van-tich">
    <h3 class="sd-vt-title">📜 Văn tịch chép</h3>
    ${items}
  </div>`;
}

/** Đoạn trích đặt trong dấu « » — nhưng nếu người soạn đã tự gõ « » ở đầu
 *  cuối thì đừng bọc đôi. */
function nhamNhayVt(doan: string): string {
  const s = doan.trim();
  const daCo = s.startsWith("«") && s.endsWith("»");
  return daCo ? esc(s) : `«${esc(s)}»`;
}

// ── Ký hiệu dùng chung cho mọi sa đồ ──────────────────────────────────────
//
// Hoạ tiết + đầu mũi tên là kênh phân biệt phe KHÔNG PHẢI MÀU: cặp
// --dung-chu/--sai-chu nhìn gần như một với người mù màu đỏ–lục. Bốn ký hiệu
// đầu vốn thuộc bản vẽ tay Bạch Đằng, giữ nguyên khi gỡ bản đó vì trình dựng
// tổng quát dùng lại y hệt (hoạ tiết phe, đầu mũi tên, chuyển sắc chiều sâu).
function saDoDefs(): string {
  return `<defs>
      <!-- Chiều sâu dựng bằng CHUYỂN SẮC, không bằng thêm chi tiết: hai đầu
           chuyển sắc đều phái sinh từ token có sẵn qua color-mix, nên đổi chế
           độ người lớn ⇄ trẻ em là cả sa đồ đổi theo. -->
      <linearGradient id="sd-g-dat" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="color-mix(in srgb, var(--sd-nen-bo) 88%, var(--mat))"/>
        <stop offset="1" stop-color="color-mix(in srgb, var(--sd-nen-bo) 82%, var(--chu-mem))"/>
      </linearGradient>
      <linearGradient id="sd-g-song" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="color-mix(in srgb, var(--sd-nen-song) 70%, var(--mat))"/>
        <stop offset="0.5" stop-color="var(--sd-nen-song-sau)"/>
        <stop offset="1" stop-color="color-mix(in srgb, var(--sd-nen-song) 70%, var(--mat))"/>
      </linearGradient>
      <!-- Vệt tối quanh mép khung: mắt tự dồn vào giữa, đúng thủ pháp khung
           hình của phim. Rất nhạt (12%) để không đụng ngưỡng tương phản của
           chữ và nét — phần tô nền vốn không mang ngưỡng nào. -->
      <radialGradient id="sd-g-vien" cx="0.5" cy="0.5" r="0.75">
        <stop offset="0.55" stop-color="var(--chu)" stop-opacity="0"/>
        <stop offset="1" stop-color="var(--chu)" stop-opacity="0.12"/>
      </radialGradient>
      <!-- Hạt giấy: chống cảm giác "màu bệt" của SVG phẳng. baseFrequency cao
           cho hạt mịn; opacity thấp để không thành nhiễu. -->
      <filter id="sd-f-giay" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n"/>
        <feColorMatrix in="n" type="saturate" values="0"/>
      </filter>
      <pattern id="sd-hatch-ta" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="8" stroke="var(--sd-ta-chu)" stroke-width="2" opacity="0.55"/>
      </pattern>
      <pattern id="sd-hatch-doi" width="8" height="8" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="8" stroke="var(--sd-doi-chu)" stroke-width="2" opacity="0.55"/>
        <line x1="0" y1="0" x2="8" y2="0" stroke="var(--sd-doi-chu)" stroke-width="2" opacity="0.55"/>
      </pattern>
      <marker id="sd-arrow-ta" markerWidth="12" markerHeight="12" refX="8" refY="5" orient="auto">
        <path d="M0,1 Q8,5 0,9 Q4,5 0,1 Z" fill="var(--sd-ta-chu)"/>
      </marker>
      <marker id="sd-arrow-doi" markerWidth="12" markerHeight="12" refX="8" refY="5" orient="auto">
        <path d="M0,0 L9,5 L0,10 L3,5 Z" fill="var(--sd-doi-chu)"/>
      </marker>
      <marker id="sd-tq-mui-ta" markerUnits="userSpaceOnUse" markerWidth="26" markerHeight="20" refX="20" refY="10" orient="auto">
        <path d="M0,1 Q22,10 0,19 Q10,10 0,1 Z" fill="var(--sd-ta-chu)"/>
      </marker>
      <marker id="sd-tq-mui-doi" markerUnits="userSpaceOnUse" markerWidth="26" markerHeight="20" refX="22" refY="10" orient="auto">
        <path d="M0,1 L24,10 L0,19 Z" fill="var(--sd-doi-chu)"/>
      </marker>
      <marker id="sd-tq-mui-trung" markerUnits="userSpaceOnUse" markerWidth="26" markerHeight="20" refX="20" refY="10" orient="auto">
        <path d="M1,2 L22,10 L1,18" fill="none" stroke="var(--sd-net-dia-hinh)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      </marker>
      <marker id="sd-tq-duoi-doi" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="18" refX="4" refY="9" orient="auto">
        <line x1="4" y1="1" x2="4" y2="17" stroke="var(--sd-doi-chu)" stroke-width="4" stroke-linecap="round"/>
      </marker>
    </defs>`;
}

// ── Trình dựng SVG TỔNG QUÁT — chạy bằng dữ liệu ─────────────────────────
//
// Khung vẽ cố định 1000×600. Soạn một sa đồ mới = viết `dia_hinh[]` (phông
// nền, luôn hiện) + `phan_tu[]` (bật/tắt theo `buoc[].hien`). Không đụng TS.
//
// PHÂN BIỆT PHE KHÔNG CHỈ BẰNG MÀU (mù màu đỏ–lục ~8% nam giới):
//   · hình dạng — quân ta hình TRÒN, quân địch hình THOI; thuyền ta buồm TAM
//     GIÁC, thuyền địch buồm VUÔNG; thành địch có thêm vòng tường ngoài;
//   · hoạ tiết  — ta gạch chéo MỘT chiều, địch ca-rô HAI chiều (đúng cặp
//     pattern mà chú giải .sd-legend-ta/-doi đang dùng, xem sado.css).
// Mũi tên KHÔNG nhận được hoạ tiết (animation vẽ dần đã chiếm
// stroke-dasharray), nên chỉ có hai kênh phi màu: đầu mũi (ngạnh cong của ta
// / tam giác nhọn của địch) và vạch đuôi (chỉ địch có). Đây là giới hạn thật,
// bù lại mỗi mũi tên đều mang nhãn chữ.
//
// Nhãn chữ LUÔN dùng --chu trên quầng --mat, KHÔNG dùng màu phe: đo được
// --nhan (phe ta khi loai_xung_dot=noi-chien) trên --mat chỉ 3,64:1 ở chế độ
// người lớn — trượt ngưỡng 4,5:1 của WCAG 1.4.3. --chu trên --mat đạt
// 15,14:1 (người lớn) và 17,49:1 (trẻ em).

const TQ_RONG = 1000;
const TQ_CAO = 600;

/** Làm tròn 1 chữ số thập phân — giữ chuỗi SVG gọn, không đổi hình. */
const r1 = (n: number): string => String(Math.round(n * 10) / 10);

/** Bỏ toạ độ hỏng: một điểm sai kiểu trong JSON không được làm gãy cả sa đồ. */
function diemHopLe(ds: Diem[] | undefined): Diem[] {
  return (ds ?? []).filter(
    (p): p is Diem => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]),
  );
}

function diemDon(p: Diem | undefined): Diem | null {
  const ds = diemHopLe(p ? [p] : []);
  return ds[0] ?? null;
}

const so = (v: number | undefined): number => (Number.isFinite(v) ? (v as number) : 0);

/** Catmull-Rom → Bézier bậc ba: sông/đường/sống núi mềm thay vì gãy khúc. */
function netMem(pts: Diem[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M${r1(pts[0][0])},${r1(pts[0][1])}`;
  let d = `M${r1(pts[0][0])},${r1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = i > 0 ? pts[i - 1] : pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i + 2 < pts.length ? pts[i + 2] : p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${r1(c1x)},${r1(c1y)} ${r1(c2x)},${r1(c2y)} ${r1(p2[0])},${r1(p2[1])}`;
  }
  return d;
}

/** Nhãn chữ có quầng --mat (kỹ thuật bản đồ chuẩn cho chữ đè nền đổi màu).
 *
 *  `quyMo` thành DÒNG THỨ HAI của cùng một `<text>`, không phải một nhãn rời:
 *  getBBox() khi đó trả hộp bao của cả hai dòng, nên `veNenNhan()` vẽ một tấm
 *  nền chung và đẩy cả cụm cùng lúc. Nhãn phụ rời sẽ bị đẩy đi nơi khác và
 *  không còn chú thích cho ai. */
function nhanSvg(x: number, y: number, chu: string, phu = false, quyMo?: string): string {
  // Bọc trong <g> để `veNenNhan()` chèn được tấm nền phía sau lúc chạy —
  // bề rộng chữ chỉ đo được sau khi trình duyệt dựng font, không tính trước
  // ở khâu sinh chuỗi được.
  const dong2 = quyMo?.trim()
    ? `<tspan class="sd-nhan-quy-mo" x="${r1(x)}" dy="19">${esc(quyMo.trim())}</tspan>`
    : "";
  return `<g class="sd-nhan-g"><text class="sd-nhan${phu ? " sd-nhan-phu" : ""}" x="${r1(x)}" y="${r1(y)}" text-anchor="middle">${esc(chu)}${dong2}</text></g>`;
}

/**
 * Chèn tấm nền sau mỗi nhãn, và ĐẨY NHÃN CHỒNG NHAU ra khỏi nhau.
 *
 * Vì sao cần: trên trận Bạch Đằng 1288 đo được «Bãi cọc Yên Giang» và «Thuyền
 * địch mắc cọc, vỡ» đè lên nhau thành một mớ không đọc nổi. Quầng chữ quanh
 * glyph không cứu được ca này — hai dòng chữ chồng nhau thì quầng của dòng
 * này lại ăn vào glyph của dòng kia.
 *
 * Cách xử: đo hộp bao thật bằng getBBox(), vẽ nền bo góc, rồi quét từ trên
 * xuống dời nhãn nào còn chạm nhau sang chỗ trống GẦN NHẤT — chủ yếu theo
 * chiều dọc, cộng ba nấc lách ngang nhỏ (≤52 đơn vị) để nhãn vẫn nằm trên thứ
 * nó chú thích. Dời quá một dòng chữ thì vẽ vạch nối về chỗ gốc.
 */
export function veNenNhan(svg: SVGSVGElement): void {
  // Dọn kết quả lượt trước: bỏ tấm nền + vạch nối cũ và trả nhãn về đúng chỗ
  // gốc. Không dọn thì mỗi lần đổi bước lại cộng dồn một lớp `dy` nữa.
  for (const r of svg.querySelectorAll(".sd-nhan-nen, .sd-nhan-noi")) r.remove();
  for (const t of svg.querySelectorAll("text.sd-nhan")) t.removeAttribute("dy");
  // Dịch NGANG đặt trên <g>, không phải trên <text>: nhãn hai dòng có tspan
  // khai `x` tuyệt đối, nên `dx` trên <text> chỉ dịch dòng một và tách đôi
  // nhãn. Transform trên nhóm kéo cả chữ, tấm nền lẫn vạch nối đi cùng.
  for (const g of svg.querySelectorAll(".sd-nhan-g")) g.removeAttribute("transform");

  const nhom = [...svg.querySelectorAll<SVGGElement>(".sd-nhan-g")];
  const hop: { g: SVGGElement; t: SVGTextElement; b: DOMRect }[] = [];
  for (const g of nhom) {
    // CHỈ xếp nhãn ĐANG HIỆN. Giữ chỗ cho nhãn của lớp đang ẩn thì nhãn đang
    // hiện bị đẩy văng khỏi khung — đo được 3–4 cặp chồng nhau vì lỗi này.
    // Nhãn địa hình không nằm trong .sd-layer nào nên luôn được tính.
    if (g.closest(".sd-layer-hidden")) continue;
    const t = g.querySelector<SVGTextElement>("text");
    if (!t) continue;
    let b: DOMRect;
    try {
      b = t.getBBox();
    } catch {
      continue; // phần tử chưa dựng xong
    }
    if (!b.width) continue;
    hop.push({ g, t, b });
  }
  hop.sort((a, z) => a.b.y - z.b.y);

  const daDat: DOMRect[] = [];
  const DEM = 4; // đệm quanh chữ
  // Đáy khung: đẩy quá mức này là nhãn rơi ra ngoài viewBox và mất hẳn — đã
  // gặp đúng ca đó với «Ô Mã Nhi bị bắt sống» ở bước cuối trận Bạch Đằng.
  const DAY = TQ_CAO - 26;
  /** DIỆN TÍCH chồng lấn, không phải cờ đúng/sai: sa đồ dày tới mức không còn
   *  chỗ trống nào thì vẫn phải chọn được chỗ ÍT ĐÈ NHẤT. Trả 0 đúng khi phép
   *  thử va chạm cũ trả false, nên hành vi ở mật độ thấp không đổi. */
  const deChong = (x: number, y: number, w: number, hgt: number): number => {
    let s = 0;
    for (const r of daDat) {
      const ox = Math.min(x + w + DEM, r.x + r.width + DEM) - Math.max(x, r.x);
      const oy = Math.min(y + hgt + DEM, r.y + r.height + DEM) - Math.max(y, r.y);
      if (ox > 0 && oy > 0) s += ox * oy;
    }
    return s;
  };
  // Biên chừa quanh khung vẽ khi kẹp nhãn vào trong.
  const BIEN = 6;
  for (const h of hop) {
    const buoc = h.b.height + DEM * 2;
    // Danh sách vị trí ứng viên duyệt theo KHOẢNG CÁCH tăng dần: đứng yên
    // trước, rồi các chỗ gần nhất. Nhận vị trí ĐẦU TIÊN vừa không đè ai vừa
    // còn nằm trong khung.
    //
    // Bản trước tôi viết kiểu «đẩy xuống, hết chỗ thì quay sang đẩy lên» rồi
    // `break` mà KHÔNG kiểm lại vị trí vừa chọn — kết quả đo được là 0 cặp
    // chồng nhau thành 3. Duyệt ứng viên thì không có nhánh nào thoát mà
    // chưa kiểm.
    //
    // Ba thay đổi cho sa đồ dày, cả ba đều đo trên hồ sơ 24 phần tử:
    //   · nấc NỬA dòng — gấp đôi số chỗ thử trong cùng một tầm, nên nhãn hay
    //     tìm được khe sát bên cạnh thay vì phải nhảy hẳn một dòng;
    //   · tầm đẩy dọc chặn ở 160 đơn vị (hơn ¼ chiều cao khung), tính theo
    //     KHOẢNG CÁCH chứ không theo số nấc. Chặn theo nấc thì nhãn hai dòng
    //     (có quy_mo) cao gấp đôi nên 6 nấc của nó thành 288 đơn vị — đo được
    //     một nhãn văng 191 đơn vị khỏi khối quân nó chú thích, sạch mà sai;
    //   · thêm ba nấc NGANG nhỏ (±26, ±52). Ghi chú cũ của hàm nói «chỉ đẩy
    //     dọc» là đúng với đẩy ngang TỰ DO — nhưng một cú lách 26 đơn vị (hơn
    //     một chữ) vẫn để nhãn nằm trên chính khối nó chú thích, mà mở thêm
    //     gấp năm số chỗ trống. Xa hơn thì vạch nối ở cuối hàm gánh.
    const nua = buoc / 2;
    const dyUv = [0];
    for (let k = 1; k <= 12 && k * nua <= 160; k++) dyUv.push(k * nua, -k * nua);
    const ungVien: [number, number][] = [];
    for (const uy of dyUv) for (const ux of [0, 26, -26, 52, -52]) ungVien.push([ux, uy]);
    ungVien.sort((a, z) => Math.hypot(a[0], a[1]) - Math.hypot(z[0], z[1]));
    let dy = 0;
    let dx = 0;
    let itNhat = Number.POSITIVE_INFINITY;
    let totNhat: [number, number] | null = null;
    for (const [ux, uy] of ungVien) {
      const x = h.b.x + ux;
      const y = h.b.y + uy;
      if (y < 8 || y + h.b.height > DAY) continue;
      if (x < BIEN || x + h.b.width > TQ_RONG - BIEN) continue;
      const de = deChong(x, y, h.b.width, h.b.height);
      if (de === 0) {
        dx = ux;
        dy = uy;
        totNhat = null;
        break;
      }
      if (de < itNhat) {
        itNhat = de;
        totNhat = [ux, uy];
      }
    }
    if (totNhat !== null) [dx, dy] = totNhat;
    // KẸP VÀO KHUNG, làm sau cùng. Không có bước này thì nhãn nào vốn đã nằm
    // ngoài khung (nhãn địa hình đặt ở `giua[1] - 22` với đỉnh núi sát mép
    // trên) sẽ không có ứng viên nào hợp lệ, giữ nguyên chỗ cũ và bị
    // `overflow: hidden` của <svg> cắt mất — đo được 5 nhãn kiểu này trên
    // bach-dang-1288 sau khi hồ sơ dày lên.
    const yTho = h.b.y + dy;
    dy += Math.min(Math.max(yTho, 8), Math.max(8, DAY - h.b.height)) - yTho;
    const xTho = h.b.x + dx;
    dx += Math.min(Math.max(xTho, BIEN), Math.max(BIEN, TQ_RONG - BIEN - h.b.width)) - xTho;
    if (dy) h.t.setAttribute("dy", String(Math.round(dy * 10) / 10));
    if (dx) h.g.setAttribute("transform", `translate(${Math.round(dx)},0)`);
    const y = h.b.y + dy;
    daDat.push(new DOMRect(h.b.x + dx, y, h.b.width, h.b.height));
    // Nhãn bị đẩy xa thì nối lại bằng một vạch chấm về chỗ cũ. Không có vạch,
    // người xem đọc nhãn như đang chú thích cho thứ nằm dưới chỗ MỚI của nó —
    // sa đồ nói sai mà trông vẫn sạch sẽ. Ngưỡng 22 đơn vị ≈ một dòng chữ:
    // dịch trong một dòng thì mắt vẫn ghép đúng, không cần vạch.
    if (Math.abs(dy) >= 22 || Math.abs(dx) >= 14) {
      // Toạ độ ghi trong hệ CỤC BỘ của <g>, mà <g> đã dịch ngang dx — nên đầu
      // vạch trỏ về gốc phải trừ lại dx.
      const gx = h.b.x + h.b.width / 2;
      const noi = document.createElementNS("http://www.w3.org/2000/svg", "line");
      noi.setAttribute("class", "sd-nhan-noi");
      noi.setAttribute("x1", String(Math.round(gx - dx)));
      noi.setAttribute("y1", String(Math.round(h.b.y + h.b.height / 2)));
      noi.setAttribute("x2", String(Math.round(gx)));
      noi.setAttribute("y2", String(Math.round(y + h.b.height / 2)));
      h.g.insertBefore(noi, h.t);
    }
    const nen = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    nen.setAttribute("class", "sd-nhan-nen");
    nen.setAttribute("x", String(h.b.x - 6));
    nen.setAttribute("y", String(y - 2));
    nen.setAttribute("width", String(h.b.width + 12));
    nen.setAttribute("height", String(h.b.height + 4));
    nen.setAttribute("rx", "6");
    h.g.insertBefore(nen, h.t);
  }
}

interface BenMau {
  chu: string;
  nen: string;
  hoa_tiet: string;
}

function benMau(ben: Ben | undefined): BenMau {
  if (ben === "ta")
    return { chu: "var(--sd-ta-chu)", nen: "var(--sd-ta-nen)", hoa_tiet: "url(#sd-hatch-ta)" };
  if (ben === "dich")
    return { chu: "var(--sd-doi-chu)", nen: "var(--sd-doi-nen)", hoa_tiet: "url(#sd-hatch-doi)" };
  return { chu: "var(--sd-net-dia-hinh)", nen: "var(--mat)", hoa_tiet: "none" };
}

// ── Phông nền: địa hình ──────────────────────────────────────────────────
// Mọi nét và nhãn địa hình dùng token TRUNG TÍNH --sd-net-dia-hinh, không bao
// giờ mượn màu phe: đo được nét này 5,55:1 (người lớn) / 6,66:1 (trẻ em) trên
// nền đất, thừa ngưỡng 3:1 của WCAG 1.4.11. Phần tô bên trong chỉ là trang
// trí (1,28–2,04:1) — thứ mang ngưỡng tương phản là ĐƯỜNG NÉT, không phải nền.

function diaHinhSvg(dh: DiaHinh): string {
  const pts = diemHopLe(dh.diem);
  if (pts.length === 0) return "";
  const d = netMem(pts);
  const giua = pts[Math.floor((pts.length - 1) / 2)];
  const nhan = dh.nhan ? nhanSvg(giua[0], giua[1] - 22, dh.nhan, true) : "";

  switch (dh.kieu) {
    case "song":
      // Hai nét chồng: nét ngoài rộng hơn tạo mép sông thấy được, nét trong
      // là lòng sông. Rẻ hơn nhiều so với dựng đa giác hai bờ từ đường tim.
      // Nét thứ BA là dòng chảy: nét mảnh đứt quãng chạy dọc tim sông, cho
      // sông có hướng và có chuyển động. Không có nó, sông đọc như con đường.
      return `<g class="sd-dh sd-dh-song">
        <path class="sd-song-mep" d="${d}"/>
        <path class="sd-song-long" d="${d}"/>
        <path class="sd-song-dong" d="${d}"/>
        ${nhan}
      </g>`;
    case "bien":
      return `<g class="sd-dh sd-dh-bien">
        <path class="sd-bien-nuoc" d="${d} Z"/>
        ${nhan}
      </g>`;
    case "nui":
      return `<g class="sd-dh sd-dh-nui">
        <path class="sd-nui-song" d="${d}"/>
        ${pts.map((p) => `<path class="sd-nui-dinh" d="M${r1(p[0] - 30)},${r1(p[1] + 26)} L${r1(p[0])},${r1(p[1] - 26)} L${r1(p[0] + 30)},${r1(p[1] + 26)} Z"/>`).join("")}
        ${nhan}
      </g>`;
    case "rung":
      // Cây HAI TẦNG có thân, không phải tam giác đơn: tam giác đơn ở cỡ này
      // đọc y hệt đỉnh núi, hai loại địa hình lẫn vào nhau (bắt được khi xem
      // ảnh dựng thật, không phải khi đọc code).
      return `<g class="sd-dh sd-dh-rung">
        <path class="sd-rung-vung" d="${d} Z"/>
        ${pts.map((p) => `<path class="sd-rung-cay" d="M${r1(p[0])},${r1(p[1] - 17)} L${r1(p[0] + 9)},${r1(p[1] - 3)} L${r1(p[0] + 4)},${r1(p[1] - 3)} L${r1(p[0] + 12)},${r1(p[1] + 8)} L${r1(p[0] - 12)},${r1(p[1] + 8)} L${r1(p[0] - 4)},${r1(p[1] - 3)} L${r1(p[0] - 9)},${r1(p[1] - 3)} Z M${r1(p[0] - 2)},${r1(p[1] + 8)} L${r1(p[0] - 2)},${r1(p[1] + 16)} L${r1(p[0] + 2)},${r1(p[1] + 16)} L${r1(p[0] + 2)},${r1(p[1] + 8)} Z"/>`).join("")}
        ${nhan}
      </g>`;
    case "duong":
      return `<g class="sd-dh sd-dh-duong">
        <path class="sd-duong-net" d="${d}"/>
        ${nhan}
      </g>`;
  }
}

// ── Phần tử bật/tắt theo bước ────────────────────────────────────────────

/** Tường thành có lỗ châu mai — `soLo` khối lồi, xen kẽ khối lõm. */
function thanhPath(w: number, h: number, soLo: number): string {
  const x0 = -w / 2;
  const yTren = -h / 2;
  const yKhe = yTren + 12;
  const yDuoi = h / 2;
  const n = soLo * 2 - 1;
  const b = w / n;
  let d = `M${r1(x0)},${r1(yDuoi)} L${r1(x0)},${r1(yTren)}`;
  let y = yTren;
  for (let i = 0; i < n; i++) {
    const yKe = i % 2 === 0 ? yTren : yKhe;
    if (yKe !== y) d += ` L${r1(x0 + i * b)},${r1(yKe)}`;
    d += ` L${r1(x0 + (i + 1) * b)},${r1(yKe)}`;
    y = yKe;
  }
  if (y !== yTren) d += ` L${r1(x0 + w)},${r1(yTren)}`;
  return `${d} L${r1(x0 + w)},${r1(yDuoi)} Z`;
}

function quanSvg(m: BenMau, ben: Ben | undefined): string {
  if (ben === "dich")
    return `<path class="sd-hinh" d="M0,-19 L19,0 L0,19 L-19,0 Z" fill="${m.nen}"/>
      <path class="sd-hinh" d="M0,-19 L19,0 L0,19 L-19,0 Z" fill="${m.hoa_tiet}"/>
      <path class="sd-net" d="M0,-19 L19,0 L0,19 L-19,0 Z" stroke="${m.chu}"/>
      <path class="sd-net" d="M20,-26 L20,14 M20,-24 L34,-19 L20,-14" stroke="${m.chu}"/>`;
  const hoaTiet =
    ben === "ta" ? `<circle class="sd-hinh" r="17" fill="${m.hoa_tiet}"/>` : "";
  return `<circle class="sd-hinh" r="17" fill="${m.nen}"/>
    ${hoaTiet}
    <circle class="sd-net" r="17" stroke="${m.chu}"/>
    <path class="sd-net" d="M20,-26 L26,16" stroke="${m.chu}" stroke-linecap="round"/>`;
}

function thanhSvg(m: BenMau, ben: Ben | undefined): string {
  const d = thanhPath(104, 68, 5);
  // Vòng tường ngoài chỉ vẽ cho phe địch — kênh hình dạng thứ hai, đọc được
  // cả khi in đen trắng.
  const ngoai =
    ben === "dich"
      ? `<path class="sd-net sd-net-manh" d="${thanhPath(126, 88, 5)}" stroke="${m.chu}"/>`
      : "";
  return `${ngoai}
    <path class="sd-hinh" d="${d}" fill="${m.nen}"/>
    <path class="sd-hinh" d="${d}" fill="${m.hoa_tiet}"/>
    <path class="sd-net" d="${d}" stroke="${m.chu}"/>
    <path class="sd-net" d="M-11,34 L-11,8 A11,11 0 0 1 11,8 L11,34" stroke="${m.chu}"/>`;
}

function thuyenSvg(m: BenMau, ben: Ben | undefined): string {
  // Buồm CĂNG GIÓ (đường cong) thay cho hình chữ nhật phẳng, kèm hai thanh
  // nẹp — buồm cánh dơi có nẹp là dáng thuyền buồm quen thuộc của cả hai
  // phía, và chính mấy nét nẹp đó làm cánh buồm không còn đọc ra "cái hộp".
  // Vẫn giữ nguyên KÊNH PHÂN BIỆT PHE bằng hình dạng: buồm địch cong về
  // trước, buồm ta là buồm tam giác — đọc được cả khi in đen trắng.
  const buom =
    ben === "dich"
      ? `<path class="sd-hinh" d="M3,-40 Q30,-27 3,-10 Z" fill="${m.nen}"/>
         <path class="sd-hinh" d="M3,-40 Q30,-27 3,-10 Z" fill="${m.hoa_tiet}"/>
         <path class="sd-net" d="M3,-40 Q30,-27 3,-10 Z" stroke="${m.chu}"/>
         <path class="sd-net sd-net-manh" d="M3,-32 Q21,-26 3,-21 M3,-21 Q17,-18 3,-14" stroke="${m.chu}"/>`
      : `<path class="sd-hinh" d="M3,-40 L28,-10 L3,-10 Z" fill="${m.nen}"/>
         <path class="sd-hinh" d="M3,-40 L28,-10 L3,-10 Z" fill="${m.hoa_tiet}"/>
         <path class="sd-net" d="M3,-40 L28,-10 L3,-10 Z" stroke="${m.chu}"/>
         <path class="sd-net sd-net-manh" d="M3,-27 L17,-11 M3,-18 L11,-11" stroke="${m.chu}"/>`;
  // Thân thuyền: mũi và lái CONG NGƯỢC LÊN, thêm mạn khô (đường boong) —
  // ba nét đó đủ để nửa vành cung trước kia thành một con thuyền.
  return `<path class="sd-hinh" d="M-36,-10 Q-30,-2 -30,0 Q0,26 30,0 Q30,-2 36,-10 Q18,2 0,2 Q-18,2 -36,-10 Z" fill="${m.nen}"/>
    <path class="sd-net" d="M-36,-10 Q-30,-2 -30,0 Q0,26 30,0 Q30,-2 36,-10 Q18,2 0,2 Q-18,2 -36,-10 Z" stroke="${m.chu}"/>
    <path class="sd-net sd-net-manh" d="M-28,2 Q0,12 28,2" stroke="${m.chu}"/>
    <path class="sd-net" d="M0,0 L0,-42" stroke="${m.chu}"/>
    ${buom}`;
}

function coSvg(m: BenMau, ben: Ben | undefined): string {
  const la =
    ben === "dich"
      ? `<rect class="sd-hinh" x="3" y="-66" width="52" height="30" fill="${m.nen}"/>
         <rect class="sd-hinh" x="3" y="-66" width="52" height="30" fill="${m.hoa_tiet}"/>
         <rect class="sd-net" x="3" y="-66" width="52" height="30" stroke="${m.chu}"/>`
      : `<path class="sd-hinh" d="M3,-66 L57,-66 L46,-51 L57,-36 L3,-36 Z" fill="${m.nen}"/>
         <path class="sd-hinh" d="M3,-66 L57,-66 L46,-51 L57,-36 L3,-36 Z" fill="${m.hoa_tiet}"/>
         <path class="sd-net" d="M3,-66 L57,-66 L46,-51 L57,-36 L3,-36 Z" stroke="${m.chu}"/>
         <path d="M22,-59 l3.5,8 8.5,0 -6.5,5.5 2.5,8.5 -8,-5.5 -8,5.5 2.5,-8.5 -6.5,-5.5 8.5,0 z" fill="${m.chu}"/>`;
  return `<path class="sd-net sd-net-day" d="M0,0 L0,-68" stroke="${m.chu}" stroke-linecap="round"/>
    ${la}`;
}

/** Công sự (bãi cọc, luỹ, chiến hào) — trung tính, không thuộc phe nào. */
function congSuSvg(): string {
  const coc = [-56, -37, -18, 1, 20, 39, 58]
    .map(
      // SAI KHÁC NHỎ theo chỉ số: cao thấp so le và nghiêng qua lại vài độ.
      // Bảy cọc y hệt nhau, cùng chiều cao, cách đều tăm tắp thì mắt đọc
      // thành biểu đồ cột chứ không thành bãi cọc cắm dưới lòng sông. Dùng
      // hàm sin theo chỉ số chứ KHÔNG dùng Math.random(): sa đồ phải dựng ra
      // đúng một hình mỗi lần mở, nếu không thì ảnh chụp đối chiếu vô nghĩa.
      (x, i) => {
        const cao = 14 + Math.round(Math.sin(i * 1.7) * 5);
        const xoay = Math.round(Math.sin(i * 2.3) * 4);
        return `<g transform="rotate(${xoay} ${x} 30)">
          <path class="sd-cong-su" d="M${x},30 L${x},2 M${x - 8},4 L${x},${-cao} L${x + 8},4 Z"/>
        </g>`;
      },
    )
    .join("");
  return coc;
}

function diaDanhSvg(): string {
  return `<path class="sd-dia-danh-pin" d="M0,-16 L13,0 L0,16 L-13,0 Z"/>
    <circle class="sd-dia-danh-tam" r="4"/>`;
}

/** Tách nhãn chính / nhãn phụ của một phần tử. Khai `quy_mo` mà bỏ trống
 *  `nhan` thì `quy_mo` lên làm nhãn chính — không có lý do giấu đi chữ duy
 *  nhất người soạn đã viết cho phần tử đó. */
function nhanCua(p: PhanTu): { chinh: string; phu?: string } {
  const nhan = p.nhan?.trim() ?? "";
  const quyMo = p.quy_mo?.trim() ?? "";
  if (nhan) return quyMo ? { chinh: nhan, phu: quyMo } : { chinh: nhan };
  return { chinh: quyMo };
}

function muiTenSvg(p: PhanTu, m: BenMau): string {
  const tu = diemDon(p.tu);
  const den = diemDon(p.den);
  if (!tu || !den) return "";
  const dx = den[0] - tu[0];
  const dy = den[1] - tu[1];
  const dai = Math.hypot(dx, dy) || 1;
  // Pháp tuyến của dây cung — vừa để uốn cung, vừa để đẩy nhãn ra NGOÀI cung.
  const nx0 = -dy / dai;
  const ny0 = dx / dai;
  // Cong nhẹ 14% chiều dài: mũi tên thẳng tắp đọc như sơ đồ mạch điện, cong
  // mới ra "hướng tiến quân".
  const cx = (tu[0] + den[0]) / 2 + nx0 * dai * 0.14;
  const cy = (tu[1] + den[1]) / 2 + ny0 * dai * 0.14;
  // Đầu mũi dùng bộ ký hiệu RIÊNG của sa đồ tổng quát, đo theo userSpaceOnUse:
  // bộ của Bạch Đằng theo markerUnits mặc định (strokeWidth) nên với nét 5,5
  // đầu mũi phình lên 66 đơn vị — to hơn cả một ngọn núi trên khung 1000×600.
  const dau =
    p.ben === "ta" ? "sd-tq-mui-ta" : p.ben === "dich" ? "sd-tq-mui-doi" : "sd-tq-mui-trung";
  const duoi = p.ben === "dich" ? ` marker-start="url(#sd-tq-duoi-doi)"` : "";
  const d = `M${r1(tu[0])},${r1(tu[1])} Q${r1(cx)},${r1(cy)} ${r1(den[0])},${r1(den[1])}`;
  // Điểm giữa đường bậc hai = (P0 + 2C + P1)/4. Nhãn ĐẨY TIẾP 26 đơn vị theo
  // pháp tuyến: đặt ngay trên điểm giữa thì với mũi tên ngắn, chữ phủ kín cả
  // thân mũi tên và không còn thấy mũi tên đâu nữa.
  const nx = (tu[0] + 2 * cx + den[0]) / 4 + nx0 * 26;
  const ny = (tu[1] + 2 * cy + den[1]) / 4 + ny0 * 26;
  // Vạch hành quân: nét đứt sáng chạy DỌC THÂN mũi tên (CSS bật qua class
  // .sd-dong-on, applyStep giới hạn 3 mũi/bước vì dashoffset tốn paint).
  const nh = nhanCua(p);
  return `<path class="sd-arrow" d="${d}" fill="none" stroke="${m.chu}" stroke-width="5.5" stroke-linecap="round" marker-end="url(#${dau})"${duoi}/>
    <path class="sd-arrow-dong" d="${d}" fill="none" aria-hidden="true"/>
    ${nh.chinh ? nhanSvg(nx, ny + 6, nh.chinh, false, nh.phu) : ""}`;
}

function phanTuSvg(p: PhanTu): string {
  const m = benMau(p.ben);
  const noiDung = ((): string => {
    switch (p.kieu) {
      case "quan":
        return quanSvg(m, p.ben);
      case "thanh":
        return thanhSvg(m, p.ben);
      case "thuyen":
        return thuyenSvg(m, p.ben);
      case "co":
        return coSvg(m, p.ben);
      case "cong-su":
        return congSuSvg();
      case "dia-danh":
        return diaDanhSvg();
      case "mui-ten":
        return "";
    }
  })();
  const nhanDuoi: Record<PhanTuKieu, number> = {
    quan: 40,
    thanh: 58,
    thuyen: 44,
    co: 26,
    "cong-su": 52,
    "dia-danh": 36,
    "mui-ten": 0,
  };
  const nh = nhanCua(p);
  const than =
    p.kieu === "mui-ten"
      ? muiTenSvg(p, m)
      : `<g class="sd-khoi" transform="translate(${r1(so(p.x))},${r1(so(p.y))})">${noiDung}</g>${
          nh.chinh ? nhanSvg(so(p.x), so(p.y) + nhanDuoi[p.kieu], nh.chinh, false, nh.phu) : ""
        }`;
  return `<g class="sd-layer" data-key="${esc(p.id)}">${than}</g>`;
}

/** Ngưỡng «sa đồ dày»: quá số này thì nhãn thu nhỏ một nấc.
 *  Đo 2026-08-28 trên 290 hồ sơ: 289 hồ sơ ≤ 13 phần tử, dày nhất 19
 *  (chi-lang-1427). Đặt ở 14 nên chỉ hồ sơ thật sự chật mới đổi cỡ chữ. */
const TQ_NGUONG_DAY = 14;

function buildTongQuatSvg(b: Battle): string {
  const diaHinh = (b.dia_hinh ?? []).map(diaHinhSvg).join("");
  const phanTu = (b.phan_tu ?? []).map(phanTuSvg).join("");
  const day = (b.phan_tu ?? []).length > TQ_NGUONG_DAY ? " sd-day" : "";
  return `<svg class="sd-svg sd-svg-tq${day}" viewBox="0 0 ${TQ_RONG} ${TQ_CAO}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Sa đồ minh hoạ ${esc(b.ten)}">
    ${saDoDefs()}
    <rect class="sd-nen-dat" x="0" y="0" width="${TQ_RONG}" height="${TQ_CAO}"/>
    <rect class="sd-nen-hat" x="0" y="0" width="${TQ_RONG}" height="${TQ_CAO}" filter="url(#sd-f-giay)" aria-hidden="true"/>
    <g class="sd-cam"><g class="sd-dia-hinh" aria-hidden="true">${diaHinh}</g>
    ${phanTu}
    <g class="sd-fx" aria-hidden="true"></g></g>
    <rect class="sd-nen-vien" x="0" y="0" width="${TQ_RONG}" height="${TQ_CAO}" aria-hidden="true"/>
    <text class="sd-note-tq" x="${TQ_RONG / 2}" y="${TQ_CAO - 12}" text-anchor="middle">Sa đồ minh hoạ — không theo tỉ lệ</text>
  </svg>`;
}

// ── Chú giải ký hiệu ──────────────────────────────────────────────────────
//
// Sa đồ 24 phần tử mà không có chú giải thì không đọc được. Ký hiệu trong chú
// giải do CHÍNH các hàm vẽ phần tử sinh ra, không vẽ lại bằng tay: chú giải
// lệch với sa đồ là loại sai không cổng nào bắt được.
//
// Hoạ tiết (#sd-hatch-*) và đầu mũi tên (#sd-tq-mui-*) tham chiếu <defs> của
// sa đồ chính. `url(#id)` phân giải trong PHẠM VI TÀI LIỆU, không phải trong
// phạm vi một thẻ <svg>, nên tham chiếu chéo hợp lệ — và sa đồ chính luôn
// dựng cùng lúc với chú giải trong renderFullDetail().

/** Tên bên đối phương dùng cho CHỮ. Nội chiến không có «quân địch»: tên lấy
 *  thẳng từ `doi_thu` của hồ sơ, đúng quy ước mà cặp token --sd-doi-* đã theo. */
function benTen(b: Battle, ben: Ben | undefined): string {
  if (ben === "ta") return "quân ta";
  if (ben !== "dich") return "";
  const ten = b.doi_thu?.trim();
  if (ten) return ten;
  return b.loai_xung_dot === "noi-chien" ? "phía đối phương" : "quân đối phương";
}

const hoaDau = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// Khung nhìn riêng từng ký hiệu: các hình có tầm vóc rất khác nhau (thành
// rộng 126 đơn vị, địa danh chỉ 26) nên một khung chung sẽ làm cái thì tràn,
// cái thì bé bằng hạt gạo.
const LG_KHUNG: Record<PhanTuKieu, string> = {
  quan: "-26 -33 66 60",
  thanh: "-70 -50 140 92",
  thuyen: "-44 -48 88 80",
  co: "-10 -74 76 84",
  "cong-su": "-70 -26 140 62",
  "dia-danh": "-22 -22 44 44",
  "mui-ten": "0 0 92 46",
};

const LG_TEN: Record<PhanTuKieu, string> = {
  quan: "Khối quân",
  thanh: "Thành, cứ điểm",
  thuyen: "Thuyền chiến",
  "cong-su": "Công sự — bãi cọc, luỹ, chiến hào",
  co: "Cờ hiệu",
  "dia-danh": "Địa danh",
  "mui-ten": "Hướng tiến quân",
};

// Hai ký hiệu này KHÔNG đổi hình theo phe (congSuSvg/diaDanhSvg bỏ qua `ben`).
// Liệt kê chúng ba lần cho ba phe là hứa một sự phân biệt không có thật.
const LG_TRUNG_TINH: PhanTuKieu[] = ["cong-su", "dia-danh"];

function kyHieuSvg(kieu: PhanTuKieu, ben: Ben | undefined): string {
  const m = benMau(ben);
  const than = ((): string => {
    switch (kieu) {
      case "quan":
        return quanSvg(m, ben);
      case "thanh":
        return thanhSvg(m, ben);
      case "thuyen":
        return thuyenSvg(m, ben);
      case "co":
        return coSvg(m, ben);
      case "cong-su":
        return congSuSvg();
      case "dia-danh":
        return diaDanhSvg();
      case "mui-ten": {
        const dau =
          ben === "ta" ? "sd-tq-mui-ta" : ben === "dich" ? "sd-tq-mui-doi" : "sd-tq-mui-trung";
        const duoi = ben === "dich" ? ` marker-start="url(#sd-tq-duoi-doi)"` : "";
        return `<path d="M8,36 Q38,4 64,22" fill="none" stroke="${m.chu}" stroke-width="5.5" stroke-linecap="round" marker-end="url(#${dau})"${duoi}/>`;
      }
    }
  })();
  return `<svg class="sd-lg-hinh" viewBox="${LG_KHUNG[kieu]}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">${than}</svg>`;
}

function chuGiaiHtml(b: Battle): string {
  const ds = b.phan_tu ?? [];
  const THU_TU: PhanTuKieu[] = ["quan", "thanh", "cong-su", "thuyen", "co", "dia-danh", "mui-ten"];
  const cap: { kieu: PhanTuKieu; ben?: Ben; chung?: boolean }[] = [];
  for (const kieu of THU_TU) {
    const cua = ds.filter((p) => p.kieu === kieu);
    if (cua.length === 0) continue;
    if (LG_TRUNG_TINH.includes(kieu)) {
      cap.push({ kieu, chung: cua.some((p) => !!p.ben) });
      continue;
    }
    for (const ben of ["ta", "dich", undefined] as (Ben | undefined)[])
      if (cua.some((p) => p.ben === ben)) cap.push({ kieu, ben });
  }
  // Hồ sơ không khai phan_tu[] — giữ nguyên chú giải hai ô như trước, không
  // để trống chỗ này.
  if (cap.length === 0)
    return `<div class="sd-legend">
      <span class="sd-legend-item"><span class="sd-legend-swatch sd-legend-ta"></span> Quân ta — nét gạch chéo, khối tròn</span>
      <span class="sd-legend-item"><span class="sd-legend-swatch sd-legend-doi"></span> ${esc(hoaDau(benTen(b, "dich")))} — nét ca-rô, khối thoi</span>
    </div>`;
  const muc = cap
    .map(({ kieu, ben, chung }) => {
      const phu = chung ? "ký hiệu chung cho cả hai bên" : benTen(b, ben);
      return `<li class="sd-lg-muc">${kyHieuSvg(kieu, ben)}<span class="sd-lg-chu"><b>${esc(LG_TEN[kieu])}</b>${phu ? `<span class="sd-lg-ben muted">${esc(phu)}</span>` : ""}</span></li>`;
    })
    .join("");
  return `<div class="sd-legend sd-legend-ky-hieu">
    <h3 class="sd-lg-title">🔎 Chú giải ký hiệu</h3>
    <ul class="sd-lg-ds">${muc}</ul>
  </div>`;
}

// ── Tương quan lực lượng · tổn thất ───────────────────────────────────────

/** Một con số, hoặc nhiều con số vênh nhau — mỗi con số đi kèm ĐÚNG nguồn của
 *  nó. Gộp về một dòng là lặng lẽ chọn bản gọn hơn (bất biến #4). */
function soLieuHtml(v: SoLieu | undefined): string {
  // «4.020 hy sinh» đáng in đậm cỡ lớn; một đoạn văn nêu chỗ vênh giữa hai
  // nguồn thì không — in đậm cả đoạn chỉ làm khối tổn thất thành một mảng chữ
  // gào lên. Ngưỡng 60 ký tự tách hai ca đó.
  const dai = (s: string): string => (s.length > 60 ? " sd-so-dai" : "");
  if (typeof v === "string")
    return v.trim() ? `<p class="sd-so-lieu${dai(v.trim())}">${esc(v.trim())}</p>` : "";
  if (!Array.isArray(v)) return "";
  const ds = v.filter((x) => x && typeof x.so === "string" && x.so.trim());
  if (ds.length === 0) return "";
  return `<ul class="sd-so-lieu-ds">${ds
    .map(
      (x) =>
        `<li><span class="sd-so${dai(x.so.trim())}">${esc(x.so.trim())}</span>${
          x.nguon?.trim() ? `<span class="sd-so-nguon muted">theo ${esc(x.nguon.trim())}</span>` : ""
        }</li>`,
    )
    .join("")}</ul>`;
}

function dsHtml(nhan: string, ds: string[] | undefined): string {
  const sach = (ds ?? []).map((s) => String(s).trim()).filter(Boolean);
  if (sach.length === 0) return "";
  return `<div class="sd-ll-muc"><dt>${esc(nhan)}</dt><dd><ul>${sach
    .map((s) => `<li>${esc(s)}</li>`)
    .join("")}</ul></dd></div>`;
}

function cotLucLuongHtml(tieuDe: string, lop: string, c: LucLuongBen | undefined): string {
  if (!c) return "";
  const quanSo = soLieuHtml(c.quan_so);
  const dv = dsHtml("Đơn vị", c.don_vi);
  const vk = dsHtml("Vũ khí, khí tài", c.vu_khi);
  if (!quanSo && !dv && !vk) return "";
  return `<div class="sd-ll-cot ${lop}">
    <h4 class="sd-ll-ten">${esc(tieuDe)}</h4>
    ${quanSo ? `<div class="sd-ll-quan-so">${quanSo}</div>` : ""}
    ${dv || vk ? `<dl class="sd-ll-dl">${dv}${vk}</dl>` : ""}
  </div>`;
}

/** 🔴 Bất biến #3: `luc_luong.nguon` rỗng thì khối KHÔNG hiện. Cổng
 *  validate_battles.mjs chặn ở khâu dữ liệu; đây là lớp thứ hai cho hồ sơ
 *  soạn trước khi luật đó ra đời. */
function lucLuongHtml(b: Battle): string {
  const ll = b.luc_luong;
  if (!ll) return "";
  const nguon = (ll.nguon ?? []).map((s) => String(s).trim()).filter(Boolean);
  if (nguon.length === 0) return "";
  const ta = cotLucLuongHtml("Quân ta", "sd-ll-ta", ll.ta);
  const doi = cotLucLuongHtml(hoaDau(benTen(b, "dich")), "sd-ll-doi", ll.doi_thu);
  if (!ta && !doi) return "";
  return `<section class="sd-luc-luong">
    <h3 class="sd-ll-title">⚖️ Tương quan lực lượng</h3>
    <div class="sd-ll-bang">${ta}${doi}</div>
    ${sourcesHtml(nguon, "sources sd-ll-nguon")}
  </section>`;
}

function tonThatHtml(b: Battle): string {
  const tt = b.ton_that;
  if (!tt) return "";
  const nguon = (tt.nguon ?? []).map((s) => String(s).trim()).filter(Boolean);
  if (nguon.length === 0) return "";
  const ta = soLieuHtml(tt.ta);
  const doi = soLieuHtml(tt.doi_thu);
  if (!ta && !doi) return "";
  // Lời nhắc chỉ hiện khi dữ liệu THẬT SỰ có chỗ vênh — hiện lúc nào cũng có
  // thì thành câu trang trí, và người đọc thôi để ý.
  const venh = [tt.ta, tt.doi_thu].some((v) => Array.isArray(v) && v.length > 1);
  return `<section class="sd-ton-that">
    <h3 class="sd-tt-title">🕯️ Tổn thất</h3>
    <div class="sd-tt-bang">
      ${ta ? `<div class="sd-tt-cot sd-tt-ta"><h4 class="sd-tt-ten">Quân ta</h4>${ta}</div>` : ""}
      ${doi ? `<div class="sd-tt-cot sd-tt-doi"><h4 class="sd-tt-ten">${esc(hoaDau(benTen(b, "dich")))}</h4>${doi}</div>` : ""}
    </div>
    ${venh ? `<p class="sd-tt-venh muted">Các nguồn công bố những con số khác nhau; bảng trên nêu đủ, không quy về một con số.</p>` : ""}
    ${sourcesHtml(nguon, "sources sd-tt-nguon")}
  </section>`;
}

// ── Câu hỏi đoán trước bước quyết định ────────────────────────────────────
//
// Hỏi TRƯỚC khi hiện đáp án thì phần được hỏi nhớ lâu hơn hẳn — nhưng chỉ
// ĐÚNG phần được hỏi, phần còn lại gần như không đổi. Nên câu hỏi phải nhắm
// vào bước quyết định của trận, tức bước cuối.
//
// 🔴 Đáp án VÀ hai mồi nhử đều là tiêu đề bước CÓ THẬT trong hồ sơ. Bịa một
// diễn biến không xảy ra để làm mồi nhử là cách chắc chắn nhất để người đọc
// nhớ nhầm nó — chính câu hỏi là thứ đọng lại.
//
// Thẻ này KHÔNG chặn điều hướng: nó nằm trong khối tường thuật, người xem bấm
// «Bước sau ▶» lúc nào cũng được, y như trước.

interface CauDoan {
  hoi: string;
  dapAn: { chu: string; dung: boolean; buoc: number }[];
}

function dungCauDoan(b: Battle): CauDoan | null {
  const n = b.buoc.length;
  // Dưới 4 bước thì không đủ hai mồi nhử thật, và cũng chẳng còn gì để đoán.
  if (n < 4) return null;
  const dung = b.buoc[n - 1];
  // Mồi nhử lấy trong các bước ĐÃ QUA, bỏ cả bước cuối lẫn bước đang xem: đưa
  // đúng cái đang hiện trên màn hình vào làm lựa chọn thì câu hỏi thành trò
  // đánh đố chứ không phải phép nhớ lại.
  const truoc = b.buoc.slice(0, n - 2);
  if (truoc.length < 2) return null;
  const i1 = Math.floor(truoc.length / 3);
  let i2 = truoc.length - 1 - Math.floor(truoc.length / 3);
  if (i2 === i1) i2 = (i1 + 1) % truoc.length;
  const moi = [truoc[i1], truoc[i2]];
  if (moi.some((s) => !s || !s.tieu_de)) return null;
  const ds = [
    { chu: moi[0].tieu_de, dung: false, buoc: moi[0].id },
    { chu: moi[1].tieu_de, dung: false, buoc: moi[1].id },
  ];
  // Chỗ đứng của đáp án suy từ số bước — cùng một trận luôn ra cùng một thứ
  // tự, nhưng không phải trận nào đáp án cũng nằm cuối.
  ds.splice(n % 3, 0, { chu: dung.tieu_de, dung: true, buoc: dung.id });
  return { hoi: "Bước cuối, bên ta làm gì?", dapAn: ds };
}

function cauDoanHtml(cd: CauDoan): string {
  const nut = cd.dapAn
    .map(
      (a, i) =>
        `<li><button type="button" class="sd-doan-nut" data-dung="${a.dung ? "1" : "0"}" data-buoc="${a.buoc}">${esc(String.fromCharCode(65 + i))}. ${esc(a.chu)}</button></li>`,
    )
    .join("");
  return `<div class="sd-doan">
    <p class="sd-doan-hoi">🤔 Đoán thử trước khi xem: ${esc(cd.hoi)}</p>
    <ul class="sd-doan-ds">${nut}</ul>
    <p class="sd-doan-loi" role="status" hidden></p>
  </div>`;
}

// ── Điều khiển hiển thị theo bước ─────────────────────────────────────────

/** Đo `getTotalLength()` một lần rồi chạy CSS `@keyframes` — KHÔNG
 *  requestAnimationFrame tay, để killswitch prefers-reduced-motion toàn cục
 *  (theme.css, @media (prefers-reduced-motion: reduce)) tự vô hiệu hoá được.
 *
 *  Hai lớp bảo vệ giảm-chuyển-động, vì killswitch toàn cục ép
 *  `animation-duration: 0.01ms !important` và ở mức đó Chrome KHÔNG áp
 *  `fill-mode` — tin vào fill-mode là cách phần tử kẹt `opacity: 0` vĩnh viễn
 *  (đúng vết đã mắc ở màn Hành trình, xem hanhtrinh.css):
 *    1. thoát sớm khi người dùng bật giảm chuyển động — không đặt dasharray,
 *       mũi tên hiện NGUYÊN VẸN ngay lập tức;
 *    2. kể cả khi lớp 1 hụt, trạng thái NGHỈ của mũi tên vẫn là "đã vẽ xong"
 *       (`stroke-dashoffset` mặc định = 0), animation chỉ chạy TỪ nét chưa vẽ
 *       VỀ nét đã vẽ. Animation hỏng thì mũi tên hiện đủ, không biến mất. */
function triggerArrowDraw(g: SVGGElement): void {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const path = g.querySelector<SVGPathElement>(".sd-arrow");
  if (!path) return;
  const len = path.getTotalLength();
  path.style.setProperty("--sd-len", String(len));
  path.style.strokeDasharray = String(len);
  path.classList.add("sd-arrow-draw");
}

function giamChuyenDong(): boolean {
  return !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** Các điểm đại diện của một phần tử — nuôi camera và phép dò giao chiến. */
function diemPhanTu(p: PhanTu): Diem[] {
  if (p.kieu === "mui-ten") {
    const tu = diemDon(p.tu);
    const den = diemDon(p.den);
    return [tu, den].filter((d): d is Diem => d !== null);
  }
  return [[so(p.x), so(p.y)]];
}

/**
 * Camera «như phim tài liệu»: mỗi bước thu phóng vào cụm phần tử đang hiện.
 * Chỉ là transform CSS trên <g class="sd-cam"> — toạ độ dữ liệu và thuật toán
 * xếp nhãn (getBBox đo hệ toạ độ CỤC BỘ) không hề biết đến nó. Killswitch
 * giảm-chuyển-động vô hiệu transition → nhảy thẳng, không bay lượn.
 */
function capNhatCamera(content: HTMLElement, step: BattleStep): void {
  const cam = content.querySelector<SVGGElement>(".sd-cam");
  if (!cam) return;
  const b = currentBattle;
  if (!b || !camTheoBuoc) {
    cam.style.transform = "";
    return;
  }
  const pts: Diem[] = [];
  for (const p of b.phan_tu ?? [])
    if ((step.hien as string[]).includes(p.id)) pts.push(...diemPhanTu(p));
  if (pts.length < 2) {
    cam.style.transform = "";
    return;
  }
  const DEM = 90; // đệm quanh cụm — chừa chỗ cho nhãn và đầu mũi tên
  const x0 = Math.min(...pts.map((d) => d[0])) - DEM;
  const x1 = Math.max(...pts.map((d) => d[0])) + DEM;
  const y0 = Math.min(...pts.map((d) => d[1])) - DEM;
  const y1 = Math.max(...pts.map((d) => d[1])) + DEM;
  // Sàn kích thước khung + trần hệ số: zoom quá sâu vào 2 phần tử sát nhau
  // thì mất hết ngữ cảnh địa hình, chữ phóng to thô.
  // Trần 1,5 đo bằng mắt trên ĐBP: 1,75 zoom sát tới mức nửa khung là đất
  // trống và nhãn địa hình bị cắt — camera phim tài liệu lượn NHẸ thôi.
  const w = Math.max(x1 - x0, 560);
  const h = Math.max(y1 - y0, 336);
  const k = Math.min(TQ_RONG / w, TQ_CAO / h, 1.5);
  if (k <= 1.04) {
    cam.style.transform = "";
    return;
  }
  // Kẹp tâm để khung nhìn không trượt ra ngoài mép sa đồ.
  const nuaW = TQ_RONG / k / 2;
  const nuaH = TQ_CAO / k / 2;
  const cx = Math.min(Math.max((x0 + x1) / 2, nuaW), TQ_RONG - nuaW);
  const cy = Math.min(Math.max((y0 + y1) / 2, nuaH), TQ_CAO - nuaH);
  cam.style.transform = `translate(${r1(TQ_RONG / 2 - k * cx)}px, ${r1(TQ_CAO / 2 - k * cy)}px) scale(${k.toFixed(3)})`;
}

/**
 * Chớp giao chiến: mũi tên có phe cắm tới GẦN một phần tử phe kia đang hiện
 * (≤95 đơn vị) thì nổ một vòng xung kích + tia lửa ở đầu mũi. Suy từ dữ liệu
 * sẵn có, không thêm trường mới; ngưỡng khoảng cách là phép né ca «mũi tên
 * rút lui» — rút thì không chĩa vào ai nên không nổ. Tối đa 3 chớp/bước.
 * Trả về số chớp đã tạo (để quyết định rung khung).
 */
function capNhatVaCham(content: HTMLElement, step: BattleStep): number {
  const fx = content.querySelector<SVGGElement>(".sd-fx");
  const b = currentBattle;
  if (!fx || !b) return 0;
  fx.innerHTML = "";
  if (giamChuyenDong()) return 0;
  const hien = new Set(step.hien as string[]);
  const khoi = (b.phan_tu ?? []).filter(
    (q) => q.kieu !== "mui-ten" && q.ben && hien.has(q.id),
  );
  let dem = 0;
  for (const p of b.phan_tu ?? []) {
    if (dem >= 3) break;
    if (p.kieu !== "mui-ten" || !p.ben || !hien.has(p.id)) continue;
    const den = diemDon(p.den);
    if (!den) continue;
    const trung = khoi.some(
      (q) => q.ben !== p.ben && Math.hypot(so(q.x) - den[0], so(q.y) - den[1]) < 95,
    );
    if (!trung) continue;
    dem++;
    fx.insertAdjacentHTML(
      "beforeend",
      `<g class="sd-no" transform="translate(${r1(den[0])},${r1(den[1])})"><circle class="sd-no-vong" r="12"/><path class="sd-no-tia" d="M0,-26 L5,-8 L22,-14 L9,0 L22,14 L5,8 L0,26 L-5,8 L-22,14 L-9,0 L-22,-14 L-5,-8 Z"/></g>`,
    );
  }
  return dem;
}

/** Dừng tự phát — mọi thao tác tay (bấm bước, quay lại, mở trận khác) gọi nó. */
function dungTuPhat(): void {
  if (playTimer !== null) {
    clearInterval(playTimer);
    playTimer = null;
  }
  const nut = document.getElementById("battle-play");
  if (nut) {
    nut.textContent = "▶ Phát";
    nut.setAttribute("aria-pressed", "false");
  }
}

/** Tự phát các bước như xem phim — 5 giây một bước, hết trận tự dừng. */
function batTuPhat(content: HTMLElement): void {
  const nut = document.getElementById("battle-play");
  if (!nut) return;
  nut.textContent = "⏸ Dừng";
  nut.setAttribute("aria-pressed", "true");
  playTimer = window.setInterval(() => {
    const b = currentBattle;
    // Panel đã đóng / nội dung bị thay → hẹn giờ mồ côi, tự huỷ.
    if (!b || !nut.isConnected || stepIdx >= b.buoc.length - 1) {
      dungTuPhat();
      return;
    }
    stepIdx++;
    applyStep(content);
  }, 5000);
}

/** Xếp lại nhãn của sa đồ trong `content` — an toàn khi gọi nhiều lần. */
function xepLaiNhan(content: HTMLElement): void {
  const svg = content.querySelector<SVGSVGElement>(".sd-svg-tq");
  if (!svg) return;
  try {
    veNenNhan(svg);
  } catch {
    /* nhãn giữ nguyên quầng chữ như cũ — vẫn đọc được */
  }
}

function applyStep(content: HTMLElement): void {
  const b = currentBattle;
  if (!b) return;
  const step = b.buoc[stepIdx];
  if (!step) return;

  let arrowsThisTransition = 0;
  const yenTinh = giamChuyenDong();
  let vachDong = 0; // vạch hành quân đang chạy — dashoffset tốn paint, tối đa 3
  content.querySelectorAll<SVGGElement>(".sd-layer").forEach((g) => {
    const key = g.dataset["key"] ?? "";
    const shouldShow = (step.hien as string[]).includes(key);
    g.classList.toggle("sd-layer-hidden", !shouldShow);
    // Pop-in «xuất trận» cho phần tử MỚI hiện ở bước này (mũi tên đã có
    // animation vẽ dần riêng, không chồng hai hiệu ứng).
    g.classList.toggle(
      "sd-moi",
      shouldShow && !hienTruoc.has(key) && !muiTenKeys.has(key) && !yenTinh,
    );
    const dongChay = shouldShow && muiTenKeys.has(key) && !yenTinh && vachDong < 3;
    if (dongChay) vachDong++;
    g.classList.toggle("sd-dong-on", dongChay);
    if (
      shouldShow &&
      muiTenKeys.has(key) &&
      !arrowsAnimated.has(key) &&
      arrowsThisTransition < ARROW_BUDGET_PER_TRANSITION
    ) {
      arrowsAnimated.add(key);
      arrowsThisTransition++;
      triggerArrowDraw(g);
    }
  });
  hienTruoc = new Set(step.hien as string[]);

  // Camera + chớp giao chiến + rung khung — cả ba chỉ có trên sa đồ tổng quát
  // (Bạch Đằng vẽ tay không có .sd-cam/.sd-fx thì các hàm tự thoát).
  capNhatCamera(content, step);
  if (capNhatVaCham(content, step) > 0) {
    const wrap = content.querySelector<HTMLElement>(".sd-stage-wrap");
    if (wrap && !yenTinh) {
      wrap.classList.remove("sd-rung");
      void wrap.offsetWidth; // reflow để animation rung chạy lại được
      wrap.classList.add("sd-rung");
    }
  }

  // Mực nước theo thuỷ triều: triều lên sông nở rộng ngập cọc, triều xuống thì
  // rút. Chỉ sa đồ sông nước khai `thuy_trieu`; sa đồ trên bộ bỏ trống và bỏ
  // qua cả khối. Bề rộng do CSS lo (`.sd-svg.tide-len/.tide-xuong .sd-song-*`),
  // đo trên Chrome thật: mép sông 40px khi triều lên, 22px khi triều xuống.
  if (step.thuy_trieu) {
    const svg = content.querySelector(".sd-svg");
    if (svg) {
      svg.classList.toggle("tide-len", step.thuy_trieu === "len");
      svg.classList.toggle("tide-xuong", step.thuy_trieu === "xuong");
    }
  }

  // Cập nhật khối văn bản của bước.
  const n = b.buoc.length;
  const set = (id: string, html: string) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };
  set("battle-step-count", `Bước ${stepIdx + 1}/${n}`);
  set("battle-step-title", `${esc(String(step.id))}. ${esc(step.tieu_de)}`);
  // Mốc thời gian + địa danh của riêng bước. Thiếu cả hai thì ẩn hẳn dòng,
  // không để lại một dòng trống đẩy chữ xuống.
  const meta = document.getElementById("battle-step-meta");
  if (meta) {
    const phan: string[] = [];
    if (step.thoi_gian?.trim())
      phan.push(`<span class="sd-bm-thoi">🕘 ${esc(step.thoi_gian.trim())}</span>`);
    if (step.dia_danh?.trim())
      phan.push(`<span class="sd-bm-dia">📍 ${esc(step.dia_danh.trim())}</span>`);
    meta.innerHTML = phan.join("");
    meta.hidden = phan.length === 0;
  }
  set("battle-step-desc", esc(step.mo_ta));
  // Nguồn RIÊNG của bước, đặt ngay dưới câu nó chống lưng. Nguồn cấp trận vẫn
  // ở cuối trang, hai khối không thay nhau — nên nhãn phải nói rõ đây là nguồn
  // của BƯỚC, nếu không hai dòng «📚 Nguồn» giống hệt nhau trên cùng màn hình.
  const nguonBuoc = (step.nguon ?? []).map((s) => String(s).trim()).filter(Boolean);
  set(
    "battle-step-nguon",
    nguonBuoc.length
      ? `<details class="sources sd-buoc-nguon"><summary>📚 Nguồn của bước này</summary><ul>${nguonBuoc
          .map((s) => `<li>${esc(s)}</li>`)
          .join("")}</ul></details>`
      : "",
  );

  // Thẻ đoán: chỉ hiện ở bước áp chót, ngay trước lúc lộ bước cuối.
  const oDoan = document.getElementById("battle-doan");
  if (oDoan) {
    const cd = stepIdx === n - 2 ? dungCauDoan(b) : null;
    oDoan.innerHTML = cd ? cauDoanHtml(cd) : "";
    oDoan.querySelectorAll<HTMLButtonElement>(".sd-doan-nut").forEach((nut) => {
      nut.addEventListener("click", () => {
        const loi = oDoan.querySelector<HTMLElement>(".sd-doan-loi");
        if (!loi) return;
        const dung = nut.dataset["dung"] === "1";
        nut.classList.add(dung ? "sd-doan-dung" : "sd-doan-sai");
        loi.textContent = dung
          ? "✅ Đúng. Bấm «Bước sau ▶» để xem diễn biến."
          : `❌ Chưa phải — đó là diễn biến ở bước ${nut.dataset["buoc"] ?? "?"}. Thử lại.`;
        loi.hidden = false;
        if (dung)
          oDoan
            .querySelectorAll<HTMLButtonElement>(".sd-doan-nut")
            .forEach((x) => (x.disabled = true));
      });
    });
  }

  if (step.thuy_trieu) {
    set("battle-tide", step.thuy_trieu === "len" ? "▲ Triều lên" : "▼ Triều xuống");
    const tide = document.getElementById("battle-tide");
    if (tide) {
      tide.classList.toggle("tide-len", step.thuy_trieu === "len");
      tide.classList.toggle("tide-xuong", step.thuy_trieu === "xuong");
    }
  }

  const prev = document.getElementById("battle-prev") as HTMLButtonElement | null;
  const next = document.getElementById("battle-next") as HTMLButtonElement | null;
  if (prev) prev.disabled = stepIdx === 0;
  if (next) next.disabled = stepIdx === n - 1;

  // Dải bước: trạng thái đã qua / đang ở / sắp tới, bấm nhảy thẳng tới bước đó.
  content.querySelectorAll<HTMLButtonElement>(".sd-step-dot").forEach((dot) => {
    const idx = Number(dot.dataset["step"]);
    dot.classList.remove("sd-step-done", "sd-step-current", "sd-step-upcoming");
    dot.classList.add(
      idx < stepIdx ? "sd-step-done" : idx === stepIdx ? "sd-step-current" : "sd-step-upcoming",
    );
    dot.setAttribute("aria-selected", String(idx === stepIdx));
    // Chỉ thay CON SỐ, không thay cả nội dung nút: ở chế độ dòng thời gian
    // nút còn mang mốc thời gian và địa danh, ghi đè textContent là xoá sạch.
    const oSo = dot.querySelector<HTMLElement>(".sd-step-so");
    if (oSo) oSo.textContent = idx < stepIdx ? "✓" : String(idx + 1);
  });

  // Dòng thời gian dài hơn bề ngang thì kéo mốc đang xem về giữa. Cuộn CHÍNH
  // dải mốc chứ không scrollIntoView: scrollIntoView kéo theo cả trang, làm
  // sa đồ nhảy khỏi tầm mắt mỗi lần đổi bước.
  const rail = content.querySelector<HTMLElement>(".sd-step-rail-moc");
  const moc = rail?.querySelector<HTMLElement>(".sd-step-current");
  if (rail && moc && rail.scrollWidth > rail.clientWidth + 1) {
    const rb = rail.getBoundingClientRect();
    const mb = moc.getBoundingClientRect();
    rail.scrollTo({
      left: Math.max(0, rail.scrollLeft + (mb.left - rb.left) - (rb.width - mb.width) / 2),
      behavior: yenTinh ? "auto" : "smooth",
    });
  }

  // Khối văn tịch: đoạn trích gắn với bước đang xem thì sáng lên. Không ẩn
  // các đoạn khác — người đọc vẫn thấy toàn cảnh tư liệu.
  content.querySelectorAll<HTMLElement>(".sd-vt-item").forEach((el) => {
    const gan = el.dataset["buoc"];
    el.classList.toggle("sd-vt-active", gan !== undefined && Number(gan) === step.id);
  });

  // Số phần tử hiện đổi theo từng bước, nên bố cục nhãn phải tính lại theo
  // từng bước — tính một lần lúc dựng thì thuật toán giữ chỗ cho cả nhãn của
  // lớp đang ẩn và đẩy nhãn đang hiện văng khỏi khung.
  xepLaiNhan(content);
}

// ── Màn B, đầy đủ — trận đã có sa đồ diễn biến ───────────────────────────

function renderFullDetail(content: HTMLElement): void {
  const b = currentBattle;
  if (!b) return;
  stepIdx = 0;
  dungTuPhat(); // hẹn giờ của trận trước (nếu còn) không được chạy sang trận này
  hienTruoc = new Set();

  const draftBadge =
    b.trang_thai === "draft"
      ? `<span class="draft-badge">Bản nháp (chờ kiểm sử)</span>`
      : "";
  const xungDot: XungDot = b.loai_xung_dot === "noi-chien" ? "noi-chien" : "ngoai-xam";

  // Mọi sa đồ nay chạy bằng trình dựng tổng quát; `validate_battles.mjs` chặn
  // hồ sơ nào không khai `sa_do_kieu: "tong-quat"` nên không còn nhánh rẽ.
  muiTenKeys = new Set(
    (b.phan_tu ?? []).filter((p) => p.kieu === "mui-ten").map((p) => p.id),
  );
  const coThuyTrieu = b.buoc.some((s) => !!s.thuy_trieu);

  // Dải bước thành DÒNG THỜI GIAN khi có ít nhất một bước khai `thoi_gian`
  // hoặc `dia_danh`. Không có bước nào khai thì giữ nguyên dải chấm tròn cũ —
  // 290 hồ sơ hiện có không đổi một pixel nào.
  const coMoc = b.buoc.some((s) => !!s.thoi_gian?.trim() || !!s.dia_danh?.trim());
  const stepRail = b.buoc
    .map((s, i) => {
      // Bước không khai mốc vẫn hiện bình thường, chỉ thiếu dòng chữ phụ.
      const phu = coMoc
        ? `${s.thoi_gian?.trim() ? `<span class="sd-moc-thoi">${esc(s.thoi_gian.trim())}</span>` : ""}${
            s.dia_danh?.trim() ? `<span class="sd-moc-dia">${esc(s.dia_danh.trim())}</span>` : ""
          }`
        : "";
      return `<button type="button" class="sd-step-dot${coMoc ? " sd-step-moc" : ""} ${i === 0 ? "sd-step-current" : "sd-step-upcoming"}" role="tab" aria-selected="${i === 0}" data-step="${i}"><span class="sd-step-so">${i + 1}</span>${phu}</button>`;
    })
    .join("");

  content.innerHTML = `<div class="sd-detail" id="sd-detail" data-xung-dot="${xungDot}">
    <button type="button" class="sd-back" id="sd-back">◀ Quay lại danh sách trận đánh</button>
    <header class="sd-head">
      <h2 class="sd-title">⚔️ ${esc(b.ten)} ${draftBadge}</h2>
      <p class="sa-do-disclaimer">⚠️ ${esc(b.sa_do_ghi_chu)}</p>
      <div class="sd-meta-hang">
        <dl class="sd-meta">
          ${b.chi_huy ? `<div><dt>Chỉ huy</dt><dd>${esc(b.chi_huy)}</dd></div>` : ""}
          ${b.doi_thu ? `<div><dt>Đối thủ</dt><dd>${esc(b.doi_thu)}</dd></div>` : ""}
          ${b.dia_diem ? `<div><dt>Địa điểm</dt><dd>${esc(b.dia_diem)}</dd></div>` : ""}
          ${
            b.thoi_gian?.trim()
              ? `<div><dt>Thời gian</dt><dd>${esc(b.thoi_gian.trim())}</dd></div>`
              : `<div><dt>Năm</dt><dd>${esc(String(b.nam))}</dd></div>`
          }
        </dl>
        <div class="sd-vi-tri" id="sd-vi-tri" data-battle="${esc(b.id)}" hidden></div>
      </div>
    </header>
    ${lucLuongHtml(b)}

    <div class="sd-stage-wrap">
      <div class="sd-svg-cuon">${buildTongQuatSvg(b)}</div>
      <div class="sd-step-rail${coMoc ? " sd-step-rail-moc" : ""}" role="tablist" aria-label="Các bước diễn biến">${stepRail}</div>
    </div>

    ${chuGiaiHtml(b)}

    <div class="sd-controls">
      <button id="battle-prev" type="button" class="sd-nav">◀ Bước trước</button>
      <span id="battle-step-count" class="sd-step-count"></span>
      <button id="battle-next" type="button" class="sd-nav">Bước sau ▶</button>
      ${b.buoc.length > 1 ? `<button id="battle-play" type="button" class="sd-nav sd-play" aria-pressed="false" title="Tự chuyển bước 5 giây một lần">▶ Phát</button>` : ""}
      <button id="battle-cam" type="button" class="sd-nav sd-cam-nut" aria-pressed="true" title="Camera tự thu phóng vào cụm diễn biến của bước">🎬 Thu phóng</button>
      ${coThuyTrieu ? `<span id="battle-tide" class="tide-indicator"></span>` : ""}
    </div>

    <div class="sd-narrative">
      <h3 id="battle-step-title"></h3>
      <p class="sd-buoc-meta" id="battle-step-meta" hidden></p>
      <p id="battle-step-desc"></p>
      <div id="battle-step-nguon"></div>
      <div id="battle-doan"></div>
    </div>
    ${vanTichHtml(b)}

    <div class="sd-outcome">
      ${b.ket_qua ? `<p><b>🏁 Kết quả:</b> ${esc(b.ket_qua)}</p>` : ""}
      ${b.y_nghia ? `<p><b>🌟 Ý nghĩa:</b> ${esc(b.y_nghia)}</p>` : ""}
    </div>
    ${tonThatHtml(b)}
    ${sourcesHtml(b.nguon)}
  </div>`;

  document.getElementById("sd-back")?.addEventListener("click", () => {
    dungTuPhat();
    currentBattle = null;
    renderIndex(content);
  });
  document.getElementById("battle-prev")?.addEventListener("click", () => {
    dungTuPhat();
    if (stepIdx > 0) {
      stepIdx--;
      applyStep(content);
    }
  });
  document.getElementById("battle-next")?.addEventListener("click", () => {
    dungTuPhat();
    if (currentBattle && stepIdx < currentBattle.buoc.length - 1) {
      stepIdx++;
      applyStep(content);
    }
  });
  document.getElementById("battle-play")?.addEventListener("click", () => {
    if (playTimer !== null) {
      dungTuPhat();
      return;
    }
    // Đứng ở bước cuối mà bấm Phát → chiếu lại từ đầu, đúng thói quen video.
    if (currentBattle && stepIdx >= currentBattle.buoc.length - 1) {
      stepIdx = 0;
      applyStep(content);
    }
    batTuPhat(content);
  });
  document.getElementById("battle-cam")?.addEventListener("click", (e) => {
    camTheoBuoc = !camTheoBuoc;
    (e.currentTarget as HTMLButtonElement).setAttribute("aria-pressed", String(camTheoBuoc));
    const st = currentBattle?.buoc[stepIdx];
    if (st) capNhatCamera(content, st);
  });
  content.querySelectorAll<HTMLButtonElement>(".sd-step-dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      dungTuPhat();
      const idx = Number(dot.dataset["step"]);
      if (!Number.isNaN(idx)) {
        stepIdx = idx;
        applyStep(content);
      }
    });
  });

  applyStep(content);
  void dienViTri(b.id, b.lien_quan_tinh ?? []);

  // Nền chữ + gỡ nhãn chồng nhau. Phải chạy SAU khi trình duyệt dựng xong
  // font, vì bề rộng chữ chỉ đo được lúc đó — `requestAnimationFrame` là mốc
  // sớm nhất chắc chắn đã có bố cục. Bọc try/catch: getBBox() ném nếu phần tử
  // chưa dựng, và một nhãn xấu không được phép làm chết cả sa đồ.
  requestAnimationFrame(() => {
    const svg = content.querySelector<SVGSVGElement>(".sd-svg-tq");
    if (!svg) return;
    try {
      veNenNhan(svg);
    } catch {
      /* nhãn giữ nguyên quầng chữ như cũ — vẫn đọc được */
    }
  });
}

// ── Điều hướng Màn A ↔ Màn B ──────────────────────────────────────────────

async function openDetail(content: HTMLElement, id: string): Promise<void> {
  if (battleReady(id)) {
    content.innerHTML = `<p class="muted">Đang tải sa đồ chiến dịch…</p>`;
    try {
      const res = await fetch(battleDetailUrl(id));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      currentBattle = (await res.json()) as Battle;
      arrowsAnimated = new Set();
      renderFullDetail(content);
    } catch {
      content.innerHTML = `<p class="muted">⚠️ Không tải được sa đồ chiến dịch — vui lòng kiểm tra kết nối và thử lại.</p><button type="button" class="sd-back" id="sd-back-err">◀ Quay lại danh sách trận đánh</button>`;
      document.getElementById("sd-back-err")?.addEventListener("click", () => renderIndex(content));
    }
    return;
  }
  const item = (indexItems ?? []).find((it) => it.id === id);
  if (!item) {
    renderIndex(content);
    return;
  }
  renderBasicDetail(content, item);
}

async function loadIndexIfNeeded(): Promise<boolean> {
  if (indexItems) return true;
  try {
    const [res, resSaDo] = await Promise.all([
      fetch(INDEX_URL),
      // Chỉ mục sa đồ hỏng KHÔNG được kéo sập cả Màn A: mất nó thì mọi trận
      // rơi về chế độ rút gọn, danh sách vẫn đọc được.
      fetch(SA_DO_INDEX_URL).catch(() => null),
    ]);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { items: BattleIndexItem[] };
    indexItems = data.items;
    if (resSaDo?.ok) {
      const ds = (await resSaDo.json()) as { ids?: string[] };
      saDoIds = new Set(Array.isArray(ds.ids) ? ds.ids : []);
    }
    return true;
  } catch {
    return false;
  }
}

async function openIndex(): Promise<void> {
  const content = document.getElementById("battle-content");
  if (!content) return;
  showOnly("battle-panel");
  currentBattle = null;
  if (indexItems) {
    renderIndex(content);
    return;
  }
  content.innerHTML = `<p class="muted">Đang tải danh sách trận đánh…</p>`;
  const ok = await loadIndexIfNeeded();
  if (ok) renderIndex(content);
  else
    content.innerHTML = `<p class="muted">⚠️ Không tải được danh sách trận đánh — vui lòng kiểm tra kết nối và thử lại.</p>`;
}

/** Mở thẳng Màn B của một battle_id, bỏ qua Màn A — dùng bởi sự kiện
 *  "sado:mo-tran" (xem initBattle()). */
async function openDetailById(id: string): Promise<void> {
  const content = document.getElementById("battle-content");
  if (!content) return;
  showOnly("battle-panel");
  if (!indexItems) {
    content.innerHTML = `<p class="muted">Đang tải…</p>`;
    const ok = await loadIndexIfNeeded();
    if (!ok) {
      content.innerHTML = `<p class="muted">⚠️ Không tải được dữ liệu — vui lòng kiểm tra kết nối và thử lại.</p>`;
      return;
    }
  }
  await openDetail(content, id);
}

export function initBattle(): void {
  if (document.getElementById("battle-btn")) return; // chống khởi tạo 2 lần

  const nav = document.getElementById("topbar-nav") ?? document.body;
  const btn = document.createElement("button");
  btn.id = "battle-btn";
  btn.type = "button";
  btn.textContent = "⚔️ Sa đồ chiến dịch";
  nav.appendChild(btn);

  const app = document.getElementById("app") ?? document.body;
  const aside = document.createElement("aside");
  aside.id = "battle-panel";
  aside.hidden = true;
  aside.innerHTML = `<button id="battle-close" aria-label="Đóng">×</button><div id="battle-content"></div>`;
  app.appendChild(aside);
  registerPanel("battle-panel");

  btn.addEventListener("click", () => void openIndex());
  document.getElementById("battle-close")?.addEventListener("click", () => {
    hidePanel("battle-panel");
  });

  // Móc nối cho journey.ts: nút «Xem sa đồ trận này» của một chặng hành trình
  // phát CustomEvent kèm battle_id (journey.ts nối dây 2026-08-26) → nhảy
  // thẳng Màn B; thiếu id thì mở Màn A.
  window.addEventListener("sado:mo-tran", (ev) => {
    const id = (ev as CustomEvent<{ id?: string }>).detail?.id;
    if (id) void openDetailById(id);
    else void openIndex();
  });
}
