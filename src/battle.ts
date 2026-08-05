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
// nên soạn một sa đồ mới chỉ còn là viết JSON. Sa đồ Bạch Đằng 938 (không có
// trường `sa_do_kieu`) vẫn dùng bộ khoá riêng chôn trong buildBachDangSvg().
type LayerKey = string;

// Mũi tên hành quân của RIÊNG sa đồ Bạch Đằng — được vẽ bằng hiệu ứng "đang
// tiến" lần đầu hiện ra trong phiên xem, xem applyStep()/triggerArrowDraw().
// Sa đồ tổng quát tự suy ra bộ này từ `phan_tu[].kieu === "mui-ten"`.
const BACH_DANG_MUI_TEN: ReadonlySet<string> = new Set([
  "mui-nhu-dich",
  "mui-phan-cong-trai",
  "mui-phan-cong-phai",
]);
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
}

interface BattleStep {
  id: number;
  tieu_de: string;
  mo_ta: string;
  /** Chỉ sa đồ sông nước mới dùng; vắng mặt thì không hiện chỉ báo thuỷ triều. */
  thuy_trieu?: TideDir;
  hien: LayerKey[];
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
  // Nội chiến (Trịnh–Nguyễn, 1954–1975…) không dùng cặp màu "đúng/sai" —
  // xem token --sd-ta-*/--sd-doi-* trong sado.css. Vắng mặt = "ngoai-xam",
  // đúng với bach-dang-938.json hiện tại (chưa có trường này).
  loai_xung_dot?: XungDot;
  /** Vắng mặt = sa đồ vẽ tay riêng (chỉ còn bach-dang-938). */
  sa_do_kieu?: "tong-quat";
  dia_hinh?: DiaHinh[];
  phan_tu?: PhanTu[];
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

let indexItems: BattleIndexItem[] | null = null;
let currentBattle: Battle | null = null;
let stepIdx = 0;
let eraFilter = "all";
// Nhớ layer mũi tên nào đã chạy animation "đang vẽ" trong phiên xem trận
// hiện tại — chỉ chạy lần đầu hiện, tránh nhấp nháy khi bấm tới-lui nhiều lần.
let arrowsAnimated = new Set<string>();
// Bộ khoá mũi tên của trận đang mở, đặt một lần lúc dựng Màn B.
let muiTenKeys: ReadonlySet<string> = BACH_DANG_MUI_TEN;

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
      <dl class="sd-meta">
        ${item.chi_huy ? `<div><dt>Chỉ huy</dt><dd>${esc(item.chi_huy)}</dd></div>` : ""}
        ${item.dia_diem ? `<div><dt>Địa điểm</dt><dd>${esc(item.dia_diem)}</dd></div>` : ""}
        <div><dt>Năm</dt><dd>${esc(item.nam_hien_thi ?? String(item.nam))}</dd></div>
      </dl>
    </header>
    ${item.mo_ta ? `<div class="sd-narrative"><p>${esc(item.mo_ta)}</p></div>` : ""}
    ${item.ket_qua ? `<div class="sd-outcome"><p><b>🏁 Kết quả:</b> ${esc(item.ket_qua)}</p></div>` : ""}
    ${sourcesHtml(item.nguon)}
  </div>`;

  document.getElementById("sd-back")?.addEventListener("click", () => renderIndex(content));
}

// ── Ký hiệu dùng chung cho mọi sa đồ ──────────────────────────────────────
//
// Hoạ tiết + đầu mũi tên là kênh phân biệt phe KHÔNG PHẢI MÀU: cặp
// --dung-chu/--sai-chu nhìn gần như một với người mù màu đỏ–lục. Bốn ký hiệu
// đầu giữ NGUYÊN nội dung cũ của buildBachDangSvg(); hai ký hiệu cuối chỉ sa
// đồ tổng quát dùng tới, thừa ra trong sa đồ Bạch Đằng cũng vô hại.
function saDoDefs(): string {
  return `<defs>
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

// ── Trình dựng SVG — Bạch Đằng 938 ───────────────────────────────────────

const STAKE_XS = [360, 390, 420, 450, 480, 510, 540];

function exposedStakes(): string {
  return STAKE_XS.map(
    (x) =>
      `<g transform="translate(${x},0)"><line x1="0" y1="196" x2="0" y2="288" stroke="var(--luu-chu)" stroke-width="4" stroke-linecap="round"/><path d="M-7,202 L0,180 L7,202 Z" fill="var(--luu-chu)"/></g>`,
  ).join("");
}

function submergedStakes(): string {
  return STAKE_XS.map(
    (x) =>
      `<g transform="translate(${x},0)"><line x1="0" y1="252" x2="0" y2="286" stroke="var(--luu-chu)" stroke-width="4" stroke-linecap="round"/></g>`,
  ).join("");
}

function boat(x: number, y: number, rot: number, broken: boolean): string {
  return `<g transform="translate(${x},${y}) rotate(${rot})">
    <path class="sd-hull" d="M-26,6 Q0,24 26,6 L20,-2 L-20,-2 Z" fill="var(--sd-doi-chu)"/>
    <line class="sd-mast" x1="0" y1="-2" x2="0" y2="-26" stroke="var(--sd-doi-chu)" stroke-width="3"/>
    <path class="sd-sail" d="M3,-24 L20,-6 L3,-6 Z" fill="var(--sd-nen-bo)"/>
    ${broken ? `<path class="sd-crack" d="M-8,4 L-2,-2 L3,7 L8,-2" fill="none" stroke="var(--sd-doi-chu)" stroke-width="2"/>` : ""}
  </g>`;
}

function troop(x: number, y: number): string {
  return `<g transform="translate(${x},${y})"><circle cx="0" cy="0" r="6" fill="var(--sd-ta-chu)"/><line x1="7" y1="-12" x2="12" y2="9" stroke="var(--sd-ta-chu)" stroke-width="2.5" stroke-linecap="round"/></g>`;
}

/** Vùng kiểm soát — hoạ tiết gạch chéo (ta) / ca-rô (đối phương) là kênh
 *  phân biệt CHÍNH, không phải màu. Hai <rect> chồng: nền mờ (thông tin phụ,
 *  không tự thân mang nghĩa) + hoạ tiết (thông tin chính). */
function zone(x: number, y: number, w: number, h: number, side: "ta" | "doi"): string {
  const nen = side === "ta" ? "var(--sd-ta-nen)" : "var(--sd-doi-nen)";
  const hatch = side === "ta" ? "url(#sd-hatch-ta)" : "url(#sd-hatch-doi)";
  return `<g class="sd-zone" data-side="${side}" aria-hidden="true">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${nen}" opacity="0.4"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${hatch}"/>
  </g>`;
}

function buildBachDangSvg(): string {
  const fleet =
    boat(630, 232, 0, false) + boat(712, 224, -5, false) + boat(792, 242, 4, false);
  const stranded =
    boat(398, 252, 26, true) + boat(464, 244, -20, true) + boat(432, 266, 44, true);
  const topTroops = [120, 190, 260, 330].map((x) => troop(x, 118)).join("");
  const botTroops = [120, 190, 260, 330].map((x) => troop(x, 352)).join("");

  return `<svg class="sd-svg" viewBox="0 0 900 470" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Sa đồ minh hoạ trận Bạch Đằng 938">
    ${saDoDefs()}

    <rect class="sd-bank" x="0" y="0" width="900" height="175" fill="var(--sd-nen-bo)"/>
    <rect class="sd-bank" x="0" y="295" width="900" height="175" fill="var(--sd-nen-bo)"/>
    <text class="sd-geo-label" x="866" y="240" text-anchor="end" font-size="15" fill="var(--chu-mem)">Biển →</text>
    <text class="sd-geo-label" x="20" y="240" font-size="15" fill="var(--chu-mem)">← Thượng nguồn</text>
    <text class="sd-note" x="450" y="456" text-anchor="middle" font-size="13" fill="var(--chu-mem)">Sa đồ minh hoạ — không theo tỉ lệ</text>

    <g class="sd-layer" data-key="song">
      <rect class="sd-riverbed" x="0" y="175" width="900" height="120" fill="var(--sd-nen-song-sau)"/>
      <rect id="battle-water" class="sd-water" x="0" y="175" width="900" height="120" fill="var(--sd-nen-song)" opacity="0.75"/>
      <path class="sd-wave" d="M40,206 q24,-8 48,0 t48,0 t48,0" fill="none" stroke="var(--sd-nen-song-sau)" stroke-width="2" opacity="0.6"/>
      <path class="sd-wave" d="M300,268 q24,-8 48,0 t48,0 t48,0" fill="none" stroke="var(--sd-nen-song-sau)" stroke-width="2" opacity="0.6"/>
    </g>

    <g class="sd-layer" data-key="coc-ngam" opacity="0.5">${submergedStakes()}</g>

    <g class="sd-layer" data-key="coc-lo">${exposedStakes()}</g>

    <g class="sd-layer" data-key="quan-ta-mai-phuc">
      ${zone(60, 15, 330, 150, "ta")}
      ${zone(60, 305, 330, 150, "ta")}
      ${topTroops}${botTroops}
      <text class="sd-caption" x="120" y="100" font-size="13" fill="var(--sd-ta-chu)">Quân ta mai phục</text>
    </g>

    <g class="sd-layer" data-key="thuyen-dich">
      ${zone(560, 190, 310, 95, "doi")}
      ${fleet}
      <text class="sd-caption" x="712" y="200" text-anchor="middle" font-size="13" fill="var(--sd-doi-chu)">Thuyền Nam Hán</text>
    </g>

    <g class="sd-layer" data-key="mui-nhu-dich">
      <path class="sd-arrow" d="M604,150 C544,176 502,200 482,216" fill="none" stroke="var(--sd-ta-chu)" stroke-width="4" marker-end="url(#sd-arrow-ta)"/>
      <text class="sd-caption" x="560" y="140" text-anchor="middle" font-size="13" fill="var(--sd-ta-chu)">Nhử vào bãi cọc</text>
    </g>

    <g class="sd-layer" data-key="thuyen-mac-can">
      ${zone(345, 215, 210, 65, "doi")}
      ${stranded}
      <text class="sd-caption" x="432" y="300" text-anchor="middle" font-size="13" fill="var(--sd-doi-chu)">Thuyền vỡ, mắc cạn</text>
    </g>

    <g class="sd-layer" data-key="mui-phan-cong-trai">
      ${zone(60, 15, 400, 150, "ta")}
      <path class="sd-arrow" d="M236,108 C300,150 360,200 412,232" fill="none" stroke="var(--sd-ta-chu)" stroke-width="5" marker-end="url(#sd-arrow-ta)"/>
    </g>

    <g class="sd-layer" data-key="mui-phan-cong-phai">
      ${zone(60, 305, 400, 150, "ta")}
      <path class="sd-arrow" d="M236,362 C300,320 360,272 412,250" fill="none" stroke="var(--sd-ta-chu)" stroke-width="5" marker-end="url(#sd-arrow-ta)"/>
    </g>

    <g class="sd-layer" data-key="co-thang" transform="translate(450,92)">
      <line class="sd-pole" x1="0" y1="0" x2="0" y2="92" stroke="var(--luu-chu)" stroke-width="4"/>
      <path class="sd-flag" d="M0,4 L54,4 L45,19 L54,34 L0,34 Z" fill="var(--sd-ta-chu)"/>
      <path d="M22,10 l3,7 7,0 -5.5,4.5 2,7 -6.5,-4.5 -6.5,4.5 2,-7 -5.5,-4.5 7,0 z" fill="var(--nhan-sang)"/>
      <text class="sd-caption" x="0" y="-8" text-anchor="middle" font-size="14" fill="var(--sd-ta-chu)">Toàn thắng</text>
    </g>
  </svg>`;
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

/** Nhãn chữ có quầng --mat (kỹ thuật bản đồ chuẩn cho chữ đè nền đổi màu). */
function nhanSvg(x: number, y: number, chu: string, phu = false): string {
  return `<text class="sd-nhan${phu ? " sd-nhan-phu" : ""}" x="${r1(x)}" y="${r1(y)}" text-anchor="middle">${esc(chu)}</text>`;
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
      return `<g class="sd-dh sd-dh-song">
        <path class="sd-song-mep" d="${d}"/>
        <path class="sd-song-long" d="${d}"/>
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
  const buom =
    ben === "dich"
      ? `<rect class="sd-hinh" x="2" y="-38" width="26" height="26" fill="${m.nen}"/>
         <rect class="sd-hinh" x="2" y="-38" width="26" height="26" fill="${m.hoa_tiet}"/>
         <rect class="sd-net" x="2" y="-38" width="26" height="26" stroke="${m.chu}"/>`
      : `<path class="sd-hinh" d="M3,-38 L28,-10 L3,-10 Z" fill="${m.nen}"/>
         <path class="sd-hinh" d="M3,-38 L28,-10 L3,-10 Z" fill="${m.hoa_tiet}"/>
         <path class="sd-net" d="M3,-38 L28,-10 L3,-10 Z" stroke="${m.chu}"/>`;
  return `<path class="sd-hinh" d="M-34,-6 Q0,26 34,-6 Z" fill="${m.nen}"/>
    <path class="sd-net" d="M-34,-6 Q0,26 34,-6 Z" stroke="${m.chu}"/>
    <path class="sd-net" d="M0,-6 L0,-40" stroke="${m.chu}"/>
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
      (x) =>
        `<path class="sd-cong-su" d="M${x},30 L${x},2 M${x - 8},4 L${x},-14 L${x + 8},4 Z"/>`,
    )
    .join("");
  return coc;
}

function diaDanhSvg(): string {
  return `<path class="sd-dia-danh-pin" d="M0,-16 L13,0 L0,16 L-13,0 Z"/>
    <circle class="sd-dia-danh-tam" r="4"/>`;
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
  return `<path class="sd-arrow" d="${d}" fill="none" stroke="${m.chu}" stroke-width="5.5" stroke-linecap="round" marker-end="url(#${dau})"${duoi}/>
    ${p.nhan ? nhanSvg(nx, ny + 6, p.nhan) : ""}`;
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
  const than =
    p.kieu === "mui-ten"
      ? muiTenSvg(p, m)
      : `<g transform="translate(${r1(so(p.x))},${r1(so(p.y))})">${noiDung}</g>${
          p.nhan ? nhanSvg(so(p.x), so(p.y) + nhanDuoi[p.kieu], p.nhan) : ""
        }`;
  return `<g class="sd-layer" data-key="${esc(p.id)}">${than}</g>`;
}

function buildTongQuatSvg(b: Battle): string {
  const diaHinh = (b.dia_hinh ?? []).map(diaHinhSvg).join("");
  const phanTu = (b.phan_tu ?? []).map(phanTuSvg).join("");
  return `<svg class="sd-svg sd-svg-tq" viewBox="0 0 ${TQ_RONG} ${TQ_CAO}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Sa đồ minh hoạ ${esc(b.ten)}">
    ${saDoDefs()}
    <rect class="sd-nen-dat" x="0" y="0" width="${TQ_RONG}" height="${TQ_CAO}"/>
    <g class="sd-dia-hinh" aria-hidden="true">${diaHinh}</g>
    ${phanTu}
    <text class="sd-note-tq" x="${TQ_RONG / 2}" y="${TQ_CAO - 12}" text-anchor="middle">Sa đồ minh hoạ — không theo tỉ lệ</text>
  </svg>`;
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

function applyStep(content: HTMLElement): void {
  const b = currentBattle;
  if (!b) return;
  const step = b.buoc[stepIdx];
  if (!step) return;

  let arrowsThisTransition = 0;
  content.querySelectorAll<SVGGElement>(".sd-layer").forEach((g) => {
    const key = g.dataset["key"] ?? "";
    const shouldShow = (step.hien as string[]).includes(key);
    g.classList.toggle("sd-layer-hidden", !shouldShow);
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

  // Mực nước theo thuỷ triều: triều lên ngập cọc, triều xuống thì rút. Chỉ sa
  // đồ sông nước khai `thuy_trieu`; sa đồ trên bộ bỏ trống và bỏ qua cả khối.
  if (step.thuy_trieu) {
    const svg = content.querySelector(".sd-svg");
    if (svg) {
      svg.classList.toggle("tide-len", step.thuy_trieu === "len");
      svg.classList.toggle("tide-xuong", step.thuy_trieu === "xuong");
    }
    const water = content.querySelector<SVGRectElement>("#battle-water");
    if (water) {
      const len = step.thuy_trieu === "len";
      water.setAttribute("y", len ? "175" : "214");
      water.setAttribute("height", len ? "120" : "81");
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
  set("battle-step-desc", esc(step.mo_ta));
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
    dot.textContent = idx < stepIdx ? "✓" : String(idx + 1);
  });
}

// ── Màn B, đầy đủ — trận đã có sa đồ diễn biến ───────────────────────────

function renderFullDetail(content: HTMLElement): void {
  const b = currentBattle;
  if (!b) return;
  stepIdx = 0;

  const draftBadge =
    b.trang_thai === "draft"
      ? `<span class="draft-badge">Bản nháp (chờ kiểm sử)</span>`
      : "";
  const xungDot: XungDot = b.loai_xung_dot === "noi-chien" ? "noi-chien" : "ngoai-xam";

  const tongQuat = b.sa_do_kieu === "tong-quat";
  muiTenKeys = tongQuat
    ? new Set((b.phan_tu ?? []).filter((p) => p.kieu === "mui-ten").map((p) => p.id))
    : BACH_DANG_MUI_TEN;
  const coThuyTrieu = b.buoc.some((s) => !!s.thuy_trieu);

  const stepRail = b.buoc
    .map(
      (_step, i) =>
        `<button type="button" class="sd-step-dot ${i === 0 ? "sd-step-current" : "sd-step-upcoming"}" role="tab" aria-selected="${i === 0}" data-step="${i}">${i + 1}</button>`,
    )
    .join("");

  content.innerHTML = `<div class="sd-detail" id="sd-detail" data-xung-dot="${xungDot}">
    <button type="button" class="sd-back" id="sd-back">◀ Quay lại danh sách trận đánh</button>
    <header class="sd-head">
      <h2 class="sd-title">⚔️ ${esc(b.ten)} ${draftBadge}</h2>
      <p class="sa-do-disclaimer">⚠️ ${esc(b.sa_do_ghi_chu)}</p>
      <dl class="sd-meta">
        ${b.chi_huy ? `<div><dt>Chỉ huy</dt><dd>${esc(b.chi_huy)}</dd></div>` : ""}
        ${b.doi_thu ? `<div><dt>Đối thủ</dt><dd>${esc(b.doi_thu)}</dd></div>` : ""}
        ${b.dia_diem ? `<div><dt>Địa điểm</dt><dd>${esc(b.dia_diem)}</dd></div>` : ""}
        <div><dt>Năm</dt><dd>${esc(String(b.nam))}</dd></div>
      </dl>
    </header>

    <div class="sd-stage-wrap">
      ${tongQuat ? buildTongQuatSvg(b) : buildBachDangSvg()}
      <div class="sd-step-rail" role="tablist" aria-label="Các bước diễn biến">${stepRail}</div>
    </div>

    <div class="sd-legend">
      <span class="sd-legend-item"><span class="sd-legend-swatch sd-legend-ta"></span> Quân ta — nét gạch chéo, khối tròn</span>
      <span class="sd-legend-item"><span class="sd-legend-swatch sd-legend-doi"></span> ${esc(b.doi_thu || "Quân đối phương")} — nét ca-rô, khối thoi</span>
    </div>

    <div class="sd-controls">
      <button id="battle-prev" type="button" class="sd-nav">◀ Bước trước</button>
      <span id="battle-step-count" class="sd-step-count"></span>
      <button id="battle-next" type="button" class="sd-nav">Bước sau ▶</button>
      ${coThuyTrieu ? `<span id="battle-tide" class="tide-indicator"></span>` : ""}
    </div>

    <div class="sd-narrative">
      <h3 id="battle-step-title"></h3>
      <p id="battle-step-desc"></p>
    </div>

    <div class="sd-outcome">
      ${b.ket_qua ? `<p><b>🏁 Kết quả:</b> ${esc(b.ket_qua)}</p>` : ""}
      ${b.y_nghia ? `<p><b>🌟 Ý nghĩa:</b> ${esc(b.y_nghia)}</p>` : ""}
    </div>
    ${sourcesHtml(b.nguon)}
  </div>`;

  document.getElementById("sd-back")?.addEventListener("click", () => {
    currentBattle = null;
    renderIndex(content);
  });
  document.getElementById("battle-prev")?.addEventListener("click", () => {
    if (stepIdx > 0) {
      stepIdx--;
      applyStep(content);
    }
  });
  document.getElementById("battle-next")?.addEventListener("click", () => {
    if (currentBattle && stepIdx < currentBattle.buoc.length - 1) {
      stepIdx++;
      applyStep(content);
    }
  });
  content.querySelectorAll<HTMLButtonElement>(".sd-step-dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = Number(dot.dataset["step"]);
      if (!Number.isNaN(idx)) {
        stepIdx = idx;
        applyStep(content);
      }
    });
  });

  applyStep(content);
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

  // Móc nối cho journey.ts: hiện tại journey.ts chỉ gọi
  // `document.getElementById("battle-btn")?.click()` (không kèm battle_id) —
  // nên nút "Xem sa đồ trận này" trong một chặng hành trình sẽ mở Màn A thay
  // vì nhảy thẳng vào Màn B như đặc tả yêu cầu. Battle.ts đã sẵn sàng nhận
  // CustomEvent này để nhảy thẳng; phần còn thiếu là journey.ts phát sự kiện
  // — xem báo cáo cuối, KHÔNG tự sửa journey.ts (ngoài phạm vi sở hữu file).
  window.addEventListener("sado:mo-tran", (ev) => {
    const id = (ev as CustomEvent<{ id?: string }>).detail?.id;
    if (id) void openDetailById(id);
    else void openIndex();
  });
}
