// Chế độ «DÒNG THỜI GIAN 4000 NĂM» — Việt Nam từ ~2879 TCN đến nay dạng
// timeline dọc, lọc theo loại sự kiện. Module tự chứa: initTimeline() tự tạo
// nút mở + panel bằng JS (không sửa index.html).

interface TLEvent {
  nam: number;
  nam_hien_thi: string;
  tieu_de: string;
  mo_ta: string;
  loai: string;
  nguon: string[];
}
interface TLData { ghi_chu?: string; items: TLEvent[] }

import { esc, sourcesHtml } from "./util/html";
import { registerPanel, showOnly, hidePanel } from "./panels";

const DATA_URL = `${import.meta.env.BASE_URL}data/timeline/dong-thoi-gian.json`;

const LOAI_TEN: Record<string, string> = {
  "dung-nuoc": "Dựng nước",
  "giu-nuoc": "Giữ nước",
  "trieu-dai": "Triều đại",
  "van-hoa": "Văn hóa",
  "ngoai-giao": "Ngoại giao",
  "hien-dai": "Hiện đại",
};

let events: TLEvent[] | null = null;
let filter = "all";

function render(): void {
  const body = document.getElementById("timeline-body");
  if (!body || !events) return;
  const list = filter === "all" ? events : events.filter((e) => e.loai === filter);
  const rows = list
    .map(
      (e) => `<li class="tl-item tl-${esc(e.loai)}">
        <div class="tl-year">${esc(e.nam_hien_thi)}</div>
        <div class="tl-card">
          <span class="tl-badge tl-badge-${esc(e.loai)}">${esc(LOAI_TEN[e.loai] ?? e.loai)}</span>
          <h4>${esc(e.tieu_de)}</h4>
          <p>${esc(e.mo_ta)}</p>
          ${sourcesHtml(e.nguon, "tl-sources")}
        </div>
      </li>`,
    )
    .join("");
  body.innerHTML = `<ol class="tl-list">${rows}</ol>`;
}

function renderFilters(host: HTMLElement): void {
  const loais = ["all", ...Object.keys(LOAI_TEN)];
  host.innerHTML = loais
    .map(
      (l) => `<button type="button" class="tl-filter${l === filter ? " active" : ""}" data-loai="${l}">${l === "all" ? "Tất cả" : esc(LOAI_TEN[l])}</button>`,
    )
    .join("");
  host.querySelectorAll<HTMLButtonElement>(".tl-filter").forEach((b) =>
    b.addEventListener("click", () => {
      filter = b.dataset.loai ?? "all";
      host.querySelectorAll<HTMLButtonElement>(".tl-filter").forEach((x) => x.classList.toggle("active", x === b));
      render();
    }),
  );
}

function closePanel(): void {
  hidePanel("timeline-panel");
}

export function initTimeline(): void {
  if (document.getElementById("timeline-panel")) return;
  const btn = document.createElement("button");
  btn.id = "timeline-btn";
  btn.type = "button";
  btn.textContent = "🕰️ Dòng thời gian";
  btn.title = "Việt Nam từ ~2879 TCN đến nay";
  const nav = document.getElementById("topbar-nav");
  if (nav) nav.appendChild(btn);
  else document.body.appendChild(btn);

  const panel = document.createElement("aside");
  panel.id = "timeline-panel";
  panel.hidden = true;
  panel.innerHTML = `
    <button id="timeline-close" aria-label="Đóng">×</button>
    <h2 class="tl-title">🕰️ Dòng thời gian 4000 năm</h2>
    <p class="tl-note">~2879 TCN → nay. Chủ quyền Hoàng Sa &amp; Trường Sa của Việt Nam. Bản nháp — chờ người soát.</p>
    <div class="tl-filters" id="timeline-filters"></div>
    <div id="timeline-body"><p class="muted">Đang tải…</p></div>`;
  const app = document.getElementById("app") ?? document.body;
  app.appendChild(panel);
  registerPanel("timeline-panel");

  btn.addEventListener("click", () => {
    showOnly("timeline-panel");
    if (events) { render(); return; }
    void fetch(DATA_URL)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<TLData>; })
      .then((d) => {
        events = (d.items ?? []).slice().sort((a, b) => a.nam - b.nam);
        const filters = document.getElementById("timeline-filters");
        if (filters) renderFilters(filters);
        render();
      })
      .catch(() => {
        const body = document.getElementById("timeline-body");
        if (body) body.innerHTML = `<p class="muted">⚠️ Chưa tải được dòng thời gian.</p>`;
      });
  });
  document.getElementById("timeline-close")?.addEventListener("click", closePanel);
}
