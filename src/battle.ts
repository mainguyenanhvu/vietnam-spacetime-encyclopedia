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

// Các key nhóm phần tử SVG bật/tắt theo bước — cho sa đồ Bạch Đằng 938.
// Kiến trúc hiện tại vẽ SVG riêng theo từng trận (buildBachDangSvg); một
// trình dựng SVG tổng quát cho 168 trận là việc tương lai, không phải hôm nay.
type LayerKey =
  | "song"
  | "coc-ngam"
  | "coc-lo"
  | "quan-ta-mai-phuc"
  | "thuyen-dich"
  | "mui-nhu-dich"
  | "thuyen-mac-can"
  | "mui-phan-cong-trai"
  | "mui-phan-cong-phai"
  | "co-thang";

// Layer nào là mũi tên hành quân — được vẽ bằng hiệu ứng "đang tiến" lần đầu
// hiện ra trong phiên xem, xem applyStep()/triggerArrowDraw().
const ARROW_LAYER_KEYS: ReadonlySet<string> = new Set([
  "mui-nhu-dich",
  "mui-phan-cong-trai",
  "mui-phan-cong-phai",
]);
// Animation stroke-dashoffset tốn paint (không compositor-only) — giới hạn
// số mũi tên chạy đồng thời trong một lần chuyển bước.
const ARROW_BUDGET_PER_TRANSITION = 2;

interface BattleStep {
  id: number;
  tieu_de: string;
  mo_ta: string;
  thuy_trieu: TideDir;
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

// Trận đã có sa đồ diễn biến đầy đủ (file trong public/data/battles/).
// TẠM hard-code — B2b trong đặc tả (dacta_hanhtrinh_sado.md) đề nghị sinh tự
// động một chỉ mục kiểu scripts/build_catalog.mjs từ chính thư mục battles/;
// việc đó thuộc index-builder/data tooling, không phải phạm vi CSS/UI ở đây.
const SA_DO_SAN_CO: readonly string[] = ["bach-dang-938"];

const INDEX_URL = `${import.meta.env.BASE_URL}data/overlays/chien-dich-tran-danh.json`;
const battleDetailUrl = (id: string): string =>
  `${import.meta.env.BASE_URL}data/battles/${id}.json`;

const battleReady = (id: string): boolean => SA_DO_SAN_CO.includes(id);

let indexItems: BattleIndexItem[] | null = null;
let currentBattle: Battle | null = null;
let stepIdx = 0;
let eraFilter = "all";
// Nhớ layer mũi tên nào đã chạy animation "đang vẽ" trong phiên xem trận
// hiện tại — chỉ chạy lần đầu hiện, tránh nhấp nháy khi bấm tới-lui nhiều lần.
let arrowsAnimated = new Set<string>();

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
    <defs>
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
    </defs>

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

// ── Điều khiển hiển thị theo bước ─────────────────────────────────────────

/** Đo `getTotalLength()` một lần rồi chạy CSS `@keyframes` — KHÔNG
 *  requestAnimationFrame tay, để killswitch prefers-reduced-motion toàn cục
 *  (style.css, @media (prefers-reduced-motion: reduce)) tự vô hiệu hoá được. */
function triggerArrowDraw(g: SVGGElement): void {
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
      ARROW_LAYER_KEYS.has(key) &&
      !arrowsAnimated.has(key) &&
      arrowsThisTransition < ARROW_BUDGET_PER_TRANSITION
    ) {
      arrowsAnimated.add(key);
      arrowsThisTransition++;
      triggerArrowDraw(g);
    }
  });

  // Mực nước theo thuỷ triều: triều lên ngập cọc, triều xuống thì rút.
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

  // Cập nhật khối văn bản của bước.
  const n = b.buoc.length;
  const set = (id: string, html: string) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };
  set("battle-step-count", `Bước ${stepIdx + 1}/${n}`);
  set("battle-step-title", `${esc(String(step.id))}. ${esc(step.tieu_de)}`);
  set("battle-step-desc", esc(step.mo_ta));
  set(
    "battle-tide",
    step.thuy_trieu === "len" ? "▲ Triều lên" : "▼ Triều xuống",
  );
  const tide = document.getElementById("battle-tide");
  if (tide) {
    tide.classList.toggle("tide-len", step.thuy_trieu === "len");
    tide.classList.toggle("tide-xuong", step.thuy_trieu === "xuong");
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
        <div><dt>Chỉ huy</dt><dd>${esc(b.chi_huy)}</dd></div>
        <div><dt>Đối thủ</dt><dd>${esc(b.doi_thu)}</dd></div>
        <div><dt>Địa điểm</dt><dd>${esc(b.dia_diem)}</dd></div>
        <div><dt>Năm</dt><dd>${esc(String(b.nam))}</dd></div>
      </dl>
    </header>

    <div class="sd-stage-wrap">
      ${buildBachDangSvg()}
      <div class="sd-step-rail" role="tablist" aria-label="Các bước diễn biến">${stepRail}</div>
    </div>

    <div class="sd-legend">
      <span class="sd-legend-item"><span class="sd-legend-swatch sd-legend-ta"></span> Quân ta</span>
      <span class="sd-legend-item"><span class="sd-legend-swatch sd-legend-doi"></span> ${esc(b.doi_thu)}</span>
    </div>

    <div class="sd-controls">
      <button id="battle-prev" type="button" class="sd-nav">◀ Bước trước</button>
      <span id="battle-step-count" class="sd-step-count"></span>
      <button id="battle-next" type="button" class="sd-nav">Bước sau ▶</button>
      <span id="battle-tide" class="tide-indicator"></span>
    </div>

    <div class="sd-narrative">
      <h3 id="battle-step-title"></h3>
      <p id="battle-step-desc"></p>
    </div>

    <div class="sd-outcome">
      <p><b>🏁 Kết quả:</b> ${esc(b.ket_qua)}</p>
      <p><b>🌟 Ý nghĩa:</b> ${esc(b.y_nghia)}</p>
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
    const res = await fetch(INDEX_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { items: BattleIndexItem[] };
    indexItems = data.items;
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
