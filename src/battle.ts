// Sa đồ chiến dịch tương tác — SVG 2D cách điệu cho trận Bạch Đằng 938.
// Người dùng bước qua từng giai đoạn diễn biến; mỗi bước bật/tắt các nhóm
// phần tử SVG theo mảng `hien`, chỉ điều khiển bằng CSS display.
// Tự chứa: initBattle() tạo nút mở + panel, không đụng vào main.ts.

type TideDir = "len" | "xuong";

// Các key nhóm phần tử SVG có thể bật/tắt theo từng bước.
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

interface BattleStep {
  id: number;
  tieu_de: string;
  mo_ta: string;
  thuy_trieu: TideDir;
  hien: LayerKey[]; // các nhóm phần tử SVG hiện ở bước này
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
}

const DATA_URL = `${import.meta.env.BASE_URL}data/battles/bach-dang-938.json`;

let battle: Battle | null = null;
let stepIdx = 0;

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function hideOtherPanels(): void {
  for (const id of [
    "province-panel",
    "game-panel",
    "quiz-panel",
    "story-panel",
    "library-panel",
    "olympia-panel",
    "journey-panel",
  ]) {
    const p = document.getElementById(id);
    if (p) p.hidden = true;
  }
}

// ── Trình dựng SVG ─────────────────────────────────────────────────────────

const STAKE_XS = [360, 390, 420, 450, 480, 510, 540];

function exposedStakes(): string {
  return STAKE_XS.map(
    (x) =>
      `<g transform="translate(${x},0)"><line x1="0" y1="196" x2="0" y2="288" stroke="#5b3a1e" stroke-width="4" stroke-linecap="round"/><path d="M-7,202 L0,180 L7,202 Z" fill="#3e2612"/></g>`,
  ).join("");
}

function submergedStakes(): string {
  return STAKE_XS.map(
    (x) =>
      `<g transform="translate(${x},0)"><line x1="0" y1="252" x2="0" y2="286" stroke="#4a3320" stroke-width="4" stroke-linecap="round"/></g>`,
  ).join("");
}

function boat(x: number, y: number, rot: number, broken: boolean): string {
  return `<g transform="translate(${x},${y}) rotate(${rot})">
    <path class="battle-hull" d="M-26,6 Q0,24 26,6 L20,-2 L-20,-2 Z" fill="#6b2b2b"/>
    <line class="battle-mast" x1="0" y1="-2" x2="0" y2="-26" stroke="#3a1d1d" stroke-width="3"/>
    <path class="battle-sail" d="M3,-24 L20,-6 L3,-6 Z" fill="#d8c9a0"/>
    ${broken ? `<path class="battle-crack" d="M-8,4 L-2,-2 L3,7 L8,-2" fill="none" stroke="#1a0d0d" stroke-width="2"/>` : ""}
  </g>`;
}

function troop(x: number, y: number): string {
  return `<g transform="translate(${x},${y})"><circle cx="0" cy="0" r="6" fill="#1f6b3a"/><line x1="7" y1="-12" x2="12" y2="9" stroke="#123f22" stroke-width="2.5" stroke-linecap="round"/></g>`;
}

function buildSvg(): string {
  const fleet =
    boat(630, 232, 0, false) + boat(712, 224, -5, false) + boat(792, 242, 4, false);
  const stranded =
    boat(398, 252, 26, true) + boat(464, 244, -20, true) + boat(432, 266, 44, true);
  const topTroops = [120, 190, 260, 330].map((x) => troop(x, 118)).join("");
  const botTroops = [120, 190, 260, 330].map((x) => troop(x, 352)).join("");

  return `<svg class="battle-svg" viewBox="0 0 900 470" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Sa đồ minh hoạ trận Bạch Đằng 938">
    <defs>
      <marker id="battle-arrow-lure" markerWidth="10" markerHeight="10" refX="7" refY="4" orient="auto"><path d="M0,0 L9,4 L0,8 Z" fill="#b8860b"/></marker>
      <marker id="battle-arrow-atk" markerWidth="10" markerHeight="10" refX="7" refY="4" orient="auto"><path d="M0,0 L9,4 L0,8 Z" fill="#c0392b"/></marker>
    </defs>

    <!-- Nền tĩnh: hai bờ + nhãn (luôn hiện) -->
    <rect class="battle-bank battle-bank-top" x="0" y="0" width="900" height="175" fill="#d9c9a3"/>
    <rect class="battle-bank battle-bank-bot" x="0" y="295" width="900" height="175" fill="#cdbf98"/>
    <text class="battle-label" x="866" y="240" text-anchor="end" font-size="15" fill="#2f5d7a">Biển →</text>
    <text class="battle-label" x="20" y="240" font-size="15" fill="#3a6a3a">← Thượng nguồn</text>
    <text class="battle-note" x="450" y="456" text-anchor="middle" font-size="13" fill="#8a7a55">Sa đồ minh hoạ — không theo tỉ lệ</text>

    <!-- song: nền sông + mực nước theo thuỷ triều -->
    <g class="battle-layer" data-key="song">
      <rect class="battle-riverbed" x="0" y="175" width="900" height="120" fill="#2f6f9f"/>
      <rect id="battle-water" class="battle-water" x="0" y="175" width="900" height="120" fill="#3d86bd" opacity="0.75"/>
      <path class="battle-wave" d="M40,206 q24,-8 48,0 t48,0 t48,0" fill="none" stroke="#bcdcef" stroke-width="2" opacity="0.6"/>
      <path class="battle-wave" d="M300,268 q24,-8 48,0 t48,0 t48,0" fill="none" stroke="#bcdcef" stroke-width="2" opacity="0.6"/>
    </g>

    <!-- coc-ngam: hàng cọc chìm dưới nước (mờ) -->
    <g class="battle-layer" data-key="coc-ngam" opacity="0.5">${submergedStakes()}</g>

    <!-- coc-lo: hàng cọc nhô lên (rõ) -->
    <g class="battle-layer" data-key="coc-lo">${exposedStakes()}</g>

    <!-- quan-ta-mai-phuc: quân ta mai phục hai bờ -->
    <g class="battle-layer" data-key="quan-ta-mai-phuc">
      ${topTroops}${botTroops}
      <text class="battle-caption" x="120" y="100" font-size="13" fill="#1f6b3a">Quân ta mai phục</text>
    </g>

    <!-- thuyen-dich: đoàn thuyền địch -->
    <g class="battle-layer" data-key="thuyen-dich">
      ${fleet}
      <text class="battle-caption" x="712" y="200" text-anchor="middle" font-size="13" fill="#6b2b2b">Thuyền Nam Hán</text>
    </g>

    <!-- mui-nhu-dich: mũi tên nhử địch tiến vào bãi cọc -->
    <g class="battle-layer" data-key="mui-nhu-dich">
      <path d="M604,150 C544,176 502,200 482,216" fill="none" stroke="#b8860b" stroke-width="4" marker-end="url(#battle-arrow-lure)"/>
      <text class="battle-caption" x="560" y="140" text-anchor="middle" font-size="13" fill="#8a6508">Nhử vào bãi cọc</text>
    </g>

    <!-- thuyen-mac-can: thuyền địch vỡ / mắc cạn -->
    <g class="battle-layer" data-key="thuyen-mac-can">
      ${stranded}
      <text class="battle-caption" x="432" y="300" text-anchor="middle" font-size="13" fill="#6b2b2b">Thuyền vỡ, mắc cạn</text>
    </g>

    <!-- mui-phan-cong-trai: phản công từ bờ trên -->
    <g class="battle-layer" data-key="mui-phan-cong-trai">
      <path d="M236,108 C300,150 360,200 412,232" fill="none" stroke="#c0392b" stroke-width="5" marker-end="url(#battle-arrow-atk)"/>
    </g>

    <!-- mui-phan-cong-phai: phản công từ bờ dưới -->
    <g class="battle-layer" data-key="mui-phan-cong-phai">
      <path d="M236,362 C300,320 360,272 412,250" fill="none" stroke="#c0392b" stroke-width="5" marker-end="url(#battle-arrow-atk)"/>
    </g>

    <!-- co-thang: cờ chiến thắng -->
    <g class="battle-layer" data-key="co-thang" transform="translate(450,92)">
      <line class="battle-pole" x1="0" y1="0" x2="0" y2="92" stroke="#7a5b2a" stroke-width="4"/>
      <path class="battle-flag" d="M0,4 L54,4 L45,19 L54,34 L0,34 Z" fill="#c0392b"/>
      <path d="M22,10 l3,7 7,0 -5.5,4.5 2,7 -6.5,-4.5 -6.5,4.5 2,-7 -5.5,-4.5 7,0 z" fill="#ffd54a"/>
      <text class="battle-caption" x="0" y="-8" text-anchor="middle" font-size="14" fill="#c0392b">Toàn thắng</text>
    </g>
  </svg>`;
}

// ── Điều khiển hiển thị theo bước ──────────────────────────────────────────

function applyStep(content: HTMLElement): void {
  const b = battle;
  if (!b) return;
  const step = b.buoc[stepIdx];

  // Bật/tắt nhóm phần tử SVG bằng CSS display theo mảng `hien`.
  content.querySelectorAll<SVGGElement>(".battle-layer").forEach((g) => {
    const key = g.dataset["key"] ?? "";
    g.style.display = (step.hien as string[]).includes(key) ? "" : "none";
  });

  // Mực nước theo thuỷ triều: triều lên ngập cọc, triều xuống thì rút.
  const svg = content.querySelector(".battle-svg");
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
  set("battle-step-title", `${step.id}. ${esc(step.tieu_de)}`);
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
}

function renderPanel(content: HTMLElement): void {
  const b = battle;
  if (!b) return;
  stepIdx = 0;

  const draftBadge =
    b.trang_thai === "draft"
      ? `<span class="draft-badge">Bản nháp (chờ kiểm sử)</span>`
      : "";
  const sources = b.nguon
    .map((s) => `<li>${esc(s)}</li>`)
    .join("");

  content.innerHTML = `
    <h2>⚔️ ${esc(b.ten)} ${draftBadge}</h2>
    <p class="sa-do-disclaimer">⚠️ ${esc(b.sa_do_ghi_chu)}</p>
    <div class="battle-meta">
      <span><b>Chỉ huy:</b> ${esc(b.chi_huy)}</span>
      <span><b>Đối thủ:</b> ${esc(b.doi_thu)}</span>
      <span><b>Địa điểm:</b> ${esc(b.dia_diem)}</span>
      <span><b>Năm:</b> ${b.nam}</span>
    </div>
    ${buildSvg()}
    <div class="battle-controls">
      <button id="battle-prev" type="button">◀ Bước trước</button>
      <span id="battle-step-count" class="battle-step-count"></span>
      <button id="battle-next" type="button">Bước sau ▶</button>
      <span id="battle-tide" class="tide-indicator"></span>
    </div>
    <div class="battle-step">
      <h3 id="battle-step-title"></h3>
      <p id="battle-step-desc"></p>
    </div>
    <div class="battle-outcome">
      <p><b>🏁 Kết quả:</b> ${esc(b.ket_qua)}</p>
      <p><b>🌟 Ý nghĩa:</b> ${esc(b.y_nghia)}</p>
    </div>
    <details class="sources"><summary>📚 Nguồn</summary><ul>${sources}</ul></details>`;

  document.getElementById("battle-prev")?.addEventListener("click", () => {
    if (stepIdx > 0) {
      stepIdx--;
      applyStep(content);
    }
  });
  document.getElementById("battle-next")?.addEventListener("click", () => {
    if (battle && stepIdx < battle.buoc.length - 1) {
      stepIdx++;
      applyStep(content);
    }
  });

  applyStep(content);
}

async function openBattle(): Promise<void> {
  const panel = document.getElementById("battle-panel");
  const content = document.getElementById("battle-content");
  if (!panel || !content) return;
  hideOtherPanels();
  panel.hidden = false;
  if (battle) {
    renderPanel(content);
    return;
  }
  content.innerHTML = `<p class="muted">Đang tải sa đồ chiến dịch…</p>`;
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    battle = (await res.json()) as Battle;
    renderPanel(content);
  } catch {
    content.innerHTML = `<p class="muted">⚠️ Không tải được sa đồ chiến dịch — vui lòng kiểm tra kết nối và thử lại.</p>`;
  }
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

  btn.addEventListener("click", () => void openBattle());
  document.getElementById("battle-close")?.addEventListener("click", () => {
    const panel = document.getElementById("battle-panel");
    if (panel) panel.hidden = true;
  });
}
